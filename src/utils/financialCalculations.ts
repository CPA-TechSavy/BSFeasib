import {
  FeasibilityProject,
  YearFinancials,
  LoanAmortizationRow,
  DepreciationRow,
  FeasibilityMetrics,
  LaborBenefitItem,
} from '../types';
import {
  compileProductionEmployeeBenefits,
  compileNonManufacturingEmployeeBenefits,
} from './philippineBenefits';

/**
 * Calculates the annual cost of an additional/non-statutory labor benefit item.
 * - 'one_month_salary' (or 13th Month Pay): equivalent to 1 month basic salary of direct and/or indirect employees.
 * - 'percentage': % of annual basic salary.
 * - 'fixed_monthly_per_head': monthly allowance per head * 12 * headcount.
 * - 'fixed_annual': annual lump sum.
 */
export function calculateLaborBenefitAmount(
  benefit: LaborBenefitItem,
  directLaborWages: Array<{ monthlyWage: number; headcount: number }>,
  indirectLaborWages: Array<{ monthlyWage: number; headcount: number }>,
  inflationFactor: number = 1
): number {
  const appliesDirect = benefit.appliesTo === 'both' || benefit.appliesTo === 'direct_only';
  const appliesIndirect = benefit.appliesTo === 'both' || benefit.appliesTo === 'indirect_only';

  const dlMonthlyBasic = (directLaborWages || []).reduce(
    (sum, lab) => sum + (lab.monthlyWage || 0) * (lab.headcount || 0),
    0
  );
  const dlAnnualBasic = dlMonthlyBasic * 12;
  const dlHeadcount = (directLaborWages || []).reduce((sum, lab) => sum + (lab.headcount || 0), 0);

  const idlMonthlyBasic = (indirectLaborWages || []).reduce(
    (sum, lab) => sum + (lab.monthlyWage || 0) * (lab.headcount || 0),
    0
  );
  const idlAnnualBasic = idlMonthlyBasic * 12;
  const idlHeadcount = (indirectLaborWages || []).reduce((sum, lab) => sum + (lab.headcount || 0), 0);

  const isThirteenthMonth = (benefit.name || '').toLowerCase().includes('13th');

  if (
    benefit.type === 'one_month_salary' ||
    (isThirteenthMonth && benefit.type !== 'fixed_monthly_per_head' && benefit.type !== 'fixed_annual')
  ) {
    const multiplier = benefit.type === 'one_month_salary' ? (benefit.rateOrAmount || 1) : 1;
    let total = 0;
    if (appliesDirect) total += dlMonthlyBasic * multiplier;
    if (appliesIndirect) total += idlMonthlyBasic * multiplier;
    return total;
  }

  if (benefit.type === 'percentage') {
    const rate = (benefit.rateOrAmount || 0) / 100;
    let total = 0;
    if (appliesDirect) total += dlAnnualBasic * rate;
    if (appliesIndirect) total += idlAnnualBasic * rate;
    return total;
  }

  if (benefit.type === 'fixed_monthly_per_head') {
    const monthly = (benefit.rateOrAmount || 0) * inflationFactor;
    let total = 0;
    if (appliesDirect) total += monthly * 12 * dlHeadcount;
    if (appliesIndirect) total += monthly * 12 * idlHeadcount;
    return total;
  }

  if (benefit.type === 'fixed_annual') {
    const annualAmt = (benefit.rateOrAmount || 0) * inflationFactor;
    const totalHead = (appliesDirect ? dlHeadcount : 0) + (appliesIndirect ? idlHeadcount : 0);
    return totalHead > 0 ? annualAmt : 0;
  }

  return 0;
}

/**
 * Calculates depreciation schedule for all fixed assets using the chosen method:
 * - Straight-Line (Default)
 * - Double Declining Balance (200% Accelerated)
 * - 150% Declining Balance
 * - Sum-of-the-Years'-Digits (SYD)
 */
export function calculateDepreciation(project: FeasibilityProject): DepreciationRow[] {
  return project.fixedAssets.map((asset) => {
    const cost = Math.max(0, asset.cost);
    const salvageValue = Math.max(0, Math.min(asset.salvageValue, cost));
    const usefulLife = Math.max(1, asset.usefulLifeYears);
    const depreciableBase = Math.max(0, cost - salvageValue);
    const method = asset.depreciationMethod || 'Straight-Line';

    let accum = 0;
    let currentBookValue = cost;
    const yearValues: {
      year: number;
      depreciation: number;
      accumulatedDepreciation: number;
      bookValue: number;
    }[] = [];

    // Sum of the years digits denominator: n(n+1)/2
    const sydDenominator = (usefulLife * (usefulLife + 1)) / 2;

    for (let yr = 1; yr <= 5; yr++) {
      let dep = 0;

      if (yr <= usefulLife && currentBookValue > salvageValue) {
        if (method === 'Straight-Line') {
          const straightLinePerYear = depreciableBase / usefulLife;
          dep = Math.min(straightLinePerYear, currentBookValue - salvageValue);
        } else if (method === 'Double Declining Balance') {
          const ddbRate = 2 / usefulLife;
          const tentativeDep = currentBookValue * ddbRate;
          dep = Math.min(tentativeDep, currentBookValue - salvageValue);
        } else if (method === '150% Declining Balance') {
          const db150Rate = 1.5 / usefulLife;
          const tentativeDep = currentBookValue * db150Rate;
          dep = Math.min(tentativeDep, currentBookValue - salvageValue);
        } else if (method === 'Sum-of-the-Years-Digits') {
          const remainingLife = usefulLife - yr + 1;
          const tentativeDep = depreciableBase * (remainingLife / sydDenominator);
          dep = Math.min(tentativeDep, currentBookValue - salvageValue);
        }
      }

      dep = Math.max(0, Math.round(dep * 100) / 100);
      accum += dep;
      currentBookValue = Math.max(salvageValue, cost - accum);

      yearValues.push({
        year: yr,
        depreciation: dep,
        accumulatedDepreciation: Math.round(accum * 100) / 100,
        bookValue: Math.round(currentBookValue * 100) / 100,
      });
    }

    const annualDepreciation = yearValues[0]?.depreciation || 0;

    return {
      assetId: asset.id,
      assetName: asset.name,
      cost,
      usefulLife,
      salvageValue,
      depreciationMethod: method,
      annualDepreciation,
      yearValues,
    };
  });
}

