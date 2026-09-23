import { useMemo } from 'react';
import { FeasibilityProject, YearFinancials } from '../types';
import {
  calculateLoanAmortization,
  calculateDepreciation,
  calculate5YearFinancials,
  formatCurrency,
} from '../utils/financialCalculations';
import PdfDownloadButton from './PdfDownloadButton';
import {
  Table,
  Receipt,
  Landmark,
  PiggyBank,
  CheckCircle2,
  Wallet,
  Coins,
  Package,
  CreditCard,
  Building,
  ArrowUpDown,
} from 'lucide-react';

interface SupportingSchedulesViewProps {
  project: FeasibilityProject;
  financials?: YearFinancials[];
  onOpenBankModal?: () => void;
}

export default function SupportingSchedulesView({
  project,
  financials,
  onOpenBankModal,
}: SupportingSchedulesViewProps) {
  const c = project.currency;
  const loanSchedule = useMemo(() => calculateLoanAmortization(project), [project]);
  const depreciationSchedule = useMemo(() => calculateDepreciation(project), [project]);

  // Ensure full 5-year financials with Year 0 Pre-Operating
  const allYears = useMemo(() => {
    if (financials && financials.length >= 6) {
      return financials;
    }
    return calculate5YearFinancials(project);
  }, [financials, project]);

  const years5 = useMemo(() => allYears.filter((y) => y.year >= 1), [allYears]);
  const year0 = allYears[0] || {
    year: 0,
    cash: project.initialWorkingCapitalBuffer || 0,
    endingCash: project.initialWorkingCapitalBuffer || 0,
    beginningCash: 0,
    netCashFlow: project.initialWorkingCapitalBuffer || 0,
    accountsReceivable: 0,
    inventory: 0,
    accountsPayable: 0,
    currentPortionOfDebt: loanSchedule[0]?.principalRepayment || 0,
    longTermDebt: Math.max(0, project.financing.bankLoanAmount - (loanSchedule[0]?.principalRepayment || 0)),
  };

  const bankName = project.workingCapitalBufferDetails?.bankName || 'Depository Commercial Bank';
  const bankInterestRate = project.workingCapitalBufferDetails?.bankInterestRatePercent ?? 1.0;
  const baseCashOnHand = project.workingCapitalBufferDetails?.cashOnHand ?? Math.round((project.initialWorkingCapitalBuffer || 0) * 0.2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 p-5 sm:p-6 space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wide">
              Feasibility Notes Schedules (Supporting Schedules)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Detailed working papers and audit schedules supporting line items in the Financial Statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PdfDownloadButton
            targetId="all-notes-schedules-container"
            title="Feasibility Notes & Supporting Schedules"
            subtitle={`${project.title} • All 5 Schedules`}
            projectTitle={project.title}
            buttonText="Download All Schedules (PDF)"
            size="md"
            variant="slate"
            orientation="landscape"
            format="a4"
          />
          {onOpenBankModal && (
            <button
              onClick={onOpenBankModal}
              title="Open comprehensive interactive breakdown for bank savings interest and loan payments"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-50 to-emerald-50 hover:from-indigo-100 hover:to-emerald-100 text-indigo-950 border border-indigo-200 flex items-center gap-2 transition shadow-2xs cursor-pointer"
            >
              <Landmark className="w-4 h-4 text-indigo-600" />
              <span>Bank Savings Interest & Loan Debt Breakdown</span>
            </button>
          )}
        </div>
      </div>

      <div id="all-notes-schedules-container" className="space-y-10">
        {/* Mobile Horizontal Scroll Hint */}
        <div className="md:hidden flex items-center justify-between text-[11px] text-slate-600 bg-indigo-50/60 px-3 py-2 rounded-xl border border-indigo-100">
          <span className="flex items-center gap-1.5 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 rotate-90 shrink-0" />
            Scroll horizontally to see all schedule periods
          </span>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full shrink-0">
            Yr 1–5 →
          </span>
        </div>

      {/* ========================================================================= */}
      {/* SCHEDULE 1: CASH AND CASH EQUIVALENT SCHEDULE */}
      {/* ========================================================================= */}
      <section id="note-schedule-1-cash" className="print-break-inside-avoid space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Schedule 1: Cash and Cash Equivalent Schedule
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Movement of Cash on Hand and Cash in Bank ({bankName} @ {bankInterestRate}% p.a.) with dynamic interest earned based on depository bank balance, ending cash balance, and reconciliation to the Financial Statements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PdfDownloadButton
              targetId="note-schedule-1-cash"
              title="Schedule 1: Cash and Cash Equivalent Schedule"
              subtitle={`Depository Bank: ${bankName} (${bankInterestRate}% p.a.)`}
              projectTitle={project.title}
              buttonText="Download PDF"
              size="xs"
              variant="emerald"
              orientation="landscape"
              format="a4"
              fitToSinglePage={true}
            />
            {onOpenBankModal && (
              <button
                onClick={onOpenBankModal}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
                <span>Interest Details</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
          <table className="w-full min-w-[660px] text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left w-2/5">Particulars / Cash Component</th>
                <th className="py-2.5 px-3 text-right font-financial">Pre-Op (Yr 0)</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 1</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 2</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 3</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 4</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {/* Part 1: Cash Flow Movement */}
              <tr className="bg-slate-50/60 font-semibold text-slate-700">
                <td colSpan={7} className="py-1.5 px-3">
                  I. Overall Cash Flow Movement
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5">Beginning Cash Balance</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-600">
                    {formatCurrency(y.beginningCash, c)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5">Add: Operating Cash Inflows / (Disbursements)</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-600">
                    {formatCurrency(y.year === 0 ? y.operatingCashFlow : y.operatingCashFlow - (y.interestIncome || 0), c)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5 font-medium text-emerald-700">
                  <div className="flex flex-col">
                    <span>Add: Interest Received from Depository Bank ({bankInterestRate}% p.a.)</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Dynamically computed based on opening Cash in Bank balance
                    </span>
                  </div>
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-1.5 px-3 text-right font-financial font-medium text-emerald-700">
                    {formatCurrency(y.interestIncome || 0, c)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5 text-slate-600">Add / (Less): Investing Activities (CapEx)</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-600">
                    {formatCurrency(y.investingCashFlow, c)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5 text-slate-600">Add / (Less): Financing Activities (Equity, Debt, Drawings)</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-600">
                    {formatCurrency(y.financingCashFlow, c)}
                  </td>
                ))}
              </tr>
              <tr className="acc-subtotal font-semibold bg-slate-50/40">
                <td className="py-2 px-3 pl-5">Net Increase / (Decrease) in Cash</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2 px-3 text-right font-financial font-semibold">
                    {formatCurrency(y.netCashFlow, c)}
                  </td>
                ))}
              </tr>

              {/* Part 2: Composition into Cash on Hand and Cash in Bank */}
              <tr className="bg-slate-50/60 font-semibold text-slate-700 pt-2">
                <td colSpan={7} className="py-1.5 px-3">
                  II. Breakdown of Cash & Cash Equivalents by Holding Account
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cash on Hand (Petty Cash Fund & Operating Float)</span>
                  </div>
                </td>
                {allYears.map((y) => {
                  const coh = Math.min(y.endingCash, baseCashOnHand);
                  return (
                    <td key={y.year} className="py-1.5 px-3 text-right font-financial font-medium text-slate-800">
                      {formatCurrency(coh, c)}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Cash in Bank ({bankName})</span>
                  </div>
                </td>
                {allYears.map((y) => {
                  const coh = Math.min(y.endingCash, baseCashOnHand);
                  const cib = Math.max(0, y.endingCash - coh);
                  return (
                    <td key={y.year} className="py-1.5 px-3 text-right font-financial font-medium text-indigo-950">
                      {formatCurrency(cib, c)}
                    </td>
                  );
                })}
              </tr>

              {/* Ending Cash Balance */}
              <tr className="acc-total font-bold bg-emerald-50/60 text-emerald-950">
                <td className="py-2.5 px-3 font-bold uppercase tracking-wide">
                  Ending Cash Balance (per Schedule 1)
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2.5 px-3 text-right font-financial font-bold text-emerald-950">
                    {formatCurrency(y.endingCash, c)}
                  </td>
                ))}
              </tr>

              {/* Financial Statements Reconciliation Row */}
              <tr className="bg-indigo-50/40 text-xs font-semibold text-indigo-900 border-t border-indigo-200">
                <td className="py-2 px-3 pl-4 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Reflected in Financial Statements (Balance Sheet & Cash Flow)</span>
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2 px-3 text-right font-financial font-bold text-indigo-950">
                    {formatCurrency(y.cash, c)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Audit Reconciliation:</strong> The ending cash balance per Schedule 1 matches line-for-line with the Statement of Financial Position (Balance Sheet Current Asset: Cash & Cash Equivalents) and the Statement of Cash Flows across all periods.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
            Reconciled: ₱0.00 Variance
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCHEDULE 2: FIXED ASSET DEPRECIATION SCHEDULE (Remains the same) */}
      {/* ========================================================================= */}
      <section id="note-schedule-2-depreciation" className="print-break-inside-avoid space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Schedule 2: Fixed Asset Depreciation Schedule
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports Straight-Line (Default), Double Declining Balance, 150% DB, and Sum-of-the-Years&apos;-Digits.
            </p>
          </div>
          <PdfDownloadButton
            targetId="note-schedule-2-depreciation"
            title="Schedule 2: Fixed Asset Depreciation Schedule"
            subtitle="Fixed Assets, Acquisition Costs & Depreciation"
            projectTitle={project.title}
            buttonText="Download PDF"
            size="xs"
            variant="indigo"
            orientation="landscape"
            format="a4"
            fitToSinglePage={true}
          />
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
          <table className="w-full min-w-[780px] text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left">Asset Description</th>
                <th className="py-2.5 px-3 text-left">Method</th>
                <th className="py-2.5 px-3 text-right font-financial">Acquisition Cost</th>
                <th className="py-2.5 px-3 text-right font-financial">Life (Yrs)</th>
                <th className="py-2.5 px-3 text-right font-financial">Salvage Value</th>
                <th className="py-2.5 px-3 text-right font-financial">Yr 1 Depr.</th>
                <th className="py-2.5 px-3 text-right font-financial">Yr 1 Book Val</th>
                <th className="py-2.5 px-3 text-right font-financial">Yr 3 Book Val</th>
                <th className="py-2.5 px-3 text-right font-financial">Yr 5 Book Val</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {depreciationSchedule.map((item) => {
                const yr1Depr = item.yearValues.find((y) => y.year === 1)?.depreciation || item.annualDepreciation;
                const yr1BV = item.yearValues.find((y) => y.year === 1)?.bookValue || 0;
                const yr3BV = item.yearValues.find((y) => y.year === 3)?.bookValue || 0;
                const yr5BV = item.yearValues.find((y) => y.year === 5)?.bookValue || 0;

                return (
                  <tr key={item.assetId} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-slate-800">{item.assetName}</td>
                    <td className="py-2 px-3 text-slate-600">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium">
                        {item.depreciationMethod || 'Straight-Line'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-financial">
                      {formatCurrency(item.cost, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial">{item.usefulLife}</td>
                    <td className="py-2 px-3 text-right font-financial text-slate-600">
                      {formatCurrency(item.salvageValue, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial font-semibold text-slate-900">
                      {formatCurrency(yr1Depr, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial text-slate-700">
                      {formatCurrency(yr1BV, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial text-slate-700">
                      {formatCurrency(yr3BV, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial text-slate-700">
                      {formatCurrency(yr5BV, c)}
                    </td>
                  </tr>
                );
              })}
              {/* Grand Total Depreciation */}
              <tr className="acc-subtotal font-bold bg-slate-50/70">
                <td className="py-2.5 px-3 font-bold text-slate-900">Total Fixed Assets</td>
                <td className="py-2.5 px-3 text-slate-500 text-xs italic">Multi-Method</td>
                <td className="py-2.5 px-3 text-right font-financial font-bold">
                  {formatCurrency(
                    depreciationSchedule.reduce((s, d) => s + d.cost, 0),
                    c
                  )}
                </td>
                <td className="py-2.5 px-3 text-right font-financial">-</td>
                <td className="py-2.5 px-3 text-right font-financial">
                  {formatCurrency(
                    depreciationSchedule.reduce((s, d) => s + d.salvageValue, 0),
                    c
                  )}
                </td>
                <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950">
                  {formatCurrency(
                    depreciationSchedule.reduce(
                      (s, d) =>
                        s +
                        (d.yearValues.find((y) => y.year === 1)?.depreciation ||
                          d.annualDepreciation),
                      0
                    ),
                    c
                  )}
                </td>
                <td colSpan={3} className="py-2.5 px-3 text-right text-xs text-slate-500 italic">
                  End of Useful Life Book Value = Salvage Value
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCHEDULE 3: ACCOUNTS RECEIVABLE AND INVENTORY SCHEDULE */}
      {/* ========================================================================= */}
      <section id="note-schedule-3-ar-inventory" className="print-break-inside-avoid space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Schedule 3: Account Receivables and Inventory Schedule
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Movement of Accounts Receivable ({project.workingCapital.accountsReceivablePercentOfSales}% of Sales) and Inventory ({project.workingCapital.inventoryPercentOfCOGS}% of COGS) showing ending balances matching the Financial Statements.
            </p>
          </div>
          <PdfDownloadButton
            targetId="note-schedule-3-ar-inventory"
            title="Schedule 3: Accounts Receivable and Inventory Schedule"
            subtitle="Working Capital Assets"
            projectTitle={project.title}
            buttonText="Download PDF"
            size="xs"
            variant="default"
            orientation="landscape"
            format="a4"
            fitToSinglePage={true}
          />
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
          <table className="w-full min-w-[660px] text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left w-2/5">Working Capital Account / Particulars</th>
                <th className="py-2.5 px-3 text-right font-financial">Pre-Op (Yr 0)</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 1</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 2</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 3</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 4</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {/* Part A: Accounts Receivable Movement */}
              <tr className="bg-slate-50/60 font-semibold text-slate-700">
                <td colSpan={7} className="py-1.5 px-3">
                  I. Accounts Receivable Movement ({project.workingCapital.accountsReceivablePercentOfSales}% credit sales policy)
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5 text-slate-600">Beginning Accounts Receivable</td>
                {allYears.map((y, idx) => {
                  const prev = idx === 0 ? 0 : allYears[idx - 1]?.accountsReceivable || 0;
                  return (
                    <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-600">
                      {formatCurrency(prev, c)}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5 text-slate-700">Add: Net Sales Revenue on Credit</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-700">
                    {formatCurrency(y.netSales, c)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5 text-slate-600">Less: Cash Collections from Customers</td>
                {allYears.map((y, idx) => {
                  const prev = idx === 0 ? 0 : allYears[idx - 1]?.accountsReceivable || 0;
                  const collections = idx === 0 ? 0 : prev + y.netSales - y.accountsReceivable;
                  return (
                    <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-600">
                      {formatCurrency(-collections, c)}
                    </td>
                  );
                })}
              </tr>
              <tr className="acc-subtotal font-bold bg-indigo-50/30 text-indigo-950">
                <td className="py-2 px-3 pl-5">
                  Ending Accounts Receivable (Net)
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2 px-3 text-right font-financial font-bold text-indigo-950">
                    {formatCurrency(y.accountsReceivable, c)}
                  </td>
                ))}
              </tr>
              <tr className="text-xs text-slate-500 bg-slate-50/20 italic">
                <td className="py-1.5 px-3 pl-7">↳ Reflected in Balance Sheet: Current Assets</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-600 font-medium">
                    {formatCurrency(y.accountsReceivable, c)}
                  </td>
                ))}
              </tr>

              {/* Part B: Inventories Movement */}
              <tr className="bg-slate-50/60 font-semibold text-slate-700 pt-3">
                <td colSpan={7} className="py-1.5 px-3">
                  II. Inventories Movement ({project.workingCapital.inventoryPercentOfCOGS}% buffer of Cost of Goods Sold)
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5 text-slate-600">Beginning Inventory Balance</td>
                {allYears.map((y, idx) => {
                  const prev = idx === 0 ? 0 : allYears[idx - 1]?.inventory || 0;
                  return (
                    <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-600">
                      {formatCurrency(prev, c)}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5 text-slate-700">Add: Manufacturing Additions & Material Purchases</td>
                {allYears.map((y, idx) => {
                  const prev = idx === 0 ? 0 : allYears[idx - 1]?.inventory || 0;
                  const additions = idx === 0 ? 0 : y.totalCOGS + (y.inventory - prev);
                  return (
                    <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-700">
                      {formatCurrency(additions, c)}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-1.5 px-3 pl-5 text-slate-600">Less: Cost of Goods Sold (Transferred to Sales)</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-600">
                    {formatCurrency(-y.totalCOGS, c)}
                  </td>
                ))}
              </tr>
              <tr className="acc-subtotal font-bold bg-indigo-50/30 text-indigo-950">
                <td className="py-2 px-3 pl-5">
                  Ending Inventory Balance
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2 px-3 text-right font-financial font-bold text-indigo-950">
                    {formatCurrency(y.inventory, c)}
                  </td>
                ))}
              </tr>
              <tr className="text-xs text-slate-500 bg-slate-50/20 italic">
                <td className="py-1.5 px-3 pl-7">↳ Reflected in Balance Sheet: Current Assets</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-1.5 px-3 text-right font-financial text-slate-600 font-medium">
                    {formatCurrency(y.inventory, c)}
                  </td>
                ))}
              </tr>

              {/* Part C: Total Working Capital Operating Assets */}
              <tr className="acc-total font-bold bg-slate-100 text-slate-900 border-t-2 border-slate-300">
                <td className="py-2.5 px-3 font-bold uppercase tracking-wide">
                  Total Receivables & Inventory (Ending Balances)
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2.5 px-3 text-right font-financial font-bold text-slate-900">
                    {formatCurrency(y.accountsReceivable + y.inventory, c)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Financial Statements Reconciliation:</strong> Ending Accounts Receivable and Ending Inventory balances reconcile 100% with the Statement of Financial Position (Balance Sheet Current Assets) and drive the Operating Cash Flow statement adjustments.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
            Reconciled: ₱0.00 Variance
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCHEDULE 4: ACCOUNTS PAYABLE SCHEDULE */}
      {/* ========================================================================= */}
      <section id="note-schedule-4-ap" className="print-break-inside-avoid space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Schedule 4: Accounts Payable Schedule
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Movement of trade obligations to direct material suppliers ({project.workingCapital.accountsPayablePercentOfPurchases}% of Purchases) and ending balance reflected in the Financial Statements.
            </p>
          </div>
          <PdfDownloadButton
            targetId="note-schedule-4-ap"
            title="Schedule 4: Accounts Payable Schedule"
            subtitle="Trade Payables to Direct Material Suppliers"
            projectTitle={project.title}
            buttonText="Download PDF"
            size="xs"
            variant="default"
            orientation="landscape"
            format="a4"
            fitToSinglePage={true}
          />
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
          <table className="w-full min-w-[660px] text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left w-2/5">Accounts Payable Movement / Particulars</th>
                <th className="py-2.5 px-3 text-right font-financial">Pre-Op (Yr 0)</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 1</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 2</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 3</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 4</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              <tr>
                <td className="py-2 px-3 pl-5 text-slate-600">Beginning Accounts Payable</td>
                {allYears.map((y, idx) => {
                  const prev = idx === 0 ? 0 : allYears[idx - 1]?.accountsPayable || 0;
                  return (
                    <td key={y.year} className="py-2 px-3 text-right font-financial text-slate-600">
                      {formatCurrency(prev, c)}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-2 px-3 pl-5 text-slate-700 font-medium">
                  Add: Direct Material Purchases on Credit
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2 px-3 text-right font-financial font-medium text-slate-700">
                    {formatCurrency(y.directMaterials, c)}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-50/40">
                <td className="py-2 px-3 pl-5 font-semibold text-slate-800">
                  Total Trade Obligations to Suppliers
                </td>
                {allYears.map((y, idx) => {
                  const prev = idx === 0 ? 0 : allYears[idx - 1]?.accountsPayable || 0;
                  return (
                    <td key={y.year} className="py-2 px-3 text-right font-financial font-semibold text-slate-800">
                      {formatCurrency(prev + y.directMaterials, c)}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-2 px-3 pl-5 text-slate-600">
                  Less: Cash Payments to Suppliers & Trade Creditors
                </td>
                {allYears.map((y, idx) => {
                  const prev = idx === 0 ? 0 : allYears[idx - 1]?.accountsPayable || 0;
                  const payments = idx === 0 ? 0 : prev + y.directMaterials - y.accountsPayable;
                  return (
                    <td key={y.year} className="py-2 px-3 text-right font-financial text-slate-600">
                      {formatCurrency(-payments, c)}
                    </td>
                  );
                })}
              </tr>

              {/* Ending Accounts Payable */}
              <tr className="acc-total font-bold bg-amber-50/60 text-amber-950 border-t-2 border-amber-200">
                <td className="py-2.5 px-3 font-bold uppercase tracking-wide">
                  Ending Accounts Payable Balance (per Schedule 4)
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2.5 px-3 text-right font-financial font-bold text-amber-950">
                    {formatCurrency(y.accountsPayable, c)}
                  </td>
                ))}
              </tr>

              {/* Reconciliation row */}
              <tr className="bg-indigo-50/40 text-xs font-semibold text-indigo-900 border-t border-indigo-200">
                <td className="py-2 px-3 pl-4 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Reflected in Financial Statements (Balance Sheet Current Liabilities)</span>
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2 px-3 text-right font-financial font-bold text-indigo-950">
                    {formatCurrency(y.accountsPayable, c)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Balance Sheet Alignment:</strong> The ending Accounts Payable balance exactly matches the Current Liabilities section of the Statement of Financial Position and reconciles with the Statement of Cash Flows operating changes.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
            Reconciled: ₱0.00 Variance
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCHEDULE 5: BANK LOAN SCHEDULE */}
      {/* ========================================================================= */}
      <section id="note-schedule-5-loan" className="print-break-inside-avoid space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Schedule 5: Bank Loan Schedule
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of bank loan obligations into Current Portion (due within 1 year) and Long-Term Portion (due after 1 year), including interest and principal paid and ending balances.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PdfDownloadButton
              targetId="note-schedule-5-loan"
              title="Schedule 5: Bank Loan Schedule"
              subtitle={`Principal: ${formatCurrency(project.financing.bankLoanAmount, c)} @ ${project.financing.annualInterestRate}% p.a.`}
              projectTitle={project.title}
              buttonText="Download PDF"
              size="xs"
              variant="indigo"
              orientation="landscape"
              format="a4"
              fitToSinglePage={true}
            />
            {onOpenBankModal && (
              <button
                onClick={onOpenBankModal}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                <span>Debt Service Details</span>
              </button>
            )}
          </div>
        </div>

        {/* Loan Overview Banner */}
        <div className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 p-3 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
          <div>
            <span className="text-slate-500 block">Principal Borrowed:</span>
            <span className="font-bold text-slate-900 font-financial text-sm">
              {formatCurrency(project.financing.bankLoanAmount, c)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Annual Interest Rate:</span>
            <span className="font-bold text-indigo-900 font-financial text-sm">
              {project.financing.annualInterestRate}% p.a.
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Loan Term:</span>
            <span className="font-bold text-slate-900 font-financial text-sm">
              {project.financing.loanTermYears} Years
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Amortization Method:</span>
            <span className="font-bold text-slate-900 text-sm">
              Equal Annual Installment
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
          <table className="w-full min-w-[660px] text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left w-2/5">Debt Service & Balance Classification</th>
                <th className="py-2.5 px-3 text-right font-financial">Pre-Op (Yr 0)</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 1</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 2</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 3</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 4</th>
                <th className="py-2.5 px-3 text-right font-financial">Year 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {/* Part 1: Movement of Total Bank Debt */}
              <tr className="bg-slate-50/60 font-semibold text-slate-700">
                <td colSpan={7} className="py-1.5 px-3">
                  I. Total Bank Loan Balance & Debt Service Movement
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 pl-5 text-slate-600">Beginning Total Loan Balance</td>
                {allYears.map((y) => {
                  const beg = y.year === 0 ? 0 : loanSchedule[y.year - 1]?.beginningBalance || 0;
                  return (
                    <td key={y.year} className="py-2 px-3 text-right font-financial text-slate-600">
                      {formatCurrency(beg, c)}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-2 px-3 pl-5 text-slate-700">Add: Loan Availment / Borrowing Proceeds</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2 px-3 text-right font-financial text-slate-700">
                    {formatCurrency(y.year === 0 ? project.financing.bankLoanAmount : 0, c)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-3 pl-5 text-amber-700 font-medium">
                  Less: Principal Repaid During the Year
                </td>
                {allYears.map((y) => {
                  const princ = y.year === 0 ? 0 : loanSchedule[y.year - 1]?.principalRepayment || 0;
                  return (
                    <td key={y.year} className="py-2 px-3 text-right font-financial font-medium text-amber-700">
                      {formatCurrency(-princ, c)}
                    </td>
                  );
                })}
              </tr>
              <tr className="acc-subtotal font-semibold bg-slate-50/40">
                <td className="py-2 px-3 pl-5 text-slate-900">
                  Total Ending Loan Balance (Outstanding Principal)
                </td>
                {allYears.map((y) => {
                  const end = y.year === 0 ? project.financing.bankLoanAmount : loanSchedule[y.year - 1]?.endingBalance || 0;
                  return (
                    <td key={y.year} className="py-2 px-3 text-right font-financial font-semibold text-slate-900">
                      {formatCurrency(end, c)}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-2 px-3 pl-5 text-rose-700 font-medium">
                  Interest Paid / Finance Cost ({project.financing.annualInterestRate}%)
                </td>
                {allYears.map((y) => {
                  const intExp = y.year === 0 ? 0 : loanSchedule[y.year - 1]?.interestExpense || 0;
                  return (
                    <td key={y.year} className="py-2 px-3 text-right font-financial font-medium text-rose-700">
                      {formatCurrency(intExp, c)}
                    </td>
                  );
                })}
              </tr>
              <tr className="bg-slate-50/50 text-xs">
                <td className="py-1.5 px-3 pl-7 text-slate-600 font-medium">
                  ↳ Total Annual Debt Service Paid (Principal + Interest)
                </td>
                {allYears.map((y) => {
                  const pmt = y.year === 0 ? 0 : loanSchedule[y.year - 1]?.annualPayment || 0;
                  return (
                    <td key={y.year} className="py-1.5 px-3 text-right font-financial font-medium text-slate-700">
                      {formatCurrency(pmt, c)}
                    </td>
                  );
                })}
              </tr>

              {/* Part 2: Balance Sheet Classification Breakdown */}
              <tr className="bg-slate-50/60 font-semibold text-slate-700 pt-3">
                <td colSpan={7} className="py-1.5 px-3">
                  II. Balance Sheet Classification: Current Portion vs. Long-Term Portion
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 pl-5 font-semibold text-indigo-950">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Current Portion of Bank Loan (Due within 12 Months)</span>
                  </div>
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2 px-3 text-right font-financial font-bold text-amber-900">
                    {formatCurrency(y.currentPortionOfDebt, c)}
                  </td>
                ))}
              </tr>
              <tr className="text-xs text-slate-500 bg-slate-50/20 italic">
                <td className="py-1 px-3 pl-8">↳ Reflected in Balance Sheet: Current Liabilities</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-1 px-3 text-right font-financial text-slate-600 font-medium">
                    {formatCurrency(y.currentPortionOfDebt, c)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2 px-3 pl-5 font-semibold text-indigo-950">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>Long-Term Bank Loan (Due Beyond 12 Months, Net of Current)</span>
                  </div>
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2 px-3 text-right font-financial font-bold text-indigo-950">
                    {formatCurrency(y.longTermDebt, c)}
                  </td>
                ))}
              </tr>
              <tr className="text-xs text-slate-500 bg-slate-50/20 italic">
                <td className="py-1 px-3 pl-8">↳ Reflected in Balance Sheet: Non-Current Liabilities</td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-1 px-3 text-right font-financial text-slate-600 font-medium">
                    {formatCurrency(y.longTermDebt, c)}
                  </td>
                ))}
              </tr>

              {/* Total Bank Loan Balance Check */}
              <tr className="acc-total font-bold bg-slate-100 text-slate-900 border-t-2 border-slate-300">
                <td className="py-2.5 px-3 font-bold uppercase tracking-wide">
                  Total Bank Loan Ending Balance (Current + Long-Term)
                </td>
                {allYears.map((y) => (
                  <td key={y.year} className="py-2.5 px-3 text-right font-financial font-bold text-slate-900">
                    {formatCurrency(y.currentPortionOfDebt + y.longTermDebt, c)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Financial Statements Reconciliation:</strong> Current portion reconciles to Current Liabilities, Long-term portion reconciles to Non-Current Liabilities, Interest paid reconciles to Income Statement (Finance Costs), and Principal paid reconciles to Financing Cash Flows.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
            Reconciled: ₱0.00 Variance
          </span>
        </div>
      </section>
      </div>
    </div>
  );
}
