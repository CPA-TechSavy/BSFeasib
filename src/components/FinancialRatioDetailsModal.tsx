import React, { useEffect } from 'react';
import { FeasibilityProject, YearFinancials } from '../types';
import { formatCurrency, formatPercent } from '../utils/financialCalculations';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Sparkles,
  Calculator,
  Target,
  ArrowRight,
} from 'lucide-react';

export type RatioKey =
  // Liquidity
  | 'current_ratio'
  | 'quick_ratio'
  | 'cash_ratio'
  | 'ocf_ratio'
  // Leverage & Solvency
  | 'debt_to_equity'
  | 'debt_to_assets'
  | 'interest_coverage'
  | 'equity_multiplier'
  // Profitability
  | 'gross_profit_margin'
  | 'operating_profit_margin'
  | 'net_profit_margin'
  | 'roa'
  | 'roe'
  | 'roic'
  // Operational Efficiency / Activity
  | 'total_asset_turnover'
  | 'fixed_asset_turnover'
  | 'inventory_turnover'
  | 'dsi'
  | 'ar_turnover'
  | 'dso'
  | 'ap_turnover'
  | 'dpo'
  | 'ccc'
  | 'working_capital_turnover';

interface FinancialRatioDetailsModalProps {
  ratioKey: RatioKey | null;
  onClose: () => void;
  project: FeasibilityProject;
  financials: YearFinancials[];
}

interface RatioStaticMeta {
  title: string;
  category: string;
  categoryColor: 'blue' | 'indigo' | 'emerald' | 'amber';
  formula: string;
  formulaDescription: string;
  benchmark: string;
  benchmarkTarget: string;
  definition: string;
  importance: string;
  panelDefenseQuestion: string;
  panelDefenseTip: string;
}

