import { FeasibilityProject, LaborBenefitItem } from '../types';

export const DEFAULT_13TH_MONTH_PAY: LaborBenefitItem = {
  id: 'benefit-13th-month-pay',
  name: '13th Month Pay',
  type: 'one_month_salary',
  rateOrAmount: 1,
  appliesTo: 'both',
  notes: 'Mandatory 13th month pay equivalent to 1 month basic salary of all Direct and Indirect employees (PD 851)',
};

export const BLANK_PROJECT: FeasibilityProject = {
  id: 'feasibility-study',
  title: '',
  proponents: '',
  academicProgram: '',
  institution: '',
  academicYear: 'A.Y. 2026–2027',
  currency: '₱',
  taxRatePercent: 25,
  discountRatePercent: 12,
  inflationRatePercent: 4.0,
  dividendPayoutPercent: 0,

  preOperatingExpenses: [],
  fixedAssets: [],

  initialWorkingCapitalBuffer: 0,
  workingCapitalBufferDetails: {
    cashOnHand: 0,
    cashInBank: 0,
    bankName: '',
    bankInterestRatePercent: 0,
  },

  financing: {
    equityContribution: 0,
    bankLoanAmount: 0,
    annualInterestRate: 0,
    loanTermYears: 5,
  },

  products: [],
  directLabor: [],
  indirectLabor: [],
  productionUtilities: [],
  factoryDepreciationPercent: 50,
  factoryDepreciationMethod: 'percentage',
  factoryAssetIds: [],
  factorySupplies: [],
  productionLaborBenefits: [DEFAULT_13TH_MONTH_PAY],
  includeLaborBenefitsInCOGS: true,
  factoryOverheadAnnual: 0,
  factoryOverheadGrowthRate: 0,
  nonManufacturingLabor: [],
  nonManufacturingLaborBenefits: [],
  operatingExpenses: [],

  salesDiscountsPercent: 0,

  workingCapital: {
    accountsReceivablePercentOfSales: 0,
    inventoryPercentOfCOGS: 0,
    accountsPayablePercentOfPurchases: 0,
    minimumCashBalance: 0,
    discountsAndAllowancesPercent: 0,
    ownerWithdrawalsPercent: 0,
    ownerWithdrawalsTerms: 'Annual dividend distribution / periodic owner drawings',
  },

  academicNotes:
    'Depreciation is computed using the Straight-Line Method over the estimated useful life of the assets. Income tax is calculated at statutory rate. Cash flows are discounted at the target hurdle rate representing the weighted average cost of capital.',
};

export const SAMPLE_PROJECTS: FeasibilityProject[] = [BLANK_PROJECT];