/**
 * Computes the monthly wage for a labor position in year `yr` (1 to 5)
 * taking into account either custom annual salary increase (% or fixed amount)
 * or falling back to the project general inflation rate.
 */
export function calculateLaborMonthlyWageForYear(
  baseMonthlyWage: number,
  yr: number, // 1, 2, 3, 4, 5
  increaseType?: 'percentage' | 'amount',
  increaseValue?: number,
  fallbackInflationRatePercent: number = 0
): number {
  if (yr <= 1) return baseMonthlyWage;
  const yearsPassed = yr - 1;

  if (increaseValue !== undefined && increaseValue !== 0 && !isNaN(increaseValue)) {
    if (increaseType === 'amount') {
      // Fixed monthly amount added each year (e.g. +₱500 per month each year)
      return Math.max(0, baseMonthlyWage + increaseValue * yearsPassed);
    } else {
      // Annual percentage increase compounded (e.g. 5% per year)
      const rate = increaseValue / 100;
      return Math.max(0, baseMonthlyWage * Math.pow(1 + rate, yearsPassed));
    }
  }

  // Fallback to project-wide inflation escalation
  const inflationFactor = Math.pow(1 + fallbackInflationRatePercent / 100, yearsPassed);
  return Math.max(0, baseMonthlyWage * inflationFactor);
}

/**
 * Calculates loan amortization schedule using equal annual installment formula
 */
export function calculateLoanAmortization(project: FeasibilityProject): LoanAmortizationRow[] {
  const principal = project.financing.bankLoanAmount;
  const rate = project.financing.annualInterestRate / 100;
  const term = Math.max(1, project.financing.loanTermYears);

  if (principal <= 0 || rate <= 0) {
    return [1, 2, 3, 4, 5].map((year) => ({
      year,
      beginningBalance: 0,
      annualPayment: 0,
      principalRepayment: 0,
      interestExpense: 0,
      endingBalance: 0,
    }));
  }

  // Annuity payment formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  const annualPayment =
    (principal * (rate * Math.pow(1 + rate, term))) / (Math.pow(1 + rate, term) - 1);

  const schedule: LoanAmortizationRow[] = [];
  let balance = principal;

  for (let yr = 1; yr <= 5; yr++) {
    const beginningBalance = balance;
    let interestExpense = 0;
    let principalRepayment = 0;
    let payment = 0;

    if (yr <= term && balance > 0.01) {
      interestExpense = balance * rate;
      payment = Math.min(annualPayment, balance + interestExpense);
      principalRepayment = payment - interestExpense;
      balance = Math.max(0, balance - principalRepayment);
    } else {
      balance = 0;
    }

    schedule.push({
      year: yr,
      beginningBalance,
      annualPayment: payment,
      principalRepayment,
      interestExpense,
      endingBalance: balance,
    });
  }

  return schedule;
}

/**
 * Calculates 5-year Financial Statements & Balance Sheet with accounting balancing integrity
 */
