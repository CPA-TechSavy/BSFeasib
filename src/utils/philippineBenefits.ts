/**
 * Philippine Statutory Employee Benefits Computation Engine
 * Compliant with:
 * - Republic Act No. 11199 (Social Security Act of 2018 - Official SSS Contribution Table)
 * - Republic Act No. 11223 (Universal Health Care Act - PhilHealth 5% Premium, 2.5% Employer Share)
 * - Republic Act No. 9679 & Circular No. 460 (Pag-IBIG / HDMF 2% Employer Share with ₱10,000 ceiling)
 */

export interface SssBracket {
  minSalary: number;
  maxSalary: number;
  msc: number; // Monthly Salary Credit
  regularMsc: number;
  wispMsc: number;
  regularEr: number; // 9.5%
  wispEr: number; // 9.5%
  ecEr: number; // ₱10 (MSC <= 14,500) or ₱30 (MSC > 14,500)
  totalEr: number; // regularEr + wispEr + ecEr
  regularEe: number; // 4.5%
  wispEe: number; // 4.5%
  totalEe: number;
  totalContribution: number;
}

/**
 * Builds the official statutory SSS Contribution Table for regular employers & employees.
 */
export function buildSssContributionTable(): SssBracket[] {
  const brackets: SssBracket[] = [];

  // Minimum MSC: 4,000 (compensation below 4,250)
  const minBracket: SssBracket = {
    minSalary: 0,
    maxSalary: 4249.99,
    msc: 4000,
    regularMsc: 4000,
    wispMsc: 0,
    regularEr: 380,
    wispEr: 0,
    ecEr: 10,
    totalEr: 390,
    regularEe: 180,
    wispEe: 0,
    totalEe: 180,
    totalContribution: 570,
  };
  brackets.push(minBracket);

  // Stepped MSCs: 4,500 up to 29,500 in 500 increments
  for (let msc = 4500; msc <= 29500; msc += 500) {
    const minSal = msc - 250;
    const maxSal = msc + 249.99;
    const regularMsc = Math.min(msc, 20000);
    const wispMsc = Math.max(0, msc - 20000);
    const regularEr = Math.round(regularMsc * 0.095 * 100) / 100;
    const wispEr = Math.round(wispMsc * 0.095 * 100) / 100;
    const ecEr = msc <= 14500 ? 10 : 30;
    const totalEr = Math.round((regularEr + wispEr + ecEr) * 100) / 100;

    const regularEe = Math.round(regularMsc * 0.045 * 100) / 100;
    const wispEe = Math.round(wispMsc * 0.045 * 100) / 100;
    const totalEe = Math.round((regularEe + wispEe) * 100) / 100;

    brackets.push({
      minSalary: minSal,
      maxSalary: maxSal,
      msc,
      regularMsc,
      wispMsc,
      regularEr,
      wispEr,
      ecEr,
      totalEr,
      regularEe,
      wispEe,
      totalEe,
      totalContribution: Math.round((totalEr + totalEe) * 100) / 100,
    });
  }

  // Maximum MSC: 30,000 (compensation 29,750 and above)
  const maxBracket: SssBracket = {
    minSalary: 29750,
    maxSalary: Number.MAX_SAFE_INTEGER,
    msc: 30000,
    regularMsc: 20000,
    wispMsc: 10000,
    regularEr: 1900,
    wispEr: 950,
    ecEr: 30,
    totalEr: 2880,
    regularEe: 900,
    wispEe: 450,
    totalEe: 1350,
    totalContribution: 4230,
  };
  brackets.push(maxBracket);

  return brackets;
}

export const SSS_CONTRIBUTION_TABLE = buildSssContributionTable();

/**
 * Calculates the exact Employer Share for SSS using the official statutory table.
 */
export function getSssEmployerShare(monthlySalary: number): {
  msc: number;
  regularMsc: number;
  wispMsc: number;
  regularEr: number;
  wispEr: number;
  ecEr: number;
  totalEr: number;
  bracketDesc: string;
} {
  const salary = Math.max(0, monthlySalary || 0);
  const matched =
    SSS_CONTRIBUTION_TABLE.find(
      (b) => salary >= b.minSalary && salary <= b.maxSalary
    ) || SSS_CONTRIBUTION_TABLE[SSS_CONTRIBUTION_TABLE.length - 1];

  const bracketDesc =
    matched.maxSalary === Number.MAX_SAFE_INTEGER
      ? `₱${matched.minSalary.toLocaleString()} and above (MSC: ₱${matched.msc.toLocaleString()})`
      : `₱${matched.minSalary.toLocaleString()} - ₱${Math.floor(matched.maxSalary).toLocaleString()} (MSC: ₱${matched.msc.toLocaleString()})`;

  return {
    msc: matched.msc,
    regularMsc: matched.regularMsc,
    wispMsc: matched.wispMsc,
    regularEr: matched.regularEr,
    wispEr: matched.wispEr,
    ecEr: matched.ecEr,
    totalEr: matched.totalEr,
    bracketDesc,
  };
}

