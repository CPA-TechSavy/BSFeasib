import { useState, useMemo } from 'react';
import { FeasibilityProject, YearFinancials } from '../types';
import {
  calculateLoanAmortization,
  formatCurrency,
  formatPercent,
} from '../utils/financialCalculations';
import {
  X,
  Landmark,
  PiggyBank,
  Receipt,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Calendar,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Download,
  HelpCircle,
  Clock,
  Sparkles,
  Sliders,
  Scale,
} from 'lucide-react';
import { downloadFile } from '../utils/exportHelpers';

interface BankInterestAndLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  financials: YearFinancials[];
}

type ModalTab = 'overview' | 'savings' | 'loan' | 'monthly';

export default function BankInterestAndLoanModal({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  financials,
}: BankInterestAndLoanModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
  const [monthlyYearView, setMonthlyYearView] = useState<number>(1);
  const [withholdingTaxRate, setWithholdingTaxRate] = useState<number>(20); // 20% standard final withholding tax on interest in many jurisdictions like PH BIR

  const c = project.currency;

  // Working capital buffer details
  const totalBuffer = project.initialWorkingCapitalBuffer || 0;
  const cashInBank =
    project.workingCapitalBufferDetails?.cashInBank ?? Math.round(totalBuffer * 0.8);
  const cashOnHand =
    project.workingCapitalBufferDetails?.cashOnHand ?? Math.round(totalBuffer * 0.2);
  const bankName =
    project.workingCapitalBufferDetails?.bankName || 'Commercial Depository Bank';
  const savingsRate =
    project.workingCapitalBufferDetails?.bankInterestRatePercent ?? 1.0;

  // Loan parameters
  const loanPrincipal = project.financing.bankLoanAmount || 0;
  const loanInterestRate = project.financing.annualInterestRate || 0;
  const loanTermYears = Math.max(1, project.financing.loanTermYears || 1);

  // Annual loan schedule
  const loanSchedule = calculateLoanAmortization(project);

  // 5-Year savings interest breakdown
  const savingsSchedule = useMemo(() => {
    return [1, 2, 3, 4, 5].map((yr) => {
      const fin = financials.find((f) => f.year === yr);
      const prevFin = financials.find((f) => f.year === yr - 1);
      const prevCash = prevFin ? prevFin.endingCash : totalBuffer;
      const prevCoh = Math.min(prevCash, cashOnHand);
      const depositBase = Math.max(0, prevCash - prevCoh);
      const annualGross = fin?.interestIncome ?? Math.round(depositBase * (savingsRate / 100));
      const monthlyGross = annualGross / 12;
      const dailyGross = annualGross / 365;
      const taxWithheld = Math.round(annualGross * (withholdingTaxRate / 100));
      const netInterest = annualGross - taxWithheld;

      return {
        year: yr,
        depositBase,
        annualGross,
        monthlyGross,
        dailyGross,
        taxWithheld,
        netInterest,
        rate: savingsRate,
      };
    });
  }, [financials, cashOnHand, totalBuffer, savingsRate, withholdingTaxRate]);

  // Totals for Savings
  const total5YrSavingsInterestGross = savingsSchedule.reduce(
    (sum, s) => sum + s.annualGross,
    0
  );
  const total5YrSavingsInterestNet = savingsSchedule.reduce(
    (sum, s) => sum + s.netInterest,
    0
  );

  // Totals for Loan
  const totalLoanInterestToPay = loanSchedule.reduce(
    (sum, r) => sum + r.interestExpense,
    0
  );
  const totalLoanPrincipalToPay = loanSchedule.reduce(
    (sum, r) => sum + r.principalRepayment,
    0
  );
  const totalDebtServiceOutflow = totalLoanPrincipalToPay + totalLoanInterestToPay;

  // Monthly Loan Schedule (Detailed Month-by-Month Amortization)
  const monthlyAmortization = useMemo(() => {
    if (loanPrincipal <= 0 || loanInterestRate <= 0) return [];
    
    // Find beginning balance for selected year
    const yrRow = loanSchedule.find((r) => r.year === monthlyYearView);
    const startBalance = yrRow ? yrRow.beginningBalance : 0;
    if (startBalance <= 0) return [];

    const monthlyRate = loanInterestRate / 100 / 12;
    const remainingMonths = Math.max(1, (loanTermYears - monthlyYearView + 1) * 12);
    
    // Monthly annuity payment for remaining term
    const monthlyPmt =
      (startBalance * (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths))) /
      (Math.pow(1 + monthlyRate, remainingMonths) - 1);

    let currBalance = startBalance;
    const months = [];

    for (let m = 1; m <= 12; m++) {
      if (currBalance <= 0.01) break;
      const interestPortion = currBalance * monthlyRate;
      const principalPortion = Math.min(monthlyPmt - interestPortion, currBalance);
      const endingBal = Math.max(0, currBalance - principalPortion);

      months.push({
        month: m,
        beginningBalance: currBalance,
        monthlyPayment: principalPortion + interestPortion,
        principalPortion,
        interestPortion,
        endingBalance: endingBal,
      });

      currBalance = endingBal;
    }

    return months;
  }, [loanPrincipal, loanInterestRate, loanTermYears, loanSchedule, monthlyYearView]);

  // Export CSV of this breakdown
  const handleExportCSV = () => {
    let csv = `FEASIBILITY STUDY - BANK SAVINGS & LOAN DEBT SERVICE BREAKDOWN\n`;
    csv += `Project: ${project.title}\nCurrency: ${c}\nGenerated: ${new Date().toLocaleDateString()}\n\n`;

    csv += `PART 1: BANK SAVINGS & INTEREST INCOME SCHEDULE\n`;
    csv += `Depository Bank: ${bankName}, Interest Rate: ${savingsRate}% p.a., Initial Bank Deposit: ${cashInBank}\n`;
    csv += `Year,Beginning Bank Balance,Gross Annual Interest Received,Est. Monthly Interest,20% Withholding Tax,Net Interest Received\n`;
    savingsSchedule.forEach((s) => {
      csv += `Year ${s.year},${s.depositBase},${s.annualGross},${s.monthlyGross.toFixed(2)},${s.taxWithheld},${s.netInterest}\n`;
    });
    csv += `5-Year Total,,${total5YrSavingsInterestGross},,,${total5YrSavingsInterestNet}\n\n`;

    csv += `PART 2: BANK LOAN DEBT SERVICE BREAKDOWN (CAPITAL REPAYMENT & INTEREST)\n`;
    csv += `Principal Borrowed: ${loanPrincipal}, Interest Rate: ${loanInterestRate}% p.a., Term: ${loanTermYears} Years\n`;
    csv += `Year,Beginning Balance,Total Annual Payment,Capital (Principal) Paid,Interest Paid,Ending Balance\n`;
    loanSchedule.forEach((r) => {
      csv += `Year ${r.year},${r.beginningBalance.toFixed(2)},${r.annualPayment.toFixed(2)},${r.principalRepayment.toFixed(2)},${r.interestExpense.toFixed(2)},${r.endingBalance.toFixed(2)}\n`;
    });
    csv += `Total Outflow,,${totalDebtServiceOutflow.toFixed(2)},${totalLoanPrincipalToPay.toFixed(2)},${totalLoanInterestToPay.toFixed(2)},\n\n`;

    csv += `PART 3: NET BANKING FINANCING POSITION\n`;
    csv += `Year,Savings Interest Received,Loan Interest Paid,Net Interest Cost (Paid - Received),Capital Repaid,Total Net Cash Outflow to Banks\n`;
    [1, 2, 3, 4, 5].forEach((yr) => {
      const s = savingsSchedule.find((item) => item.year === yr)?.annualGross || 0;
      const l = loanSchedule.find((item) => item.year === yr) || {
        interestExpense: 0,
        principalRepayment: 0,
        annualPayment: 0,
      };
      const netInterestCost = l.interestExpense - s;
      const netOutflow = l.annualPayment - s;
      csv += `Year ${yr},${s},${l.interestExpense.toFixed(2)},${netInterestCost.toFixed(2)},${l.principalRepayment.toFixed(2)},${netOutflow.toFixed(2)}\n`;
    });

    const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    downloadFile(csv, `${safeTitle}_bank_interest_and_loan_breakdown.csv`, 'text/csv');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Bank Savings Interest & Loan Debt Breakdown
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                  Feasibility Working Paper
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Detailed decomposition of interest earned on bank deposits vs. capital & interest paid on debt
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              title="Download schedule breakdown as CSV"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-300 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              title="Print breakdown"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI Quick-Stats Strip */}
        <div className="bg-slate-50/80 border-b border-slate-200 px-5 sm:px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          {/* Card 1: Bank Deposit */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1 text-emerald-700">
                <PiggyBank className="w-3.5 h-3.5" />
                Bank Deposit (Savings)
              </span>
              <span className="font-financial font-normal text-slate-600">{savingsRate}% p.a.</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-financial text-slate-900 mt-1">
              {formatCurrency(cashInBank, c)}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              Depository: <strong className="text-slate-700">{bankName}</strong>
            </div>
          </div>

          {/* Card 2: 5-Yr Savings Interest */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1 text-emerald-700">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Interest Received (5 Yrs)
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                + Income
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold font-financial text-emerald-700 mt-1">
              {formatCurrency(total5YrSavingsInterestGross, c)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Yr 1: <strong className="font-financial text-slate-700">{formatCurrency(savingsSchedule[0]?.annualGross || 0, c)}</strong> ({formatCurrency(Math.round((savingsSchedule[0]?.annualGross || 0) / 12), c)}/mo)
            </div>
          </div>

          {/* Card 3: Bank Loan Capital */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1 text-indigo-700">
                <Receipt className="w-3.5 h-3.5" />
                Loan Capital (Principal)
              </span>
              <span className="font-financial font-normal text-slate-600">{loanInterestRate}% p.a.</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-financial text-slate-900 mt-1">
              {formatCurrency(loanPrincipal, c)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Tenure: <strong className="text-slate-700">{loanTermYears} {loanTermYears === 1 ? 'Year' : 'Years'}</strong> amortized
            </div>
          </div>

          {/* Card 4: Loan Interest to Pay */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1 text-amber-700">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Total Loan Interest to Pay
              </span>
              <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.2 rounded">
                - Expense
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold font-financial text-amber-800 mt-1">
              {formatCurrency(totalLoanInterestToPay, c)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Total Debt Service: <strong className="font-financial text-slate-800">{formatCurrency(totalDebtServiceOutflow, c)}</strong>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-3 sm:px-6 scrollbar-thin shrink-0 gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>1. Comparative Overview & Net Banking Spread</span>
          </button>

          <button
            onClick={() => setActiveTab('savings')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
              activeTab === 'savings'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PiggyBank className="w-4 h-4 text-emerald-600" />
            <span>2. Savings Interest Received Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('loan')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
              activeTab === 'loan'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-indigo-600" />
            <span>3. Bank Loan Capital & Interest Repayment Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
              activeTab === 'monthly'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>4. Monthly Payment Amortization (Months 1–12)</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW & COMPARATIVE SPREAD */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Feasibility Banking Summary
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                      Interest Inflows vs. Loan Outflows (5-Year Matrix)
                    </h3>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-right shrink-0">
                    <span className="text-[10px] uppercase font-semibold text-slate-300 block">
                      5-Yr Net Interest Cost
                    </span>
                    <span className="text-xl font-bold font-financial text-amber-300">
                      {formatCurrency(totalLoanInterestToPay - total5YrSavingsInterestGross, c)}
                    </span>
                    <span className="text-[10px] text-slate-300 block mt-0.5">
                      Interest Paid ({formatCurrency(totalLoanInterestToPay, c)}) minus Interest Received ({formatCurrency(total5YrSavingsInterestGross, c)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Yearly Matrix Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Year-by-Year Banking Cash & Expense Flow Matrix
                    </h4>
                    <p className="text-xs text-slate-500">
                      Shows exactly how much interest you receive from your savings account vs. how much capital and interest you pay on your loan.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[620px] text-xs sm:text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-left">Period</th>
                        <th className="py-2.5 px-3 text-right bg-emerald-50/50 text-emerald-900 border-l border-emerald-100">
                          Interest Received (+Savings)
                        </th>
                        <th className="py-2.5 px-3 text-right bg-indigo-50/50 text-indigo-900 border-l border-indigo-100">
                          Capital (Principal) Paid
                        </th>
                        <th className="py-2.5 px-3 text-right bg-amber-50/50 text-amber-900">
                          Interest Paid (-Loan)
                        </th>
                        <th className="py-2.5 px-3 text-right bg-indigo-50/70 text-indigo-950 font-bold">
                          Total Loan Payment
                        </th>
                        <th className="py-2.5 px-3 text-right border-l border-slate-200">
                          Net Interest Cost
                        </th>
                        <th className="py-2.5 px-3 text-right border-l border-slate-200">
                          Net Cash Outflow to Banks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {[1, 2, 3, 4, 5].map((yr) => {
                        const sItem = savingsSchedule.find((s) => s.year === yr);
                        const lItem = loanSchedule.find((l) => l.year === yr) || {
                          principalRepayment: 0,
                          interestExpense: 0,
                          annualPayment: 0,
                        };

                        const interestReceived = sItem?.annualGross || 0;
                        const capitalPaid = lItem.principalRepayment;
                        const interestPaid = lItem.interestExpense;
                        const totalPayment = lItem.annualPayment;
                        const netInterestCost = interestPaid - interestReceived;
                        const netCashOutflow = totalPayment - interestReceived;

                        return (
                          <tr key={yr} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-semibold text-slate-800">Year {yr}</td>
                            
                            {/* Interest Received */}
                            <td className="py-2 px-3 text-right font-financial font-semibold text-emerald-700 bg-emerald-50/20 border-l border-emerald-100">
                              +{formatCurrency(interestReceived, c)}
                            </td>

                            {/* Capital Paid */}
                            <td className="py-2 px-3 text-right font-financial font-medium text-indigo-900 bg-indigo-50/20 border-l border-indigo-100">
                              {capitalPaid > 0 ? formatCurrency(capitalPaid, c) : '-'}
                            </td>

                            {/* Interest Paid */}
                            <td className="py-2 px-3 text-right font-financial text-amber-700 bg-amber-50/20">
                              {interestPaid > 0 ? formatCurrency(interestPaid, c) : '-'}
                            </td>

                            {/* Total Loan Payment */}
                            <td className="py-2 px-3 text-right font-financial font-bold text-slate-900 bg-indigo-50/40">
                              {totalPayment > 0 ? formatCurrency(totalPayment, c) : '-'}
                            </td>

                            {/* Net Interest Cost */}
                            <td className={`py-2 px-3 text-right font-financial font-semibold border-l border-slate-200 ${
                              netInterestCost > 0 ? 'text-amber-800' : 'text-emerald-700'
                            }`}>
                              {formatCurrency(netInterestCost, c)}
                            </td>

                            {/* Net Cash Outflow */}
                            <td className="py-2 px-3 text-right font-financial font-bold text-slate-900 border-l border-slate-200">
                              {formatCurrency(netCashOutflow, c)}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Total Row */}
                      <tr className="acc-total font-bold bg-slate-100/90 text-slate-900">
                        <td className="py-2.5 px-3 font-bold uppercase">5-Year Cumulative</td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-800 bg-emerald-100/50 border-l border-emerald-200">
                          +{formatCurrency(total5YrSavingsInterestGross, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-900 bg-indigo-100/50 border-l border-indigo-200">
                          {formatCurrency(totalLoanPrincipalToPay, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-amber-800 bg-amber-100/50">
                          {formatCurrency(totalLoanInterestToPay, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900 bg-indigo-100/60">
                          {formatCurrency(totalDebtServiceOutflow, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-amber-900 border-l border-slate-300">
                          {formatCurrency(totalLoanInterestToPay - total5YrSavingsInterestGross, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-950 border-l border-slate-300">
                          {formatCurrency(totalDebtServiceOutflow - total5YrSavingsInterestGross, c)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Accounting Treatments Callout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
                    <PiggyBank className="w-4 h-4 text-emerald-700" />
                    How Savings Interest Flows Through Statements
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>Income Statement:</strong> Recorded as <em>Interest Income</em> (Financial Revenue) added right under Operating Income (EBIT). It increases taxable income and net profit.
                    </li>
                    <li>
                      <strong>Cash Flow Statement:</strong> Flows into Net Income in Operating Cash Flows (Indirect Method).
                    </li>
                    <li>
                      <strong>Balance Sheet:</strong> Accumulated cash boosts <em>Cash and Cash Equivalents</em> under Current Assets.
                    </li>
                  </ul>
                </div>

                <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wide">
                    <Receipt className="w-4 h-4 text-indigo-700" />
                    How Loan Capital & Interest Flow Through Statements
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>Capital (Principal) Paid:</strong> Does <em>NOT</em> appear on the Income Statement! It directly reduces <em>Bank Loans Payable</em> liability on the Balance Sheet and is an outflow under <em>Financing Cash Flows</em>.
                    </li>
                    <li>
                      <strong>Interest Paid:</strong> Deducted on the Income Statement as <em>Financing Cost / Interest Expense</em>, reducing taxes by providing a tax shield (Tax Rate × Interest Expense).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BANK SAVINGS INTEREST BREAKDOWN */}
          {/* ========================================================================= */}
          {activeTab === 'savings' && (
            <div className="space-y-6">
              {/* Savings Details Bar */}
              <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Depository Account: {bankName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Initial Day 1 bank deposit allocation: <strong className="text-slate-800">{formatCurrency(cashInBank, c)}</strong> ({totalBuffer > 0 ? Math.round((cashInBank / totalBuffer) * 100) : 0}% of total initial working capital buffer)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-right">
                      <span className="text-[10px] uppercase font-semibold text-emerald-800 block">
                        Annual Savings Rate
                      </span>
                      <span className="text-base font-bold font-financial text-emerald-900">
                        {savingsRate.toFixed(2)}% p.a.
                      </span>
                    </div>

                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                        Cash on Hand (Vault)
                      </span>
                      <span className="text-sm font-bold font-financial text-slate-700">
                        {formatCurrency(cashOnHand, c)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-Year Savings Interest Schedule Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Projected Bank Savings Interest Schedule (5-Year Horizon)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Interest is calculated annually on the active cash balance maintained in the bank account.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span>Tax Withholding Note:</span>
                    <select
                      value={withholdingTaxRate}
                      onChange={(e) => setWithholdingTaxRate(parseFloat(e.target.value) || 0)}
                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-semibold text-slate-800"
                    >
                      <option value={0}>0% (Gross Presentation)</option>
                      <option value={20}>20% (Standard Final Tax)</option>
                      <option value={15}>15% Tax</option>
                      <option value={25}>25% Tax</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[620px] text-xs sm:text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-left">Period</th>
                        <th className="py-2.5 px-3 text-right">Depository Balance</th>
                        <th className="py-2.5 px-3 text-right">Interest Rate</th>
                        <th className="py-2.5 px-3 text-right text-emerald-900 bg-emerald-50/50">
                          Gross Annual Interest
                        </th>
                        <th className="py-2.5 px-3 text-right text-slate-600">
                          Est. Monthly Yield
                        </th>
                        <th className="py-2.5 px-3 text-right text-slate-500">
                          Daily Accrual (365d)
                        </th>
                        {withholdingTaxRate > 0 && (
                          <>
                            <th className="py-2.5 px-3 text-right text-slate-500">
                              Less: {withholdingTaxRate}% WHT
                            </th>
                            <th className="py-2.5 px-3 text-right text-emerald-900 bg-emerald-50/70 font-bold">
                              Net Interest Received
                            </th>
                          </>
                        )}
                        <th className="py-2.5 px-3 text-right border-l border-slate-200">
                          Cumulative Interest
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {(() => {
                        let runningGross = 0;
                        return savingsSchedule.map((s) => {
                          runningGross += s.annualGross;
                          return (
                            <tr key={s.year} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                Year {s.year}
                              </td>
                              <td className="py-2.5 px-3 text-right font-financial font-medium text-slate-800">
                                {formatCurrency(s.depositBase, c)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-financial text-indigo-700 font-semibold">
                                {s.rate.toFixed(2)}%
                              </td>
                              <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-700 bg-emerald-50/20">
                                {formatCurrency(s.annualGross, c)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-financial text-slate-700">
                                {formatCurrency(Math.round(s.monthlyGross), c)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-financial text-slate-500">
                                {formatCurrency(Math.round(s.dailyGross * 100) / 100, c)}
                              </td>
                              {withholdingTaxRate > 0 && (
                                <>
                                  <td className="py-2.5 px-3 text-right font-financial text-slate-500">
                                    -{formatCurrency(s.taxWithheld, c)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-800 bg-emerald-50/30">
                                    {formatCurrency(s.netInterest, c)}
                                  </td>
                                </>
                              )}
                              <td className="py-2.5 px-3 text-right font-financial font-semibold text-slate-900 border-l border-slate-200">
                                {formatCurrency(runningGross, c)}
                              </td>
                            </tr>
                          );
                        });
                      })()}

                      {/* Subtotal */}
                      <tr className="acc-total font-bold bg-slate-50 text-slate-900">
                        <td className="py-2.5 px-3 font-bold uppercase">Total 5-Year Interest</td>
                        <td className="py-2.5 px-3 text-right font-financial">-</td>
                        <td className="py-2.5 px-3 text-right font-financial">-</td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-800 bg-emerald-100/50">
                          {formatCurrency(total5YrSavingsInterestGross, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-slate-700">
                          {formatCurrency(Math.round(total5YrSavingsInterestGross / 60), c)}/mo avg
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial">-</td>
                        {withholdingTaxRate > 0 && (
                          <>
                            <td className="py-2.5 px-3 text-right font-financial text-slate-600">
                              -{formatCurrency(Math.round(total5YrSavingsInterestGross * (withholdingTaxRate / 100)), c)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-900 bg-emerald-100/70">
                              {formatCurrency(total5YrSavingsInterestNet, c)}
                            </td>
                          </>
                        )}
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-800 border-l border-slate-300">
                          {formatCurrency(total5YrSavingsInterestGross, c)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Explanatory Note */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  Academic Note on Savings Interest Income
                </div>
                <p>
                  In undergraduate business feasibility studies, cash in bank serves as an operating safety buffer.
                  The generated interest income represents financial income earned on liquid cash balances held at {bankName}.
                  Under standard accounting (PFRS/PAS 1), it is recognized on an accrual basis and presented on the Income Statement as <strong>Interest Income</strong> after Operating Income (EBIT).
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: BANK LOAN CAPITAL & INTEREST AMORTIZATION */}
          {/* ========================================================================= */}
          {activeTab === 'loan' && (
            <div className="space-y-6">
              {/* Loan Terms Summary Header */}
              <div className="bg-white border border-indigo-200 rounded-xl p-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Term Loan Debt Financing Structure
                      </h4>
                      <p className="text-xs text-slate-500">
                        Borrowed Capital: <strong className="text-slate-900 font-financial">{formatCurrency(loanPrincipal, c)}</strong> | Annual Interest: <strong className="text-indigo-700 font-financial">{loanInterestRate}%</strong> | Term: <strong className="text-slate-900 font-financial">{loanTermYears} {loanTermYears === 1 ? 'Year' : 'Years'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 text-right">
                      <span className="text-[10px] uppercase font-semibold text-indigo-800 block">
                        Annual Installment (Debt Service)
                      </span>
                      <span className="text-base font-bold font-financial text-indigo-900">
                        {formatCurrency(loanSchedule[0]?.annualPayment || 0, c)}
                      </span>
                    </div>

                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                        Monthly Equivalent
                      </span>
                      <span className="text-sm font-bold font-financial text-slate-700">
                        {formatCurrency(Math.round((loanSchedule[0]?.annualPayment || 0) / 12), c)}/mo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Annual Schedule Table with Capital vs Interest Highlight */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Annual Bank Debt Amortization Schedule (Equal Annuity Method)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Decomposition of each annual debt payment into <strong>Capital Repayment (Principal)</strong> and <strong>Financing Cost (Interest Expense)</strong>.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[660px] text-xs sm:text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-left">Period</th>
                        <th className="py-2.5 px-3 text-right">Beginning Balance</th>
                        <th className="py-2.5 px-3 text-right bg-indigo-50/70 text-indigo-950 font-bold border-l border-indigo-100">
                          Total Annual Payment
                        </th>
                        <th className="py-2.5 px-3 text-right bg-blue-50/70 text-blue-900 font-bold">
                          Capital (Principal) Paid
                        </th>
                        <th className="py-2.5 px-3 text-right bg-amber-50/70 text-amber-900 font-bold">
                          Interest Expense Paid
                        </th>
                        <th className="py-2.5 px-3 text-right text-slate-500">
                          Capital % vs Interest %
                        </th>
                        <th className="py-2.5 px-3 text-right border-l border-slate-200 font-semibold">
                          Ending Balance (Remaining Capital)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {loanSchedule.map((row) => {
                        const principalPct =
                          row.annualPayment > 0
                            ? Math.round((row.principalRepayment / row.annualPayment) * 100)
                            : 0;
                        const interestPct =
                          row.annualPayment > 0 ? 100 - principalPct : 0;

                        return (
                          <tr key={row.year} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              Year {row.year}
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial text-slate-700">
                              {formatCurrency(row.beginningBalance, c)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950 bg-indigo-50/30 border-l border-indigo-100">
                              {row.annualPayment > 0 ? formatCurrency(row.annualPayment, c) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-blue-800 bg-blue-50/30">
                              {row.principalRepayment > 0
                                ? formatCurrency(row.principalRepayment, c)
                                : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-amber-700 bg-amber-50/30">
                              {row.interestExpense > 0
                                ? formatCurrency(row.interestExpense, c)
                                : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial text-xs text-slate-600">
                              {row.annualPayment > 0 ? (
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-blue-700 font-semibold">{principalPct}% C</span>
                                  <span className="text-slate-400">/</span>
                                  <span className="text-amber-700 font-semibold">{interestPct}% I</span>
                                </div>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900 border-l border-slate-200">
                              {formatCurrency(row.endingBalance, c)}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Subtotal */}
                      <tr className="acc-total font-bold bg-slate-50 text-slate-900">
                        <td className="py-2.5 px-3 font-bold uppercase">Total Debt Service</td>
                        <td className="py-2.5 px-3 text-right font-financial">-</td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950 bg-indigo-100/50 border-l border-indigo-200">
                          {formatCurrency(totalDebtServiceOutflow, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-blue-900 bg-blue-100/50">
                          {formatCurrency(totalLoanPrincipalToPay, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-amber-800 bg-amber-100/50">
                          {formatCurrency(totalLoanInterestToPay, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-xs">
                          {totalDebtServiceOutflow > 0 ? (
                            <span className="font-semibold">
                              {Math.round((totalLoanPrincipalToPay / totalDebtServiceOutflow) * 100)}% Capital / {Math.round((totalLoanInterestToPay / totalDebtServiceOutflow) * 100)}% Interest
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900 border-l border-slate-300">
                          {formatCurrency(0, c)} (Fully Paid)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Ratio Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Total Borrowing Cost
                  </span>
                  <div className="text-base font-bold font-financial text-amber-800 mt-0.5">
                    {formatCurrency(totalLoanInterestToPay, c)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {loanPrincipal > 0
                      ? `${Math.round((totalLoanInterestToPay / loanPrincipal) * 100)}% of original borrowed capital`
                      : 'No loan active'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Tax Shield from Interest
                  </span>
                  <div className="text-base font-bold font-financial text-emerald-700 mt-0.5">
                    {formatCurrency(totalLoanInterestToPay * (project.taxRatePercent / 100), c)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Tax savings @ {project.taxRatePercent}% corporate tax rate
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Net Effective Interest Cost
                  </span>
                  <div className="text-base font-bold font-financial text-indigo-900 mt-0.5">
                    {formatCurrency(totalLoanInterestToPay * (1 - project.taxRatePercent / 100), c)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    After-tax cost of debt financing
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MONTHLY PAYMENT AMORTIZATION SCHEDULE (MONTHS 1 TO 12) */}
          {/* ========================================================================= */}
          {activeTab === 'monthly' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Monthly Loan Payment Amortization Schedule
                  </h4>
                  <p className="text-xs text-slate-500">
                    Detailed month-by-month breakdown showing how each regular monthly payment splits between Capital and Interest.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">Select Year:</label>
                  <select
                    value={monthlyYearView}
                    onChange={(e) => setMonthlyYearView(parseInt(e.target.value) || 1)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 focus:outline-indigo-500"
                  >
                    {Array.from({ length: loanTermYears }, (_, i) => i + 1).map((yr) => (
                      <option key={yr} value={yr}>
                        Year {yr} (Months {(yr - 1) * 12 + 1} to {yr * 12})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {monthlyAmortization.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[680px] text-xs sm:text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-left">Month</th>
                        <th className="py-2.5 px-3 text-right">Beginning Capital</th>
                        <th className="py-2.5 px-3 text-right bg-indigo-50/70 text-indigo-950 font-bold border-l border-indigo-100">
                          Monthly Payment
                        </th>
                        <th className="py-2.5 px-3 text-right bg-blue-50/70 text-blue-900 font-bold">
                          Capital (Principal)
                        </th>
                        <th className="py-2.5 px-3 text-right bg-amber-50/70 text-amber-900 font-bold">
                          Interest Paid
                        </th>
                        <th className="py-2.5 px-3 text-right border-l border-slate-200">
                          Ending Capital Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {monthlyAmortization.map((m) => {
                        const globalMonth = (monthlyYearView - 1) * 12 + m.month;
                        return (
                          <tr key={m.month} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-medium text-slate-800">
                              Month {globalMonth}{' '}
                              <span className="text-[11px] text-slate-400 font-normal">
                                (Yr {monthlyYearView}, M{m.month})
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-financial text-slate-700">
                              {formatCurrency(m.beginningBalance, c)}
                            </td>
                            <td className="py-2 px-3 text-right font-financial font-bold text-indigo-950 bg-indigo-50/30 border-l border-indigo-100">
                              {formatCurrency(m.monthlyPayment, c)}
                            </td>
                            <td className="py-2 px-3 text-right font-financial font-bold text-blue-800 bg-blue-50/30">
                              {formatCurrency(m.principalPortion, c)}
                            </td>
                            <td className="py-2 px-3 text-right font-financial font-semibold text-amber-700 bg-amber-50/30">
                              {formatCurrency(m.interestPortion, c)}
                            </td>
                            <td className="py-2 px-3 text-right font-financial font-bold text-slate-900 border-l border-slate-200">
                              {formatCurrency(m.endingBalance, c)}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Total for selected year */}
                      <tr className="acc-total font-bold bg-slate-50 text-slate-900">
                        <td className="py-2.5 px-3 font-bold uppercase">
                          Year {monthlyYearView} Total (12 Mos)
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial">-</td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950 bg-indigo-100/50 border-l border-indigo-200">
                          {formatCurrency(
                            monthlyAmortization.reduce((s, m) => s + m.monthlyPayment, 0),
                            c
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-blue-900 bg-blue-100/50">
                          {formatCurrency(
                            monthlyAmortization.reduce((s, m) => s + m.principalPortion, 0),
                            c
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-amber-800 bg-amber-100/50">
                          {formatCurrency(
                            monthlyAmortization.reduce((s, m) => s + m.interestPortion, 0),
                            c
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900 border-l border-slate-300">
                          {formatCurrency(
                            monthlyAmortization[monthlyAmortization.length - 1]?.endingBalance || 0,
                            c
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">No active bank loan in Year {monthlyYearView}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Either the loan principal is zero or the loan has already matured before this period.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Values update reactively with changes made in Assumptions & Schedules.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
            >
              Export Breakdown (.csv)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