export function calculate5YearFinancials(project: FeasibilityProject): YearFinancials[] {
  const depreciationSchedule = calculateDepreciation(project);
  const loanSchedule = calculateLoanAmortization(project);

  const totalCapex = project.fixedAssets.reduce((sum, a) => sum + a.cost, 0);
  const totalPreOperating = project.preOperatingExpenses.reduce((sum, p) => sum + p.amount, 0);
  
  // Year 0 Setup
  const year0Cash = project.initialWorkingCapitalBuffer;
  const year0PaidInCapital = project.financing.equityContribution;
  const year0Loan = project.financing.bankLoanAmount;

  const results: YearFinancials[] = [];

  // Year 0 Financials
  const year0: YearFinancials = {
    year: 0,
    grossSales: 0,
    salesDiscounts: 0,
    netSales: 0,
    directMaterials: 0,
    directLabor: 0,
    factoryOverhead: 0,
    factoryOverheadSuppliesAndUtilities: 0,
    totalFactoryOverhead: 0,
    factoryDepreciation: 0,
    totalCOGS: 0,
    grossProfit: 0,
    grossProfitMargin: 0,
    adminExpenses: totalPreOperating, // Expensed pre-operating in academic studies
    sellingExpenses: 0,
    utilitiesAndRent: 0,
    otherOpex: 0,
    opexDepreciation: 0,
    opexSalaries: 0,
    opexSss: 0,
    opexPhilhealth: 0,
    opexPagibig: 0,
    opex13thMonthPay: 0,
    opexNonStatutoryBenefits: 0,
    itemizedOpex: [],
    totalOpex: totalPreOperating,
    ebit: -totalPreOperating,
    interestIncome: 0,
    interestExpense: 0,
    ebt: -totalPreOperating,
    taxExpense: 0,
    netIncome: -totalPreOperating,
    netProfitMargin: 0,
    operatingCashFlow: -totalPreOperating,
    investingCashFlow: -totalCapex,
    financingCashFlow: year0PaidInCapital + year0Loan,
    netCashFlow: year0PaidInCapital + year0Loan - totalCapex - totalPreOperating,
    beginningCash: 0,
    endingCash: year0PaidInCapital + year0Loan - totalCapex - totalPreOperating,
    cash: year0PaidInCapital + year0Loan - totalCapex - totalPreOperating,
    accountsReceivable: 0,
    inventory: 0,
    totalCurrentAssets: year0PaidInCapital + year0Loan - totalCapex - totalPreOperating,
    grossPPE: totalCapex,
    accumulatedDepreciation: 0,
    netPPE: totalCapex,
    totalAssets: year0PaidInCapital + year0Loan - totalCapex - totalPreOperating + totalCapex,
    accountsPayable: 0,
    currentPortionOfDebt: loanSchedule[0] ? loanSchedule[0].principalRepayment : 0,
    totalCurrentLiabilities: loanSchedule[0] ? loanSchedule[0].principalRepayment : 0,
    longTermDebt: Math.max(0, year0Loan - (loanSchedule[0] ? loanSchedule[0].principalRepayment : 0)),
    totalLiabilities: year0Loan,
    paidInCapital: year0PaidInCapital,
    retainedEarnings: -totalPreOperating,
    totalEquity: year0PaidInCapital - totalPreOperating,
    totalLiabilitiesAndEquity: year0Loan + (year0PaidInCapital - totalPreOperating),
    isBalanced: true,
    balanceDifference: 0,
    fixedCosts: totalPreOperating,
    variableCosts: 0,
    contributionMargin: 0,
    contributionMarginRatio: 0,
    breakEvenSales: 0,
    marginOfSafety: 0,
    marginOfSafetyRatio: 0,
  };
  results.push(year0);

  let prevCash = year0.endingCash;
  let prevAR = 0;
  let prevInventory = 0;
  let prevAP = 0;
  let cumulativeRetainedEarnings = year0.retainedEarnings;

  for (let yr = 1; yr <= 5; yr++) {
    // 1. Sales Calculation
    let grossSales = 0;
    let directMaterials = 0;

    project.products.forEach((prod) => {
      // Compound growth rate from Year 1
      const growthFactor = Math.pow(1 + prod.annualGrowthRate / 100, yr - 1);
      const volume = prod.year1Volume * growthFactor;
      const sales = volume * prod.unitPrice;
      const rawCost = prod.rawMaterialsCostPerUnit !== undefined
        ? prod.rawMaterialsCostPerUnit
        : Math.max(
            0,
            prod.unitCost -
              (prod.directLaborCostPerUnit || 0) -
              (prod.factoryOverheadCostPerUnit || 0)
          );
      const dm = volume * rawCost;

      grossSales += sales;
      directMaterials += dm;
    });

    const discountPercent =
      project.workingCapital?.discountsAndAllowancesPercent !== undefined
        ? project.workingCapital.discountsAndAllowancesPercent
        : (project.salesDiscountsPercent || 0);
    const salesDiscounts = grossSales * (discountPercent / 100);
    const netSales = grossSales - salesDiscounts;

    // 2. Direct Labor
    let directLabor = 0;
    project.directLabor.forEach((lab) => {
      const wageYr = calculateLaborMonthlyWageForYear(
        lab.monthlyWage,
        yr,
        lab.annualSalaryIncreaseType,
        lab.annualSalaryIncreaseValue,
        project.inflationRatePercent
      );
      const annualWage = wageYr * (lab.monthsPerYear || 12) * (lab.headcount || 1);
      directLabor += annualWage;
    });

    // 3. Factory Overhead (Indirect Labor + Production Utilities + Other FOH) & Depreciation
    let indirectLaborTotal = 0;
    if (project.indirectLabor && project.indirectLabor.length > 0) {
      project.indirectLabor.forEach((lab) => {
        const wageYr = calculateLaborMonthlyWageForYear(
          lab.monthlyWage,
          yr,
          lab.annualSalaryIncreaseType,
          lab.annualSalaryIncreaseValue,
          project.inflationRatePercent
        );
        const annualWage = wageYr * (lab.monthsPerYear || 12) * (lab.headcount || 1);
        indirectLaborTotal += annualWage;
      });
    }

    let productionUtilitiesTotal = 0;
    if (project.productionUtilities && project.productionUtilities.length > 0) {
      project.productionUtilities.forEach((util) => {
        const growth = Math.pow(1 + (util.annualGrowthRate || 0) / 100, yr - 1);
        const annualBase =
          util.annualAmountYear1 !== undefined && util.annualAmountYear1 !== 0
            ? util.annualAmountYear1
            : (util.monthlyAmount ? util.monthlyAmount * 12 : 0);
        productionUtilitiesTotal += annualBase * growth;
      });
    }

    // Production Labor Benefits (Direct & Indirect)
    let factoryLaborBenefits = 0;
    let productionStatutoryBenefits = 0;
    let additionalNonStatutoryBenefits = 0;
    const includeBenefitsInCOGS = project.includeLaborBenefitsInCOGS !== false;
    if (includeBenefitsInCOGS) {
      // Project direct and indirect labor wages for year yr taking into account custom annual salary increase
      const projectedDl = (project.directLabor || []).map((lab) => ({
        ...lab,
        monthlyWage: calculateLaborMonthlyWageForYear(
          lab.monthlyWage || 0,
          yr,
          lab.annualSalaryIncreaseType,
          lab.annualSalaryIncreaseValue,
          project.inflationRatePercent
        ),
      }));

      const projectedIdl = (project.indirectLabor || []).map((lab) => ({
        ...lab,
        monthlyWage: calculateLaborMonthlyWageForYear(
          lab.monthlyWage || 0,
          yr,
          lab.annualSalaryIncreaseType,
          lab.annualSalaryIncreaseValue,
          project.inflationRatePercent
        ),
      }));

      const { summary: statSummary } = compileProductionEmployeeBenefits(
        projectedDl,
        projectedIdl
      );
      productionStatutoryBenefits = statSummary.totalStatutoryAnnual;
      factoryLaborBenefits += productionStatutoryBenefits;

      // Add any additional non-statutory benefits (Uniforms, Allowances, etc.)
      const inflationFactor = Math.pow(1 + project.inflationRatePercent / 100, yr - 1);
      const customBenefits = (project.productionLaborBenefits || []).filter((b) => {
        const n = (b.name || '').toLowerCase();
        return (
          !n.includes('sss') &&
          !n.includes('social security') &&
          !n.includes('philhealth') &&
          !n.includes('pag-ibig') &&
          !n.includes('hdmf') &&
          !n.includes('13th')
        );
      });

      customBenefits.forEach((b) => {
        const amt = calculateLaborBenefitAmount(b, projectedDl, projectedIdl, inflationFactor);
        additionalNonStatutoryBenefits += amt;
      });
      factoryLaborBenefits += additionalNonStatutoryBenefits;
    }

    // 4. Other Factory Supplies & Miscellaneous Overhead
    // Aligns itemized supplies with otherFactoryOverheadAnnual to prevent double-counting
    const itemizedSuppliesYr1 = (project.factorySupplies || []).reduce((sum, sup) => {
      const amt = sup.annualAmount !== undefined ? sup.annualAmount : (sup.quantity || 0) * (sup.unitCost || 0);
      return sum + amt;
    }, 0);
    const otherOverheadYr1 = project.factoryOverheadAnnual || 0;
    let baseSuppliesAndOverhead = otherOverheadYr1;
    if (itemizedSuppliesYr1 > 0) {
      if (otherOverheadYr1 === 0 || otherOverheadYr1 === itemizedSuppliesYr1) {
        baseSuppliesAndOverhead = itemizedSuppliesYr1;
      } else {
        baseSuppliesAndOverhead = Math.max(itemizedSuppliesYr1, otherOverheadYr1);
      }
    }
    const overheadInflationFactor = Math.pow(
      1 + (project.factoryOverheadGrowthRate || project.inflationRatePercent || 0) / 100,
      yr - 1
    );
    const suppliesAndOverheadTotal = baseSuppliesAndOverhead * overheadInflationFactor;

    // Total annual depreciation across all fixed assets
    const totalYearDepreciation = depreciationSchedule.reduce((sum, d) => {
      const yrVal = d.yearValues.find((y) => y.year === yr);
      return sum + (yrVal ? yrVal.depreciation : 0);
    }, 0);

    // Attribute depreciation to factory (COGS) vs OPEX
    let factoryDepreciation = 0;
    let opexDepreciation = 0;

    if (project.factoryDepreciationMethod === 'specific_assets' && project.factoryAssetIds) {
      depreciationSchedule.forEach((d) => {
        const yrVal = d.yearValues.find((y) => y.year === yr);
        const depAmt = yrVal ? yrVal.depreciation : 0;
        if (project.factoryAssetIds?.includes(d.assetId)) {
          factoryDepreciation += depAmt;
        } else {
          opexDepreciation += depAmt;
        }
      });
    } else {
      const fohDeprPercent = project.factoryDepreciationPercent !== undefined ? project.factoryDepreciationPercent : 50;
      factoryDepreciation = totalYearDepreciation * (fohDeprPercent / 100);
      opexDepreciation = totalYearDepreciation * (Math.max(0, 100 - fohDeprPercent) / 100);
    }

    // Factory Overhead: combined total amount of:
    // 1. Indirect Labors
    // 2. Utilities Expense Attributed to Production
    // 3. Other Factory Supplies & Miscellaneous Overhead
    // (Items 1-3 = Factory Overhead Supplies & Utilities)
    // 4. Depreciation Expense Attributed to Production
    // 5. Production Employee Benefits Schedule (Statutory Contributions + Mandatory 13th Month Pay + Custom Benefits)
    
    // Factory Overhead (Supplies and Utilities): reflects only Indirect Labor, Utilities Production, and Supplies & Misc
    const factoryOverheadSuppliesAndUtilities =
      indirectLaborTotal +
      productionUtilitiesTotal +
      suppliesAndOverheadTotal;

    const totalFactoryOverhead =
      factoryOverheadSuppliesAndUtilities +
      factoryDepreciation +
      (includeBenefitsInCOGS ? factoryLaborBenefits : 0);

    const totalCOGS = directMaterials + directLabor + totalFactoryOverhead;
    const grossProfit = netSales - totalCOGS;
    const grossProfitMargin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

    // 4. Operating Expenses
    let utilitiesAndRent = 0;
    let otherOpex = 0;
    let opexSalaries = 0;
    let opexSss = 0;
    let opexPhilhealth = 0;
    let opexPagibig = 0;
    let opex13thMonthPay = 0;
    let opexNonStatutoryBenefits = 0;

    // Non-Manufacturing personnel
    if (project.nonManufacturingLabor && project.nonManufacturingLabor.length > 0) {
      const projectedNonMfg = project.nonManufacturingLabor.map((emp) => ({
        ...emp,
        monthlyWage: calculateLaborMonthlyWageForYear(
          emp.monthlyWage,
          yr,
          emp.annualSalaryIncreaseType,
          emp.annualSalaryIncreaseValue,
          project.inflationRatePercent
        ),
      }));

      // 1. Basic Salaries (Account: Salaries)
      projectedNonMfg.forEach((emp) => {
        const months = Math.min(12, emp.monthsPerYear || 12);
        const annualWage = emp.monthlyWage * months * (emp.headcount || 1);
        opexSalaries += annualWage;
      });

      // 2. Non-Manufacturing Statutory Benefits (Accounts: SSS, Philhealth, Pag-ibig, 13th Month Pay)
      const nonMfgStat = compileNonManufacturingEmployeeBenefits(projectedNonMfg);
      opexSss = nonMfgStat.summary.totalSssErAnnual;
      opexPhilhealth = nonMfgStat.summary.totalPhilHealthErAnnual;
      opexPagibig = nonMfgStat.summary.totalPagIbigErAnnual;
      opex13thMonthPay = nonMfgStat.summary.totalThirteenthMonth;

      // 3. Additional / Non-Statutory Benefits for Non-Manufacturing Personnel (Account: Non-Statutory Benefits)
      if (project.nonManufacturingLaborBenefits && project.nonManufacturingLaborBenefits.length > 0) {
        const totalBasic = projectedNonMfg.reduce((sum, e) => sum + (e.monthlyWage || 0) * (e.headcount || 1), 0);
        const totalHead = projectedNonMfg.reduce((sum, e) => sum + (e.headcount || 1), 0);
        const nmlInflation = Math.pow(1 + (project.inflationRatePercent || 0) / 100, yr - 1);

        project.nonManufacturingLaborBenefits.forEach((b) => {
          if (b.type === 'percentage') {
            const rate = (b.rateOrAmount || 0) / 100;
            opexNonStatutoryBenefits += totalBasic * 12 * rate;
          } else if (b.type === 'fixed_monthly_per_head') {
            const monthly = (b.rateOrAmount || 0) * nmlInflation;
            opexNonStatutoryBenefits += monthly * 12 * totalHead;
          } else if (b.type === 'fixed_annual') {
            const annual = (b.rateOrAmount || 0) * nmlInflation;
            opexNonStatutoryBenefits += annual;
          } else if (b.type === 'one_month_salary') {
            const multiplier = b.rateOrAmount || 1;
            opexNonStatutoryBenefits += totalBasic * multiplier;
          }
        });
      }
    }

    const itemizedOpex: { id: string; name: string; amount: number }[] = [];
    (project.operatingExpenses || []).forEach((opex) => {
      let amount = 0;
      if (opex.customYearAmounts && opex.customYearAmounts[yr] !== undefined) {
        amount = opex.customYearAmounts[yr];
      } else {
        const growth = Math.pow(1 + (opex.annualGrowthRate || 0) / 100, yr - 1);
        amount = (opex.annualAmountYear1 || 0) * growth;
      }
      otherOpex += amount;
      itemizedOpex.push({ id: opex.id, name: opex.name, amount });
    });

    const totalOpex =
      opexSalaries +
      opexSss +
      opexPhilhealth +
      opexPagibig +
      opex13thMonthPay +
      opexNonStatutoryBenefits +
      utilitiesAndRent +
      otherOpex +
      opexDepreciation;

    const adminExpenses =
      opexSalaries +
      opexSss +
      opexPhilhealth +
      opexPagibig +
      opex13thMonthPay +
      opexNonStatutoryBenefits +
      otherOpex;
    const sellingExpenses = 0;
    const ebit = grossProfit - totalOpex;

    // 5. Financing, Interest Income & Tax
    const baseCashOnHand =
      project.workingCapitalBufferDetails?.cashOnHand ??
      Math.round((project.initialWorkingCapitalBuffer || 0) * 0.2);
    const bankInterestRate =
      (project.workingCapitalBufferDetails?.bankInterestRatePercent ?? 0) / 100;
    // Bank deposit generates interest income based on actual cash held in bank account
    // Cash in Bank = Total Cash minus petty cash / cash on hand float
    const prevCashOnHand = Math.min(prevCash, baseCashOnHand);
    const prevCashInBank = Math.max(0, prevCash - prevCashOnHand);
    const interestIncome = Math.round(prevCashInBank * bankInterestRate);

    const loanRow = loanSchedule[yr - 1] || {
      interestExpense: 0,
      principalRepayment: 0,
      endingBalance: 0,
    };
    const interestExpense = loanRow.interestExpense;
    const ebt = ebit + interestIncome - interestExpense;
    const taxExpense = ebt > 0 ? ebt * (project.taxRatePercent / 100) : 0;
    const netIncome = ebt - taxExpense;
    const netProfitMargin = netSales > 0 ? (netIncome / netSales) * 100 : 0;

    // 6. Working Capital Requirements (Balance Sheet Drivers)
    const accountsReceivable = netSales * (project.workingCapital.accountsReceivablePercentOfSales / 100);
    const inventory = totalCOGS * (project.workingCapital.inventoryPercentOfCOGS / 100);
    const accountsPayable = directMaterials * (project.workingCapital.accountsPayablePercentOfPurchases / 100);

    const deltaAR = accountsReceivable - prevAR;
    const deltaInv = inventory - prevInventory;
    const deltaAP = accountsPayable - prevAP;

    // 7. Cash Flow Statement (Indirect Method)
    // Operating Cash Flow = Net Income + Non-cash Depreciation - ΔAR - ΔInventory + ΔAP
    const operatingCashFlow = netIncome + totalYearDepreciation - deltaAR - deltaInv + deltaAP;
    
    // Investing Cash Flow (Year 1-5 has 0 major capex in typical undergraduate base model)
    const investingCashFlow = 0;

    // Dividends / Drawings (Owner Withdrawals Policy)
    const withdrawalPercent =
      project.workingCapital?.ownerWithdrawalsPercent !== undefined
        ? project.workingCapital.ownerWithdrawalsPercent
        : (project.dividendPayoutPercent || 0);
    const dividendsPaid =
      netIncome > 0 ? netIncome * (withdrawalPercent / 100) : 0;

    // Financing Cash Flow = - Principal Repayment - Dividends
    const financingCashFlow = -loanRow.principalRepayment - dividendsPaid;
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
    const endingCash = prevCash + netCashFlow;

    // 8. Balance Sheet items
    const cash = endingCash;
    const totalCurrentAssets = cash + accountsReceivable + inventory;

    // Accumulated Depreciation up to year yr
    const totalAccumDepreciation = depreciationSchedule.reduce((sum, d) => {
      const yrVal = d.yearValues.find((y) => y.year === yr);
      return sum + (yrVal ? yrVal.accumulatedDepreciation : 0);
    }, 0);
    const grossPPE = totalCapex;
    const accumulatedDepreciation = totalAccumDepreciation;
    const netPPE = Math.max(0, grossPPE - accumulatedDepreciation);
    const totalAssets = totalCurrentAssets + netPPE;

    // Debt
    const nextLoanRow = loanSchedule[yr] || { principalRepayment: 0 };
    const currentPortionOfDebt = Math.min(loanRow.endingBalance, nextLoanRow.principalRepayment);
    const totalCurrentLiabilities = accountsPayable + currentPortionOfDebt;
    const longTermDebt = Math.max(0, loanRow.endingBalance - currentPortionOfDebt);
    const totalLiabilities = totalCurrentLiabilities + longTermDebt;

    // Equity
    cumulativeRetainedEarnings += netIncome - dividendsPaid;
    const paidInCapital = year0PaidInCapital;
    const retainedEarnings = cumulativeRetainedEarnings;
    const totalEquity = paidInCapital + retainedEarnings;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    const diff = Math.abs(totalAssets - totalLiabilitiesAndEquity);
    const isBalanced = diff < 1.0; // Rounding tolerance within 1 currency unit

    // 9. Break-Even Analysis
    // Fixed Costs = Direct Labor (100% fixed) + Total FOH (which includes factory depreciation and benefits) + Admin + Rent/Utilities + Other Opex + Opex Depreciation + Interest
    const fixedCosts =
      directLabor +
      totalFactoryOverhead +
      adminExpenses +
      utilitiesAndRent +
      otherOpex +
      opexDepreciation +
      interestExpense;
    // Variable Costs = Direct Materials + Selling commission/marketing + sales discounts (Direct Labor is 100% fixed)
    const variableCosts = directMaterials + sellingExpenses + salesDiscounts;
    const contributionMargin = netSales - variableCosts;
    const contributionMarginRatio = netSales > 0 ? contributionMargin / netSales : 0;
    const breakEvenSales =
      contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : 0;
    const marginOfSafety = Math.max(0, netSales - breakEvenSales);
    const marginOfSafetyRatio = netSales > 0 ? (marginOfSafety / netSales) * 100 : 0;

    results.push({
      year: yr,
      grossSales,
      salesDiscounts,
      netSales,
      directMaterials,
      directLabor,
      factoryOverhead: factoryOverheadSuppliesAndUtilities, // Factory Overhead (Supplies & Utilities) reflecting Indirect Labor, Utilities Production, and Supplies & Misc
      factoryOverheadSuppliesAndUtilities,
      totalFactoryOverhead,
      factoryLaborBenefits,
      factoryDepreciation,
      totalCOGS,
      grossProfit,
      grossProfitMargin,
      adminExpenses,
      sellingExpenses,
      utilitiesAndRent,
      otherOpex,
      opexDepreciation,
      opexSalaries,
      opexSss,
      opexPhilhealth,
      opexPagibig,
      opex13thMonthPay,
      opexNonStatutoryBenefits,
      itemizedOpex,
      totalOpex,
      ebit,
      interestIncome,
      interestExpense,
      ebt,
      taxExpense,
      netIncome,
      netProfitMargin,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
      beginningCash: prevCash,
      endingCash,
      cash,
      accountsReceivable,
      inventory,
      totalCurrentAssets,
      grossPPE,
      accumulatedDepreciation,
      netPPE,
      totalAssets,
      accountsPayable,
      currentPortionOfDebt,
      totalCurrentLiabilities,
      longTermDebt,
      totalLiabilities,
      paidInCapital,
      retainedEarnings,
      totalEquity,
      totalLiabilitiesAndEquity,
      isBalanced,
      balanceDifference: totalAssets - totalLiabilitiesAndEquity,
      fixedCosts,
      variableCosts,
      contributionMargin,
      contributionMarginRatio: contributionMarginRatio * 100,
      breakEvenSales,
      marginOfSafety,
      marginOfSafetyRatio,
    });

    // Update state for next iteration
    prevCash = endingCash;
    prevAR = accountsReceivable;
    prevInventory = inventory;
    prevAP = accountsPayable;
  }

  return results;
}

