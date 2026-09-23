import { FeasibilityProject, YearFinancials, FeasibilityMetrics } from '../types';

/**
 * Downloads a text/JSON or CSV file to user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export project assumptions and all details to JSON file
 */
export function exportProjectJSON(project: FeasibilityProject) {
  const dataStr = JSON.stringify(project, null, 2);
  const safeTitle = (project.title || 'feasibility_study').trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'feasibility_project';
  downloadFile(dataStr, `${safeTitle}_backup.json`, 'application/json');
}

/**
 * Generates an Excel-compatible HTML Spreadsheet (.xls) containing all 3 statements,
 * cash flows, break-even, and ratio tables nicely separated and formatted!
 */
export function exportToExcel(
  project: FeasibilityProject,
  financials: YearFinancials[],
  metrics: FeasibilityMetrics
) {
  const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const c = project.currency;

  let html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>Financial Statements</x:Name>
            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body { font-family: Calibri, sans-serif; font-size: 11pt; }
      table { border-collapse: collapse; margin-bottom: 25px; width: 100%; }
      th { background-color: #1e293b; color: #ffffff; padding: 6px; font-weight: bold; text-align: left; }
      td { padding: 5px; border-bottom: 1px solid #e2e8f0; }
      .num { text-align: right; }
      .header-title { font-size: 14pt; font-weight: bold; }
      .section-hdr { background-color: #f1f5f9; font-weight: bold; }
      .subtotal { border-top: 1px solid #475569; font-weight: bold; }
      .grandtotal { border-top: 1px solid #000; border-bottom: 3px double #000; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="header-title">${project.title}</div>
    <div>${project.proponents} - ${project.academicProgram}</div>
    <div>${project.institution} (${project.academicYear})</div>
    <br/>

    <!-- SUMMARY OF FEASIBILITY -->
    <table>
      <thead>
        <tr><th colspan="4">EXECUTIVE FEASIBILITY DEFENSE METRICS</th></tr>
      </thead>
      <tbody>
        <tr><td>Total Initial Investment Outlay:</td><td class="num">${c}${Math.round(metrics.totalInitialInvestment).toLocaleString()}</td><td>Verdict:</td><td><b>${metrics.isFeasible ? 'FEASIBLE' : 'REVIEW REQUIRED'}</b></td></tr>
        <tr><td>Net Present Value (NPV @ ${project.discountRatePercent}%):</td><td class="num">${c}${Math.round(metrics.npv).toLocaleString()}</td><td>Internal Rate of Return (IRR):</td><td class="num">${metrics.irr.toFixed(1)}%</td></tr>
        <tr><td>Payback Period:</td><td class="num">${metrics.paybackPeriodYears.toFixed(2)} Years</td><td>Accounting Rate of Return (ARR):</td><td class="num">${metrics.accountingRateOfReturn.toFixed(1)}%</td></tr>
      </tbody>
    </table>

    <!-- 1. INCOME STATEMENT -->
    <table>
      <thead>
        <tr>
          <th>STATEMENT OF COMPREHENSIVE INCOME (${c})</th>
          <th class="num">Year 1</th>
          <th class="num">Year 2</th>
          <th class="num">Year 3</th>
          <th class="num">Year 4</th>
          <th class="num">Year 5</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Gross Sales Revenue</td>${financials.slice(1).map(f => `<td class="num">${Math.round(f.grossSales).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Less: Sales Discounts & Allowances</td>${financials.slice(1).map(f => `<td class="num">(${Math.round(f.salesDiscounts).toLocaleString()})</td>`).join('')}</tr>
        <tr class="subtotal"><td>Net Sales</td>${financials.slice(1).map(f => `<td class="num">${Math.round(f.netSales).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Less: Cost of Goods Sold</td>${financials.slice(1).map(f => `<td class="num">(${Math.round(f.totalCOGS).toLocaleString()})</td>`).join('')}</tr>
        <tr class="subtotal"><td>Gross Profit</td>${financials.slice(1).map(f => `<td class="num">${Math.round(f.grossProfit).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Operating Expenses (SG&A + Depr.)</td>${financials.slice(1).map(f => `<td class="num">(${Math.round(f.totalOpex).toLocaleString()})</td>`).join('')}</tr>
        <tr class="subtotal"><td>Operating Income (EBIT)</td>${financials.slice(1).map(f => `<td class="num">${Math.round(f.ebit).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Add: Bank Interest Income</td>${financials.slice(1).map(f => `<td class="num">${Math.round(f.interestIncome || 0).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Less: Financing Cost (Interest Expense)</td>${financials.slice(1).map(f => `<td class="num">(${Math.round(f.interestExpense).toLocaleString()})</td>`).join('')}</tr>
        <tr class="subtotal"><td>Net Income Before Taxes (EBT)</td>${financials.slice(1).map(f => `<td class="num">${Math.round(f.ebt).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Less: Provision for Income Tax (${project.taxRatePercent}%)</td>${financials.slice(1).map(f => `<td class="num">(${Math.round(f.taxExpense).toLocaleString()})</td>`).join('')}</tr>
        <tr class="grandtotal"><td>NET INCOME AFTER TAX</td>${financials.slice(1).map(f => `<td class="num">${Math.round(f.netIncome).toLocaleString()}</td>`).join('')}</tr>
      </tbody>
    </table>

    <!-- 2. CASH FLOW STATEMENT -->
    <table>
      <thead>
        <tr>
          <th>STATEMENT OF CASH FLOWS (${c})</th>
          <th class="num">Pre-Op (Yr 0)</th>
          <th class="num">Year 1</th>
          <th class="num">Year 2</th>
          <th class="num">Year 3</th>
          <th class="num">Year 4</th>
          <th class="num">Year 5</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Cash Flows from Operating Activities</td>${financials.map(f => `<td class="num">${Math.round(f.operatingCashFlow).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Cash Flows from Investing Activities (CapEx)</td>${financials.map(f => `<td class="num">${Math.round(f.investingCashFlow).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Cash Flows from Financing Activities</td>${financials.map(f => `<td class="num">${Math.round(f.financingCashFlow).toLocaleString()}</td>`).join('')}</tr>
        <tr class="subtotal"><td>Net Increase / (Decrease) in Cash</td>${financials.map(f => `<td class="num">${Math.round(f.netCashFlow).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Add: Beginning Cash Balance</td>${financials.map(f => `<td class="num">${Math.round(f.beginningCash).toLocaleString()}</td>`).join('')}</tr>
        <tr class="grandtotal"><td>ENDING CASH BALANCE</td>${financials.map(f => `<td class="num">${Math.round(f.endingCash).toLocaleString()}</td>`).join('')}</tr>
      </tbody>
    </table>

    <!-- 3. BALANCE SHEET -->
    <table>
      <thead>
        <tr>
          <th>STATEMENT OF FINANCIAL POSITION (${c})</th>
          <th class="num">Pre-Op (Yr 0)</th>
          <th class="num">Year 1</th>
          <th class="num">Year 2</th>
          <th class="num">Year 3</th>
          <th class="num">Year 4</th>
          <th class="num">Year 5</th>
        </tr>
      </thead>
      <tbody>
        <tr class="section-hdr"><td colspan="7">ASSETS</td></tr>
        <tr><td>Cash & Cash Equivalents</td>${financials.map(f => `<td class="num">${Math.round(f.cash).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Accounts Receivable</td>${financials.map(f => `<td class="num">${Math.round(f.accountsReceivable).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Inventories</td>${financials.map(f => `<td class="num">${Math.round(f.inventory).toLocaleString()}</td>`).join('')}</tr>
        <tr class="subtotal"><td>Total Current Assets</td>${financials.map(f => `<td class="num">${Math.round(f.totalCurrentAssets).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Property, Plant & Equipment (Gross)</td>${financials.map(f => `<td class="num">${Math.round(f.grossPPE).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Less: Accumulated Depreciation</td>${financials.map(f => `<td class="num">(${Math.round(f.accumulatedDepreciation).toLocaleString()})</td>`).join('')}</tr>
        <tr><td>Net Property, Plant & Equipment</td>${financials.map(f => `<td class="num">${Math.round(f.netPPE).toLocaleString()}</td>`).join('')}</tr>
        <tr class="grandtotal"><td>TOTAL ASSETS</td>${financials.map(f => `<td class="num">${Math.round(f.totalAssets).toLocaleString()}</td>`).join('')}</tr>

        <tr class="section-hdr"><td colspan="7">LIABILITIES & EQUITY</td></tr>
        <tr><td>Accounts Payable</td>${financials.map(f => `<td class="num">${Math.round(f.accountsPayable).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Current Portion of Long-Term Debt</td>${financials.map(f => `<td class="num">${Math.round(f.currentPortionOfDebt).toLocaleString()}</td>`).join('')}</tr>
        <tr class="subtotal"><td>Total Current Liabilities</td>${financials.map(f => `<td class="num">${Math.round(f.totalCurrentLiabilities).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Long-Term Bank Loan</td>${financials.map(f => `<td class="num">${Math.round(f.longTermDebt).toLocaleString()}</td>`).join('')}</tr>
        <tr class="subtotal"><td>Total Liabilities</td>${financials.map(f => `<td class="num">${Math.round(f.totalLiabilities).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Paid-in Capital</td>${financials.map(f => `<td class="num">${Math.round(f.paidInCapital).toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Retained Earnings</td>${financials.map(f => `<td class="num">${Math.round(f.retainedEarnings).toLocaleString()}</td>`).join('')}</tr>
        <tr class="subtotal"><td>Total Equity</td>${financials.map(f => `<td class="num">${Math.round(f.totalEquity).toLocaleString()}</td>`).join('')}</tr>
        <tr class="grandtotal"><td>TOTAL LIABILITIES & EQUITY</td>${financials.map(f => `<td class="num">${Math.round(f.totalLiabilitiesAndEquity).toLocaleString()}</td>`).join('')}</tr>
      </tbody>
    </table>
  </body>
  </html>`;

  downloadFile(html, `${safeTitle}_feasibility_statements.xls`, 'application/vnd.ms-excel');
}