/**
 * Calculates the exact PhilHealth Employer Share under RA 11223 (UHC Law):
 * Premium rate: 5.0% divided equally (2.5% Employer share, 2.5% Employee share).
 * Salary floor: ₱10,000 (Min ER share = ₱250.00).
 * Salary ceiling: ₱100,000 (Max ER share = ₱2,500.00).
 */
export function getPhilHealthEmployerShare(monthlySalary: number): {
  monthlySalary: number;
  applicableSalary: number;
  rate: number;
  erShare: number;
  isFloor: boolean;
  isCeiling: boolean;
} {
  const salary = Math.max(0, monthlySalary || 0);
  const applicableSalary = Math.min(100000, Math.max(10000, salary));
  const erShare = Math.round(applicableSalary * 0.025 * 100) / 100;

  return {
    monthlySalary: salary,
    applicableSalary,
    rate: 0.025,
    erShare,
    isFloor: salary < 10000,
    isCeiling: salary > 100000,
  };
}

/**
 * Calculates the exact Pag-IBIG (HDMF) Employer Share under RA 9679 & Circular 460:
 * Employer rate: 2.0% of Monthly Compensation.
 * Maximum monthly fund salary ceiling: ₱10,000 (effective 2024).
 * Maximum monthly ER contribution: ₱200.00.
 */
export function getPagIbigEmployerShare(monthlySalary: number): {
  monthlySalary: number;
  applicableSalary: number;
  rate: number;
  erShare: number;
  isCapped: boolean;
} {
  const salary = Math.max(0, monthlySalary || 0);
  const applicableSalary = Math.min(10000, salary);
  const erShare = Math.round(applicableSalary * 0.02 * 100) / 100;

  return {
    monthlySalary: salary,
    applicableSalary,
    rate: 0.02,
    erShare,
    isCapped: salary >= 10000,
  };
}

export interface ProductionEmployeeBenefitRecord {
  id: string;
  sourceId: string;
  role: string;
  classification: 'Direct Labor' | 'Indirect Labor';
  headcount: number;
  individualNumber?: number; // e.g. 1 of 2
  monthlySalary: number; // Respective Monthly Salary
  annualSalary12M: number; // monthlySalary * 12
  annualSalary: number; // monthlySalary * 12

  // Statutory Employer Shares (per individual worker)
  sssErMonthly: number;
  sssMsc: number;
  sssEcEr: number;
  sssBracketDesc: string;

  philHealthErMonthly: number;
  pagIbigErMonthly: number;

  totalStatutoryMonthlyPerHead: number; // SSS + PhilHealth + Pag-IBIG
  totalStatutoryAnnualPerHead: number; // Monthly * 12

  // Object forms for granular UI components
  sss: {
    totalEr: number;
    totalErTotalRole: number;
    msc: number;
    ecEr: number;
    bracketRange: string;
    bracketDesc: string;
    regularEr: number;
    wispEr: number;
  };
  philHealth: {
    monthlyErPerHead: number;
    monthlyErTotalRole: number;
    annualErTotalRole: number;
    floorApplied: boolean;
    capApplied: boolean;
    rate: number;
  };
  pagIbig: {
    monthlyErPerHead: number;
    monthlyErTotalRole: number;
    annualErTotalRole: number;
    capApplied: boolean;
    rate: number;
  };

  totalMonthlyBenefitsPerHead: number;
  totalMonthlyBenefitsTotalRole: number;
  totalAnnualBenefitsTotalRole: number;

  // 13th Month Pay (Presidential Decree No. 851: 1/12 of Total Basic Annual Salary)
  thirteenthMonthPayPerHead: number;
  thirteenthMonthPayTotalRole: number;
  totalAnnualBenefitsAnd13thMonthTotalRole: number;

  // Totals for the position row (per head * headcount)
  totalMonthlySalaryAll: number;
  totalSssErMonthlyAll: number;
  totalPhilHealthErMonthlyAll: number;
  totalPagIbigErMonthlyAll: number;
  totalStatutoryMonthlyAll: number;
  totalStatutoryAnnualAll: number;
}

export interface ProductionBenefitsSummary {
  totalHeadcount: number;
  directHeadcount: number;
  indirectHeadcount: number;
  totalMonthlySalary: number;
  totalMonthlyBasic: number;
  totalAnnualBasic: number;
  directMonthlySalary: number;
  indirectMonthlySalary: number;
  totalSssErMonthly: number;
  totalSssErAnnual: number;
  totalPhilHealthErMonthly: number;
  totalPhilHealthErAnnual: number;
  totalPagIbigErMonthly: number;
  totalPagIbigErAnnual: number;
  totalStatutoryMonthly: number;
  totalStatutoryAnnual: number;
  totalThirteenthMonth: number; // Sum of 13th month pay for all production employees (PD 851)
  totalAnnualStatutoryAnd13th: number;
  directLabor: {
    headcount: number;
    monthlyBasicTotal: number;
    sssErMonthlyTotal: number;
    philHealthErMonthlyTotal: number;
    pagIbigErMonthlyTotal: number;
    totalMonthlyBenefits: number;
    totalAnnualBenefits: number;
    thirteenthMonthTotal: number;
    totalAnnualBenefitsAnd13th: number;
  };
  indirectLabor: {
    headcount: number;
    monthlyBasicTotal: number;
    sssErMonthlyTotal: number;
    philHealthErMonthlyTotal: number;
    pagIbigErMonthlyTotal: number;
    totalMonthlyBenefits: number;
    totalAnnualBenefits: number;
    thirteenthMonthTotal: number;
    totalAnnualBenefitsAnd13th: number;
  };
}