const RATIO_DEFINITIONS: Record<RatioKey, RatioStaticMeta> = {
  current_ratio: {
    title: 'Current Ratio',
    category: 'Liquidity & Short-Term Solvency',
    categoryColor: 'blue',
    formula: 'Total Current Assets ÷ Total Current Liabilities',
    formulaDescription: '(Cash + Accounts Receivable + Inventory) ÷ (Accounts Payable + Current Debt)',
    benchmark: '≥ 1.50x – 2.00x',
    benchmarkTarget: 'Healthy coverage without excessive idle cash or obsolete inventory.',
    definition:
      'Measures the company’s ability to cover its short-term debts and financial obligations due within one year using short-term assets that are convertible into cash.',
    importance:
      'A Current Ratio above 1.50x reassures trade creditors, suppliers, and lending institutions that working capital operations can comfortably withstand short-term revenue interruptions.',
    panelDefenseQuestion: 'Why does your Current Ratio change across the 5 projection years?',
    panelDefenseTip:
      'Highlight that initial working capital was funded at Year 0. In later years, continuous cash accumulation from net operating income expands current assets while current liabilities remain steady, demonstrating growing liquidity safety.',
  },
  quick_ratio: {
    title: 'Quick Ratio (Acid-Test Ratio)',
    category: 'Liquidity & Short-Term Solvency',
    categoryColor: 'blue',
    formula: '(Cash & Equivalents + Accounts Receivable) ÷ Total Current Liabilities',
    formulaDescription: '(Total Current Assets − Ending Inventory) ÷ Total Current Liabilities',
    benchmark: '≥ 1.00x',
    benchmarkTarget: 'At least 1:1 coverage without relying on future merchandise/inventory sales.',
    definition:
      'A stringent test of immediate liquidity that measures whether the enterprise can pay off all current liabilities immediately using only quick, near-cash assets, excluding inventory which requires time to sell.',
    importance:
      'Eliminates inventory liquidation risk. Proves that the enterprise does not have to engage in distress selling or steep discounting to settle bills on time.',
    panelDefenseQuestion: 'What is the practical difference between your Quick Ratio and Current Ratio?',
    panelDefenseTip:
      'Explain that the difference represents the inventory buffer held to prevent stockouts. A Quick Ratio ≥ 1.0x confirms that even during severe demand drops or supply delays, obligations can be settled promptly.',
  },
  cash_ratio: {
    title: 'Cash Ratio',
    category: 'Liquidity & Short-Term Solvency',
    categoryColor: 'blue',
    formula: 'Cash & Cash Equivalents ÷ Total Current Liabilities',
    formulaDescription: 'Cash in Hand & Bank Deposits ÷ Total Current Liabilities',
    benchmark: '≥ 0.50x – 1.00x',
    benchmarkTarget: 'Substantial immediate reserve to meet unexpected expenses.',
    definition:
      'The most conservative of all liquidity metrics. It evaluates the portion of current liabilities that can be paid off instantaneously using exclusively liquid bank deposits and on-hand cash reserves.',
    importance:
      'Demonstrates ultimate cash solvency under zero collections and zero inventory movement.',
    panelDefenseQuestion: 'Is having an exceptionally high Cash Ratio always favorable?',
    panelDefenseTip:
      'Acknowledge that while high cash eliminates default risk, excessive uninvested cash carries an opportunity cost. In this study, cash balances are strategically reinvested into growth, debt retirement, and owner distributions.',
  },
  ocf_ratio: {
    title: 'Operating Cash Flow Ratio',
    category: 'Liquidity & Short-Term Solvency',
    categoryColor: 'blue',
    formula: 'Operating Cash Flow ÷ Total Current Liabilities',
    formulaDescription: 'Net Cash from Operating Activities ÷ Total Current Liabilities',
    benchmark: '≥ 1.00x',
    benchmarkTarget: 'Cash generated from daily operations should exceed short-term debt.',
    definition:
      'Compares actual cash generated from operational trading to current liabilities. Unlike accrual earnings, it measures real cash inflows from sales adjusted for working capital changes.',
    importance:
      'Proves operational self-sufficiency. High OCF coverage indicates that the business does not need emergency borrowing or equity injections to stay solvent.',
    panelDefenseQuestion: 'Why is OCF Ratio preferred by financial analysts over Net Income for liquidity?',
    panelDefenseTip:
      'Explain that Net Income contains non-cash expenses like depreciation and accruals. OCF confirms that cash is physically entering bank accounts to honor current maturities.',
  },
  debt_to_equity: {
    title: 'Debt-to-Equity (D/E) Ratio',
    category: 'Leverage & Solvency',
    categoryColor: 'indigo',
    formula: 'Total Liabilities ÷ Total Equity',
    formulaDescription: '(Current Liabilities + Long-Term Bank Debt) ÷ (Paid-in Capital + Retained Earnings)',
    benchmark: '≤ 1.50x (Ideal < 1.00x)',
    benchmarkTarget: 'Conservative capital structure with equity absorbing financial shocks.',
    definition:
      'Evaluates the proportion of total debt financing relative to the capital contributed by business owners and cumulative earnings retained in the enterprise.',
    importance:
      'Low D/E indicates low financial risk and reduced risk of bankruptcy during economic downturns.',
    panelDefenseQuestion: 'How does your debt financing evolve over the 5-year study horizon?',
    panelDefenseTip:
      'Show that as annual debt amortizations pay down bank loans and retained earnings compound, D/E steadily declines, de-leveraging the firm and enhancing financial stability.',
  },
  debt_to_assets: {
    title: 'Debt-to-Assets Ratio',
    category: 'Leverage & Solvency',
    categoryColor: 'indigo',
    formula: '(Total Liabilities ÷ Total Assets) × 100%',
    formulaDescription: 'Creditor Financing Proportion of Total Asset Base',
    benchmark: '≤ 50.0%',
    benchmarkTarget: 'Less than half of the company’s assets should be financed by outside creditors.',
    definition:
      'Specifies the percentage of the enterprise’s total economic resources (equipment, inventory, receivables, cash) that is funded through borrowed funds and trade payables.',
    importance:
      'Measures financial leverage and structural solvency. Lower values imply stronger asset protection for lenders and owners.',
    panelDefenseQuestion: 'What portion of your asset base is funded by debt vs owner equity?',
    panelDefenseTip:
      'Cite the percentage (e.g. 30%) and explain that the majority is funded through equity capital and reinvested profits, maintaining a conservative balance sheet.',
  },
  interest_coverage: {
    title: 'Interest Coverage Ratio',
    category: 'Leverage & Solvency',
    categoryColor: 'indigo',
    formula: 'EBIT (Operating Income) ÷ Interest Expense',
    formulaDescription: 'Earnings Before Interest & Taxes ÷ Annual Loan Interest Dues',
    benchmark: '≥ 3.0x (Ideal ≥ 5.0x)',
    benchmarkTarget: 'Operating profit should comfortably exceed annual financing charges.',
    definition:
      'Determines how many times operating income can cover scheduled debt interest payments. Also known as the Times Interest Earned (TIE) ratio.',
    importance:
      'A primary metric used by commercial bank credit officers to determine loan eligibility and debt service capacity.',
    panelDefenseQuestion: 'What happens if sales fall by 20%? Can you still pay interest dues?',
    panelDefenseTip:
      'Highlight the large coverage multiple (e.g. 8x–15x). Even under severe top-line stress, operating profits remain ample to service debt without defaulting.',
  },
  equity_multiplier: {
    title: 'Equity Multiplier',
    category: 'Leverage & Solvency',
    categoryColor: 'indigo',
    formula: 'Total Assets ÷ Total Equity',
    formulaDescription: 'DuPont Financial Leverage Factor: 1 + Debt-to-Equity',
    benchmark: '≤ 2.00x',
    benchmarkTarget: 'Assets are primarily supported by equity capital rather than heavy debt.',
    definition:
      'A key component of DuPont ROE analysis. It measures the degree to which a company uses financial leverage to boost return on equity.',
    importance:
      'When equity multiplier equals 1.0x, the firm has zero debt. Values between 1.2x and 1.8x reflect healthy, moderate balance sheet leverage.',
    panelDefenseQuestion: 'How does the Equity Multiplier connect to Return on Equity (ROE)?',
    panelDefenseTip:
      'Explain the DuPont formula: ROE = Net Profit Margin × Asset Turnover × Equity Multiplier. Showing that sustainable ROE is driven by margin and asset efficiency rather than excessive borrowing.',
  },
  gross_profit_margin: {
    title: 'Gross Profit Margin',
    category: 'Profitability & Margins',
    categoryColor: 'emerald',
    formula: '(Gross Profit ÷ Net Sales) × 100%',
    formulaDescription: '[(Net Sales − Total COGS) ÷ Net Sales] × 100%',
    benchmark: '≥ 30.0% – 40.0%',
    benchmarkTarget: 'Strong mark-up over direct manufacturing and ingredient costs.',
    definition:
      'Reflects the percentage of every sales dollar/peso remaining after paying direct production costs (direct materials, direct labor, and factory overhead).',
    importance:
      'Indicates production efficiency, pricing power, and cost control over raw materials.',
    panelDefenseQuestion: 'What are the main cost components depressing or driving your Gross Margin?',
    panelDefenseTip:
      'Break down Direct Materials, Direct Labor wages, and Factory Overhead. Demonstrate that volume growth spreads fixed factory depreciation over more units, preserving gross margins.',
  },
  operating_profit_margin: {
    title: 'Operating Profit Margin',
    category: 'Profitability & Margins',
    categoryColor: 'emerald',
    formula: '(Operating Income [EBIT] ÷ Net Sales) × 100%',
    formulaDescription: 'Operating Earnings After Admin & Selling Expenses ÷ Net Sales',
    benchmark: '≥ 15.0%',
    benchmarkTarget: 'Healthy operating efficiency after covering all SG&A overhead.',
    definition:
      'Measures the proportion of revenue left over after subtracting both production costs and operating expenses (salaries, admin, rent, utilities, selling, and depreciation).',
    importance:
      'Evaluates core business operations independent of financing structure and income tax rates.',
    panelDefenseQuestion: 'How do operating expenses scale relative to revenue growth?',
    panelDefenseTip:
      'Explain that administrative and rent costs are largely fixed, allowing operating margin to expand over time through operational leverage as sales volume scales.',
  },
  net_profit_margin: {
    title: 'Net Profit Margin',
    category: 'Profitability & Margins',
    categoryColor: 'emerald',
    formula: '(Net Income After Tax ÷ Net Sales) × 100%',
    formulaDescription: 'Bottom-Line Net Income ÷ Net Sales',
    benchmark: '≥ 10.0% – 15.0%',
    benchmarkTarget: 'Healthy bottom line retained after all expenses, interest, and taxes.',
    definition:
      'The ultimate bottom-line profitability metric indicating how many cents of profit are generated for each currency unit of revenue collected.',
    importance:
      'Used by business owners and investors to evaluate overall operational success and dividend distribution capability.',
    panelDefenseQuestion: 'Why does Net Profit Margin increase or decrease across the projection years?',
    panelDefenseTip:
      'Connect it to economies of scale diluting fixed overhead, diminishing loan interest as principal amortizes, and steady tax rates.',
  },
  roa: {
    title: 'Return on Assets (ROA)',
    category: 'Profitability & Margins',
    categoryColor: 'emerald',
    formula: '(Net Income ÷ Total Assets) × 100%',
    formulaDescription: 'Annual Net Earnings Generated per Unit of Total Capital Resources',
    benchmark: '≥ 10.0%',
    benchmarkTarget: 'Asset productivity superior to long-term government bond yields.',
    definition:
      'Shows how efficiently company management utilizes all economic assets (machinery, inventory, working capital) to generate net earnings.',
    importance:
      'Enables comparison of managerial efficiency across businesses regardless of capital structure.',
    panelDefenseQuestion: 'What does your ROA say about your asset utilization?',
    panelDefenseTip:
      'State that each 100 units of asset investment produces the indicated percentage of annual net income, proving that fixed capital expenditures were appropriately sized.',
  },
  roe: {
    title: 'Return on Equity (ROE)',
    category: 'Profitability & Margins',
    categoryColor: 'emerald',
    formula: '(Net Income ÷ Total Equity) × 100%',
    formulaDescription: 'Annual Net Return on Owners’ Contributed & Retained Capital',
    benchmark: '≥ 15.0% – 20.0%',
    benchmarkTarget: 'Exceeds the opportunity cost of equity capital and hurdle rate.',
    definition:
      'Measures the profitability generated directly on the equity invested by founders and accumulated retained earnings.',
    importance:
      'The primary return metric sought by prospective shareholders and venture investors.',
    panelDefenseQuestion: 'How does your projected ROE compare against your hurdle/discount rate?',
    panelDefenseTip:
      'Confirm that projected ROE comfortably surpasses the hurdle rate, validating the financial attractiveness of the project for equity investors.',
  },
  roic: {
    title: 'Return on Invested Capital (ROIC)',
    category: 'Profitability & Margins',
    categoryColor: 'emerald',
    formula: 'NOPAT ÷ Total Invested Capital',
    formulaDescription: '[EBIT × (1 − Tax Rate)] ÷ (Total Debt + Total Equity)',
    benchmark: '≥ 12.0% (Exceeds WACC)',
    benchmarkTarget: 'Value-creating enterprise generating economic profit above capital cost.',
    definition:
      'Assesses how well a company allocates capital to profitable investments. It strips out financing choices by using Net Operating Profit After Tax (NOPAT) divided by total capital provided by debt and equity holders.',
    importance:
      'A true indicator of competitive advantage and economic value creation.',
    panelDefenseQuestion: 'Is the business creating true economic value beyond its capital cost?',
    panelDefenseTip:
      'State that ROIC exceeds the cost of capital, proving that every unit of capital deployed generates a surplus return, increasing overall enterprise value.',
  },
  total_asset_turnover: {
    title: 'Total Asset Turnover',
    category: 'Operational Efficiency & Activity',
    categoryColor: 'amber',
    formula: 'Net Sales ÷ Total Assets',
    formulaDescription: 'Revenue Generated per Unit of Total Asset Base',
    benchmark: '≥ 1.00x – 1.50x',
    benchmarkTarget: 'Annual revenue equal to or exceeding the total balance sheet asset value.',
    definition:
      'Measures the overall efficiency with which an enterprise employs its entire asset base to generate top-line commercial revenue.',
    importance:
      'High asset turnover indicates lean capital allocation and active asset utilization.',
    panelDefenseQuestion: 'Does your asset turnover indicate efficient asset utilization?',
    panelDefenseTip:
      'Explain that revenue scales faster than the asset base because fixed asset investments are completed upfront in Year 0, creating operating efficiency as sales expand.',
  },
  fixed_asset_turnover: {
    title: 'Fixed Asset Turnover',
    category: 'Operational Efficiency & Activity',
    categoryColor: 'amber',
    formula: 'Net Sales ÷ Net PPE',
    formulaDescription: 'Net Sales ÷ Net Property, Plant & Equipment',
    benchmark: '≥ 2.50x – 4.00x',
    benchmarkTarget: 'Strong utilization of factory equipment, vehicles, and facilities.',
    definition:
      'Measures how effectively management utilizes fixed tangible assets (machinery, building improvements, production lines) to generate sales.',
    importance:
      'Helps analysts identify idle machinery or excessive capital expenditure commitments.',
    panelDefenseQuestion: 'Why does Fixed Asset Turnover rise significantly across the 5 years?',
    panelDefenseTip:
      'Clarify that Net PPE gradually declines due to annual depreciation while sales volume expands, demonstrating increasing production throughput per unit of book plant value.',
  },
  inventory_turnover: {
    title: 'Inventory Turnover',
    category: 'Operational Efficiency & Activity',
    categoryColor: 'amber',
    formula: 'Cost of Goods Sold (COGS) ÷ Ending Inventory',
    formulaDescription: 'How Many Times Inventory Is Replaced and Sold Annually',
    benchmark: '≥ 6.00x – 10.00x',
    benchmarkTarget: 'Regular inventory replenishment preventing spoilage or stockouts.',
    definition:
      'Indicates the velocity at which inventory is produced, sold, and replenished throughout the accounting year.',
    importance:
      'Protects against spoilage, inventory holding costs, obsolescence, and working capital traps.',
    panelDefenseQuestion: 'What inventory policy is assumed in your feasibility model?',
    panelDefenseTip:
      'State the working capital policy percentage (e.g. 8% of COGS), which ensures safety stock for uninterrupted customer deliveries while avoiding holding unnecessary excess stock.',
  },
  dsi: {
    title: 'Days Sales of Inventory (DSI)',
    category: 'Operational Efficiency & Activity',
    categoryColor: 'amber',
    formula: '(Ending Inventory ÷ COGS) × 365 Days',
    formulaDescription: '365 Days ÷ Inventory Turnover',
    benchmark: '≤ 45.0 – 60.0 Days',
    benchmarkTarget: 'Inventory moves swiftly from raw material to finished product and customer.',
    definition:
      'The average number of calendar days it takes the business to turn its inventory into sales. Also known as the Average Age of Inventory.',
    importance:
      'Lower DSI minimizes holding and warehousing costs and reduces raw material degradation.',
    panelDefenseQuestion: 'Is your DSI realistic for your industry and manufacturing cycle?',
    panelDefenseTip:
      'Relate DSI directly to production batch times and lead times for ingredient procurement, showing that inventory buffers are sufficient to prevent production halts.',
  },
  ar_turnover: {
    title: 'Accounts Receivable Turnover',
    category: 'Operational Efficiency & Activity',
    categoryColor: 'amber',
    formula: 'Net Sales ÷ Accounts Receivable',
    formulaDescription: 'Velocity of Credit Sales Collection into Cash',
    benchmark: '≥ 8.00x – 12.00x',
    benchmarkTarget: 'Customer receivables are collected within 30 to 45 days.',
    definition:
      'Quantifies how efficiently the firm extends trade credit to buyers and collects cash receipts from outstanding invoices.',
    importance:
      'High AR turnover prevents bad debts and accelerates cash conversion.',
    panelDefenseQuestion: 'What credit terms do you offer to your customers or distributors?',
    panelDefenseTip:
      'Reference the accounts receivable policy (e.g. 5% of net sales), showing disciplined trade credit granting and prompt receivables collection.',
  },
  dso: {
    title: 'Days Sales Outstanding (DSO)',
    category: 'Operational Efficiency & Activity',
    categoryColor: 'amber',
    formula: '(Accounts Receivable ÷ Net Sales) × 365 Days',
    formulaDescription: '365 Days ÷ Accounts Receivable Turnover',
    benchmark: '≤ 30.0 – 45.0 Days',
    benchmarkTarget: 'Collections align strictly with standard 30-day commercial terms.',
    definition:
      'The average number of days it takes after a sale is completed to receive actual cash payment from the customer.',
    importance:
      'Directly dictates working capital requirements; prompt collection protects operational liquidity.',
    panelDefenseQuestion: 'How will you manage collection if customers delay payments beyond DSO?',
    panelDefenseTip:
      'Mention policies such as early payment discounts, strict credit screening, and distributor deposit terms to enforce predictable DSO.',
  },
  ap_turnover: {
    title: 'Accounts Payable Turnover',
    category: 'Operational Efficiency & Activity',
    categoryColor: 'amber',
    formula: 'Direct Purchases ÷ Accounts Payable',
    formulaDescription: 'Velocity of Settling Invoices with Trade Suppliers',
    benchmark: '6.0x – 12.0x',
    benchmarkTarget: 'Honoring trade supplier credit terms without forfeiting early discounts.',
    definition:
      'Measures the frequency with which the business pays off its raw material suppliers and trade creditors within the projection year.',
    importance:
      'Demonstrates reliability with suppliers while maximizing trade credit utility.',
    panelDefenseQuestion: 'Are you taking full advantage of trade supplier credit terms?',
    panelDefenseTip:
      'Explain that the business utilizes credit terms (e.g. 30 days) to match operating cycles, preserving cash without harming supplier relationships.',
  },
  dpo: {
    title: 'Days Payable Outstanding (DPO)',
    category: 'Operational Efficiency & Activity',
    categoryColor: 'amber',
    formula: '(Accounts Payable ÷ Direct Purchases) × 365 Days',
    formulaDescription: '365 Days ÷ Accounts Payable Turnover',
    benchmark: '30.0 – 60.0 Days',
    benchmarkTarget: 'Healthy commercial payment buffer aligning with supplier credit terms.',
    definition:
      'The average time in calendar days the company takes to settle trade payables with suppliers for direct materials and inventory purchases.',
    importance:
      'A longer DPO delays cash outflows, enhancing working capital financing.',
    panelDefenseQuestion: 'Why shouldn’t DPO be extended indefinitely to save cash?',
    panelDefenseTip:
      'Emphasize that keeping DPO aligned with standard agreed supplier credit periods preserves trade trust, ensures uninterrupted deliveries, and avoids supplier penalties.',
  },
  ccc: {
    title: 'Cash Conversion Cycle (CCC)',
    category: 'Operational Efficiency & Activity',
    categoryColor: 'amber',
    formula: 'DSO + DSI − DPO',
    formulaDescription: 'Days Sales Outstanding + Days Inventory − Days Payable Outstanding',
    benchmark: 'Shorter is optimal (Ideal ≤ 30 – 45 Days)',
    benchmarkTarget: 'Minimal gap between cash paid for raw inputs and cash collected from customers.',
    definition:
      'Measures the net time (in calendar days) it takes for an enterprise to convert its cash investments into inventory, sell that inventory, and collect cash back from customers, after factoring in supplier trade credit.',
    importance:
      'The ultimate summary metric of working capital efficiency. Shorter cycles mean less external financing is required to support operations.',
    panelDefenseQuestion: 'What does your Cash Conversion Cycle tell the panel about your working capital?',
    panelDefenseTip:
      'Explain that customer collections (DSO) and inventory turnover (DSI) closely balance supplier credit (DPO), resulting in a short, lean working capital cycle that self-funds growth.',
  },
  working_capital_turnover: {
    title: 'Working Capital Turnover',
    category: 'Operational Efficiency & Activity',
    categoryColor: 'amber',
    formula: 'Net Sales ÷ Net Working Capital',
    formulaDescription: 'Net Sales ÷ (Current Assets − Current Liabilities)',
    benchmark: '≥ 2.00x – 4.00x',
    benchmarkTarget: 'Efficient conversion of circulating capital into top-line sales.',
    definition:
      'Reflects how efficiently an enterprise uses its net circulating capital (current assets less current liabilities) to generate revenue.',
    importance:
      'High working capital turnover proves that management is not hoarding unproductive working capital.',
    panelDefenseQuestion: 'Can Working Capital Turnover become dangerously high?',
    panelDefenseTip:
      'Note that while high turnover indicates lean operations, an excessively high ratio might signal overtrading or inadequate liquidity reserves. Our model balances turnover with a safe liquidity buffer.',
  },
};