/**
 * Calculates Capital Budgeting Feasibility Metrics: NPV, IRR, Payback, ARR
 */
export function calculateFeasibilityMetrics(
  project: FeasibilityProject,
  financials: YearFinancials[]
): FeasibilityMetrics {
  const totalCapex = project.fixedAssets.reduce((sum, a) => sum + a.cost, 0);
  const totalPreOp = project.preOperatingExpenses.reduce((sum, p) => sum + p.amount, 0);
  const initialWorkingCapital = project.initialWorkingCapitalBuffer;
  const totalInitialInvestment = totalCapex + totalPreOp + initialWorkingCapital;

  const r = project.discountRatePercent / 100;

  // Free Cash Flows from Year 1 to 5
  // For equity feasibility / project feasibility: we use Net Cash Flow from Operations + salvage value in yr 5
  // or Net Cash Flow. In academic studies, Net Operating Cash Flow (less any replacement Capex) is standard.
  const cashFlows = [
    -totalInitialInvestment,
    financials[1]?.operatingCashFlow || 0,
    financials[2]?.operatingCashFlow || 0,
    financials[3]?.operatingCashFlow || 0,
    financials[4]?.operatingCashFlow || 0,
    (financials[5]?.operatingCashFlow || 0) + (financials[5]?.netPPE || 0) * 0.5, // Terminal / residual value in yr 5
  ];

  // 1. Net Present Value (NPV)
  let npv = cashFlows[0];
  for (let t = 1; t <= 5; t++) {
    npv += cashFlows[t] / Math.pow(1 + r, t);
  }

  // 2. Internal Rate of Return (IRR) via numerical bisection
  let low = -0.5;
  let high = 2.0;
  let irr = 0;

  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    let npvMid = cashFlows[0];
    for (let t = 1; t <= 5; t++) {
      npvMid += cashFlows[t] / Math.pow(1 + mid, t);
    }

    if (Math.abs(npvMid) < 0.0001) {
      irr = mid;
      break;
    }

    let npvLow = cashFlows[0];
    for (let t = 1; t <= 5; t++) {
      npvLow += cashFlows[t] / Math.pow(1 + low, t);
    }

    if (npvLow * npvMid < 0) {
      high = mid;
    } else {
      low = mid;
    }
    irr = mid;
  }

  // 3. Payback Period
  let cumulative = 0;
  let paybackPeriodYears = 5;
  for (let t = 1; t <= 5; t++) {
    const cf = cashFlows[t];
    if (cumulative + cf >= totalInitialInvestment) {
      const remainingNeeded = totalInitialInvestment - cumulative;
      paybackPeriodYears = t - 1 + remainingNeeded / Math.max(0.01, cf);
      break;
    }
    cumulative += cf;
  }

  // 4. Discounted Payback Period
  let discCumulative = 0;
  let discountedPaybackPeriodYears = 5;
  for (let t = 1; t <= 5; t++) {
    const dcf = cashFlows[t] / Math.pow(1 + r, t);
    if (discCumulative + dcf >= totalInitialInvestment) {
      const remainingNeeded = totalInitialInvestment - discCumulative;
      discountedPaybackPeriodYears = t - 1 + remainingNeeded / Math.max(0.01, dcf);
      break;
    }
    discCumulative += dcf;
  }

  // 5. Accounting Rate of Return (ARR) = Average Net Income / Initial Investment
  const totalNetIncome = financials.slice(1).reduce((sum, f) => sum + f.netIncome, 0);
  const avgNetIncome = totalNetIncome / 5;
  const accountingRateOfReturn = (avgNetIncome / Math.max(1, totalInitialInvestment)) * 100;

  // 6. Profitability Index (PI) = PV of Future Cash Inflows / Initial Outlay
  const pvInflows = npv - cashFlows[0];
  const profitabilityIndex = pvInflows / Math.max(1, Math.abs(cashFlows[0]));

  const isFeasible = npv > 0 && irr > r && paybackPeriodYears <= 5;

  let verdictSummary = '';
  if (isFeasible) {
    verdictSummary = `FINANCIALLY FEASIBLE: The project yields a positive Net Present Value (NPV) of ${npv >= 0 ? '+' : ''}${Math.round(npv).toLocaleString()} at a ${project.discountRatePercent}% hurdle rate, with an Internal Rate of Return (IRR) of ${(irr * 100).toFixed(1)}% substantially exceeding the cost of capital, and an expected Payback Period of ${paybackPeriodYears.toFixed(2)} years.`;
  }

  // 5-Year Average Ratios
  const years = financials.slice(1);
  const avgCurrentRatio =
    years.reduce(
      (sum, y) =>
        sum + (y.totalCurrentLiabilities > 0 ? y.totalCurrentAssets / y.totalCurrentLiabilities : 1),
      0
    ) / 5;

  const avgNetProfitMargin = years.reduce((sum, y) => sum + y.netProfitMargin, 0) / 5;

  const avgROE =
    years.reduce((sum, y) => sum + (y.totalEquity > 0 ? (y.netIncome / y.totalEquity) * 100 : 0), 0) /
    5;

  const avgROA =
    years.reduce((sum, y) => sum + (y.totalAssets > 0 ? (y.netIncome / y.totalAssets) * 100 : 0), 0) /
    5;

  const avgDebtToEquity =
    years.reduce(
      (sum, y) => sum + (y.totalEquity > 0 ? y.totalLiabilities / y.totalEquity : 0),
      0
    ) / 5;

  return {
    totalInitialInvestment,
    equityContribution: project.financing.equityContribution,
    debtFinancing: project.financing.bankLoanAmount,
    npv,
    irr: irr * 100,
    paybackPeriodYears,
    discountedPaybackPeriodYears,
    accountingRateOfReturn,
    profitabilityIndex,
    isFeasible,
    verdictSummary,
    avgCurrentRatio,
    avgNetProfitMargin,
    avgROE,
    avgROA,
    avgDebtToEquity,
  };
}