/**
 * Compiles all production employees from Direct Labor and Indirect Labor
 * and evaluates their actual statutory benefits.
 */
export function compileProductionEmployeeBenefits(
  directLabor: Array<{ id: string; role: string; headcount: number; monthlyWage: number }>,
  indirectLabor: Array<{ id: string; role: string; headcount: number; monthlyWage: number }> = [],
  expandHeadcount = false
): {
  records: ProductionEmployeeBenefitRecord[];
  directLaborRecords: ProductionEmployeeBenefitRecord[];
  indirectLaborRecords: ProductionEmployeeBenefitRecord[];
  summary: ProductionBenefitsSummary;
} {
  const records: ProductionEmployeeBenefitRecord[] = [];

  const processList = (
    list: Array<{ id: string; role: string; headcount: number; monthlyWage: number }>,
    classification: 'Direct Labor' | 'Indirect Labor'
  ) => {
    list.forEach((item, itemIdx) => {
      const wage = item.monthlyWage || 0;
      const count = Math.max(1, item.headcount || 1);

      const sss = getSssEmployerShare(wage);
      const philHealth = getPhilHealthEmployerShare(wage);
      const pagIbig = getPagIbigEmployerShare(wage);

      const totalPerHeadMonthly =
        Math.round((sss.totalEr + philHealth.erShare + pagIbig.erShare) * 100) / 100;
      const totalPerHeadAnnual = Math.round(totalPerHeadMonthly * 12 * 100) / 100;

      // Presidential Decree No. 851: 1/12 of Total Basic Annual Salary = 1 Month Basic Wage
      const thirteenthMonthPerHead = wage;

      if (expandHeadcount && count > 1) {
        for (let i = 1; i <= count; i++) {
          records.push({
            id: `${item.id}-${i}`,
            sourceId: item.id,
            role: `${item.role} (Staff ${i} of ${count})`,
            classification,
            headcount: 1,
            individualNumber: i,
            monthlySalary: wage,
            annualSalary12M: wage * 12,
            annualSalary: wage * 12,
            sssErMonthly: sss.totalEr,
            sssMsc: sss.msc,
            sssEcEr: sss.ecEr,
            sssBracketDesc: sss.bracketDesc,
            philHealthErMonthly: philHealth.erShare,
            pagIbigErMonthly: pagIbig.erShare,
            totalStatutoryMonthlyPerHead: totalPerHeadMonthly,
            totalStatutoryAnnualPerHead: totalPerHeadAnnual + thirteenthMonthPerHead,
            sss: {
              totalEr: sss.totalEr,
              totalErTotalRole: sss.totalEr,
              msc: sss.msc,
              ecEr: sss.ecEr,
              bracketRange: sss.bracketDesc,
              bracketDesc: sss.bracketDesc,
              regularEr: sss.regularEr,
              wispEr: sss.wispEr,
            },
            philHealth: {
              monthlyErPerHead: philHealth.erShare,
              monthlyErTotalRole: philHealth.erShare,
              annualErTotalRole: philHealth.erShare * 12,
              floorApplied: philHealth.isFloor,
              capApplied: philHealth.isCeiling,
              rate: philHealth.rate,
            },
            pagIbig: {
              monthlyErPerHead: pagIbig.erShare,
              monthlyErTotalRole: pagIbig.erShare,
              annualErTotalRole: pagIbig.erShare * 12,
              capApplied: pagIbig.isCapped,
              rate: pagIbig.rate,
            },
            totalMonthlyBenefitsPerHead: totalPerHeadMonthly,
            totalMonthlyBenefitsTotalRole: totalPerHeadMonthly,
            totalAnnualBenefitsTotalRole: totalPerHeadAnnual + thirteenthMonthPerHead,
            thirteenthMonthPayPerHead: thirteenthMonthPerHead,
            thirteenthMonthPayTotalRole: thirteenthMonthPerHead,
            totalAnnualBenefitsAnd13thMonthTotalRole: totalPerHeadAnnual + thirteenthMonthPerHead,
            totalMonthlySalaryAll: wage,
            totalSssErMonthlyAll: sss.totalEr,
            totalPhilHealthErMonthlyAll: philHealth.erShare,
            totalPagIbigErMonthlyAll: pagIbig.erShare,
            totalStatutoryMonthlyAll: totalPerHeadMonthly,
            totalStatutoryAnnualAll: totalPerHeadAnnual + thirteenthMonthPerHead,
          });
        }
      } else {
        const thirteenthMonthRoleTotal = Math.round(thirteenthMonthPerHead * count * 100) / 100;
        const totalAnnualRole = Math.round(totalPerHeadAnnual * count * 100) / 100;
        records.push({
          id: item.id || `labor-${classification}-${itemIdx}`,
          sourceId: item.id,
          role: item.role || `${classification} Staff`,
          classification,
          headcount: count,
          monthlySalary: wage,
          annualSalary12M: wage * 12,
          annualSalary: wage * 12,
          sssErMonthly: sss.totalEr,
          sssMsc: sss.msc,
          sssEcEr: sss.ecEr,
          sssBracketDesc: sss.bracketDesc,
          philHealthErMonthly: philHealth.erShare,
          pagIbigErMonthly: pagIbig.erShare,
          totalStatutoryMonthlyPerHead: totalPerHeadMonthly,
          totalStatutoryAnnualPerHead: totalPerHeadAnnual + thirteenthMonthPerHead,
          sss: {
            totalEr: sss.totalEr,
            totalErTotalRole: Math.round(sss.totalEr * count * 100) / 100,
            msc: sss.msc,
            ecEr: sss.ecEr,
            bracketRange: sss.bracketDesc,
            bracketDesc: sss.bracketDesc,
            regularEr: sss.regularEr,
            wispEr: sss.wispEr,
          },
          philHealth: {
            monthlyErPerHead: philHealth.erShare,
            monthlyErTotalRole: Math.round(philHealth.erShare * count * 100) / 100,
            annualErTotalRole: Math.round(philHealth.erShare * count * 12 * 100) / 100,
            floorApplied: philHealth.isFloor,
            capApplied: philHealth.isCeiling,
            rate: philHealth.rate,
          },
          pagIbig: {
            monthlyErPerHead: pagIbig.erShare,
            monthlyErTotalRole: Math.round(pagIbig.erShare * count * 100) / 100,
            annualErTotalRole: Math.round(pagIbig.erShare * count * 12 * 100) / 100,
            capApplied: pagIbig.isCapped,
            rate: pagIbig.rate,
          },
          totalMonthlyBenefitsPerHead: totalPerHeadMonthly,
          totalMonthlyBenefitsTotalRole: Math.round(totalPerHeadMonthly * count * 100) / 100,
          totalAnnualBenefitsTotalRole: totalAnnualRole + thirteenthMonthRoleTotal,
          thirteenthMonthPayPerHead: thirteenthMonthPerHead,
          thirteenthMonthPayTotalRole: thirteenthMonthRoleTotal,
          totalAnnualBenefitsAnd13thMonthTotalRole: totalAnnualRole + thirteenthMonthRoleTotal,
          totalMonthlySalaryAll: wage * count,
          totalSssErMonthlyAll: Math.round(sss.totalEr * count * 100) / 100,
          totalPhilHealthErMonthlyAll: Math.round(philHealth.erShare * count * 100) / 100,
          totalPagIbigErMonthlyAll: Math.round(pagIbig.erShare * count * 100) / 100,
          totalStatutoryMonthlyAll: Math.round(totalPerHeadMonthly * count * 100) / 100,
          totalStatutoryAnnualAll: totalAnnualRole + thirteenthMonthRoleTotal,
        });
      }
    });
  };

  processList(directLabor, 'Direct Labor');
  processList(indirectLabor, 'Indirect Labor');

  const directLaborRecords = records.filter((r) => r.classification === 'Direct Labor');
  const indirectLaborRecords = records.filter((r) => r.classification === 'Indirect Labor');

  const totalHeadcount = records.reduce((sum, r) => sum + r.headcount, 0);
  const directHeadcount = directLaborRecords.reduce((sum, r) => sum + r.headcount, 0);
  const indirectHeadcount = indirectLaborRecords.reduce((sum, r) => sum + r.headcount, 0);

  const totalMonthlySalary = records.reduce((sum, r) => sum + r.totalMonthlySalaryAll, 0);
  const directMonthlySalary = directLaborRecords.reduce((sum, r) => sum + r.totalMonthlySalaryAll, 0);
  const indirectMonthlySalary = indirectLaborRecords.reduce((sum, r) => sum + r.totalMonthlySalaryAll, 0);

  const totalSssErMonthly = records.reduce((sum, r) => sum + r.totalSssErMonthlyAll, 0);
  const totalPhilHealthErMonthly = records.reduce((sum, r) => sum + r.totalPhilHealthErMonthlyAll, 0);
  const totalPagIbigErMonthly = records.reduce((sum, r) => sum + r.totalPagIbigErMonthlyAll, 0);
  const totalStatutoryMonthly = records.reduce((sum, r) => sum + r.totalStatutoryMonthlyAll, 0);

  const totalSssErAnnual = Math.round(totalSssErMonthly * 12 * 100) / 100;
  const totalPhilHealthErAnnual = Math.round(totalPhilHealthErMonthly * 12 * 100) / 100;
  const totalPagIbigErAnnual = Math.round(totalPagIbigErMonthly * 12 * 100) / 100;

  const dlSss = directLaborRecords.reduce((sum, r) => sum + r.totalSssErMonthlyAll, 0);
  const dlPh = directLaborRecords.reduce((sum, r) => sum + r.totalPhilHealthErMonthlyAll, 0);
  const dlPi = directLaborRecords.reduce((sum, r) => sum + r.totalPagIbigErMonthlyAll, 0);
  const dlMonthlyBen = dlSss + dlPh + dlPi;
  const dl13thMonth = directLaborRecords.reduce((sum, r) => sum + r.thirteenthMonthPayTotalRole, 0);

  const idlSss = indirectLaborRecords.reduce((sum, r) => sum + r.totalSssErMonthlyAll, 0);
  const idlPh = indirectLaborRecords.reduce((sum, r) => sum + r.totalPhilHealthErMonthlyAll, 0);
  const idlPi = indirectLaborRecords.reduce((sum, r) => sum + r.totalPagIbigErMonthlyAll, 0);
  const idlMonthlyBen = idlSss + idlPh + idlPi;
  const idl13thMonth = indirectLaborRecords.reduce((sum, r) => sum + r.thirteenthMonthPayTotalRole, 0);

  const totalThirteenthMonth = dl13thMonth + idl13thMonth;
  // Total Statutory Benefits includes SSS, PhilHealth, Pag-IBIG and 13th Month Pay (PD 851)
  const totalStatutoryAnnual = Math.round((totalSssErAnnual + totalPhilHealthErAnnual + totalPagIbigErAnnual + totalThirteenthMonth) * 100) / 100;
  const totalAnnualStatutoryAnd13th = totalStatutoryAnnual;

  return {
    records,
    directLaborRecords,
    indirectLaborRecords,
    summary: {
      totalHeadcount,
      directHeadcount,
      indirectHeadcount,
      totalMonthlySalary,
      totalMonthlyBasic: totalMonthlySalary,
      totalAnnualBasic: totalMonthlySalary * 12,
      directMonthlySalary,
      indirectMonthlySalary,
      totalSssErMonthly,
      totalSssErAnnual,
      totalPhilHealthErMonthly,
      totalPhilHealthErAnnual,
      totalPagIbigErMonthly,
      totalPagIbigErAnnual,
      totalStatutoryMonthly,
      totalStatutoryAnnual,
      totalThirteenthMonth,
      totalAnnualStatutoryAnd13th,
      directLabor: {
        headcount: directHeadcount,
        monthlyBasicTotal: directMonthlySalary,
        sssErMonthlyTotal: dlSss,
        philHealthErMonthlyTotal: dlPh,
        pagIbigErMonthlyTotal: dlPi,
        totalMonthlyBenefits: dlMonthlyBen,
        totalAnnualBenefits: Math.round((dlMonthlyBen * 12 + dl13thMonth) * 100) / 100,
        thirteenthMonthTotal: dl13thMonth,
        totalAnnualBenefitsAnd13th: Math.round((dlMonthlyBen * 12 + dl13thMonth) * 100) / 100,
      },
      indirectLabor: {
        headcount: indirectHeadcount,
        monthlyBasicTotal: indirectMonthlySalary,
        sssErMonthlyTotal: idlSss,
        philHealthErMonthlyTotal: idlPh,
        pagIbigErMonthlyTotal: idlPi,
        totalMonthlyBenefits: idlMonthlyBen,
        totalAnnualBenefits: Math.round((idlMonthlyBen * 12 + idl13thMonth) * 100) / 100,
        thirteenthMonthTotal: idl13thMonth,
        totalAnnualBenefitsAnd13th: Math.round((idlMonthlyBen * 12 + idl13thMonth) * 100) / 100,
      },
    },
  };
}