export default function FinancialRatioDetailsModal({
  ratioKey,
  onClose,
  project,
  financials,
}: FinancialRatioDetailsModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!ratioKey) return null;

  const meta = RATIO_DEFINITIONS[ratioKey];
  const years5 = financials.slice(1);

  // Helper to compute ratio values and dynamic explanation per year
  function getYearAnalysis(y: YearFinancials, yrIdx: number) {
    let rawVal = 0;
    let formatted = '';
    let statusText = 'Normal';
    let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let dynamicInsight = '';

    switch (ratioKey) {
      case 'current_ratio': {
        rawVal = y.totalCurrentLiabilities > 0 ? y.totalCurrentAssets / y.totalCurrentLiabilities : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        if (rawVal >= 2.0) {
          statusText = 'Robust Liquidity';
          statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (rawVal >= 1.5) {
          statusText = 'Healthy';
          statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
        } else {
          statusText = 'Moderate';
          statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
        }
        dynamicInsight = `The business holds ${formatCurrency(y.totalCurrentAssets, project.currency)} in short-term assets against ${formatCurrency(y.totalCurrentLiabilities, project.currency)} in short-term payables & current debt, providing a ${rawVal.toFixed(2)}x cushion to absorb unexpected operational delays.`;
        break;
      }
      case 'quick_ratio': {
        const quickAssets = y.cash + y.accountsReceivable;
        rawVal = y.totalCurrentLiabilities > 0 ? quickAssets / y.totalCurrentLiabilities : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        if (rawVal >= 1.5) {
          statusText = 'Excellent Acid-Test';
          statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (rawVal >= 1.0) {
          statusText = 'Adequate';
          statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
        } else {
          statusText = 'Tight';
          statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
        }
        dynamicInsight = `Excluding ${formatCurrency(y.inventory, project.currency)} in unsold inventory, quick assets of ${formatCurrency(quickAssets, project.currency)} cover current obligations ${rawVal.toFixed(2)} times over without forced inventory liquidation.`;
        break;
      }
      case 'cash_ratio': {
        rawVal = y.totalCurrentLiabilities > 0 ? y.cash / y.totalCurrentLiabilities : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        statusText = rawVal >= 0.5 ? 'Strong Cash Cushion' : 'Moderate';
        statusColor = rawVal >= 0.5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Pure cash reserves of ${formatCurrency(y.cash, project.currency)} cover ${Math.round(rawVal * 100)}% of all immediate debts, securing day-to-day liquidity even under zero customer payments.`;
        break;
      }
      case 'ocf_ratio': {
        rawVal = y.totalCurrentLiabilities > 0 ? y.operatingCashFlow / y.totalCurrentLiabilities : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        statusText = rawVal >= 1.0 ? 'Self-Sustaining' : 'Developing';
        statusColor = rawVal >= 1.0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Operating cash generation of ${formatCurrency(y.operatingCashFlow, project.currency)} covers current liabilities ${rawVal.toFixed(2)}x, showing cash velocity from daily operations.`;
        break;
      }
      case 'debt_to_equity': {
        rawVal = y.totalEquity > 0 ? y.totalLiabilities / y.totalEquity : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        statusText = rawVal <= 0.8 ? 'Conservative' : rawVal <= 1.5 ? 'Moderate Leverage' : 'Leveraged';
        statusColor = rawVal <= 0.8 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Creditor claims represent ${Math.round(rawVal * 100)}% of owners’ equity (${formatCurrency(y.totalEquity, project.currency)}). ${yrIdx > 0 ? 'Decreases as debt is repaid and retained earnings compound.' : 'Reflects initial financing structure.'}`;
        break;
      }
      case 'debt_to_assets': {
        rawVal = y.totalAssets > 0 ? (y.totalLiabilities / y.totalAssets) * 100 : 0;
        formatted = formatPercent(rawVal);
        statusText = rawVal <= 40 ? 'Conservative' : 'Standard';
        statusColor = rawVal <= 40 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Outside creditors finance ${rawVal.toFixed(1)}% of total enterprise assets (${formatCurrency(y.totalAssets, project.currency)}), leaving the remaining ${(100 - rawVal).toFixed(1)}% securely funded by equity.`;
        break;
      }
      case 'interest_coverage': {
        rawVal = y.interestExpense > 0 ? y.ebit / y.interestExpense : 0;
        formatted = y.interestExpense > 0 ? `${rawVal.toFixed(1)}x` : 'N/A (No Debt)';
        statusText = y.interestExpense === 0 ? 'No Debt' : rawVal >= 5.0 ? 'High Coverage' : 'Sufficient';
        statusColor = rawVal >= 5.0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = y.interestExpense > 0
          ? `Operating income (EBIT) of ${formatCurrency(y.ebit, project.currency)} covers annual interest dues of ${formatCurrency(y.interestExpense, project.currency)} by ${rawVal.toFixed(1)} times, ensuring minimal default risk.`
          : 'Zero interest expense incurred as debt has been retired or zero debt financing was utilized.';
        break;
      }
      case 'equity_multiplier': {
        rawVal = y.totalEquity > 0 ? y.totalAssets / y.totalEquity : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        statusText = rawVal <= 1.8 ? 'Sound Capital Base' : 'Moderately Leveraged';
        statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Each 1.00 unit of equity capital supports ${rawVal.toFixed(2)} units of total assets. Indicates balanced leverage that amplifies ROE without excessive financial distress risk.`;
        break;
      }
      case 'gross_profit_margin': {
        rawVal = y.grossProfitMargin;
        formatted = formatPercent(rawVal);
        statusText = rawVal >= 35 ? 'Strong Margin' : 'Normal';
        statusColor = rawVal >= 35 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Gross profit of ${formatCurrency(y.grossProfit, project.currency)} represents ${rawVal.toFixed(1)}% of net sales, demonstrating healthy markup after direct material, labor, and factory overhead costs.`;
        break;
      }
      case 'operating_profit_margin': {
        rawVal = y.netSales > 0 ? (y.ebit / y.netSales) * 100 : 0;
        formatted = formatPercent(rawVal);
        statusText = rawVal >= 15 ? 'Robust Operating Core' : 'Viable';
        statusColor = rawVal >= 15 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `After covering administrative and selling overheads (${formatCurrency(y.totalOpex, project.currency)}), ${rawVal.toFixed(1)}% of revenue is retained as core operating profit.`;
        break;
      }
      case 'net_profit_margin': {
        rawVal = y.netProfitMargin;
        formatted = formatPercent(rawVal);
        statusText = rawVal >= 12 ? 'High Net Return' : 'Sound';
        statusColor = rawVal >= 12 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Final bottom-line net income is ${formatCurrency(y.netIncome, project.currency)}, yielding a net margin of ${rawVal.toFixed(1)}% after all financing charges and income taxes (${formatCurrency(y.taxExpense, project.currency)}).`;
        break;
      }
      case 'roa': {
        rawVal = y.totalAssets > 0 ? (y.netIncome / y.totalAssets) * 100 : 0;
        formatted = formatPercent(rawVal);
        statusText = rawVal >= 10 ? 'High Productivity' : 'Adequate';
        statusColor = rawVal >= 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Total assets generate ${rawVal.toFixed(1)}% in net annual earnings. Demonstrates that equipment and operating working capital are actively generating bottom-line value.`;
        break;
      }
      case 'roe': {
        rawVal = y.totalEquity > 0 ? (y.netIncome / y.totalEquity) * 100 : 0;
        formatted = formatPercent(rawVal);
        statusText = rawVal >= 15 ? 'Superior Owner Return' : 'Solid';
        statusColor = rawVal >= 15 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Owners’ investment of ${formatCurrency(y.totalEquity, project.currency)} yields an annual return of ${rawVal.toFixed(1)}%, exceeding general equity market benchmarks.`;
        break;
      }
      case 'roic': {
        const nopat = y.ebit * (1 - project.taxRatePercent / 100);
        const totalDebt = y.longTermDebt + y.currentPortionOfDebt;
        const capital = y.totalEquity + totalDebt;
        rawVal = capital > 0 ? (nopat / capital) * 100 : 0;
        formatted = formatPercent(rawVal);
        statusText = rawVal >= project.discountRatePercent ? 'Value Accretive' : 'Adequate';
        statusColor = rawVal >= project.discountRatePercent ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `NOPAT of ${formatCurrency(nopat, project.currency)} yields an ROIC of ${rawVal.toFixed(1)}% against invested capital of ${formatCurrency(capital, project.currency)}, generating surplus economic return above hurdle rates.`;
        break;
      }
      case 'total_asset_turnover': {
        rawVal = y.totalAssets > 0 ? y.netSales / y.totalAssets : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        statusText = rawVal >= 1.0 ? 'Efficient Turnover' : 'Moderate';
        statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Every 1.00 unit of assets generates ${rawVal.toFixed(2)} units of net commercial sales, reflecting productive capacity utilization.`;
        break;
      }
      case 'fixed_asset_turnover': {
        rawVal = y.netPPE > 0 ? y.netSales / y.netPPE : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        statusText = rawVal >= 2.5 ? 'Active Plant Utilization' : 'Standard';
        statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Net equipment and physical assets of ${formatCurrency(y.netPPE, project.currency)} produce ${formatCurrency(y.netSales, project.currency)} in sales (${rawVal.toFixed(2)}x turnover).`;
        break;
      }
      case 'inventory_turnover': {
        rawVal = y.inventory > 0 ? y.totalCOGS / y.inventory : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        statusText = rawVal >= 6.0 ? 'Rapid Turnover' : 'Standard Velocity';
        statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Production stock turns over ${rawVal.toFixed(2)} times per year, ensuring fresh inventory flow and mitigating holding losses.`;
        break;
      }
      case 'dsi': {
        const invTurn = y.inventory > 0 ? y.totalCOGS / y.inventory : 0;
        rawVal = invTurn > 0 ? 365 / invTurn : 0;
        formatted = `${rawVal.toFixed(1)} Days`;
        statusText = rawVal <= 60 ? 'Lean Holding Period' : 'Buffer';
        statusColor = rawVal <= 60 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Inventory remains in the production pipeline and warehouse for approximately ${rawVal.toFixed(1)} calendar days before delivery to buyers.`;
        break;
      }
      case 'ar_turnover': {
        rawVal = y.accountsReceivable > 0 ? y.netSales / y.accountsReceivable : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        statusText = rawVal >= 8.0 ? 'Prompt Invoicing' : 'Normal';
        statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Trade receivables are collected and recycled ${rawVal.toFixed(2)} times per year, demonstrating active cash flow discipline.`;
        break;
      }
      case 'dso': {
        const arTurn = y.accountsReceivable > 0 ? y.netSales / y.accountsReceivable : 0;
        rawVal = arTurn > 0 ? 365 / arTurn : 0;
        formatted = `${rawVal.toFixed(1)} Days`;
        statusText = rawVal <= 45 ? 'Swift Collections' : 'Standard';
        statusColor = rawVal <= 45 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Average collection duration is ${rawVal.toFixed(1)} days from invoice generation to actual bank deposit.`;
        break;
      }
      case 'ap_turnover': {
        const purchases = y.directMaterials > 0 ? y.directMaterials : y.totalCOGS * 0.6;
        rawVal = y.accountsPayable > 0 ? purchases / y.accountsPayable : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        statusText = 'Consistent Settlement';
        statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Direct material purchases of ${formatCurrency(purchases, project.currency)} are settled across ${rawVal.toFixed(2)} annual turnover cycles.`;
        break;
      }
      case 'dpo': {
        const purchases = y.directMaterials > 0 ? y.directMaterials : y.totalCOGS * 0.6;
        const apTurn = y.accountsPayable > 0 ? purchases / y.accountsPayable : 0;
        rawVal = apTurn > 0 ? 365 / apTurn : 0;
        formatted = `${rawVal.toFixed(1)} Days`;
        statusText = 'Standard Terms';
        statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Trade payables to suppliers are honored on average every ${rawVal.toFixed(1)} days, matching conventional credit arrangements.`;
        break;
      }
      case 'ccc': {
        const invTurn = y.inventory > 0 ? y.totalCOGS / y.inventory : 0;
        const dsi = invTurn > 0 ? 365 / invTurn : 0;
        const arTurn = y.accountsReceivable > 0 ? y.netSales / y.accountsReceivable : 0;
        const dso = arTurn > 0 ? 365 / arTurn : 0;
        const purchases = y.directMaterials > 0 ? y.directMaterials : y.totalCOGS * 0.6;
        const apTurn = y.accountsPayable > 0 ? purchases / y.accountsPayable : 0;
        const dpo = apTurn > 0 ? 365 / apTurn : 0;
        rawVal = dso + dsi - dpo;
        formatted = `${rawVal.toFixed(1)} Days`;
        statusText = rawVal <= 45 ? 'Lean & Efficient' : 'Normal Cycle';
        statusColor = rawVal <= 45 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Takes ${rawVal.toFixed(1)} days from paying suppliers for materials until cash is recouped from customer sales (DSO ${dso.toFixed(1)}d + DSI ${dsi.toFixed(1)}d − DPO ${dpo.toFixed(1)}d).`;
        break;
      }
      case 'working_capital_turnover': {
        const nwc = y.totalCurrentAssets - y.totalCurrentLiabilities;
        rawVal = nwc > 0 ? y.netSales / nwc : 0;
        formatted = `${rawVal.toFixed(2)}x`;
        statusText = rawVal >= 2.0 ? 'Active Capital Velocity' : 'Sound';
        statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
        dynamicInsight = `Net working capital of ${formatCurrency(nwc, project.currency)} is turned over ${rawVal.toFixed(2)} times to support top-line net sales of ${formatCurrency(y.netSales, project.currency)}.`;
        break;
      }
    }

    return {
      year: y.year,
      formatted,
      statusText,
      statusColor,
      dynamicInsight,
    };
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                {meta.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Ratio Analysis & Meaning
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              {meta.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* FORMULA & BENCHMARK SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1">
                <Calculator className="w-4 h-4 text-indigo-600" />
                Computation Formula
              </div>
              <div className="text-sm font-bold font-mono text-indigo-950 mt-1">
                {meta.formula}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {meta.formulaDescription}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1">
                <Target className="w-4 h-4 text-emerald-600" />
                Standard Benchmark
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {meta.benchmark}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {meta.benchmarkTarget}
              </div>
            </div>
          </div>

          {/* WHAT THIS RATIO MEANS */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              What This Ratio Means
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {meta.definition}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-800">Financial Significance: </span>
              {meta.importance}
            </p>
          </div>

          {/* YEAR-BY-YEAR MEANING BEHIND THE NUMBERS */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Year-by-Year Meaning Behind the Numbers
            </h3>
            <div className="space-y-3">
              {years5.map((y, idx) => {
                const analysis = getYearAnalysis(y, idx);
                return (
                  <div
                    key={y.year}
                    className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                          Year {y.year}
                        </span>
                        <span className="text-base font-bold font-financial text-indigo-950">
                          {analysis.formatted}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${analysis.statusColor}`}
                      >
                        {analysis.statusText}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {analysis.dynamicInsight}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* THESIS / DEFENSE PANEL ADVICE */}
          <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Oral Defense Examiner Guidance
            </div>
            <div className="text-xs text-amber-950 font-medium mb-1">
              <span className="font-bold">Probable Panel Question: </span>
              &ldquo;{meta.panelDefenseQuestion}&rdquo;
            </div>
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Recommended Answer: </span>
              {meta.panelDefenseTip}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