/**
 * Format currency with commas and academic bracket formatting for negative numbers
 */
export function formatCurrency(
  value: number,
  currency: string = '₱',
  decimals: number = 0
): string {
  if (isNaN(value)) return `${currency}0`;
  const rounded = Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (value < -0.01) {
    return `(${currency}${rounded})`;
  }
  return `${currency}${rounded}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (isNaN(value)) return '0.0%';
  return `${value.toFixed(decimals)}%`;
}

export interface Year1FactoryOverheadSummary {
  indirectLaborAnnual: number;
  productionUtilitiesAnnual: number;
  factorySuppliesAnnual: number;
  otherFactoryOverheadAnnual: number;
  suppliesAndOverheadAnnual: number;
  factoryOverheadSuppliesAndUtilitiesAnnual: number; // Indirect Labor + Utilities Production + Supplies & Misc
  productionStatutoryContributionsAnnual: number;
  productionStatutoryBenefitsAnnual: number;
  productionThirteenthMonthPayAnnual: number;
  additionalNonStatutoryBenefitsAnnual: number;
  factoryLaborBenefitsAnnual: number;
  factoryDepreciationAnnual: number;
  totalFactoryOverheadAnnual: number;
  totalProductionVolume: number;
  overheadPerUnit: number;
}

export function calculateFactoryOverheadForYear(
  project: FeasibilityProject,
  year: number = 1
): Year1FactoryOverheadSummary {
  const yr = Math.max(1, Math.min(5, Math.round(year) || 1));

  // 1. Indirect labor
  let indirectLaborAnnual = 0;
  if (project.indirectLabor && project.indirectLabor.length > 0) {
    project.indirectLabor.forEach((lab) => {
      const wageYr = calculateLaborMonthlyWageForYear(
        lab.monthlyWage || 0,
        yr,
        lab.annualSalaryIncreaseType,
        lab.annualSalaryIncreaseValue,
        project.inflationRatePercent
      );
      const annualWage = wageYr * (lab.monthsPerYear || 12) * (lab.headcount || 1);
      indirectLaborAnnual += annualWage;
    });
  }

  // 2. Production Utilities
  let productionUtilitiesAnnual = 0;
  if (project.productionUtilities && project.productionUtilities.length > 0) {
    project.productionUtilities.forEach((util) => {
      const growth = Math.pow(1 + (util.annualGrowthRate || 0) / 100, yr - 1);
      const annualBase =
        util.annualAmountYear1 !== undefined && util.annualAmountYear1 !== 0
          ? util.annualAmountYear1
          : (util.monthlyAmount ? util.monthlyAmount * 12 : 0);
      productionUtilitiesAnnual += annualBase * growth;
    });
  }

  // 3. Factory Supplies & Miscellaneous Overhead
  const factorySuppliesAnnualBase = (project.factorySupplies || []).reduce(
    (sum, sup) =>
      sum +
      (sup.annualAmount !== undefined
        ? sup.annualAmount
        : (sup.quantity || 0) * (sup.unitCost || 0)),
    0
  );

  const otherFactoryOverheadAnnualBase = project.factoryOverheadAnnual || 0;

  // Aligns itemized supplies with otherFactoryOverheadAnnual to prevent double-counting
  let baseSuppliesAndOverhead = otherFactoryOverheadAnnualBase;
  if (factorySuppliesAnnualBase > 0) {
    if (otherFactoryOverheadAnnualBase === 0 || otherFactoryOverheadAnnualBase === factorySuppliesAnnualBase) {
      baseSuppliesAndOverhead = factorySuppliesAnnualBase;
    } else {
      baseSuppliesAndOverhead = Math.max(factorySuppliesAnnualBase, otherFactoryOverheadAnnualBase);
    }
  }

  const overheadInflationFactor = Math.pow(
    1 + (project.factoryOverheadGrowthRate || project.inflationRatePercent || 0) / 100,
    yr - 1
  );

  const suppliesAndOverheadAnnual = baseSuppliesAndOverhead * overheadInflationFactor;
  const factorySuppliesAnnual = factorySuppliesAnnualBase * overheadInflationFactor;
  const otherFactoryOverheadAnnual = otherFactoryOverheadAnnualBase * overheadInflationFactor;

  // 5. Factory Labor Benefits (Production Employee Benefits Schedule + Mandatory 13th Month Pay + Additional Benefits)
  let productionStatutoryContributionsAnnual = 0;
  let productionStatutoryBenefitsAnnual = 0;
  let productionThirteenthMonthPayAnnual = 0;
  let additionalNonStatutoryBenefitsAnnual = 0;
  let factoryLaborBenefitsAnnual = 0;

  if (project.includeLaborBenefitsInCOGS !== false) {
    const projectedDl = (project.directLabor || []).map((lab) => ({
      ...lab,
      monthlyWage: calculateLaborMonthlyWageForYear(
        lab.monthlyWage || 0,
        yr,
        lab.annualSalaryIncreaseType,
        lab.annualSalaryIncreaseValue,
        project.inflationRatePercent
      ),
    }));

    const projectedIdl = (project.indirectLabor || []).map((lab) => ({
      ...lab,
      monthlyWage: calculateLaborMonthlyWageForYear(
        lab.monthlyWage || 0,
        yr,
        lab.annualSalaryIncreaseType,
        lab.annualSalaryIncreaseValue,
        project.inflationRatePercent
      ),
    }));

    const { summary: statSummary } = compileProductionEmployeeBenefits(
      projectedDl,
      projectedIdl
    );
    productionStatutoryContributionsAnnual = Math.round(
      (statSummary.totalSssErAnnual +
        statSummary.totalPhilHealthErAnnual +
        statSummary.totalPagIbigErAnnual) *
        100
    ) / 100;
    productionThirteenthMonthPayAnnual = statSummary.totalThirteenthMonth;
    // Total Statutory Benefits explicitly includes SSS, PhilHealth, Pag-IBIG contributions and 13th Month Pay (P.D. 851)
    productionStatutoryBenefitsAnnual = statSummary.totalStatutoryAnnual;

    const customBenefits = (project.productionLaborBenefits || []).filter((b) => {
      const n = (b.name || '').toLowerCase();
      return (
        !n.includes('sss') &&
        !n.includes('social security') &&
        !n.includes('philhealth') &&
        !n.includes('pag-ibig') &&
        !n.includes('hdmf') &&
        !n.includes('13th')
      );
    });

    const nonStatInflationFactor = Math.pow(1 + (project.inflationRatePercent || 0) / 100, yr - 1);
    customBenefits.forEach((b) => {
      additionalNonStatutoryBenefitsAnnual += calculateLaborBenefitAmount(
        b,
        projectedDl,
        projectedIdl,
        nonStatInflationFactor
      );
    });

    factoryLaborBenefitsAnnual =
      productionStatutoryBenefitsAnnual +
      additionalNonStatutoryBenefitsAnnual;
  }

  // 6. Factory Depreciation
  const deprSchedule = calculateDepreciation(project);
  let factoryDepreciationAnnual = 0;
  if (project.factoryDepreciationMethod === 'specific_assets' && project.factoryAssetIds) {
    deprSchedule.forEach((d) => {
      const yrVal = d.yearValues.find((y) => y.year === yr);
      const depAmt = yrVal ? yrVal.depreciation : d.annualDepreciation;
      if (project.factoryAssetIds?.includes(d.assetId)) {
        factoryDepreciationAnnual += depAmt;
      }
    });
  } else {
    const fohDeprPercent =
      project.factoryDepreciationPercent !== undefined
        ? project.factoryDepreciationPercent
        : 50;
    const totalYrDepr = deprSchedule.reduce((sum, d) => {
      const yrVal = d.yearValues.find((y) => y.year === yr);
      return sum + (yrVal ? yrVal.depreciation : d.annualDepreciation);
    }, 0);
    factoryDepreciationAnnual = totalYrDepr * (fohDeprPercent / 100);
  }

  // Factory Overhead (Supplies and Utilities) reflecting Indirect Labor, Utilities Production, and Supplies & Misc
  const factoryOverheadSuppliesAndUtilitiesAnnual =
    indirectLaborAnnual +
    productionUtilitiesAnnual +
    suppliesAndOverheadAnnual;

  const totalFactoryOverheadAnnual =
    factoryOverheadSuppliesAndUtilitiesAnnual +
    factoryDepreciationAnnual +
    factoryLaborBenefitsAnnual;

  const totalProductionVolume = project.products.reduce((sum, p) => {
    const vol = (p.year1Volume || 0) * Math.pow(1 + (p.annualGrowthRate || 0) / 100, yr - 1);
    return sum + vol;
  }, 0);

  const overheadPerUnit =
    totalProductionVolume > 0
      ? Math.round((totalFactoryOverheadAnnual / totalProductionVolume) * 100) / 100
      : 0;

  return {
    indirectLaborAnnual,
    productionUtilitiesAnnual,
    factorySuppliesAnnual,
    otherFactoryOverheadAnnual,
    suppliesAndOverheadAnnual,
    factoryOverheadSuppliesAndUtilitiesAnnual,
    productionStatutoryContributionsAnnual,
    productionStatutoryBenefitsAnnual,
    productionThirteenthMonthPayAnnual,
    additionalNonStatutoryBenefitsAnnual,
    factoryLaborBenefitsAnnual,
    factoryDepreciationAnnual,
    totalFactoryOverheadAnnual,
    totalProductionVolume,
    overheadPerUnit,
  };
}

export function calculateYear1FactoryOverhead(project: FeasibilityProject): Year1FactoryOverheadSummary {
  return calculateFactoryOverheadForYear(project, 1);
}