export interface NonManufacturingEmployeeBenefitRecord {
  id: string;
  sourceId: string;
  role: string;
  category: 'Administrative' | 'Selling & Marketing';
  headcount: number;
  individualNumber?: number;
  monthlySalary: number;
  annualSalary12M: number;
  annualSalary: number;
  sssErMonthly: number;
  sssMsc: number;
  sssEcEr: number;
  sssBracketDesc: string;
  philHealthErMonthly: number;
  pagIbigErMonthly: number;
  totalStatutoryMonthlyPerHead: number;
  totalStatutoryAnnualPerHead: number;
  sss: {
    totalEr: number;
    totalErTotalRole: number;
    msc: number;
    ecEr: number;
    bracketRange: string;
    bracketDesc: string;
    regularEr: number;
    wispEr: number;
  };
  philHealth: {
    monthlyErPerHead: number;
    monthlyErTotalRole: number;
    annualErTotalRole: number;
    floorApplied: boolean;
    capApplied: boolean;
    rate: number;
  };
  pagIbig: {
    monthlyErPerHead: number;
    monthlyErTotalRole: number;
    annualErTotalRole: number;
    capApplied: boolean;
    rate: number;
  };
  totalMonthlyBenefitsPerHead: number;
  totalMonthlyBenefitsTotalRole: number;
  totalAnnualBenefitsTotalRole: number;
  thirteenthMonthPayPerHead: number;
  thirteenthMonthPayTotalRole: number;
  totalAnnualBenefitsAnd13thMonthTotalRole: number;
  totalMonthlySalaryAll: number;
  totalSssErMonthlyAll: number;
  totalPhilHealthErMonthlyAll: number;
  totalPagIbigErMonthlyAll: number;
  totalStatutoryMonthlyAll: number;
  totalStatutoryAnnualAll: number;
}

