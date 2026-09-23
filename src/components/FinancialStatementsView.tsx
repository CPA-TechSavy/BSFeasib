import { useState, Fragment } from 'react';
import { FeasibilityProject, YearFinancials } from '../types';
import { formatCurrency, formatPercent } from '../utils/financialCalculations';
import PdfDownloadButton from './PdfDownloadButton';
import {
  getEffectiveClassification,
  getOwnerName,
  calculatePartnersEquitySchedule,
  calculateSoleProprietorEquitySchedule,
} from '../utils/equityCalculations';
import {
  FileText,
  DollarSign,
  PieChart,
  Scale,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  Landmark,
  Users,
  User,
  Building2,
  Sparkles,
  Layers,
} from 'lucide-react';

interface FinancialStatementsViewProps {
  project: FeasibilityProject;
  financials: YearFinancials[];
  onOpenBankModal?: () => void;
  onOpenCompanyModal?: () => void;
}

type StatementViewType = 'all' | 'income' | 'cashflow' | 'balance' | 'equity';

export default function FinancialStatementsView({
  project,
  financials,
  onOpenBankModal,
  onOpenCompanyModal,
}: FinancialStatementsViewProps) {
  const [selectedView, setSelectedView] = useState<StatementViewType>('all');
  const c = project.currency;

  const years5 = financials.slice(1); // Year 1 to 5
  const allYears = financials; // Year 0 to 5

  // Entity classification and detailed equity distribution
  const classification = getEffectiveClassification(project);
  const ownerName = getOwnerName(project);
  const partnerSchedules = calculatePartnersEquitySchedule(project, financials);
  const soleProprietorMovements = calculateSoleProprietorEquitySchedule(project, financials);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
      {/* Control / View Switcher Header */}
      <div className="no-print bg-slate-900 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
            Projected Financial Statements
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <PdfDownloadButton
            targetId="all-statements-container"
            title="Projected Financial Statements"
            subtitle={`${project.title} • Complete 5-Year Financial Statements`}
            projectTitle={project.title}
            buttonText="Download All Statements (PDF)"
            size="sm"
            variant="slate"
            orientation="landscape"
            format="a4"
          />

          {/* View Switcher Tabs */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setSelectedView('all')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition whitespace-nowrap min-h-[32px] cursor-pointer ${
                selectedView === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedView('income')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition whitespace-nowrap min-h-[32px] cursor-pointer ${
                selectedView === 'income'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Income Statement
            </button>
            <button
              onClick={() => setSelectedView('cashflow')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition whitespace-nowrap min-h-[32px] cursor-pointer ${
                selectedView === 'cashflow'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Cash Flows
            </button>
            <button
              onClick={() => setSelectedView('balance')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition whitespace-nowrap min-h-[32px] cursor-pointer ${
                selectedView === 'balance'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Balance Sheet
            </button>
            <button
              onClick={() => setSelectedView('equity')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition whitespace-nowrap min-h-[32px] cursor-pointer ${
                selectedView === 'equity'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Changes in Equity
            </button>
          </div>
        </div>
      </div>

      <div id="all-statements-container" className="p-3 sm:p-6 space-y-8 sm:space-y-10">
        {/* Mobile Horizontal Scroll Hint */}
        <div className="md:hidden flex items-center justify-between text-[11px] text-slate-600 bg-indigo-50/60 px-3 py-2 rounded-xl border border-indigo-100">
          <span className="flex items-center gap-1.5 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 rotate-90 shrink-0" />
            Scroll horizontally to view all projected years
          </span>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full shrink-0">
            Yr 1–5 →
          </span>
        </div>
        {/* ========================================================================= */}
        {/* 1. PROJECTED STATEMENT OF COMPREHENSIVE INCOME */}
        {/* ========================================================================= */}
        {(selectedView === 'all' || selectedView === 'income') && (
          <div id="statement-income" className="print-break-inside-avoid">
            <div className="flex items-center justify-between mb-4">
              <div className="w-24 hidden sm:block" />
              <div className="text-center flex-1">
                <h3 className="text-base sm:text-lg font-bold font-serif-title uppercase tracking-wider text-slate-900">
                  {project.title}
                </h3>
                <h4 className="text-sm font-semibold uppercase text-slate-700">
                  Projected Statement of Comprehensive Income
                </h4>
                <p className="text-xs text-slate-500 italic">
                  For the Years Ended 1 to 5 (Amounts in {c})
                </p>
              </div>
              <div className="w-auto flex justify-end">
                <PdfDownloadButton
                  targetId="statement-income"
                  title="Projected Statement of Comprehensive Income"
                  subtitle={`${project.title} • For the Years Ended 1 to 5 (${c})`}
                  projectTitle={project.title}
                  buttonText="Download PDF"
                  size="xs"
                  variant="default"
                  orientation="landscape"
                  format="a4"
                  fitToSinglePage={true}
                />
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[580px] text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                    <th className="py-2 text-left w-1/3">Particulars</th>
                    <th className="py-2 text-right font-financial">Year 1</th>
                    <th className="py-2 text-right font-financial">Year 2</th>
                    <th className="py-2 text-right font-financial">Year 3</th>
                    <th className="py-2 text-right font-financial">Year 4</th>
                    <th className="py-2 text-right font-financial">Year 5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                  {/* Revenue */}
                  <tr>
                    <td className="py-1.5 font-medium pl-1">Gross Sales Revenue</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial">
                        {formatCurrency(y.grossSales, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1.5 pl-4 text-slate-600">Less: Sales Discounts & Allowances</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                        {formatCurrency(-y.salesDiscounts, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/50">
                    <td className="py-1.5 pl-1">Net Sales</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial">
                        {formatCurrency(y.netSales, c)}
                      </td>
                    ))}
                  </tr>

                  {/* COGS breakdown */}
                  <tr>
                    <td className="py-1.5 font-medium pl-1 pt-3">Less: Cost of Goods Sold</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial"></td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Direct Raw Materials</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.directMaterials, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Direct Labor</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.directLabor, c)}
                      </td>
                    ))}
                  </tr>
                  {project.includeLaborBenefitsInCOGS !== false && years5.some((y) => (y.factoryLaborBenefits || 0) > 0) && (
                    <tr>
                      <td className="py-1 pl-4 text-slate-600">Production Labor Benefits (Direct & Indirect)</td>
                      {years5.map((y) => (
                        <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                          {formatCurrency(y.factoryLaborBenefits || 0, c)}
                        </td>
                      ))}
                    </tr>
                  )}
                  <tr>
                    <td
                      className="py-1 pl-4 text-slate-600"
                      title="Reflects Indirect Labor, Production Utilities, and Supplies & Misc"
                    >
                      Factory Overhead (Supplies & Utilities)
                    </td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.factoryOverheadSuppliesAndUtilities ?? y.factoryOverhead, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Depreciation - Machinery & Plant</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.factoryDepreciation, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-medium">
                    <td className="py-1.5 pl-4 text-slate-700">Total Cost of Goods Sold</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-slate-700">
                        {formatCurrency(-y.totalCOGS, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Gross Profit */}
                  <tr className="acc-subtotal font-semibold bg-indigo-50/30">
                    <td className="py-2 pl-1">Gross Profit</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-2 text-right font-financial text-indigo-950 font-bold">
                        {formatCurrency(y.grossProfit, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-xs text-slate-500 italic">
                    <td className="py-0.5 pl-4">Gross Profit Margin %</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-0.5 text-right font-financial">
                        {formatPercent(y.grossProfitMargin)}
                      </td>
                    ))}
                  </tr>

                  {/* Operating Expenses */}
                  <tr>
                    <td className="py-1.5 font-medium pl-1 pt-3">Less: Operating Expenses (SG&A)</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial"></td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Salaries</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.opexSalaries ?? 0, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">SSS</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.opexSss ?? 0, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Philhealth</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.opexPhilhealth ?? 0, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Pag-ibig</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.opexPagibig ?? 0, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">13th Month Pay</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.opex13thMonthPay ?? 0, c)}
                      </td>
                    ))}
                  </tr>
                  {(years5.some((y) => (y.opexNonStatutoryBenefits ?? 0) > 0) || ((project.nonManufacturingLaborBenefits || []).length > 0)) && (
                    <tr>
                      <td className="py-1 pl-4 text-slate-600">Non-Statutory Benefits</td>
                      {years5.map((y) => (
                        <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                          {formatCurrency(y.opexNonStatutoryBenefits ?? 0, c)}
                        </td>
                      ))}
                    </tr>
                  )}
                  {/* Operating Expense Items using Expense Name as Account Title */}
                  {(project.operatingExpenses || []).map((opex) => (
                    <tr key={opex.id} className="hover:bg-slate-50/40">
                      <td className="py-1 pl-4 text-slate-600">
                        {opex.name || 'Operating Expense'}
                      </td>
                      {years5.map((y) => {
                        const item = y.itemizedOpex?.find((i) => i.id === opex.id);
                        const fallbackAmt =
                          opex.customYearAmounts?.[y.year] ??
                          (opex.annualAmountYear1 * Math.pow(1 + (opex.annualGrowthRate || 0) / 100, y.year - 1));
                        const amt = item !== undefined ? item.amount : fallbackAmt;
                        return (
                          <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                            {formatCurrency(amt, c)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {(!project.operatingExpenses || project.operatingExpenses.length === 0) &&
                    years5.some((y) => (y.utilitiesAndRent || 0) > 0 || (y.otherOpex || 0) > 0) && (
                      <>
                        {years5.some((y) => (y.utilitiesAndRent || 0) > 0) && (
                          <tr>
                            <td className="py-1 pl-4 text-slate-600">Store / Office Rent & Utilities</td>
                            {years5.map((y) => (
                              <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                                {formatCurrency(y.utilitiesAndRent, c)}
                              </td>
                            ))}
                          </tr>
                        )}
                        {years5.some((y) => (y.otherOpex || 0) > 0) && (
                          <tr>
                            <td className="py-1 pl-4 text-slate-600">Other Operating Expenses</td>
                            {years5.map((y) => (
                              <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                                {formatCurrency(y.otherOpex, c)}
                              </td>
                            ))}
                          </tr>
                        )}
                      </>
                    )}
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Depreciation - Office & Fixtures</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.opexDepreciation, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-medium">
                    <td className="py-1.5 pl-4 text-slate-700">Total Operating Expenses</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-slate-700">
                        {formatCurrency(-y.totalOpex, c)}
                      </td>
                    ))}
                  </tr>

                  {/* EBIT */}
                  <tr className="acc-subtotal font-semibold bg-slate-50/50">
                    <td className="py-1.5 pl-1">Operating Income (EBIT)</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.ebit, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Interest Income */}
                  <tr>
                    <td className="py-1.5 pl-4 text-emerald-700">
                      <span>
                        Add: Other Income – Interest Received from Bank Account ({project.workingCapitalBufferDetails?.bankName || 'Depository Bank'} @ {project.workingCapitalBufferDetails?.bankInterestRatePercent ?? 0}%)
                      </span>
                      {onOpenBankModal && (
                        <button
                          onClick={onOpenBankModal}
                          className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                          title="Click to view bank savings interest calculation breakdown"
                        >
                          Breakdown
                        </button>
                      )}
                    </td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-emerald-700">
                        {formatCurrency(y.interestIncome ?? 0, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Finance Cost */}
                  <tr>
                    <td className="py-1.5 pl-4 text-slate-600">
                      <span>
                        Less: Finance Costs – Interest Expense on Bank Borrowings ({project.financing.annualInterestRate}%)
                      </span>
                      {onOpenBankModal && (
                        <button
                          onClick={onOpenBankModal}
                          className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 hover:bg-indigo-200 text-indigo-800 transition cursor-pointer"
                          title="Click to view bank loan capital and interest breakdown"
                        >
                          Breakdown
                        </button>
                      )}
                    </td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                        {formatCurrency(-y.interestExpense, c)}
                      </td>
                    ))}
                  </tr>

                  {/* EBT */}
                  <tr className="acc-subtotal font-semibold">
                    <td className="py-1.5 pl-1">Earnings Before Taxes (EBT)</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial">
                        {formatCurrency(y.ebt, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Tax */}
                  <tr>
                    <td className="py-1.5 pl-4 text-slate-600">
                      Less: Provision for Income Tax ({project.taxRatePercent}%)
                    </td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                        {formatCurrency(-y.taxExpense, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Net Income */}
                  <tr className="acc-total font-bold bg-emerald-50/40 text-slate-900">
                    <td className="py-2.5 pl-1 uppercase font-bold tracking-wide">
                      Net Income After Tax
                    </td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-2.5 text-right font-financial font-bold text-emerald-900">
                        {formatCurrency(y.netIncome, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-xs text-slate-500 italic">
                    <td className="py-1 pl-4">Net Profit Margin %</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatPercent(y.netProfitMargin)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic px-2">
              * Note on Cost of Goods Sold: <strong>Factory Overhead (Supplies & Utilities)</strong> reflects Indirect Labor, Utilities Production, and Supplies & Misc. The sum of <em>Production Labor Benefits (Direct & Indirect)</em>, <em>Factory Overhead (Supplies & Utilities)</em>, and <em>Depreciation - Machinery & Plant</em> equals <strong>Total Factory Overhead</strong>.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. PROJECTED STATEMENT OF CASH FLOWS */}
        {/* ========================================================================= */}
        {(selectedView === 'all' || selectedView === 'cashflow') && (
          <div id="statement-cashflow" className="print-break-inside-avoid print-break-before pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-24 hidden sm:block" />
              <div className="text-center flex-1">
                <h3 className="text-base sm:text-lg font-bold font-serif-title uppercase tracking-wider text-slate-900">
                  {project.title}
                </h3>
                <h4 className="text-sm font-semibold uppercase text-slate-700">
                  Projected Statement of Cash Flows
                </h4>
                <p className="text-xs text-slate-500 italic">
                  From Pre-Operating Year 0 through Year 5 (Amounts in {c})
                </p>
              </div>
              <div className="w-auto flex justify-end">
                <PdfDownloadButton
                  targetId="statement-cashflow"
                  title="Projected Statement of Cash Flows"
                  subtitle={`${project.title} • Pre-Op (Yr 0) through Year 5 (${c})`}
                  projectTitle={project.title}
                  buttonText="Download PDF"
                  size="xs"
                  variant="default"
                  orientation="landscape"
                  format="a4"
                  fitToSinglePage={true}
                />
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[660px] text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                    <th className="py-2 text-left w-1/3">Particulars</th>
                    <th className="py-2 text-right font-financial">Pre-Op (Yr 0)</th>
                    <th className="py-2 text-right font-financial">Year 1</th>
                    <th className="py-2 text-right font-financial">Year 2</th>
                    <th className="py-2 text-right font-financial">Year 3</th>
                    <th className="py-2 text-right font-financial">Year 4</th>
                    <th className="py-2 text-right font-financial">Year 5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                  {/* Operating Cash Flow */}
                  <tr className="bg-slate-50/60 font-semibold">
                    <td colSpan={7} className="py-1.5 pl-1">
                      I. CASH FLOWS FROM OPERATING ACTIVITIES
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4">Net Income / (Pre-Operating Loss)</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.netIncome, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Add: Non-Cash Depreciation Expense</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.year === 0 ? 0 : y.factoryDepreciation + y.opexDepreciation, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">(Increase) / Decrease in Accounts Receivable</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(
                          y.year === 0
                            ? 0
                            : -(y.accountsReceivable - (allYears[y.year - 1]?.accountsReceivable || 0)),
                          c
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">(Increase) / Decrease in Inventories</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(
                          y.year === 0
                            ? 0
                            : -(y.inventory - (allYears[y.year - 1]?.inventory || 0)),
                          c
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Increase / (Decrease) in Accounts Payable</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(
                          y.year === 0
                            ? 0
                            : y.accountsPayable - (allYears[y.year - 1]?.accountsPayable || 0),
                          c
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Net Cash Provided by / (Used in) Operating Activities</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.operatingCashFlow, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Investing Cash Flow */}
                  <tr className="bg-slate-50/60 font-semibold pt-2">
                    <td colSpan={7} className="py-1.5 pl-1">
                      II. CASH FLOWS FROM INVESTING ACTIVITIES
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Acquisition of Fixed Assets (CapEx)</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.investingCashFlow, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Net Cash Provided by / (Used in) Investing Activities</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.investingCashFlow, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Financing Cash Flow */}
                  <tr className="bg-slate-50/60 font-semibold pt-2">
                    <td colSpan={7} className="py-1.5 pl-1">
                      III. CASH FLOWS FROM FINANCING ACTIVITIES
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Equity Contribution by Owners</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.year === 0 ? project.financing.equityContribution : 0, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Proceeds from Bank Borrowing</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.year === 0 ? project.financing.bankLoanAmount : 0, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Bank Loan Principal Repayment</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(
                          y.year === 0
                            ? 0
                            : -y.currentPortionOfDebt,
                          c
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Dividend Distribution / Partner Drawings</td>
                    {allYears.map((y) => {
                      const div =
                        y.year > 0 && y.netIncome > 0
                          ? y.netIncome * (project.dividendPayoutPercent / 100)
                          : 0;
                      return (
                        <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                          {formatCurrency(-div, c)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Net Cash Provided by / (Used in) Financing Activities</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.financingCashFlow, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Net Change in Cash */}
                  <tr className="acc-subtotal font-semibold bg-indigo-50/40">
                    <td className="py-2 pl-1">NET INCREASE / (DECREASE) IN CASH</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-2 text-right font-financial font-bold">
                        {formatCurrency(y.netCashFlow, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1.5 pl-1">Add: Beginning Cash Balance</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial">
                        {formatCurrency(y.beginningCash, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-total font-bold bg-emerald-50/40">
                    <td className="py-2.5 pl-1 uppercase font-bold tracking-wide">
                      CASH BALANCE, END OF YEAR
                    </td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-2.5 text-right font-financial font-bold text-emerald-950">
                        {formatCurrency(y.endingCash, c)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>

              {/* Supplemental Cash Flow Information & Bank Disclosures (PAS 7 / IAS 7) */}
              <div className="mt-5 pt-3.5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Supplemental Cash Flow Disclosures & Bank Activity
                  </h5>
                  <span className="text-[11px] text-slate-500 italic">
                    PAS 7 Cash & Financing Disclosures
                  </span>
                </div>
                <table className="w-full min-w-[620px] text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-600 font-semibold bg-slate-50/70">
                        <th className="py-1.5 pl-2 text-left w-1/3">Disclosure Item</th>
                      <th className="py-1.5 text-right font-financial">Pre-Op (Yr 0)</th>
                      <th className="py-1.5 text-right font-financial">Year 1</th>
                      <th className="py-1.5 text-right font-financial">Year 2</th>
                      <th className="py-1.5 text-right font-financial">Year 3</th>
                      <th className="py-1.5 text-right font-financial">Year 4</th>
                      <th className="py-1.5 text-right font-financial">Year 5</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
                    <tr>
                      <td className="py-1 pl-2 text-emerald-700 font-medium">
                        Interest Received from Bank Depository Account
                      </td>
                      {allYears.map((y) => (
                        <td key={y.year} className="py-1 text-right font-financial text-emerald-700 font-medium">
                          {formatCurrency(y.interestIncome ?? 0, c)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-1 pl-2 text-slate-700 font-medium">
                        Interest Paid on Bank Borrowings
                      </td>
                      {allYears.map((y) => (
                        <td key={y.year} className="py-1 text-right font-financial text-slate-700 font-medium">
                          {formatCurrency(y.interestExpense ?? 0, c)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-1 pl-2 text-slate-600">
                        Income Taxes Paid to Bureau of Internal Revenue (BIR)
                      </td>
                      {allYears.map((y) => (
                        <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                          {formatCurrency(y.taxExpense ?? 0, c)}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-indigo-50/40 font-semibold">
                      <td className="py-1.5 pl-2 text-indigo-950 font-bold">
                        Total Cash Paid to Bank for Debt Service (Principal + Interest)
                      </td>
                      {allYears.map((y) => (
                        <td key={y.year} className="py-1.5 text-right font-financial text-indigo-950 font-bold">
                          {formatCurrency(
                            y.year === 0 ? 0 : y.currentPortionOfDebt + (y.interestExpense || 0),
                            c
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. PROJECTED STATEMENT OF FINANCIAL POSITION (BALANCE SHEET) */}
        {/* ========================================================================= */}
        {(selectedView === 'all' || selectedView === 'balance') && (
          <div id="statement-balance" className="print-break-inside-avoid print-break-before pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-24 hidden sm:block" />
              <div className="text-center flex-1">
                <h3 className="text-base sm:text-lg font-bold font-serif-title uppercase tracking-wider text-slate-900">
                  {project.companyAccount?.entityName || project.title}
                </h3>
                <h4 className="text-sm font-semibold uppercase text-slate-700">
                  Projected Statement of Financial Position (Balance Sheet)
                </h4>
                <p className="text-xs text-slate-500 italic">
                  As of Pre-Operating Year 0 through Year 5 (Amounts in {c}) • {classification}
                  {classification === 'Partnership' && ` (${partnerSchedules.length} Partners)`}
                  {classification === 'Sole Proprietorship' && ` (Proprietor: ${ownerName})`}
                </p>
              </div>
              <div className="w-auto flex justify-end">
                <PdfDownloadButton
                  targetId="statement-balance"
                  title="Projected Statement of Financial Position (Balance Sheet)"
                  subtitle={`${project.companyAccount?.entityName || project.title} • As of Pre-Op through Year 5 (${c})`}
                  projectTitle={project.title}
                  buttonText="Download PDF"
                  size="xs"
                  variant="default"
                  orientation="landscape"
                  format="a4"
                  fitToSinglePage={true}
                />
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[680px] text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                    <th className="py-2 text-left w-1/3">Particulars</th>
                    <th className="py-2 text-right font-financial">Pre-Op (Yr 0)</th>
                    <th className="py-2 text-right font-financial">Year 1</th>
                    <th className="py-2 text-right font-financial">Year 2</th>
                    <th className="py-2 text-right font-financial">Year 3</th>
                    <th className="py-2 text-right font-financial">Year 4</th>
                    <th className="py-2 text-right font-financial">Year 5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                  {/* ASSETS */}
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={7} className="py-1.5 pl-2 tracking-wide uppercase text-xs">
                      ASSETS
                    </td>
                  </tr>

                  {/* Current Assets */}
                  <tr className="bg-slate-50 font-semibold">
                    <td colSpan={7} className="py-1 pl-2 text-slate-700">
                      Current Assets
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Cash and Cash Equivalents</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.cash, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Accounts Receivable (Net)</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.accountsReceivable, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Inventories</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.inventory, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Total Current Assets</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.totalCurrentAssets, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Non-Current Assets */}
                  <tr className="bg-slate-50 font-semibold pt-2">
                    <td colSpan={7} className="py-1 pl-2 text-slate-700">
                      Non-Current Assets
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Property, Plant & Equipment (At Cost)</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.grossPPE, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Less: Accumulated Depreciation</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(-y.accumulatedDepreciation, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Net Property, Plant & Equipment</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.netPPE, c)}
                      </td>
                    ))}
                  </tr>

                  {/* TOTAL ASSETS */}
                  <tr className="acc-total font-bold bg-indigo-50/60 text-indigo-950">
                    <td className="py-2.5 pl-2 uppercase font-bold tracking-wide">TOTAL ASSETS</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-2.5 text-right font-financial font-bold text-indigo-950">
                        {formatCurrency(y.totalAssets, c)}
                      </td>
                    ))}
                  </tr>

                  {/* LIABILITIES AND EQUITY */}
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={7} className="py-1.5 pl-2 tracking-wide uppercase text-xs">
                      LIABILITIES AND EQUITY
                    </td>
                  </tr>

                  {/* Current Liabilities */}
                  <tr className="bg-slate-50 font-semibold">
                    <td colSpan={7} className="py-1 pl-2 text-slate-700">
                      Current Liabilities
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Accounts Payable</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.accountsPayable, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Current Portion of Bank Loan</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.currentPortionOfDebt, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Total Current Liabilities</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.totalCurrentLiabilities, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Non-Current Liabilities */}
                  <tr className="bg-slate-50 font-semibold pt-2">
                    <td colSpan={7} className="py-1 pl-2 text-slate-700">
                      Non-Current Liabilities
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Long-Term Bank Loan (Net of current)</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.longTermDebt, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Total Liabilities</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.totalLiabilities, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Equity */}
                  <tr className="bg-slate-50 font-semibold pt-2">
                    <td colSpan={7} className="py-1.5 pl-2 text-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase tracking-wider text-xs text-slate-700">
                          {classification === 'Sole Proprietorship'
                            ? "Owner’s Equity"
                            : "Partners’ Equity"}
                        </span>
                        {onOpenCompanyModal && (
                          <button
                            type="button"
                            onClick={onOpenCompanyModal}
                            className="no-print text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {classification === 'Partnership' ? (
                              <>
                                <Users className="w-3 h-3" />
                                <span>Configure Partners & Profit Share</span>
                              </>
                            ) : (
                              <>
                                <User className="w-3 h-3" />
                                <span>Configure Owner Details</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {classification === 'Partnership' ? (
                    <>
                      {partnerSchedules.map((partner) => (
                        <tr key={partner.id} className="hover:bg-slate-50/60">
                          <td className="py-1.5 pl-4 text-slate-700">
                            <span className="font-medium text-slate-900">{partner.name}, Capital</span>
                            <span className="text-[11px] text-emerald-700 font-semibold ml-1.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                              {partner.profitSharePercent}% profit share
                            </span>
                          </td>
                          {allYears.map((y) => (
                            <td key={y.year} className="py-1.5 text-right font-financial text-slate-800">
                              {formatCurrency(partner.yearlyData[y.year]?.endingCapital ?? 0, c)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="acc-subtotal font-semibold bg-emerald-50/30 text-slate-900">
                        <td className="py-2 pl-2 font-semibold text-slate-900 uppercase text-xs tracking-wide">
                          Total Partners’ Equity
                        </td>
                        {allYears.map((y) => (
                          <td key={y.year} className="py-2 text-right font-financial font-bold text-slate-950">
                            {formatCurrency(y.totalEquity, c)}
                          </td>
                        ))}
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr className="hover:bg-slate-50/60">
                        <td className="py-1.5 pl-4 text-slate-700">
                          <span className="font-medium text-slate-900">{ownerName}, Capital</span>
                          <span className="text-[11px] text-indigo-700 font-semibold ml-1.5 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
                            Proprietor Ending Capital
                          </span>
                        </td>
                        {allYears.map((y) => (
                          <td key={y.year} className="py-1.5 text-right font-financial text-slate-800">
                            {formatCurrency(y.totalEquity, c)}
                          </td>
                        ))}
                      </tr>
                      <tr className="acc-subtotal font-semibold bg-indigo-50/30 text-slate-900">
                        <td className="py-2 pl-2 font-semibold text-slate-900 uppercase text-xs tracking-wide">
                          Total Owner’s Equity
                        </td>
                        {allYears.map((y) => (
                          <td key={y.year} className="py-2 text-right font-financial font-bold text-slate-950">
                            {formatCurrency(y.totalEquity, c)}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}

                  {/* TOTAL LIABILITIES AND EQUITY */}
                  <tr className="acc-total font-bold bg-indigo-50/60 text-indigo-950">
                    <td className="py-2.5 pl-2 uppercase font-bold tracking-wide">
                      TOTAL LIABILITIES & EQUITY
                    </td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-2.5 text-right font-financial font-bold text-indigo-950">
                        {formatCurrency(y.totalLiabilitiesAndEquity, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Balance Verification Row */}
                  <tr className="no-print bg-slate-50/90 text-xs">
                    <td className="py-1.5 pl-2 font-medium text-slate-500">
                      Balance Check [Assets - (Liab + Eq)]
                    </td>
                    {allYears.map((y) => (
                      <td
                        key={y.year}
                        className={`py-1.5 text-right font-financial font-bold ${
                          y.isBalanced ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {y.isBalanced ? '0 (Balanced)' : formatCurrency(y.balanceDifference, c)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. STATEMENT OF CHANGES IN EQUITY */}
        {/* ========================================================================= */}
        {(selectedView === 'all' || selectedView === 'equity') && (
          <div id="statement-equity" className="print-break-inside-avoid print-break-before pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-24 hidden sm:block" />
              <div className="text-center flex-1">
                <h3 className="text-base sm:text-lg font-bold font-serif-title uppercase tracking-wider text-slate-900">
                  {project.companyAccount?.entityName || project.title}
                </h3>
                <h4 className="text-sm font-semibold uppercase text-slate-700">
                  {classification === 'Sole Proprietorship'
                    ? "Projected Statement of Changes in Owner's Equity"
                    : classification === 'Partnership'
                    ? "Projected Statement of Changes in Partners' Equity"
                    : "Projected Statement of Changes in Stockholders' Equity"}
                </h4>
                <p className="text-xs text-slate-500 italic">
                  From Inception through Year 5 (Amounts in {c}) • {classification}
                  {classification === 'Partnership' &&
                    ` (${partnerSchedules.length} Partners • Per Agreed Profit Sharing Ratio)`}
                  {classification === 'Sole Proprietorship' && ` (Proprietor: ${ownerName})`}
                </p>
              </div>
              <div className="w-auto flex justify-end">
                <PdfDownloadButton
                  targetId="statement-equity"
                  title={classification === 'Sole Proprietorship'
                    ? "Projected Statement of Changes in Owner's Equity"
                    : classification === 'Partnership'
                    ? "Projected Statement of Changes in Partners' Equity"
                    : "Projected Statement of Changes in Stockholders' Equity"}
                  subtitle={`${project.companyAccount?.entityName || project.title} • Inception through Year 5 (${c})`}
                  projectTitle={project.title}
                  buttonText="Download PDF"
                  size="xs"
                  variant="default"
                  orientation="landscape"
                  format="a4"
                  fitToSinglePage={true}
                />
              </div>
            </div>

            {/* Ownership Structure Quick Bar */}
            <div className="no-print mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Entity Form:</span>
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {classification}
                </span>
                {classification === 'Partnership' ? (
                  <span className="text-slate-600">
                    {partnerSchedules.length} Partners: {partnerSchedules.map((p) => `${p.name} (${p.profitSharePercent}%)`).join(', ')}
                  </span>
                ) : classification === 'Sole Proprietorship' ? (
                  <span className="text-slate-600">
                    Sole Owner: <strong className="text-slate-800">{ownerName}</strong>
                  </span>
                ) : (
                  <span className="text-slate-600">
                    Capital Stock: {formatCurrency(project.companyAccount?.corporation?.paidUpCapital || project.financing.equityContribution, c)}
                  </span>
                )}
              </div>
              {onOpenCompanyModal && (
                <button
                  type="button"
                  onClick={onOpenCompanyModal}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-100 text-indigo-900 border border-slate-300 transition shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <Building2 className="w-3 h-3 text-indigo-600" />
                  <span>Configure Equity & Profit Sharing</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[680px] text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-semibold text-slate-800 bg-slate-100/70">
                    <th className="py-2 text-left w-1/3 pl-2">Particulars</th>
                    <th className="py-2 text-right font-financial">Pre-Op (Yr 0)</th>
                    <th className="py-2 text-right font-financial">Year 1</th>
                    <th className="py-2 text-right font-financial">Year 2</th>
                    <th className="py-2 text-right font-financial">Year 3</th>
                    <th className="py-2 text-right font-financial">Year 4</th>
                    <th className="py-2 text-right font-financial">Year 5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                  {/* ================= PARTNERSHIP PRESENTATION ================= */}
                  {classification === 'Partnership' && (
                    <>
                      {partnerSchedules.map((partner) => (
                        <Fragment key={partner.id}>
                          {/* Partner Section Header */}
                          <tr className="bg-emerald-50/70 font-bold text-emerald-950 border-t-2 border-emerald-300">
                            <td colSpan={7} className="py-1.5 pl-2">
                              <div className="flex items-center justify-between">
                                <span className="uppercase tracking-wider text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                                  {partner.name}, Capital Account
                                </span>
                                <span className="text-[11px] font-semibold text-emerald-800 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
                                  Profit & Loss Share: {partner.profitSharePercent}%
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* Beginning Capital */}
                          <tr className="hover:bg-slate-50/60">
                            <td className="py-1.5 pl-4 text-slate-700">
                              Beginning Capital Balance ({partner.name})
                            </td>
                            {allYears.map((y) => (
                              <td key={y.year} className="py-1.5 text-right font-financial text-slate-700">
                                {formatCurrency(partner.yearlyData[y.year]?.beginningCapital ?? 0, c)}
                              </td>
                            ))}
                          </tr>

                          {/* Additional / Initial Contribution */}
                          <tr className="hover:bg-slate-50/60">
                            <td className="py-1.5 pl-4 text-slate-600">
                              Add: Initial / Additional Capital Contribution
                            </td>
                            {allYears.map((y) => (
                              <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                                {formatCurrency(partner.yearlyData[y.year]?.additionalContribution ?? 0, c)}
                              </td>
                            ))}
                          </tr>

                          {/* Share in Net Income */}
                          <tr className="hover:bg-slate-50/60">
                            <td className="py-1.5 pl-4 text-slate-800 font-medium">
                              Add / (Deduct): Share in Net Income / (Pre-Op Outlays) [{partner.profitSharePercent}%]
                            </td>
                            {allYears.map((y) => (
                              <td
                                key={y.year}
                                className={`py-1.5 text-right font-financial font-medium ${
                                  (partner.yearlyData[y.year]?.shareOfNetIncome ?? 0) < 0
                                    ? 'text-amber-800'
                                    : 'text-emerald-800'
                                }`}
                              >
                                {formatCurrency(partner.yearlyData[y.year]?.shareOfNetIncome ?? 0, c)}
                              </td>
                            ))}
                          </tr>

                          {/* Drawings */}
                          <tr className="hover:bg-slate-50/60">
                            <td className="py-1.5 pl-4 text-slate-600">
                              Less: Partner's Profit Withdrawals / Drawings
                            </td>
                            {allYears.map((y) => (
                              <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                                {formatCurrency(-(partner.yearlyData[y.year]?.drawings ?? 0), c)}
                              </td>
                            ))}
                          </tr>

                          {/* Partner Ending Capital (Matches Balance Sheet line) */}
                          <tr className="bg-emerald-50/40 font-semibold border-b border-emerald-200">
                            <td className="py-2 pl-4 font-bold text-slate-900">
                              Ending Capital Balance, {partner.name}
                              <span className="text-[10px] text-emerald-800 ml-2 italic">
                                (Reflected in Balance Sheet)
                              </span>
                            </td>
                            {allYears.map((y) => (
                              <td key={y.year} className="py-2 text-right font-financial font-bold text-emerald-950">
                                {formatCurrency(partner.yearlyData[y.year]?.endingCapital ?? 0, c)}
                              </td>
                            ))}
                          </tr>
                        </Fragment>
                      ))}

                      {/* CONSOLIDATED TOTAL PARTNERS' EQUITY */}
                      <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                        <td colSpan={7} className="py-2 pl-2 uppercase tracking-wide text-xs">
                          CONSOLIDATED TOTAL PARTNERS' EQUITY SUMMARY
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 pl-4 text-slate-700 font-medium">
                          Beginning Total Partners' Equity
                        </td>
                        {allYears.map((y) => {
                          const prevEquity = y.year === 0 ? 0 : allYears[y.year - 1].totalEquity;
                          return (
                            <td key={y.year} className="py-1.5 text-right font-financial">
                              {formatCurrency(prevEquity, c)}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-1.5 pl-4 text-slate-600">
                          Add: Partners' Total Initial / Additional Capital Contribution
                        </td>
                        {allYears.map((y) => (
                          <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                            {formatCurrency(y.year === 0 ? project.financing.equityContribution : 0, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 pl-4 text-slate-800 font-medium">
                          Add / (Deduct): Total Net Income After Tax / (Pre-Operating Outlays)
                        </td>
                        {allYears.map((y) => (
                          <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                            {formatCurrency(y.netIncome, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 pl-4 text-slate-600">
                          Less: Partners' Total Profit Drawings / Withdrawals
                        </td>
                        {allYears.map((y) => {
                          const div =
                            y.year > 0 && y.netIncome > 0
                              ? y.netIncome * ((project.dividendPayoutPercent || 0) / 100)
                              : 0;
                          return (
                            <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                              {formatCurrency(-div, c)}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="acc-total font-bold bg-emerald-100/70 text-slate-900 border-t-2 border-b-2 border-emerald-400">
                        <td className="py-2.5 pl-2 uppercase font-bold tracking-wide text-xs text-emerald-950">
                          TOTAL ENDING PARTNERS' EQUITY
                          <span className="text-[10px] text-emerald-800 ml-2 normal-case italic font-normal">
                            (Matches Balance Sheet Total Equity)
                          </span>
                        </td>
                        {allYears.map((y) => (
                          <td key={y.year} className="py-2.5 text-right font-financial font-bold text-emerald-950">
                            {formatCurrency(y.totalEquity, c)}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}

                  {/* ================= SOLE PROPRIETORSHIP PRESENTATION ================= */}
                  {classification === 'Sole Proprietorship' && (
                    <>
                      <tr className="hover:bg-slate-50/60">
                        <td className="py-2 pl-2 text-slate-800 font-medium">
                          Beginning Owner's Capital ({ownerName})
                        </td>
                        {allYears.map((y) => {
                          const prevEquity = y.year === 0 ? 0 : allYears[y.year - 1].totalEquity;
                          return (
                            <td key={y.year} className="py-2 text-right font-financial text-slate-700">
                              {formatCurrency(prevEquity, c)}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="hover:bg-slate-50/60">
                        <td className="py-2 pl-2 text-slate-600">
                          Add: Proprietor Capital Contribution ({ownerName})
                        </td>
                        {allYears.map((y) => (
                          <td key={y.year} className="py-2 text-right font-financial text-slate-600">
                            {formatCurrency(y.year === 0 ? project.financing.equityContribution : 0, c)}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-slate-50/60">
                        <td className="py-2 pl-2 text-slate-900 font-semibold">
                          Add / (Deduct): Net Income After Tax / (Pre-Operating Outlays) [Added to Owner Capital]
                        </td>
                        {allYears.map((y) => (
                          <td
                            key={y.year}
                            className={`py-2 text-right font-financial font-semibold ${
                              y.netIncome < 0 ? 'text-amber-800' : 'text-emerald-800'
                            }`}
                          >
                            {formatCurrency(y.netIncome, c)}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-slate-50/60">
                        <td className="py-2 pl-2 text-slate-600">
                          Less: Proprietor's Personal Drawings
                        </td>
                        {allYears.map((y) => {
                          const div =
                            y.year > 0 && y.netIncome > 0
                              ? y.netIncome * ((project.dividendPayoutPercent || 0) / 100)
                              : 0;
                          return (
                            <td key={y.year} className="py-2 text-right font-financial text-slate-600">
                              {formatCurrency(-div, c)}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="acc-total font-bold bg-indigo-50/60 text-slate-900 border-t-2 border-b-2 border-indigo-300">
                        <td className="py-2.5 pl-2 uppercase font-bold tracking-wide text-xs text-indigo-950">
                          ENDING OWNER'S CAPITAL ({ownerName.toUpperCase()})
                          <span className="text-[10px] text-indigo-800 ml-2 normal-case italic font-normal">
                            (Matches Balance Sheet Owner's Equity)
                          </span>
                        </td>
                        {allYears.map((y) => (
                          <td key={y.year} className="py-2.5 text-right font-financial font-bold text-indigo-950">
                            {formatCurrency(y.totalEquity, c)}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}

                  {/* ================= CORPORATION PRESENTATION ================= */}
                  {classification === 'Corporation' && (
                    <>
                      <tr>
                        <td className="py-1.5 pl-1">Beginning Stockholders' Equity</td>
                        {allYears.map((y) => {
                          const prevEquity = y.year === 0 ? 0 : allYears[y.year - 1].totalEquity;
                          return (
                            <td key={y.year} className="py-1.5 text-right font-financial">
                              {formatCurrency(prevEquity, c)}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-1.5 pl-1 text-slate-600">
                          Add: Common Stock / Paid-up Capital Stock (
                          {project.companyAccount?.corporation?.paidUpShares?.toLocaleString() || '–'} shares @ {c}
                          {project.companyAccount?.corporation?.parValuePerShare || 100} par)
                        </td>
                        {allYears.map((y) => (
                          <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                            {formatCurrency(y.year === 0 ? project.financing.equityContribution : 0, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 pl-1">
                          Add / (Deduct): Net Income After Tax / (Pre-Operating Outlays)
                        </td>
                        {allYears.map((y) => (
                          <td key={y.year} className="py-1.5 text-right font-financial">
                            {formatCurrency(y.netIncome, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 pl-1 text-slate-600">
                          Less: Cash Dividends Declared to Stockholders
                        </td>
                        {allYears.map((y) => {
                          const div =
                            y.year > 0 && y.netIncome > 0
                              ? y.netIncome * ((project.dividendPayoutPercent || 0) / 100)
                              : 0;
                          return (
                            <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                              {formatCurrency(-div, c)}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="acc-total font-bold bg-emerald-50/40 text-slate-900">
                        <td className="py-2.5 pl-1 uppercase font-bold tracking-wide">
                          TOTAL STOCKHOLDERS' EQUITY, END OF YEAR
                        </td>
                        {allYears.map((y) => (
                          <td key={y.year} className="py-2.5 text-right font-financial font-bold text-emerald-950">
                            {formatCurrency(y.totalEquity, c)}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              {/* ================= DETAILED SUPPLEMENTARY SCHEDULES ================= */}
              {/* Partnership: Multi-Year Profit Allocation & Partner Capital Accounts Schedule */}
              {classification === 'Partnership' && partnerSchedules.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-700" />
                        Partners' Individual Capital Accounts Multi-Year Schedule (Profit Sharing Allocation)
                      </h5>
                      <p className="text-[11px] text-slate-600">
                        Detail breakdown of capital contributions, net income distributed by profit ratio, drawings, and ending balances reconciling with the Balance Sheet.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Articles of Co-Partnership Profit Sharing Ratio
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                    <table className="w-full min-w-[780px] text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-300 text-slate-700 font-semibold bg-emerald-50/70">
                          <th className="py-2 pl-3 text-left">Partner Name</th>
                          <th className="py-2 text-right font-financial">Agreed Profit Ratio</th>
                          <th className="py-2 text-right font-financial">Initial Capital (Yr 0)</th>
                          <th className="py-2 text-right font-financial">Yr 1 Profit Share</th>
                          <th className="py-2 text-right font-financial">Yr 2 Profit Share</th>
                          <th className="py-2 text-right font-financial">Yr 3 Profit Share</th>
                          <th className="py-2 text-right font-financial">Yr 4 Profit Share</th>
                          <th className="py-2 text-right font-financial">Yr 5 Profit Share</th>
                          <th className="py-2 text-right font-financial pr-3">Yr 5 Ending Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {partnerSchedules.map((partner) => {
                          const yr0End = partner.yearlyData[0]?.endingCapital ?? 0;
                          const yr1Share = partner.yearlyData[1]?.shareOfNetIncome ?? 0;
                          const yr2Share = partner.yearlyData[2]?.shareOfNetIncome ?? 0;
                          const yr3Share = partner.yearlyData[3]?.shareOfNetIncome ?? 0;
                          const yr4Share = partner.yearlyData[4]?.shareOfNetIncome ?? 0;
                          const yr5Share = partner.yearlyData[5]?.shareOfNetIncome ?? 0;
                          const yr5End = partner.yearlyData[5]?.endingCapital ?? 0;

                          return (
                            <tr key={partner.id} className="hover:bg-slate-50/70">
                              <td className="py-2 pl-3 font-semibold text-slate-900 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                {partner.name}
                              </td>
                              <td className="py-2 text-right font-financial font-bold text-emerald-800">
                                {partner.profitSharePercent}%
                              </td>
                              <td className="py-2 text-right font-financial text-slate-700">
                                {formatCurrency(partner.initialContribution, c)}
                              </td>
                              <td className="py-2 text-right font-financial text-slate-800">
                                {formatCurrency(yr1Share, c)}
                              </td>
                              <td className="py-2 text-right font-financial text-slate-800">
                                {formatCurrency(yr2Share, c)}
                              </td>
                              <td className="py-2 text-right font-financial text-slate-800">
                                {formatCurrency(yr3Share, c)}
                              </td>
                              <td className="py-2 text-right font-financial text-slate-800">
                                {formatCurrency(yr4Share, c)}
                              </td>
                              <td className="py-2 text-right font-financial text-slate-800">
                                {formatCurrency(yr5Share, c)}
                              </td>
                              <td className="py-2 text-right font-financial font-bold text-slate-950 pr-3 bg-emerald-50/30">
                                {formatCurrency(yr5End, c)}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-50 font-bold border-t border-slate-300 text-slate-900">
                          <td className="py-2 pl-3 uppercase text-[11px] tracking-wide">
                            Total Partners' Capital
                          </td>
                          <td className="py-2 text-right font-financial text-emerald-900">
                            100.0%
                          </td>
                          <td className="py-2 text-right font-financial">
                            {formatCurrency(project.financing.equityContribution, c)}
                          </td>
                          <td className="py-2 text-right font-financial">
                            {formatCurrency(financials[1]?.netIncome ?? 0, c)}
                          </td>
                          <td className="py-2 text-right font-financial">
                            {formatCurrency(financials[2]?.netIncome ?? 0, c)}
                          </td>
                          <td className="py-2 text-right font-financial">
                            {formatCurrency(financials[3]?.netIncome ?? 0, c)}
                          </td>
                          <td className="py-2 text-right font-financial">
                            {formatCurrency(financials[4]?.netIncome ?? 0, c)}
                          </td>
                          <td className="py-2 text-right font-financial">
                            {formatCurrency(financials[5]?.netIncome ?? 0, c)}
                          </td>
                          <td className="py-2 text-right font-financial font-bold text-emerald-950 pr-3 bg-emerald-50/60">
                            {formatCurrency(financials[5]?.totalEquity ?? 0, c)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block">Accounting & Audit Reconciliation Notice:</strong>
                      <span>
                        Net income after tax is distributed strictly among partners in accordance with their agreed profit and loss sharing ratio. Each partner's ending capital balance for Year 0 through Year 5 reconciles 100% with the Equity section of the Projected Statement of Financial Position (Balance Sheet).
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sole Proprietorship: Capital Accumulation & Equity Progression Schedule */}
              {classification === 'Sole Proprietorship' && (
                <div className="mt-6 pt-4 border-t-2 border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-4 h-4 text-indigo-700" />
                        Proprietor Capital Accumulation & Equity Progression Schedule ({ownerName})
                      </h5>
                      <p className="text-[11px] text-slate-600">
                        Shows the progressive addition of net business earnings to the proprietor's capital account and personal drawings reconciliation.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                      Proprietorship Capital Account
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                    <table className="w-full min-w-[620px] text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-300 text-slate-700 font-semibold bg-indigo-50/60">
                          <th className="py-2 pl-3 text-left">Period</th>
                          <th className="py-2 text-right font-financial">Beginning Capital</th>
                          <th className="py-2 text-right font-financial">Capital Outlay / Investment</th>
                          <th className="py-2 text-right font-financial">Net Income Added to Capital</th>
                          <th className="py-2 text-right font-financial">Personal Drawings</th>
                          <th className="py-2 text-right font-financial pr-3">Ending Owner's Capital</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {soleProprietorMovements.map((movement) => (
                          <tr key={movement.year} className="hover:bg-slate-50/70">
                            <td className="py-2 pl-3 font-semibold text-slate-900">
                              {movement.year === 0 ? 'Pre-Operating (Year 0)' : `Operating Year ${movement.year}`}
                            </td>
                            <td className="py-2 text-right font-financial text-slate-700">
                              {formatCurrency(movement.beginningCapital, c)}
                            </td>
                            <td className="py-2 text-right font-financial text-slate-600">
                              {formatCurrency(movement.additionalContribution, c)}
                            </td>
                            <td
                              className={`py-2 text-right font-financial font-medium ${
                                movement.netIncome < 0 ? 'text-amber-800' : 'text-emerald-800'
                              }`}
                            >
                              {formatCurrency(movement.netIncome, c)}
                            </td>
                            <td className="py-2 text-right font-financial text-slate-600">
                              {formatCurrency(-movement.drawings, c)}
                            </td>
                            <td className="py-2 text-right font-financial font-bold text-indigo-950 pr-3 bg-indigo-50/30">
                              {formatCurrency(movement.endingCapital, c)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-200/80 text-[11px] text-indigo-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block">Accounting & Audit Reconciliation Notice:</strong>
                      <span>
                        In a sole proprietorship, the owner’s capital account directly absorbs annual net profit after tax and pre-operating outlays, reduced by personal drawings. The ending owner's capital for each year directly mirrors the Owner’s Equity balance presented on the Projected Statement of Financial Position (Balance Sheet).
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Corporation Capital Structure Disclosure */}
              {classification === 'Corporation' && project.companyAccount?.corporation && (
                <div className="mt-5 p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-950 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-bold block">Corporation Capital Stock Note:</span>
                    <span className="text-[11px] text-purple-800">
                      Authorized Capital Stock: {formatCurrency(project.companyAccount.corporation.authorizedCapital, c)} (
                      {(
                        project.companyAccount.corporation.authorizedShares ||
                        Math.floor(
                          project.companyAccount.corporation.authorizedCapital /
                            (project.companyAccount.corporation.parValuePerShare || 100)
                        )
                      ).toLocaleString()}{' '}
                      shares @ {formatCurrency(project.companyAccount.corporation.parValuePerShare || 100, c)} par value)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block text-sm">
                      Paid-up Capital: {formatCurrency(project.companyAccount.corporation.paidUpCapital, c)}
                    </span>
                    <span className="text-[11px] text-purple-700">
                      {(
                        project.companyAccount.corporation.paidUpShares ||
                        Math.floor(
                          project.companyAccount.corporation.paidUpCapital /
                            (project.companyAccount.corporation.parValuePerShare || 100)
                        )
                      ).toLocaleString()}{' '}
                      common shares fully subscribed & paid
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