export interface NonManufacturingBenefitsSummary {
  totalHeadcount: number;
  adminHeadcount: number;
  sellingHeadcount: number;
  totalMonthlySalary: number;
  totalMonthlyBasic: number;
  totalAnnualBasic: number;
  adminMonthlySalary: number;
  sellingMonthlySalary: number;
  totalSssErMonthly: number;
  totalSssErAnnual: number;
  totalPhilHealthErMonthly: number;
  totalPhilHealthErAnnual: number;
  totalPagIbigErMonthly: number;
  totalPagIbigErAnnual: number;
  totalStatutoryMonthly: number;
  totalStatutoryAnnual: number;
  totalThirteenthMonth: number;
  totalAnnualStatutoryAnd13th: number;
  admin: {
    headcount: number;
    monthlyBasicTotal: number;
    sssErMonthlyTotal: number;
    philHealthErMonthlyTotal: number;
    pagIbigErMonthlyTotal: number;
    totalMonthlyBenefits: number;
    totalAnnualBenefits: number;
    thirteenthMonthTotal: number;
    totalAnnualBenefitsAnd13th: number;
  };
  selling: {
    headcount: number;
    monthlyBasicTotal: number;
    sssErMonthlyTotal: number;
    philHealthErMonthlyTotal: number;
    pagIbigErMonthlyTotal: number;
    totalMonthlyBenefits: number;
    totalAnnualBenefits: number;
    thirteenthMonthTotal: number;
    totalAnnualBenefitsAnd13th: number;
  };
}

/**
 * Compiles all Non-Manufacturing employees (Administrative & Selling Staff)
 * and calculates their exact statutory benefits (SSS, PhilHealth, Pag-IBIG, and 13th Month Pay).
 */
export function compileNonManufacturingEmployeeBenefits(
  nonManufacturingLabor: Array<{
    id: string;
    role: string;
    category?: 'Administrative' | 'Selling & Marketing';
    headcount: number;
    monthlyWage: number;
  }> = [],
  expandHeadcount = false
): {
  records: NonManufacturingEmployeeBenefitRecord[];
  adminRecords: NonManufacturingEmployeeBenefitRecord[];
  sellingRecords: NonManufacturingEmployeeBenefitRecord[];
  summary: NonManufacturingBenefitsSummary;
} {
  const records: NonManufacturingEmployeeBenefitRecord[] = [];

  nonManufacturingLabor.forEach((emp, itemIdx) => {
    const wage = emp.monthlyWage || 0;
    const count = Math.max(1, emp.headcount || 1);
    const category: 'Administrative' | 'Selling & Marketing' =
      emp.category === 'Selling & Marketing' ? 'Selling & Marketing' : 'Administrative';

    const sss = getSssEmployerShare(wage);
    const philHealth = getPhilHealthEmployerShare(wage);
    const pagIbig = getPagIbigEmployerShare(wage);

    const totalPerHeadMonthly =
      Math.round((sss.totalEr + philHealth.erShare + pagIbig.erShare) * 100) / 100;
    const totalPerHeadAnnual = Math.round(totalPerHeadMonthly * 12 * 100) / 100;
    const thirteenthMonthPerHead = wage;

    if (expandHeadcount && count > 1) {
      for (let i = 1; i <= count; i++) {
        records.push({
          id: `${emp.id}-${i}`,
          sourceId: emp.id,
          role: `${emp.role} (Staff ${i} of ${count})`,
          category,
          headcount: 1,
          individualNumber: i,
          monthlySalary: wage,
          annualSalary12M: wage * 12,
          annualSalary: wage * 12,
          sssErMonthly: sss.totalEr,
          sssMsc: sss.msc,
          sssEcEr: sss.ecEr,
          sssBracketDesc: sss.bracketDesc,
          philHealthErMonthly: philHealth.erShare,
          pagIbigErMonthly: pagIbig.erShare,
          totalStatutoryMonthlyPerHead: totalPerHeadMonthly,
          totalStatutoryAnnualPerHead: totalPerHeadAnnual + thirteenthMonthPerHead,
          sss: {
            totalEr: sss.totalEr,
            totalErTotalRole: sss.totalEr,
            msc: sss.msc,
            ecEr: sss.ecEr,
            bracketRange: sss.bracketDesc,
            bracketDesc: sss.bracketDesc,
            regularEr: sss.regularEr,
            wispEr: sss.wispEr,
          },
          philHealth: {
            monthlyErPerHead: philHealth.erShare,
            monthlyErTotalRole: philHealth.erShare,
            annualErTotalRole: philHealth.erShare * 12,
            floorApplied: philHealth.isFloor,
            capApplied: philHealth.isCeiling,
            rate: philHealth.rate,
          },
          pagIbig: {
            monthlyErPerHead: pagIbig.erShare,
            monthlyErTotalRole: pagIbig.erShare,
            annualErTotalRole: pagIbig.erShare * 12,
            capApplied: pagIbig.isCapped,
            rate: pagIbig.rate,
          },
          totalMonthlyBenefitsPerHead: totalPerHeadMonthly,
          totalMonthlyBenefitsTotalRole: totalPerHeadMonthly,
          totalAnnualBenefitsTotalRole: totalPerHeadAnnual + thirteenthMonthPerHead,
          thirteenthMonthPayPerHead: thirteenthMonthPerHead,
          thirteenthMonthPayTotalRole: thirteenthMonthPerHead,
          totalAnnualBenefitsAnd13thMonthTotalRole: totalPerHeadAnnual + thirteenthMonthPerHead,
          totalMonthlySalaryAll: wage,
          totalSssErMonthlyAll: sss.totalEr,
          totalPhilHealthErMonthlyAll: philHealth.erShare,
          totalPagIbigErMonthlyAll: pagIbig.erShare,
          totalStatutoryMonthlyAll: totalPerHeadMonthly,
          totalStatutoryAnnualAll: totalPerHeadAnnual + thirteenthMonthPerHead,
        });
      }
    } else {
      const thirteenthMonthRoleTotal = Math.round(thirteenthMonthPerHead * count * 100) / 100;
      const totalAnnualRole = Math.round(totalPerHeadAnnual * count * 100) / 100;
      records.push({
        id: emp.id || `nml-${category}-${itemIdx}`,
        sourceId: emp.id,
        role: emp.role || `${category} Staff`,
        category,
        headcount: count,
        monthlySalary: wage,
        annualSalary12M: wage * 12,
        annualSalary: wage * 12,
        sssErMonthly: sss.totalEr,
        sssMsc: sss.msc,
        sssEcEr: sss.ecEr,
        sssBracketDesc: sss.bracketDesc,
        philHealthErMonthly: philHealth.erShare,
        pagIbigErMonthly: pagIbig.erShare,
        totalStatutoryMonthlyPerHead: totalPerHeadMonthly,
        totalStatutoryAnnualPerHead: totalPerHeadAnnual + thirteenthMonthPerHead,
        sss: {
          totalEr: sss.totalEr,
          totalErTotalRole: Math.round(sss.totalEr * count * 100) / 100,
          msc: sss.msc,
          ecEr: sss.ecEr,
          bracketRange: sss.bracketDesc,
          bracketDesc: sss.bracketDesc,
          regularEr: sss.regularEr,
          wispEr: sss.wispEr,
        },
        philHealth: {
          monthlyErPerHead: philHealth.erShare,
          monthlyErTotalRole: Math.round(philHealth.erShare * count * 100) / 100,
          annualErTotalRole: Math.round(philHealth.erShare * count * 12 * 100) / 100,
          floorApplied: philHealth.isFloor,
          capApplied: philHealth.isCeiling,
          rate: philHealth.rate,
        },
        pagIbig: {
          monthlyErPerHead: pagIbig.erShare,
          monthlyErTotalRole: Math.round(pagIbig.erShare * count * 100) / 100,
          annualErTotalRole: Math.round(pagIbig.erShare * count * 12 * 100) / 100,
          capApplied: pagIbig.isCapped,
          rate: pagIbig.rate,
        },
        totalMonthlyBenefitsPerHead: totalPerHeadMonthly,
        totalMonthlyBenefitsTotalRole: Math.round(totalPerHeadMonthly * count * 100) / 100,
        totalAnnualBenefitsTotalRole: totalAnnualRole + thirteenthMonthRoleTotal,
        thirteenthMonthPayPerHead: thirteenthMonthPerHead,
        thirteenthMonthPayTotalRole: thirteenthMonthRoleTotal,
        totalAnnualBenefitsAnd13thMonthTotalRole: totalAnnualRole + thirteenthMonthRoleTotal,
        totalMonthlySalaryAll: wage * count,
        totalSssErMonthlyAll: Math.round(sss.totalEr * count * 100) / 100,
        totalPhilHealthErMonthlyAll: Math.round(philHealth.erShare * count * 100) / 100,
        totalPagIbigErMonthlyAll: Math.round(pagIbig.erShare * count * 100) / 100,
        totalStatutoryMonthlyAll: Math.round(totalPerHeadMonthly * count * 100) / 100,
        totalStatutoryAnnualAll: totalAnnualRole + thirteenthMonthRoleTotal,
      });
    }
  });

  const adminRecords = records.filter((r) => r.category === 'Administrative');
  const sellingRecords = records.filter((r) => r.category === 'Selling & Marketing');

  const totalHeadcount = records.reduce((sum, r) => sum + r.headcount, 0);
  const adminHeadcount = adminRecords.reduce((sum, r) => sum + r.headcount, 0);
  const sellingHeadcount = sellingRecords.reduce((sum, r) => sum + r.headcount, 0);

  const totalMonthlySalary = records.reduce((sum, r) => sum + r.totalMonthlySalaryAll, 0);
  const adminMonthlySalary = adminRecords.reduce((sum, r) => sum + r.totalMonthlySalaryAll, 0);
  const sellingMonthlySalary = sellingRecords.reduce((sum, r) => sum + r.totalMonthlySalaryAll, 0);

  const totalSssErMonthly = records.reduce((sum, r) => sum + r.totalSssErMonthlyAll, 0);
  const totalPhilHealthErMonthly = records.reduce((sum, r) => sum + r.totalPhilHealthErMonthlyAll, 0);
  const totalPagIbigErMonthly = records.reduce((sum, r) => sum + r.totalPagIbigErMonthlyAll, 0);
  const totalStatutoryMonthly = records.reduce((sum, r) => sum + r.totalStatutoryMonthlyAll, 0);

  const totalSssErAnnual = Math.round(totalSssErMonthly * 12 * 100) / 100;
  const totalPhilHealthErAnnual = Math.round(totalPhilHealthErMonthly * 12 * 100) / 100;
  const totalPagIbigErAnnual = Math.round(totalPagIbigErMonthly * 12 * 100) / 100;

  const adminSss = adminRecords.reduce((sum, r) => sum + r.totalSssErMonthlyAll, 0);
  const adminPh = adminRecords.reduce((sum, r) => sum + r.totalPhilHealthErMonthlyAll, 0);
  const adminPi = adminRecords.reduce((sum, r) => sum + r.totalPagIbigErMonthlyAll, 0);
  const adminMonthlyBen = adminSss + adminPh + adminPi;
  const admin13thMonth = adminRecords.reduce((sum, r) => sum + r.thirteenthMonthPayTotalRole, 0);

  const sellingSss = sellingRecords.reduce((sum, r) => sum + r.totalSssErMonthlyAll, 0);
  const sellingPh = sellingRecords.reduce((sum, r) => sum + r.totalPhilHealthErMonthlyAll, 0);
  const sellingPi = sellingRecords.reduce((sum, r) => sum + r.totalPagIbigErMonthlyAll, 0);
  const sellingMonthlyBen = sellingSss + sellingPh + sellingPi;
  const selling13thMonth = sellingRecords.reduce((sum, r) => sum + r.thirteenthMonthPayTotalRole, 0);

  const totalThirteenthMonth = admin13thMonth + selling13thMonth;
  // Total Statutory Benefits includes SSS, PhilHealth, Pag-IBIG and 13th Month Pay (PD 851)
  const totalStatutoryAnnual = Math.round((totalSssErAnnual + totalPhilHealthErAnnual + totalPagIbigErAnnual + totalThirteenthMonth) * 100) / 100;
  const totalAnnualStatutoryAnd13th = totalStatutoryAnnual;

  return {
    records,
    adminRecords,
    sellingRecords,
    summary: {
      totalHeadcount,
      adminHeadcount,
      sellingHeadcount,
      totalMonthlySalary,
      totalMonthlyBasic: totalMonthlySalary,
      totalAnnualBasic: totalMonthlySalary * 12,
      adminMonthlySalary,
      sellingMonthlySalary,
      totalSssErMonthly,
      totalSssErAnnual,
      totalPhilHealthErMonthly,
      totalPhilHealthErAnnual,
      totalPagIbigErMonthly,
      totalPagIbigErAnnual,
      totalStatutoryMonthly,
      totalStatutoryAnnual,
      totalThirteenthMonth,
      totalAnnualStatutoryAnd13th,
      admin: {
        headcount: adminHeadcount,
        monthlyBasicTotal: adminMonthlySalary,
        sssErMonthlyTotal: adminSss,
        philHealthErMonthlyTotal: adminPh,
        pagIbigErMonthlyTotal: adminPi,
        totalMonthlyBenefits: adminMonthlyBen,
        totalAnnualBenefits: Math.round((adminMonthlyBen * 12 + admin13thMonth) * 100) / 100,
        thirteenthMonthTotal: admin13thMonth,
        totalAnnualBenefitsAnd13th: Math.round((adminMonthlyBen * 12 + admin13thMonth) * 100) / 100,
      },
      selling: {
        headcount: sellingHeadcount,
        monthlyBasicTotal: sellingMonthlySalary,
        sssErMonthlyTotal: sellingSss,
        philHealthErMonthlyTotal: sellingPh,
        pagIbigErMonthlyTotal: sellingPi,
        totalMonthlyBenefits: sellingMonthlyBen,
        totalAnnualBenefits: Math.round((sellingMonthlyBen * 12 + selling13thMonth) * 100) / 100,
        thirteenthMonthTotal: selling13thMonth,
        totalAnnualBenefitsAnd13th: Math.round((sellingMonthlyBen * 12 + selling13thMonth) * 100) / 100,
      },
    },
  };
}
