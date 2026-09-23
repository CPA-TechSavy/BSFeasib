import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  FeasibilityProject,
  PreOperatingExpenseItem,
  FixedAssetItem,
  ProductItem,
  ProductCostComponent,
  DirectLaborItem,
  IndirectLaborItem,
  ProductionUtilityItem,
  NonManufacturingLaborItem,
  OperatingExpenseItem,
  DepreciationMethod,
  FactorySupplyItem,
  LaborBenefitItem,
  BenefitCalculationType,
  BenefitAppliesTo,
} from '../types';
import {
  Plus,
  Trash2,
  Coins,
  Package,
  Users,
  Briefcase,
  Sliders,
  DollarSign,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Wallet,
  Building,
  Calculator,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  ArrowRight,
  PieChart,
  Tag,
  AlertCircle,
  Layers,
  Box,
  Sparkles,
  Factory,
  Zap,
  UserCheck,
  Boxes,
  ShieldCheck,
  CheckSquare,
  Square,
  PackageCheck,
  HeartHandshake,
  Info,
  X,
  Table,
  Eye,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  formatCurrency,
  calculateDepreciation,
  calculateLaborMonthlyWageForYear,
  calculateYear1FactoryOverhead,
  calculateFactoryOverheadForYear,
  calculateLaborBenefitAmount,
} from '../utils/financialCalculations';
import { LOCAL_BANKS, DEPRECIATION_METHODS } from '../data/bankList';
import { SAMPLE_BOM_PRESETS } from '../data/bomPresets';
import ProductCostingTab from './ProductCostingTab';
import CostingTab from './CostingTab';
import {
  compileProductionEmployeeBenefits,
  compileNonManufacturingEmployeeBenefits,
  getSssEmployerShare,
  getPhilHealthEmployerShare,
  getPagIbigEmployerShare,
  SSS_CONTRIBUTION_TABLE,
} from '../utils/philippineBenefits';
import PdfDownloadButton from './PdfDownloadButton';

interface AssumptionsEditorProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  onOpenBankModal?: () => void;
}

type TabKey =
  | 'capital'
  | 'sales'
  | 'costing'
  | 'directMaterials'
  | 'directCosts'
  | 'factoryOverhead'
  | 'nonManufacturing'
  | 'opex'
  | 'workingCapital';

export default function AssumptionsEditor({
  project,
  onUpdateProject,
  onOpenBankModal,
}: AssumptionsEditorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('capital');
  const [selectedCostingProductId, setSelectedCostingProductId] = useState<string | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleNavigateToTab = useCallback((tab: TabKey, productId?: string) => {
    setActiveTab(tab);
    if (productId) {
      setSelectedCostingProductId(productId);
    }
  }, []);

  // Tab scrolling support
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabScroll = useCallback(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkTabScroll();
    const el = tabScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkTabScroll, { passive: true });
    window.addEventListener('resize', checkTabScroll);
    return () => {
      el.removeEventListener('scroll', checkTabScroll);
      window.removeEventListener('resize', checkTabScroll);
    };
  }, [checkTabScroll]);

  // Auto-scroll active tab into view whenever activeTab changes or section is expanded
  useEffect(() => {
    if (!isExpanded || !tabScrollRef.current) return;
    const el = tabScrollRef.current;
    const activeBtn = el.querySelector<HTMLElement>(`[data-tab-key="${activeTab}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      setTimeout(checkTabScroll, 350);
    }
  }, [activeTab, isExpanded, checkTabScroll]);

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (!tabScrollRef.current) return;
    const el = tabScrollRef.current;
    const scrollDistance = Math.max(220, el.clientWidth * 0.6);
    el.scrollBy({
      left: direction === 'left' ? -scrollDistance : scrollDistance,
      behavior: 'smooth',
    });
    setTimeout(checkTabScroll, 350);
  };

  const handleTabWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = tabScrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
      el.scrollLeft += e.deltaY;
      checkTabScroll();
    }
  };

  const TAB_ITEMS: {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: 'capital', label: '1. Capital Outlay & Debt', icon: Coins },
    { key: 'sales', label: '2. Products & Sales Volume', icon: Package },
    { key: 'costing', label: '3. Costing', icon: Calculator },
    { key: 'directMaterials', label: '4. Direct Materials', icon: Tag },
    { key: 'directCosts', label: '5. Direct Labor', icon: Users },
    { key: 'factoryOverhead', label: '6. Factory Overhead', icon: Factory },
    { key: 'nonManufacturing', label: '7. Non-Manufacturing', icon: UserCheck },
    { key: 'opex', label: '8. Operating Expenses (SG&A)', icon: Briefcase },
    { key: 'workingCapital', label: '9. Working Capital Policy', icon: Layers },
  ];

  const c = project.currency;

  // --- Helpers for updating state collections ---
  const updatePreOp = (newItems: PreOperatingExpenseItem[]) => {
    onUpdateProject({ ...project, preOperatingExpenses: newItems });
  };

  const updateFixedAssets = (newItems: FixedAssetItem[]) => {
    onUpdateProject({ ...project, fixedAssets: newItems });
  };

  const updateProducts = (newItems: ProductItem[]) => {
    onUpdateProject({ ...project, products: newItems });
  };

  const updateDirectLabor = (newItems: DirectLaborItem[]) => {
    onUpdateProject({ ...project, directLabor: newItems });
  };

  const updateIndirectLabor = (newItems: IndirectLaborItem[]) => {
    onUpdateProject({ ...project, indirectLabor: newItems });
  };

  const updateProductionUtilities = (newItems: ProductionUtilityItem[]) => {
    onUpdateProject({ ...project, productionUtilities: newItems });
  };

  const updateNonManufacturingLabor = (newItems: NonManufacturingLaborItem[]) => {
    onUpdateProject({ ...project, nonManufacturingLabor: newItems });
  };

  const updateFactoryDepreciationPercent = (pct: number) => {
    onUpdateProject({ ...project, factoryDepreciationPercent: Math.max(0, Math.min(100, pct)) });
  };

  const updateFactoryDepreciationMethod = (method: 'percentage' | 'specific_assets') => {
    onUpdateProject({ ...project, factoryDepreciationMethod: method });
  };

  const toggleFactoryAsset = (assetId: string) => {
    const current = project.factoryAssetIds || [];
    const updated = current.includes(assetId)
      ? current.filter((id) => id !== assetId)
      : [...current, assetId];
    onUpdateProject({ ...project, factoryAssetIds: updated });
  };

  const selectAllFactoryAssets = (select: boolean) => {
    onUpdateProject({
      ...project,
      factoryAssetIds: select ? project.fixedAssets.map((a) => a.id) : [],
    });
  };

  const updateFactorySupplies = (newSupplies: FactorySupplyItem[]) => {
    const newSuppliesTotal = newSupplies.reduce(
      (sum, s) => sum + (s.annualAmount !== undefined ? s.annualAmount : (s.quantity || 0) * (s.unitCost || 0)),
      0
    );
    onUpdateProject({
      ...project,
      factorySupplies: newSupplies,
      // Automatically keeps factoryOverheadAnnual aligned with itemized supplies to eliminate discrepancies
      factoryOverheadAnnual: newSupplies.length > 0 ? newSuppliesTotal : project.factoryOverheadAnnual,
    });
  };

  const updateProductionLaborBenefits = (newBenefits: LaborBenefitItem[]) => {
    onUpdateProject({ ...project, productionLaborBenefits: newBenefits });
  };

  const updateNonManufacturingLaborBenefits = (newBenefits: LaborBenefitItem[]) => {
    onUpdateProject({ ...project, nonManufacturingLaborBenefits: newBenefits });
  };

  const toggleIncludeLaborBenefitsInCOGS = (include: boolean) => {
    onUpdateProject({ ...project, includeLaborBenefitsInCOGS: include });
  };

  // Clean up any duplicated 13th month entry from custom non-statutory benefits since it's now directly in the Production Employee Benefits Schedule
  useEffect(() => {
    const list = project.productionLaborBenefits || [];
    const filtered = list.filter((b) => !(b.name || '').toLowerCase().includes('13th'));
    if (filtered.length !== list.length) {
      updateProductionLaborBenefits(filtered);
    }
  }, [project.productionLaborBenefits]);

  useEffect(() => {
    const list = project.nonManufacturingLaborBenefits || [];
    const filtered = list.filter((b) => !(b.name || '').toLowerCase().includes('13th'));
    if (filtered.length !== list.length) {
      updateNonManufacturingLaborBenefits(filtered);
    }
  }, [project.nonManufacturingLaborBenefits]);

  const [showSuppliesList, setShowSuppliesList] = useState<boolean>(false);
  const [suppliesSyncFeedback, setSuppliesSyncFeedback] = useState<string | null>(null);
  const [benefitsFeedback, setBenefitsFeedback] = useState<string | null>(null);
  const [benefitsEmployeeFilter, setBenefitsEmployeeFilter] = useState<'factory_overhead' | 'direct_labor' | 'all'>('factory_overhead');
  const [showBenefitPolicyDetails, setShowBenefitPolicyDetails] = useState<boolean>(false);
  const [expandEmployeeHeadcount, setExpandEmployeeHeadcount] = useState<boolean>(false);
  const [showSssTableModal, setShowSssTableModal] = useState<boolean>(false);
  const [showCustomBenefitsSection, setShowCustomBenefitsSection] = useState<boolean>(false);
  const [benefitsClassificationFilter, setBenefitsClassificationFilter] = useState<'all' | 'direct' | 'indirect'>('all');
  const [sssSearchQuery, setSssSearchQuery] = useState<string>('');
  const [dlViewYear, setDlViewYear] = useState<number>(1);
  const [fohViewYear, setFohViewYear] = useState<number>(1);
  const benefitsViewYear = fohViewYear;
  const [nonMfgBenefitsCategoryFilter, setNonMfgBenefitsCategoryFilter] = useState<'all' | 'admin' | 'selling'>('all');
  const [expandNonMfgEmployeeHeadcount, setExpandNonMfgEmployeeHeadcount] = useState<boolean>(false);
  const [showNonMfgCustomBenefits, setShowNonMfgCustomBenefits] = useState<boolean>(false);
  const [nonMfgViewYear, setNonMfgViewYear] = useState<number>(1);
  const [opexViewYear, setOpexViewYear] = useState<number>(1);
  const [show5YearOpexSchedule, setShow5YearOpexSchedule] = useState<boolean>(false);

  const selectedDlYearSummary = useMemo(() => {
    const annual = (project.directLabor || []).reduce((sum, lab) => {
      const wageYr = calculateLaborMonthlyWageForYear(
        lab.monthlyWage || 0,
        dlViewYear,
        lab.annualSalaryIncreaseType,
        lab.annualSalaryIncreaseValue,
        project.inflationRatePercent
      );
      return sum + wageYr * (lab.monthsPerYear || 12) * (lab.headcount || 1);
    }, 0);

    const monthly = (project.directLabor || []).reduce((sum, lab) => {
      const wageYr = calculateLaborMonthlyWageForYear(
        lab.monthlyWage || 0,
        dlViewYear,
        lab.annualSalaryIncreaseType,
        lab.annualSalaryIncreaseValue,
        project.inflationRatePercent
      );
      return sum + wageYr * (lab.headcount || 1);
    }, 0);

    const totalVol = (project.products || []).reduce((sum, p) => {
      const volGrowth = Math.pow(1 + (p.annualGrowthRate || 0) / 100, dlViewYear - 1);
      return sum + Math.round((p.year1Volume || 0) * volGrowth);
    }, 0);

    return {
      annualTotal: annual,
      monthlyTotal: monthly,
      volume: totalVol,
      costPerUnit: totalVol > 0 ? annual / totalVol : 0,
    };
  }, [project.directLabor, project.products, project.inflationRatePercent, dlViewYear]);

  const selectedIndirectLaborMonthly = useMemo(() => {
    return (project.indirectLabor || []).reduce((sum, lab) => {
      const wageYr = calculateLaborMonthlyWageForYear(
        lab.monthlyWage || 0,
        fohViewYear,
        lab.annualSalaryIncreaseType,
        lab.annualSalaryIncreaseValue,
        project.inflationRatePercent
      );
      return sum + wageYr * (lab.headcount || 1);
    }, 0);
  }, [project.indirectLabor, project.inflationRatePercent, fohViewYear]);

  const compiledProductionBenefits = useMemo(() => {
    // Project direct and indirect labor wages for the selected year based on custom annual salary increase
    const projectedDirectLabor = (project.directLabor || []).map((lab) => ({
      ...lab,
      monthlyWage: calculateLaborMonthlyWageForYear(
        lab.monthlyWage || 0,
        benefitsViewYear,
        lab.annualSalaryIncreaseType,
        lab.annualSalaryIncreaseValue,
        project.inflationRatePercent
      ),
    }));

    const projectedIndirectLabor = (project.indirectLabor || []).map((lab) => ({
      ...lab,
      monthlyWage: calculateLaborMonthlyWageForYear(
        lab.monthlyWage || 0,
        benefitsViewYear,
        lab.annualSalaryIncreaseType,
        lab.annualSalaryIncreaseValue,
        project.inflationRatePercent
      ),
    }));

    return compileProductionEmployeeBenefits(
      projectedDirectLabor,
      projectedIndirectLabor,
      expandEmployeeHeadcount
    );
  }, [project.directLabor, project.indirectLabor, expandEmployeeHeadcount, benefitsViewYear, project.inflationRatePercent]);

  const handleUpdateEmployeeWage = (sourceId: string, classification: 'Direct Labor' | 'Indirect Labor', newWage: number) => {
    if (classification === 'Direct Labor') {
      const updated = (project.directLabor || []).map((l) => {
        if (l.id !== sourceId) return l;
        if (benefitsViewYear === 1) {
          return { ...l, monthlyWage: Math.max(0, newWage) };
        }
        const incType = l.annualSalaryIncreaseType || 'percentage';
        const incVal = l.annualSalaryIncreaseValue ?? (project.inflationRatePercent || 0);
        if (incType === 'amount') {
          return { ...l, monthlyWage: Math.max(0, newWage - incVal * (benefitsViewYear - 1)) };
        }
        const growth = Math.pow(1 + (incVal || 0) / 100, benefitsViewYear - 1);
        return { ...l, monthlyWage: growth > 0 ? Math.round((newWage / growth) * 100) / 100 : newWage };
      });
      updateDirectLabor(updated);
    } else {
      const updated = (project.indirectLabor || []).map((l) => {
        if (l.id !== sourceId) return l;
        if (benefitsViewYear === 1) {
          return { ...l, monthlyWage: Math.max(0, newWage) };
        }
        const incType = l.annualSalaryIncreaseType || 'percentage';
        const incVal = l.annualSalaryIncreaseValue ?? (project.inflationRatePercent || 0);
        if (incType === 'amount') {
          return { ...l, monthlyWage: Math.max(0, newWage - incVal * (benefitsViewYear - 1)) };
        }
        const growth = Math.pow(1 + (incVal || 0) / 100, benefitsViewYear - 1);
        return { ...l, monthlyWage: growth > 0 ? Math.round((newWage / growth) * 100) / 100 : newWage };
      });
      updateIndirectLabor(updated);
    }
  };

  const handleUpdateEmployeeRole = (sourceId: string, classification: 'Direct Labor' | 'Indirect Labor', newRole: string) => {
    if (classification === 'Direct Labor') {
      const updated = (project.directLabor || []).map((l) =>
        l.id === sourceId ? { ...l, role: newRole } : l
      );
      updateDirectLabor(updated);
    } else {
      const updated = (project.indirectLabor || []).map((l) =>
        l.id === sourceId ? { ...l, role: newRole } : l
      );
      updateIndirectLabor(updated);
    }
  };

  const handleUpdateEmployeeHeadcount = (sourceId: string, classification: 'Direct Labor' | 'Indirect Labor', newHeadcount: number) => {
    if (classification === 'Direct Labor') {
      const updated = (project.directLabor || []).map((l) =>
        l.id === sourceId ? { ...l, headcount: Math.max(1, newHeadcount) } : l
      );
      updateDirectLabor(updated);
    } else {
      const updated = (project.indirectLabor || []).map((l) =>
        l.id === sourceId ? { ...l, headcount: Math.max(1, newHeadcount) } : l
      );
      updateIndirectLabor(updated);
    }
  };

  const handleDeleteEmployeeRole = (sourceId: string, classification: 'Direct Labor' | 'Indirect Labor') => {
    if (classification === 'Direct Labor') {
      const updated = (project.directLabor || []).filter((l) => l.id !== sourceId);
      updateDirectLabor(updated);
    } else {
      const updated = (project.indirectLabor || []).filter((l) => l.id !== sourceId);
      updateIndirectLabor(updated);
    }
    setBenefitsFeedback(`Removed ${classification} role from schedule.`);
    setTimeout(() => setBenefitsFeedback(null), 3000);
  };

  const addIndirectLaborRoleFromBenefits = () => {
    const newRole: IndirectLaborItem = {
      id: `idl-${Date.now()}`,
      role: 'Production Quality / Safety Inspector',
      headcount: 1,
      monthlyWage: 20000,
      monthsPerYear: 12,
    };
    updateIndirectLabor([...(project.indirectLabor || []), newRole]);
    setBenefitsFeedback('Added new Factory Overhead role.');
    setTimeout(() => setBenefitsFeedback(null), 3000);
  };

  const addDirectLaborRoleFromBenefits = () => {
    const newRole: DirectLaborItem = {
      id: `dl-${Date.now()}`,
      role: 'Line Operator / Worker',
      headcount: 1,
      monthlyWage: 17000,
      monthsPerYear: 12,
    };
    updateDirectLabor([...(project.directLabor || []), newRole]);
    setBenefitsFeedback('Added new Direct Labor role.');
    setTimeout(() => setBenefitsFeedback(null), 3000);
  };

  const loadStandardFactoryRoles = () => {
    const defaultRoles: IndirectLaborItem[] = [
      {
        id: `idl-${Date.now()}-1`,
        role: 'Plant / Production Supervisor',
        headcount: 1,
        monthlyWage: 28000,
        monthsPerYear: 12,
      },
      {
        id: `idl-${Date.now()}-2`,
        role: 'Quality Assurance / QC Inspector',
        headcount: 1,
        monthlyWage: 20000,
        monthsPerYear: 12,
      },
      {
        id: `idl-${Date.now()}-3`,
        role: 'Machine Maintenance Technician',
        headcount: 1,
        monthlyWage: 19000,
        monthsPerYear: 12,
      },
      {
        id: `idl-${Date.now()}-4`,
        role: 'Factory Sanitation & Utility Worker',
        headcount: 1,
        monthlyWage: 16000,
        monthsPerYear: 12,
      },
    ];
    updateIndirectLabor([...(project.indirectLabor || []), ...defaultRoles]);
    setBenefitsFeedback('Loaded standard Factory Overhead personnel roles!');
    setTimeout(() => setBenefitsFeedback(null), 3500);
  };

  const loadStandardLaborBenefitsPresets = () => {
    const presets: LaborBenefitItem[] = [
      {
        id: `ben-${Date.now()}-1`,
        name: 'Uniform, PPE & Safety Shoes Allowance',
        type: 'fixed_monthly_per_head',
        rateOrAmount: 300,
        appliesTo: 'both',
        notes: 'Protective gear, plant uniform allowance, and safety apparel',
      },
      {
        id: `ben-${Date.now()}-2`,
        name: 'Plant Meal & Attendance Subsidy',
        type: 'fixed_monthly_per_head',
        rateOrAmount: 500,
        appliesTo: 'both',
        notes: 'Monthly meal & perfect attendance allowance for production crew',
      },
      {
        id: `ben-${Date.now()}-3`,
        name: 'Annual Factory Medical & Physical Exam',
        type: 'fixed_annual',
        rateOrAmount: 25000,
        appliesTo: 'both',
        notes: 'Occupational health screening and annual worker checkup',
      },
    ];
    updateProductionLaborBenefits(presets);
    setBenefitsFeedback('Loaded standard additional non-statutory benefits preset!');
    setTimeout(() => setBenefitsFeedback(null), 3500);
  };

  const adjustDirectLaborTo12Months = () => {
    const updated = project.directLabor.map((l) => ({
      ...l,
      monthsPerYear: 12,
    }));
    updateDirectLabor(updated);
    setBenefitsFeedback('Adjusted Tab 4 Direct Labor to 12 months/year to avoid 13th month duplication.');
    setTimeout(() => setBenefitsFeedback(null), 4000);
  };

  const updateOpex = (newItems: OperatingExpenseItem[]) => {
    onUpdateProject({ ...project, operatingExpenses: newItems });
  };

  // --- Product Cost Per Unit (Raw Materials & Packaging) State & Helpers ---
  const [selectedCostProductId, setSelectedCostProductId] = useState<string>('');
  const [autoSyncCost, setAutoSyncCost] = useState<boolean>(true);
  const [costFeedback, setCostFeedback] = useState<string | null>(null);

  // Active product for materials & packaging breakdown
  const activeCostProduct =
    project.products.find((p) => p.id === selectedCostProductId) ||
    project.products[0] ||
    null;

  // Helper to compute individual material cost
  const computeItemTotalCost = (item: Partial<ProductCostComponent>): number => {
    if (item.costMode === 'package_yield') {
      const pCost = Math.max(0, Number(item.purchaseCost) || 0);
      const pQty = Math.max(0.0001, Number(item.packageQuantity) || 1);
      const yUnits = Math.max(0.0001, Number(item.yieldUnits) || 1);
      return Math.round(((pCost * pQty) / yUnits) * 100) / 100;
    } else {
      const q = Math.max(0, Number(item.quantity) || 0);
      const u = Math.max(0, Number(item.unitCost) || 0);
      return Math.round(q * u * 100) / 100;
    }
  };

  // Update components for a product and optionally sync to unitCost
  const updateProductCostBreakdown = (
    productId: string,
    components: ProductCostComponent[],
    shouldSync: boolean = autoSyncCost
  ) => {
    const normalizedComps = components.map((c) => ({
      ...c,
      totalCost: computeItemTotalCost(c),
    }));

    const materialsAndPackagingTotal = Math.round(
      normalizedComps.reduce((s, c) => s + (c.totalCost || 0), 0) * 100
    ) / 100;

    const updatedProducts = project.products.map((p) => {
      if (p.id !== productId) return p;

      if (shouldSync) {
        const dl = p.directLaborCostPerUnit || 0;
        const combinedUnitCost = Math.round((materialsAndPackagingTotal + dl) * 100) / 100;
        return {
          ...p,
          costBreakdown: normalizedComps,
          rawMaterialsCostPerUnit: materialsAndPackagingTotal,
          unitCost: combinedUnitCost,
        };
      }

      return {
        ...p,
        costBreakdown: normalizedComps,
        rawMaterialsCostPerUnit: materialsAndPackagingTotal,
      };
    });

    updateProducts(updatedProducts);
  };

  // Apply Direct Materials & Packaging to product unit cost
  const applyMaterialsAndPackagingToUnitCost = (productId: string) => {
    const prod = project.products.find((p) => p.id === productId);
    if (!prod) return;
    const comps = prod.costBreakdown || [];
    const matTotal = Math.round(comps.reduce((s, c) => s + (c.totalCost || 0), 0) * 100) / 100;
    const dl = prod.directLaborCostPerUnit || 0;
    const combined = Math.round((matTotal + dl) * 100) / 100;

    const updatedProducts = project.products.map((p) => {
      if (p.id !== productId) return p;
      return {
        ...p,
        rawMaterialsCostPerUnit: matTotal,
        unitCost: combined,
      };
    });
    updateProducts(updatedProducts);
    setCostFeedback(
      `Updated ${prod.name || 'product'} cost to ${formatCurrency(combined, c)} (Materials & Pkg: ${formatCurrency(matTotal, c)}${dl > 0 ? ` + DL: ${formatCurrency(dl, c)}` : ''})`
    );
    setTimeout(() => setCostFeedback(null), 3500);
  };

  // Load a preset template into active product
  const loadPresetForProduct = (productId: string, presetKey: 'cafe' | 'food' | 'retail') => {
    const preset = SAMPLE_BOM_PRESETS[presetKey];
    if (!preset) return;
    updateProductCostBreakdown(productId, preset.components, true);
    setCostFeedback(`Loaded ${preset.label} preset!`);
    setTimeout(() => setCostFeedback(null), 3500);
  };

  // --- Direct Labor Cost per Unit Allocation & Helpers ---
  const [appliedDlFeedback, setAppliedDlFeedback] = useState<string | null>(null);

  // Total Direct Labor Headcount & Annual Cost
  const totalDirectLaborAnnual = project.directLabor.reduce(
    (sum, lab) => sum + (lab.monthlyWage || 0) * (lab.monthsPerYear || 12) * (lab.headcount || 1),
    0
  );
  const totalDirectLaborHeadcount = project.directLabor.reduce(
    (sum, lab) => sum + (lab.headcount || 0),
    0
  );

  // Total Indirect Labor Headcount & Annual Cost
  const totalIndirectLaborAnnual = (project.indirectLabor || []).reduce(
    (sum, lab) => sum + (lab.monthlyWage || 0) * (lab.monthsPerYear || 12) * (lab.headcount || 1),
    0
  );
  const totalIndirectLaborHeadcount = (project.indirectLabor || []).reduce(
    (sum, lab) => sum + (lab.headcount || 0),
    0
  );

  // Total Production Utilities Annual (Year 1)
  const totalProductionUtilitiesAnnual = (project.productionUtilities || []).reduce(
    (sum, util) => sum + (util.annualAmountYear1 || (util.monthlyAmount ? util.monthlyAmount * 12 : 0) || 0),
    0
  );

  const totalProductionUtilitiesMonthly = (project.productionUtilities || []).reduce(
    (sum, util) => {
      const monthly =
        util.monthlyAmount !== undefined
          ? util.monthlyAmount
          : (util.annualAmountYear1 ? util.annualAmountYear1 / 12 : 0);
      return sum + monthly;
    },
    0
  );

  // Depreciation Schedule & Production Depreciation
  const deprSchedule = calculateDepreciation(project);
  const totalYear1Depreciation = deprSchedule.reduce((sum, d) => {
    const yr1 = d.yearValues.find((y) => y.year === 1);
    return sum + (yr1 ? yr1.depreciation : d.annualDepreciation || 0);
  }, 0);
  const factoryDeprPercent = project.factoryDepreciationPercent !== undefined ? project.factoryDepreciationPercent : 50;
  const factoryDeprMethod = project.factoryDepreciationMethod || 'percentage';
  const factoryAssetIds = project.factoryAssetIds || [];

  let factoryDepreciationAmountYr1 = 0;
  let opexDepreciationAmountYr1 = 0;

  if (factoryDeprMethod === 'specific_assets') {
    deprSchedule.forEach((d) => {
      const yr1 = d.yearValues.find((y) => y.year === 1);
      const dep = yr1 ? yr1.depreciation : d.annualDepreciation || 0;
      if (factoryAssetIds.includes(d.assetId)) {
        factoryDepreciationAmountYr1 += dep;
      } else {
        opexDepreciationAmountYr1 += dep;
      }
    });
  } else {
    factoryDepreciationAmountYr1 = Math.round(totalYear1Depreciation * (factoryDeprPercent / 100));
    opexDepreciationAmountYr1 = Math.max(0, totalYear1Depreciation - factoryDepreciationAmountYr1);
  }

  // Direct & Indirect Labor Basic Pay Bases (12-month base for standard benefits calculation)
  const directLaborMonthlyWageTotal = project.directLabor.reduce(
    (sum, l) => sum + (l.monthlyWage || 0) * (l.headcount || 0),
    0
  );
  const directLaborAnnualBasic12M = directLaborMonthlyWageTotal * 12;

  const indirectLaborMonthlyWageTotal = (project.indirectLabor || []).reduce(
    (sum, l) => sum + (l.monthlyWage || 0) * (l.headcount || 0),
    0
  );
  const indirectLaborAnnualBasic12M = indirectLaborMonthlyWageTotal * 12;

  const directLaborHeadcount = totalDirectLaborHeadcount;
  const indirectLaborHeadcount = totalIndirectLaborHeadcount;

  // Factory Overhead Engine & Summary (combines Indirect Labor, Utilities, Depreciation, Supplies, Statutory Benefits, and Non-Statutory Benefits)
  const year1FohSummary = useMemo(() => {
    return calculateYear1FactoryOverhead(project);
  }, [project]);

  // Factory Overhead Summary dynamically computed for the selected projection year with custom escalations
  const selectedYearFohSummary = useMemo(() => {
    return calculateFactoryOverheadForYear(project, fohViewYear);
  }, [project, fohViewYear]);

  const totalFactoryOverheadYr1 = year1FohSummary.totalFactoryOverheadAnnual;
  const includeBenefitsInCOGS = project.includeLaborBenefitsInCOGS !== false;
  const totalProductionLaborBenefitsAnnual = year1FohSummary.factoryLaborBenefitsAnnual;
  const laborBenefitsList = project.productionLaborBenefits || [];

  // Itemized Supplies
  const factorySuppliesList = project.factorySupplies || [];
  const totalItemizedSuppliesAnnual = year1FohSummary.factorySuppliesAnnual;

  // Non-Manufacturing Personnel Metrics
  const nonMfgEmployees = project.nonManufacturingLabor || [];
  const totalNonMfgHeadcount = nonMfgEmployees.reduce((sum, e) => sum + (e.headcount || 0), 0);
  const totalNonMfgMonthly = nonMfgEmployees.reduce(
    (sum, e) => sum + (e.monthlyWage || 0) * (e.headcount || 1),
    0
  );
  const totalNonMfgAnnual = nonMfgEmployees.reduce(
    (sum, e) => sum + (e.monthlyWage || 0) * (e.monthsPerYear || 12) * (e.headcount || 1),
    0
  );

  const nonMfgLaborBenefitsList = project.nonManufacturingLaborBenefits || [];

  const projectedNonMfgList = useMemo(() => {
    return (project.nonManufacturingLabor || []).map((emp) => ({
      ...emp,
      monthlyWage: calculateLaborMonthlyWageForYear(
        emp.monthlyWage,
        nonMfgViewYear,
        emp.annualSalaryIncreaseType,
        emp.annualSalaryIncreaseValue,
        project.inflationRatePercent
      ),
    }));
  }, [project.nonManufacturingLabor, nonMfgViewYear, project.inflationRatePercent]);

  const compiledNonMfgBenefits = useMemo(() => {
    return compileNonManufacturingEmployeeBenefits(
      projectedNonMfgList,
      expandNonMfgEmployeeHeadcount
    );
  }, [projectedNonMfgList, expandNonMfgEmployeeHeadcount]);

  const totalNonMfgAdditionalBenefits = useMemo(() => {
    const totalBasic = projectedNonMfgList.reduce((sum, e) => sum + (e.monthlyWage || 0) * (e.headcount || 1), 0);
    const totalHead = projectedNonMfgList.reduce((sum, e) => sum + (e.headcount || 1), 0);
    const nmlInflation = Math.pow(1 + (project.inflationRatePercent || 0) / 100, nonMfgViewYear - 1);

    let totalCustom = 0;

    nonMfgLaborBenefitsList.forEach((b) => {
      if (b.type === 'percentage') {
        const rate = (b.rateOrAmount || 0) / 100;
        totalCustom += totalBasic * 12 * rate;
      } else if (b.type === 'fixed_monthly_per_head') {
        const monthly = (b.rateOrAmount || 0) * nmlInflation;
        totalCustom += monthly * 12 * totalHead;
      } else if (b.type === 'fixed_annual') {
        const annual = (b.rateOrAmount || 0) * nmlInflation;
        totalCustom += annual;
      } else if (b.type === 'one_month_salary') {
        const multiplier = b.rateOrAmount || 1;
        totalCustom += totalBasic * multiplier;
      }
    });

    return {
      adminCustom: totalCustom,
      sellingCustom: 0,
      totalCustom,
    };
  }, [projectedNonMfgList, nonMfgLaborBenefitsList, nonMfgViewYear, project.inflationRatePercent]);

  const loadStandardNonMfgBenefitsPresets = () => {
    const presets: LaborBenefitItem[] = [
      {
        id: `nml-ben-uniform-${Date.now()}`,
        name: 'Office Uniform & Attire Allowance',
        type: 'fixed_annual',
        rateOrAmount: 6000,
        appliesTo: 'both',
        notes: 'Annual clothing / uniform allowance per non-manufacturing employee (Tax-exempt de minimis)',
      },
      {
        id: `nml-ben-comm-${Date.now() + 1}`,
        name: 'Communication & Mobile Allowance',
        type: 'fixed_monthly_per_head',
        rateOrAmount: 1000,
        appliesTo: 'both',
        notes: 'Monthly phone and data connectivity allowance for non-manufacturing staff',
      },
      {
        id: `nml-ben-meal-${Date.now() + 2}`,
        name: 'De Minimis Rice Subsidy & Meal Allowance',
        type: 'fixed_monthly_per_head',
        rateOrAmount: 2000,
        appliesTo: 'both',
        notes: 'Monthly rice subsidy / meal stipend for non-manufacturing staff',
      },
    ];
    updateNonManufacturingLaborBenefits([...(project.nonManufacturingLaborBenefits || []), ...presets]);
  };

  // Total Year 1 Production Volume
  const totalYear1Volume = project.products.reduce((sum, p) => sum + (p.year1Volume || 0), 0);

  // Function to compute DL cost per unit for products
  const computeDLCostPerUnit = (_prod?: ProductItem): number => {
    if (totalYear1Volume <= 0 || totalDirectLaborAnnual <= 0) return 0;
    return Math.round((totalDirectLaborAnnual / totalYear1Volume) * 100) / 100;
  };

  // Apply Direct Labor to ALL products in one click
  const applyDlToAllProducts = () => {
    if (project.products.length === 0) return;
    const updated = project.products.map((p) => {
      const dlUnit = computeDLCostPerUnit(p);
      const baseRaw = p.rawMaterialsCostPerUnit !== undefined
        ? p.rawMaterialsCostPerUnit
        : p.directLaborCostPerUnit !== undefined
          ? Math.max(0, p.unitCost - p.directLaborCostPerUnit)
          : p.unitCost;
      return {
        ...p,
        rawMaterialsCostPerUnit: baseRaw,
        directLaborCostPerUnit: dlUnit,
        unitCost: Math.round((baseRaw + dlUnit) * 100) / 100,
      };
    });
    updateProducts(updated);
    setAppliedDlFeedback('Successfully applied Direct Labor Cost per unit to all products in Product & Sales Volume!');
    setTimeout(() => setAppliedDlFeedback(null), 3500);
  };

  // Reset ALL products to base raw materials
  const resetAllProductsDl = () => {
    const updated = project.products.map((p) => {
      const baseRaw = p.rawMaterialsCostPerUnit !== undefined
        ? p.rawMaterialsCostPerUnit
        : p.directLaborCostPerUnit !== undefined
          ? Math.max(0, p.unitCost - p.directLaborCostPerUnit)
          : p.unitCost;
      return {
        ...p,
        rawMaterialsCostPerUnit: baseRaw,
        directLaborCostPerUnit: 0,
        unitCost: baseRaw,
      };
    });
    updateProducts(updated);
    setAppliedDlFeedback('Reset all products to base raw materials costs.');
    setTimeout(() => setAppliedDlFeedback(null), 3500);
  };

  // Working Capital Buffer decomposition (Cash on Hand & Cash in Bank)
  const wcDetails = project.workingCapitalBufferDetails || {
    cashOnHand: Math.round((project.initialWorkingCapitalBuffer || 0) * 0.2),
    cashInBank: Math.round((project.initialWorkingCapitalBuffer || 0) * 0.8),
    bankName: '',
    bankInterestRatePercent: 1.0,
  };

  const updateWorkingCapitalBuffer = (
    newCashOnHand: number,
    newCashInBank: number,
    newBankName?: string,
    newRate?: number
  ) => {
    const safeCashOnHand = Math.max(0, newCashOnHand);
    const safeCashInBank = Math.max(0, newCashInBank);
    const total = safeCashOnHand + safeCashInBank;
    onUpdateProject({
      ...project,
      initialWorkingCapitalBuffer: total,
      workingCapitalBufferDetails: {
        cashOnHand: safeCashOnHand,
        cashInBank: safeCashInBank,
        bankName: newBankName !== undefined ? newBankName : wcDetails.bankName,
        bankInterestRatePercent:
          newRate !== undefined ? newRate : wcDetails.bankInterestRatePercent,
      },
    });
  };

  // OPEX Year Navigation Calculation Helper
  const getOpexAmountForYear = useCallback((opex: OperatingExpenseItem, year: number): number => {
    if (opex.customYearAmounts && opex.customYearAmounts[year] !== undefined) {
      return opex.customYearAmounts[year];
    }
    const growth = Math.pow(1 + (opex.annualGrowthRate || 0) / 100, year - 1);
    return Math.round((opex.annualAmountYear1 || 0) * growth);
  }, []);

  const selectedYearOpexSummary = useMemo(() => {
    const expenses = project.operatingExpenses || [];
    const currentYearTotal = expenses.reduce((sum, o) => sum + getOpexAmountForYear(o, opexViewYear), 0);
    const prevYearTotal =
      opexViewYear > 1
        ? expenses.reduce((sum, o) => sum + getOpexAmountForYear(o, opexViewYear - 1), 0)
        : currentYearTotal;
    const yoyDiff = currentYearTotal - prevYearTotal;
    const yoyPct = prevYearTotal > 0 ? (yoyDiff / prevYearTotal) * 100 : 0;

    // 5-year schedules
    const fiveYearTotals: { [year: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (let y = 1; y <= 5; y++) {
      fiveYearTotals[y] = expenses.reduce((sum, o) => sum + getOpexAmountForYear(o, y), 0);
    }
    const grandTotal5Years = Object.values(fiveYearTotals).reduce((sum, v) => sum + v, 0);

    return {
      currentYearTotal,
      currentYearMonthly: Math.round((currentYearTotal / 12) * 100) / 100,
      prevYearTotal,
      yoyDiff,
      yoyPct,
      fiveYearTotals,
      grandTotal5Years,
    };
  }, [project.operatingExpenses, opexViewYear, getOpexAmountForYear]);

  // Capital sums
  const totalPreOp = project.preOperatingExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalFixedAssets = project.fixedAssets.reduce((sum, item) => sum + item.cost, 0);
  const totalOutlay = totalPreOp + totalFixedAssets + project.initialWorkingCapitalBuffer;

  return (
    <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
      {/* Tab Header Bar */}
      <div className="bg-slate-900 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
            Feasibility Study Operating Assumptions & Schedules
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <PdfDownloadButton
            targetId={`assumptions-tab-${activeTab}`}
            title={`Assumptions Tab: ${TAB_ITEMS.find((t) => t.key === activeTab)?.label || 'Schedule'}`}
            subtitle={`${project.title} • Operating Assumptions & Schedules`}
            projectTitle={project.title}
            buttonText="Download Tab PDF"
            size="xs"
            variant="indigo"
            orientation="landscape"
            format="a4"
            fitToSinglePage={true}
          />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1 transition"
          >
            <span>{isExpanded ? 'Collapse Inputs' : 'Expand Inputs'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Mobile Tab Switcher Dropdown */}
          <div className="md:hidden px-3.5 py-2.5 bg-slate-100/90 border-b border-slate-200">
            <label htmlFor="mobile-assumption-tab-select" className="sr-only">
              Select Assumption Tab
            </label>
            <div className="relative">
              <select
                id="mobile-assumption-tab-select"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabKey)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-3.5 pr-9 py-2.5 text-xs font-semibold text-slate-800 shadow-xs appearance-none focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
              >
                {TAB_ITEMS.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sub Navigation Tabs with Smooth Scrolling Controls */}
          <div className="relative border-b border-slate-200 bg-slate-50/80 select-none overflow-hidden">
            {/* Left Scroll Navigation Button */}
            <div
              className={`absolute left-0 top-0 bottom-0 z-20 flex items-center pr-4 pl-1.5 bg-gradient-to-r from-slate-100 via-slate-100/95 to-transparent transition-all duration-200 ${
                canScrollLeft ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-2 pointer-events-none'
              }`}
            >
              <button
                type="button"
                onClick={() => handleScrollTabs('left')}
                aria-label="Scroll tabs left"
                className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition flex items-center justify-center cursor-pointer"
                title="Scroll tabs left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Tab Strip */}
            <div
              ref={tabScrollRef}
              onWheel={handleTabWheel}
              className="flex overflow-x-auto scroll-smooth px-3 sm:px-6 scrollbar-none gap-1 py-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {TAB_ITEMS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    data-tab-key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition shrink-0 rounded-t-lg cursor-pointer ${
                      isActive
                        ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs -mb-1'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Navigation Button */}
            <div
              className={`absolute right-0 top-0 bottom-0 z-20 flex items-center pl-4 pr-1.5 bg-gradient-to-l from-slate-100 via-slate-100/95 to-transparent transition-all duration-200 ${
                canScrollRight ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-2 pointer-events-none'
              }`}
            >
              <button
                type="button"
                onClick={() => handleScrollTabs('right')}
                aria-label="Scroll tabs right"
                className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition flex items-center justify-center cursor-pointer"
                title="Scroll tabs right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* TAB 1: CAPITAL OUTLAY & FINANCING */}
            {activeTab === 'capital' && (
              <div id="assumptions-tab-capital" className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-indigo-600" />
                      <span>1. Capital Outlay, Asset Investment & Financing Structure</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pre-operating expenses, property, plant & equipment, initial working capital buffer, and loan structure.
                    </p>
                  </div>
                  <PdfDownloadButton
                    targetId="assumptions-tab-capital"
                    title="1. Capital Outlay & Financing Assumptions"
                    subtitle={`${project.title} • Assumptions Tab 1`}
                    projectTitle={project.title}
                    buttonText="Download Tab PDF"
                    size="sm"
                    variant="indigo"
                    orientation="landscape"
                    format="a4"
                    fitToSinglePage={true}
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pre-Operating Expenses Table */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Pre-Operating Expenses (Year 0)
                        </h3>
                      </div>
                      <button
                        onClick={() =>
                          updatePreOp([
                            ...project.preOperatingExpenses,
                            { id: `pre-${Date.now()}`, name: 'New Pre-operating Item', amount: 15000 },
                          ])
                        }
                        className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                      >
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {project.preOperatingExpenses.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs"
                        >
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const copy = [...project.preOperatingExpenses];
                              copy[idx].name = e.target.value;
                              updatePreOp(copy);
                            }}
                            className="flex-1 text-xs text-slate-800 font-medium focus:outline-indigo-500"
                            placeholder="Expense name"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400 font-financial">{c}</span>
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => {
                                const copy = [...project.preOperatingExpenses];
                                copy[idx].amount = parseFloat(e.target.value) || 0;
                                updatePreOp(copy);
                              }}
                              className="w-24 text-xs font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5 focus:outline-indigo-500"
                            />
                          </div>
                          <button
                            onClick={() => {
                              updatePreOp(project.preOperatingExpenses.filter((_, i) => i !== idx));
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-800">
                      <span>Total Pre-Operating:</span>
                      <span className="font-financial">{formatCurrency(totalPreOp, c)}</span>
                    </div>
                  </div>

                  {/* Fixed Assets Table */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Property, Plant & Equipment (CapEx)
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateFixedAssets([
                              ...project.fixedAssets,
                              {
                                id: `fa-${Date.now()}`,
                                name: 'Equipment / Fixture',
                                cost: 50000,
                                usefulLifeYears: 5,
                                salvageValue: 5000,
                                depreciationMethod: 'Straight-Line',
                              },
                            ])
                          }
                          className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                        >
                          <Plus className="w-3 h-3" /> Add Asset
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {project.fixedAssets.map((asset, idx) => (
                        <div
                          key={asset.id}
                          className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={asset.name}
                              onChange={(e) => {
                                const copy = [...project.fixedAssets];
                                copy[idx].name = e.target.value;
                                updateFixedAssets(copy);
                              }}
                              className="flex-1 text-xs font-semibold text-slate-800 focus:outline-indigo-500"
                              placeholder="Asset name"
                            />
                            <button
                              onClick={() => {
                                updateFixedAssets(project.fixedAssets.filter((_, i) => i !== idx));
                              }}
                              className="text-slate-400 hover:text-red-600 p-0.5 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block">Cost ({c})</span>
                              <input
                                type="number"
                                value={asset.cost}
                                onChange={(e) => {
                                  const copy = [...project.fixedAssets];
                                  copy[idx].cost = parseFloat(e.target.value) || 0;
                                  updateFixedAssets(copy);
                                }}
                                className="w-full font-financial border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold focus:outline-indigo-500"
                              />
                            </div>
                            <div>
                              <span className="text-slate-400 block">Useful Life (Yrs)</span>
                              <input
                                type="number"
                                min="1"
                                max="25"
                                value={asset.usefulLifeYears}
                                onChange={(e) => {
                                  const copy = [...project.fixedAssets];
                                  copy[idx].usefulLifeYears = parseInt(e.target.value) || 1;
                                  updateFixedAssets(copy);
                                }}
                                className="w-full font-financial border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold focus:outline-indigo-500"
                              />
                            </div>
                            <div>
                              <span className="text-slate-400 block">Salvage Value ({c})</span>
                              <input
                                type="number"
                                value={asset.salvageValue}
                                onChange={(e) => {
                                  const copy = [...project.fixedAssets];
                                  copy[idx].salvageValue = parseFloat(e.target.value) || 0;
                                  updateFixedAssets(copy);
                                }}
                                className="w-full font-financial border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold focus:outline-indigo-500"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium block">
                                Depreciation Method
                              </span>
                              <select
                                value={asset.depreciationMethod || 'Straight-Line'}
                                onChange={(e) => {
                                  const copy = [...project.fixedAssets];
                                  copy[idx].depreciationMethod = e.target.value as DepreciationMethod;
                                  updateFixedAssets(copy);
                                }}
                                className="w-full bg-slate-50 border border-indigo-200 rounded px-1.5 py-1 text-xs font-medium text-slate-800 focus:outline-indigo-500"
                              >
                                {DEPRECIATION_METHODS.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.id === 'Straight-Line'
                                      ? 'Straight-Line (Default)'
                                      : m.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-800">
                      <span>Total PPE (CapEx):</span>
                      <span className="font-financial">{formatCurrency(totalFixedAssets, c)}</span>
                    </div>
                  </div>
                </div>

                {/* Capital Financing Mix & Working Capital Buffer */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-indigo-950 mb-0.5">
                        Financing Mix & Initial Working Capital Buffer
                      </h3>
                    </div>

                    {onOpenBankModal && (
                      <button
                        onClick={onOpenBankModal}
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                      >
                        <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Bank Interest & Loan Breakdown</span>
                      </button>
                    )}
                  </div>

                  {/* Breakdown of Initial Working Capital Buffer: Cash on Hand & Cash in Bank */}
                  <div className="bg-white border border-indigo-200/90 rounded-xl p-4 shadow-2xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Initial Working Capital Buffer Breakdown
                          </h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Buffer</span>
                        <span className="text-sm font-bold font-financial text-indigo-900">
                          {formatCurrency(project.initialWorkingCapitalBuffer, c)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Cash on Hand */}
                      <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
                          <span>Cash on Hand ({c})</span>
                          <span className="text-[10px] text-slate-400 font-normal">Petty / Float</span>
                        </label>
                        <input
                          type="number"
                          value={wcDetails.cashOnHand}
                          onChange={(e) =>
                            updateWorkingCapitalBuffer(
                              parseFloat(e.target.value) || 0,
                              wcDetails.cashInBank
                            )
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-financial font-bold text-slate-900 focus:outline-indigo-500"
                          placeholder="0"
                        />
                      </div>

                      {/* Cash in Bank */}
                      <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
                          <span>Cash in Bank ({c})</span>
                          <span className="text-[10px] text-indigo-600 font-semibold">Depository</span>
                        </label>
                        <input
                          type="number"
                          value={wcDetails.cashInBank}
                          onChange={(e) =>
                            updateWorkingCapitalBuffer(
                              wcDetails.cashOnHand,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-financial font-bold text-slate-900 focus:outline-indigo-500"
                          placeholder="0"
                        />
                      </div>

                      {/* Depository Local Bank Selector */}
                      <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1">
                            <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                            Depository Bank
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Local List</span>
                        </label>
                        <select
                          value={
                            LOCAL_BANKS.some((b) => b.name === wcDetails.bankName)
                              ? wcDetails.bankName
                              : 'Other'
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Other') {
                              updateWorkingCapitalBuffer(
                                wcDetails.cashOnHand,
                                wcDetails.cashInBank,
                                'Other Local Commercial Bank'
                              );
                            } else {
                              const found = LOCAL_BANKS.find((b) => b.name === val);
                              updateWorkingCapitalBuffer(
                                wcDetails.cashOnHand,
                                wcDetails.cashInBank,
                                val,
                                wcDetails.bankInterestRatePercent > 0
                                  ? wcDetails.bankInterestRatePercent
                                  : (found?.benchmarkSavingsRate ?? 1.0)
                              );
                            }
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-indigo-500 truncate"
                        >
                          {LOCAL_BANKS.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                          <option value="Other">Other Local Commercial Bank / Thrift Bank</option>
                        </select>
                        {!LOCAL_BANKS.some((b) => b.name === wcDetails.bankName) && (
                          <input
                            type="text"
                            value={wcDetails.bankName}
                            onChange={(e) =>
                              updateWorkingCapitalBuffer(
                                wcDetails.cashOnHand,
                                wcDetails.cashInBank,
                                e.target.value
                              )
                            }
                            placeholder="Specify custom bank name"
                            className="mt-1.5 w-full bg-white border border-indigo-300 rounded px-2 py-1 text-xs text-slate-900 focus:outline-indigo-500"
                          />
                        )}
                      </div>

                      {/* Bank Interest Rate (% p.a.) - Manually Encoded */}
                      <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3">
                        <label className="text-xs font-semibold text-indigo-950 flex items-center justify-between mb-1">
                          <span>Bank Interest Rate (% p.a.)</span>
                          <span className="text-[10px] bg-indigo-200/80 text-indigo-800 px-1.5 py-0.5 rounded font-medium">
                            Manual
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            max="30"
                            value={wcDetails.bankInterestRatePercent}
                            onChange={(e) =>
                              updateWorkingCapitalBuffer(
                                wcDetails.cashOnHand,
                                wcDetails.cashInBank,
                                undefined,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-white border border-indigo-300 rounded px-2.5 py-1.5 text-xs font-financial font-bold text-indigo-950 focus:outline-indigo-500 pr-7"
                            placeholder="1.0"
                          />
                          <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
                        </div>
                        <span className="text-[10px] text-indigo-700 font-medium mt-1 block">
                          Est. interest: {formatCurrency(Math.round(wcDetails.cashInBank * (wcDetails.bankInterestRatePercent / 100)), c)}/yr
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Summary Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-slate-600">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                          <strong>Cash on Hand:</strong> {formatCurrency(wcDetails.cashOnHand, c)} (
                          {project.initialWorkingCapitalBuffer > 0
                            ? Math.round((wcDetails.cashOnHand / project.initialWorkingCapitalBuffer) * 100)
                            : 0}%)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                          <strong>Cash in Bank:</strong> {formatCurrency(wcDetails.cashInBank, c)} (
                          {project.initialWorkingCapitalBuffer > 0
                            ? Math.round((wcDetails.cashInBank / project.initialWorkingCapitalBuffer) * 100)
                            : 0}%)
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-indigo-900">
                        Total Initial Working Capital Buffer: <span className="font-financial">{formatCurrency(project.initialWorkingCapitalBuffer, c)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Owners’ Equity Contribution ({c})
                      </label>
                      <input
                        type="number"
                        value={project.financing.equityContribution}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            financing: {
                              ...project.financing,
                              equityContribution: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Bank / Debt Financing ({c})
                      </label>
                      <input
                        type="number"
                        value={project.financing.bankLoanAmount}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            financing: {
                              ...project.financing,
                              bankLoanAmount: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-slate-700 block mb-1">
                            Interest %
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={project.financing.annualInterestRate}
                            onChange={(e) =>
                              onUpdateProject({
                                ...project,
                                financing: {
                                  ...project.financing,
                                  annualInterestRate: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 block mb-1">
                            Term (Yrs)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={project.financing.loanTermYears}
                            onChange={(e) =>
                              onUpdateProject({
                                ...project,
                                financing: {
                                  ...project.financing,
                                  loanTermYears: parseInt(e.target.value) || 1,
                                },
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auto-match helper button */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-indigo-100">
                    <span className="text-slate-600">
                      Total Required: <strong className="font-financial">{formatCurrency(totalOutlay, c)}</strong> | Current Financing: <strong className="font-financial">{formatCurrency(project.financing.equityContribution + project.financing.bankLoanAmount, c)}</strong>
                    </span>
                    <button
                      onClick={() => {
                        const neededEquity = Math.max(0, totalOutlay - project.financing.bankLoanAmount);
                        onUpdateProject({
                          ...project,
                          financing: { ...project.financing, equityContribution: neededEquity },
                        });
                      }}
                      className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition"
                    >
                      Auto-Balance Equity to 100%
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS & SALES PROJECTIONS */}
            {activeTab === 'sales' && (
              <div id="assumptions-tab-sales" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-600" />
                      <span>2. Revenue Streams & Product Sales Projections</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Product pricing, Year 1 volume, annual volume growth rates, and sales discount policies.
                    </p>
                  </div>
                  <PdfDownloadButton
                    targetId="assumptions-tab-sales"
                    title="2. Products & Sales Projections"
                    subtitle={`${project.title} • Assumptions Tab 2`}
                    projectTitle={project.title}
                    buttonText="Download Tab PDF"
                    size="sm"
                    variant="indigo"
                    orientation="landscape"
                    format="a4"
                    fitToSinglePage={true}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Product Pricing & Baseline Volumes
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('costing')}
                      className="px-2.5 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold flex items-center gap-1 transition border border-indigo-200"
                      title="Open Tab 3 Costing to review Selling Prices, Unit Costs, and 5-Year Revenue Projections"
                    >
                      <Calculator className="w-3.5 h-3.5 text-indigo-600" /> Costing Breakdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('directMaterials')}
                      className="px-2.5 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-semibold flex items-center gap-1 transition border border-amber-200"
                      title="Open Tab 4 Direct Materials to manage Bill of Materials and packaging"
                    >
                      <Tag className="w-3.5 h-3.5 text-amber-600" /> Direct Materials BOM
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('directCosts')}
                      className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg font-medium flex items-center gap-1 transition border border-slate-200"
                      title="Navigate to Tab 4 to compute and allocate Direct Labor per unit"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-600" /> Allocate Direct Labor
                    </button>
                    <button
                      onClick={() =>
                        updateProducts([
                          ...project.products,
                          {
                            id: `p-${Date.now()}`,
                            name: 'New Product / Service',
                            unitPrice: 100,
                            year1Volume: 5000,
                            annualGrowthRate: 8,
                            unitCost: 35,
                          },
                        ])
                      }
                      className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Product / Service
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Product / Service Name</th>
                        <th className="p-3 text-right">Selling Price ({c})</th>
                        <th className="p-3 text-right">Direct Cost / Unit ({c})</th>
                        <th className="p-3 text-right">Unit Margin</th>
                        <th className="p-3 text-right">Year 1 Volume</th>
                        <th className="p-3 text-right">Annual Growth %</th>
                        <th className="p-3 text-right">Year 1 Revenue</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.products.map((prod, idx) => {
                        const unitMargin = prod.unitPrice - prod.unitCost;
                        const marginPct = prod.unitPrice > 0 ? (unitMargin / prod.unitPrice) * 100 : 0;
                        const yr1Rev = prod.unitPrice * prod.year1Volume;

                        const isTarget = selectedCostingProductId === prod.id;

                        return (
                          <tr
                            key={prod.id}
                            id={`sales-product-row-${prod.id}`}
                            className={`transition ${
                              isTarget
                                ? 'bg-indigo-50/80 ring-2 ring-indigo-400 font-semibold'
                                : 'hover:bg-slate-50/50'
                            }`}
                          >
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={prod.name}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  copy[idx].name = e.target.value;
                                  updateProducts(copy);
                                }}
                                className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={prod.unitPrice}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  copy[idx].unitPrice = parseFloat(e.target.value) || 0;
                                  updateProducts(copy);
                                }}
                                className="w-20 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={prod.unitCost}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  const val = parseFloat(e.target.value) || 0;
                                  copy[idx].unitCost = val;
                                  copy[idx].rawMaterialsCostPerUnit = Math.max(
                                    0,
                                    val - (copy[idx].directLaborCostPerUnit || 0)
                                  );
                                  updateProducts(copy);
                                }}
                                className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
                              {prod.directLaborCostPerUnit !== undefined && prod.directLaborCostPerUnit > 0 && (
                                <div
                                  className="text-[10px] text-indigo-600 font-semibold mt-0.5 whitespace-nowrap"
                                  title={`Raw Materials: ${formatCurrency(prod.rawMaterialsCostPerUnit ?? (prod.unitCost - prod.directLaborCostPerUnit), c)} | Direct Labor: ${formatCurrency(prod.directLaborCostPerUnit, c)}`}
                                >
                                  +{formatCurrency(prod.directLaborCostPerUnit, c)} DL
                                </div>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-financial text-slate-600">
                              {formatCurrency(unitMargin, c)} ({marginPct.toFixed(0)}%)
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={prod.year1Volume}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  copy[idx].year1Volume = parseFloat(e.target.value) || 0;
                                  updateProducts(copy);
                                }}
                                className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={prod.annualGrowthRate}
                                  onChange={(e) => {
                                    const copy = [...project.products];
                                    copy[idx].annualGrowthRate = parseFloat(e.target.value) || 0;
                                    updateProducts(copy);
                                  }}
                                  className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                />
                                <span>%</span>
                              </div>
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                              {formatCurrency(yr1Rev, c)}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => {
                                  updateProducts(project.products.filter((_, i) => i !== idx));
                                }}
                                className="text-slate-400 hover:text-red-600 p-1 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: COSTING (SELLING PRICE, UNIT COST BREAKDOWN DM/DL/FOH, 5-YR REVENUE) */}
            {activeTab === 'costing' && (
              <div id="assumptions-tab-costing" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-indigo-600" />
                      <span>3. Costing & 5-Year Revenue Projections</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Selling price, unit cost breakdown (DM, DL, FOH), unit margins, and 5-year sales volume schedule.
                    </p>
                  </div>
                  <PdfDownloadButton
                    targetId="assumptions-tab-costing"
                    title="3. Costing & 5-Year Revenue Projections"
                    subtitle={`${project.title} • Assumptions Tab 3`}
                    projectTitle={project.title}
                    buttonText="Download Tab PDF"
                    size="sm"
                    variant="indigo"
                    orientation="landscape"
                    format="a4"
                    fitToSinglePage={true}
                  />
                </div>
                <CostingTab
                  project={project}
                  onUpdateProject={onUpdateProject}
                  onNavigateToTab={handleNavigateToTab}
                />
              </div>
            )}

            {/* TAB 4: DIRECT MATERIALS (BILL OF MATERIALS & PACKAGING) */}
            {activeTab === 'directMaterials' && (
              <div id="assumptions-tab-directMaterials" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-amber-50/60 via-slate-50 to-amber-50/40 rounded-2xl border border-amber-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-600" />
                      <span>4. Direct Materials (Bill of Materials & Packaging)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Itemized raw materials, ingredients, specifications, packaging, unit costs, and BOM presets.
                    </p>
                  </div>
                  <PdfDownloadButton
                    targetId="assumptions-tab-directMaterials"
                    title="4. Direct Materials (Bill of Materials & Packaging)"
                    subtitle={`${project.title} • Assumptions Tab 4`}
                    projectTitle={project.title}
                    buttonText="Download Tab PDF"
                    size="sm"
                    variant="emerald"
                    orientation="landscape"
                    format="a4"
                    fitToSinglePage={true}
                  />
                </div>
                <ProductCostingTab
                  project={project}
                  onUpdateProject={onUpdateProject}
                  onNavigateToTab={handleNavigateToTab}
                  initialProductId={selectedCostingProductId}
                />
              </div>
            )}

            {/* TAB 5: DIRECT LABOR */}
            {activeTab === 'directCosts' && (
              <div id="assumptions-tab-directCosts" className="space-y-6">
                {/* ---------------------------------------------------- */}
                {/* 1. DIRECT LABOR TABLE                                */}
                {/* ---------------------------------------------------- */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-gradient-to-r from-indigo-50/60 via-white to-slate-50 p-3.5 rounded-xl border border-indigo-200">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-2xs">
                          <Users className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          Direct Labor Headcount & Compensation {dlViewYear > 1 ? `(Year ${dlViewYear} Escalated)` : `(Year 1)`}
                        </h3>
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Direct Labor
                        </span>
                      </div>

                      {/* Year navigation selector */}
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-indigo-200 shadow-2xs w-fit">
                        <span className="text-[11px] font-bold text-indigo-950 px-2 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-700" />
                          Projection Year:
                        </span>
                        {[1, 2, 3, 4, 5].map((yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setDlViewYear(yr)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              dlViewYear === yr
                                ? 'bg-indigo-600 text-white shadow-2xs ring-1 ring-indigo-700/20'
                                : 'text-slate-600 hover:bg-indigo-100/70 hover:text-indigo-950'
                            }`}
                          >
                            Year {yr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                      <PdfDownloadButton
                        targetId="assumptions-tab-directCosts"
                        title="5. Direct Labor Schedule & Benefits"
                        subtitle={`${project.title} • Assumptions Tab 5`}
                        projectTitle={project.title}
                        buttonText="Download Tab PDF"
                        size="xs"
                        variant="indigo"
                        orientation="landscape"
                        format="a4"
                        fitToSinglePage={true}
                      />
                      <button
                        onClick={() =>
                          updateDirectLabor([
                            ...project.directLabor,
                            {
                              id: `dl-${Date.now()}`,
                              role: 'Production Technician',
                              headcount: 1,
                              monthlyWage: 18000,
                              monthsPerYear: 13,
                            },
                          ])
                        }
                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium flex items-center gap-1.5 transition shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Direct Labor Role
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Position / Role</th>
                          <th className="p-3 text-right">Headcount</th>
                          <th className="p-3 text-right">
                            {dlViewYear > 1 ? `Monthly Basic Wage (Yr ${dlViewYear}) (${c})` : `Monthly Basic Wage (${c})`}
                          </th>
                          <th className="p-3 text-center">Annual Salary Increase</th>
                          <th className="p-3 text-right">Months / Year</th>
                          <th className="p-3 text-right">
                            {dlViewYear > 1 ? `Total Annual Cost (Yr ${dlViewYear})` : `Total Annual Cost (Yr 1)`}
                          </th>
                          <th className="p-3 text-center w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {project.directLabor.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-6 text-slate-400">
                              No direct labor positions added yet. Click "Add Direct Labor Role" above.
                            </td>
                          </tr>
                        ) : (
                          project.directLabor.map((lab, idx) => {
                            const wageYr = calculateLaborMonthlyWageForYear(
                              lab.monthlyWage || 0,
                              dlViewYear,
                              lab.annualSalaryIncreaseType,
                              lab.annualSalaryIncreaseValue,
                              project.inflationRatePercent
                            );
                            const annual = wageYr * (lab.monthsPerYear || 12) * (lab.headcount || 1);
                            const incType = lab.annualSalaryIncreaseType || 'percentage';
                            const incVal = lab.annualSalaryIncreaseValue ?? 0;
                            return (
                              <tr key={lab.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    value={lab.role}
                                    placeholder="e.g. Machine Operator, Assembly Crew"
                                    onChange={(e) => {
                                      const copy = [...project.directLabor];
                                      copy[idx].role = e.target.value;
                                      updateDirectLabor(copy);
                                    }}
                                    className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="1"
                                    value={lab.headcount}
                                    onChange={(e) => {
                                      const copy = [...project.directLabor];
                                      copy[idx].headcount = parseInt(e.target.value) || 1;
                                      updateDirectLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    value={dlViewYear === 1 ? lab.monthlyWage : Math.round(wageYr * 100) / 100}
                                    onChange={(e) => {
                                      const copy = [...project.directLabor];
                                      const val = parseFloat(e.target.value) || 0;
                                      if (dlViewYear === 1) {
                                        copy[idx].monthlyWage = val;
                                      } else {
                                        if (incType === 'amount') {
                                          copy[idx].monthlyWage = Math.max(0, val - incVal * (dlViewYear - 1));
                                        } else {
                                          const rate = incVal !== 0 || lab.annualSalaryIncreaseValue !== undefined ? incVal : (project.inflationRatePercent || 0);
                                          const growth = Math.pow(1 + rate / 100, dlViewYear - 1);
                                          copy[idx].monthlyWage = growth > 0 ? Math.round((val / growth) * 100) / 100 : val;
                                        }
                                      }
                                      updateDirectLabor(copy);
                                    }}
                                    className="w-24 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5 focus:border-indigo-500 focus:outline-none"
                                  />
                                  {dlViewYear > 1 && (
                                    <span className="block text-[10px] text-indigo-700 font-normal">
                                      Base Yr 1: {formatCurrency(lab.monthlyWage, c)}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5">
                                  <div className="flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      step={incType === 'percentage' ? '0.1' : '50'}
                                      min="0"
                                      placeholder={incType === 'percentage' ? `${project.inflationRatePercent || 0}%` : '0'}
                                      value={incVal === 0 && !lab.annualSalaryIncreaseValue ? '' : incVal}
                                      onChange={(e) => {
                                        const copy = [...project.directLabor];
                                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                        copy[idx].annualSalaryIncreaseValue = val;
                                        if (!copy[idx].annualSalaryIncreaseType) {
                                          copy[idx].annualSalaryIncreaseType = 'percentage';
                                        }
                                        updateDirectLabor(copy);
                                      }}
                                      className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                                    />
                                    <select
                                      value={incType}
                                      onChange={(e) => {
                                        const copy = [...project.directLabor];
                                        copy[idx].annualSalaryIncreaseType = e.target.value as 'percentage' | 'amount';
                                        updateDirectLabor(copy);
                                      }}
                                      className="text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded px-1 py-0.5 focus:outline-none"
                                      title="Select increase mode: % (percentage per year) or Amount (fixed ₱/month increase each year)"
                                    >
                                      <option value="percentage">% / yr</option>
                                      <option value="amount">{c}/mo / yr</option>
                                    </select>
                                  </div>
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="12"
                                    max="14"
                                    value={lab.monthsPerYear}
                                    onChange={(e) => {
                                      const copy = [...project.directLabor];
                                      copy[idx].monthsPerYear = parseInt(e.target.value) || 12;
                                      updateDirectLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                                  {formatCurrency(annual, c)}
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => {
                                      updateDirectLabor(project.directLabor.filter((_, i) => i !== idx));
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-1 transition"
                                    title="Delete role"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {project.directLabor.length > 0 && (
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                          <tr>
                            <td className="p-2.5">Total Direct Labor</td>
                            <td className="p-2.5 text-right font-financial font-bold text-indigo-700">
                              {totalDirectLaborHeadcount} pax
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-indigo-700 text-xs">
                              {formatCurrency(selectedDlYearSummary.monthlyTotal, c)}
                              <span className="block text-[10px] text-slate-400 font-normal">
                                / month ({dlViewYear > 1 ? `Yr ${dlViewYear} Escalated` : 'Yr 1'})
                              </span>
                            </td>
                            <td colSpan={2} className="p-2.5 text-right text-slate-500">
                              {dlViewYear > 1 ? `Total Year ${dlViewYear} Annual:` : 'Annual Total:'}
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-indigo-700 text-sm">
                              {formatCurrency(selectedDlYearSummary.annualTotal, c)}
                              {dlViewYear > 1 && (
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  (Escalated)
                                </span>
                              )}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* ---------------------------------------------------------------------- */}
                {/* 2. DIRECT LABOR COST PER UNIT COMPUTATION & ALLOCATION                 */}
                {/* ---------------------------------------------------------------------- */}
                <div className="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/60 border border-indigo-200/80 rounded-xl p-4 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-2xs">
                          <Calculator className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          Direct Labor Cost Per Unit Computation & Allocation
                        </h3>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Sync with Products
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={applyDlToAllProducts}
                        className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-2xs flex items-center gap-1"
                        title="Add calculated direct labor to all products in Product & Sales Volume"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Apply DL to All Products
                      </button>
                      <button
                        type="button"
                        onClick={resetAllProductsDl}
                        className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg transition shadow-2xs"
                        title="Reset all products to base raw materials cost"
                      >
                        Reset All
                      </button>
                    </div>
                  </div>

                  {/* High Level Key Metric Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Total Direct Labor (Year {dlViewYear})
                      </span>
                      <span className="text-sm font-bold font-financial text-indigo-700">
                        {formatCurrency(selectedDlYearSummary.annualTotal, c)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Total Year {dlViewYear} Production Volume
                      </span>
                      <span className="text-sm font-bold font-financial text-slate-900">
                        {selectedDlYearSummary.volume.toLocaleString()} units
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Average DL Cost / Unit (Year {dlViewYear})
                      </span>
                      <span className="text-sm font-bold font-financial text-emerald-700">
                        {formatCurrency(selectedDlYearSummary.costPerUnit, c)}
                        <span className="text-xs font-normal text-slate-500"> / unit</span>
                      </span>
                    </div>
                  </div>

                  {/* Feedback Banner if an action was executed */}
                  {appliedDlFeedback && (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{appliedDlFeedback}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: FACTORY OVERHEAD */}
            {activeTab === 'factoryOverhead' && (
              <div id="assumptions-tab-factoryOverhead" className="space-y-6">
                {/* Header & Master Badge with Year Function Tab */}
                <div className="bg-gradient-to-r from-amber-50/90 via-white to-slate-50 border border-amber-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="p-1.5 bg-amber-600 text-white rounded-lg shadow-2xs">
                        <Factory className="w-4 h-4" />
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Factory Overhead (FOH) Schedule
                      </h3>
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Manufacturing Overhead
                      </span>
                    </div>

                    {/* Year Function Tab Navigation */}
                    <div className="flex items-center gap-1 bg-white/95 p-1 rounded-xl border border-amber-300 shadow-2xs w-fit">
                      <span className="text-[11px] font-bold text-amber-900 px-2 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        FOH Year:
                      </span>
                      {[1, 2, 3, 4, 5].map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setFohViewYear(yr)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            fohViewYear === yr
                              ? 'bg-amber-600 text-white shadow-2xs ring-1 ring-amber-700/20'
                              : 'text-slate-600 hover:bg-amber-100/70 hover:text-amber-950'
                          }`}
                        >
                          Year {yr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                    <PdfDownloadButton
                      targetId="assumptions-tab-factoryOverhead"
                      title="6. Factory Overhead (FOH) Schedule"
                      subtitle={`${project.title} • Assumptions Tab 6`}
                      projectTitle={project.title}
                      buttonText="Download Tab PDF"
                      size="sm"
                      variant="amber"
                      orientation="landscape"
                      format="a4"
                      fitToSinglePage={true}
                    />
                    <div className="bg-white border border-amber-200 rounded-xl px-4 py-2.5 shadow-2xs text-right shrink-0">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                          Total Year {fohViewYear} FOH (COGS)
                        </span>
                        {fohViewYear > 1 && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                            Escalated
                          </span>
                        )}
                      </div>
                      <span className="text-base font-bold font-financial text-amber-700">
                        {formatCurrency(selectedYearFohSummary.totalFactoryOverheadAnnual, c)}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-financial mt-0.5">
                        {formatCurrency(selectedYearFohSummary.overheadPerUnit, c)} / unit ({selectedYearFohSummary.totalProductionVolume.toLocaleString()} units)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6 Combined Components of Factory Overhead (Updated dynamically for Year {fohViewYear}) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-amber-50/40 p-3 rounded-xl border border-amber-200 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold truncate">1. Indirect Labor</span>
                      <span className="text-[9px] text-slate-400 font-medium">Yr {fohViewYear}</span>
                    </div>
                    <span className="font-bold font-financial text-slate-900 block mt-0.5">
                      {formatCurrency(selectedYearFohSummary.indirectLaborAnnual, c)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold truncate">2. Utilities (Prod.)</span>
                      <span className="text-[9px] text-slate-400 font-medium">Yr {fohViewYear}</span>
                    </div>
                    <span className="font-bold font-financial text-slate-900 block mt-0.5">
                      {formatCurrency(selectedYearFohSummary.productionUtilitiesAnnual, c)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold truncate">3. Depreciation (Prod.)</span>
                      <span className="text-[9px] text-slate-400 font-medium">Yr {fohViewYear}</span>
                    </div>
                    <span className="font-bold font-financial text-slate-900 block mt-0.5">
                      {formatCurrency(selectedYearFohSummary.factoryDepreciationAnnual, c)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold truncate">4. Supplies & Misc</span>
                      <span className="text-[9px] text-slate-400 font-medium">Yr {fohViewYear}</span>
                    </div>
                    <span className="font-bold font-financial text-slate-900 block mt-0.5">
                      {formatCurrency(selectedYearFohSummary.suppliesAndOverheadAnnual, c)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold truncate">5. Statutory & 13th Mo.</span>
                      <span className="text-[9px] text-slate-400 font-medium">Yr {fohViewYear}</span>
                    </div>
                    <span className="font-bold font-financial text-slate-900 block mt-0.5">
                      {formatCurrency(selectedYearFohSummary.productionStatutoryBenefitsAnnual, c)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold truncate">6. Supplemental Benefits</span>
                      <span className="text-[9px] text-slate-400 font-medium">Yr {fohViewYear}</span>
                    </div>
                    <span className="font-bold font-financial text-emerald-700 block mt-0.5">
                      {formatCurrency(selectedYearFohSummary.additionalNonStatutoryBenefitsAnnual, c)}
                    </span>
                  </div>
                </div>

                {/* 1. INDIRECT LABOR TABLE */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-amber-100 text-amber-700 rounded-lg">
                          <Users className="w-4 h-4" />
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          1. Indirect Labor Headcount & Compensation (Production Support)
                        </h4>
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Factory Support
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateIndirectLabor([
                          ...(project.indirectLabor || []),
                          {
                            id: `idl-${Date.now()}`,
                            role: 'Production Supervisor / QA',
                            headcount: 1,
                            monthlyWage: 22000,
                            monthsPerYear: 13,
                          },
                        ])
                      }
                      className="px-3 py-1.5 text-xs bg-amber-700 text-white hover:bg-amber-800 rounded-lg font-medium flex items-center gap-1.5 transition shadow-2xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Indirect Labor Role
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Position / Role</th>
                          <th className="p-3 text-right">Headcount</th>
                          <th className="p-3 text-right">
                            {fohViewYear > 1 ? `Monthly Basic Wage (Yr ${fohViewYear}) (${c})` : `Monthly Basic Wage (${c})`}
                          </th>
                          <th className="p-3 text-center">Annual Salary Increase</th>
                          <th className="p-3 text-right">Months / Year</th>
                          <th className="p-3 text-right">
                            {fohViewYear > 1 ? `Total Annual Cost (Yr ${fohViewYear})` : `Total Annual Cost (Yr 1)`}
                          </th>
                          <th className="p-3 text-center w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(!project.indirectLabor || project.indirectLabor.length === 0) ? (
                          <tr>
                            <td colSpan={7} className="text-center py-6 text-slate-400">
                              No indirect labor positions added yet. Click "Add Indirect Labor Role" above.
                            </td>
                          </tr>
                        ) : (
                          project.indirectLabor.map((lab, idx) => {
                            const wageYr = calculateLaborMonthlyWageForYear(
                              lab.monthlyWage || 0,
                              fohViewYear,
                              lab.annualSalaryIncreaseType,
                              lab.annualSalaryIncreaseValue,
                              project.inflationRatePercent
                            );
                            const annual = wageYr * (lab.monthsPerYear || 12) * (lab.headcount || 1);
                            const incType = lab.annualSalaryIncreaseType || 'percentage';
                            const incVal = lab.annualSalaryIncreaseValue ?? 0;
                            return (
                              <tr key={lab.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    value={lab.role}
                                    placeholder="e.g. Quality Control Inspector, Plant Custodian"
                                    onChange={(e) => {
                                      const copy = [...(project.indirectLabor || [])];
                                      copy[idx].role = e.target.value;
                                      updateIndirectLabor(copy);
                                    }}
                                    className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="1"
                                    value={lab.headcount}
                                    onChange={(e) => {
                                      const copy = [...(project.indirectLabor || [])];
                                      copy[idx].headcount = parseInt(e.target.value) || 1;
                                      updateIndirectLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    value={fohViewYear === 1 ? lab.monthlyWage : Math.round(wageYr * 100) / 100}
                                    onChange={(e) => {
                                      const copy = [...(project.indirectLabor || [])];
                                      const val = parseFloat(e.target.value) || 0;
                                      if (fohViewYear === 1) {
                                        copy[idx].monthlyWage = val;
                                      } else {
                                        if (incType === 'amount') {
                                          copy[idx].monthlyWage = Math.max(0, val - incVal * (fohViewYear - 1));
                                        } else {
                                          const rate = incVal !== 0 || lab.annualSalaryIncreaseValue !== undefined ? incVal : (project.inflationRatePercent || 0);
                                          const growth = Math.pow(1 + rate / 100, fohViewYear - 1);
                                          copy[idx].monthlyWage = growth > 0 ? Math.round((val / growth) * 100) / 100 : val;
                                        }
                                      }
                                      updateIndirectLabor(copy);
                                    }}
                                    className="w-24 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5 focus:border-amber-500 focus:outline-none"
                                  />
                                  {fohViewYear > 1 && (
                                    <span className="block text-[10px] text-amber-700 font-normal">
                                      Base Yr 1: {formatCurrency(lab.monthlyWage, c)}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5">
                                  <div className="flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      step={incType === 'percentage' ? '0.1' : '50'}
                                      min="0"
                                      placeholder={incType === 'percentage' ? `${project.inflationRatePercent || 0}%` : '0'}
                                      value={incVal === 0 && !lab.annualSalaryIncreaseValue ? '' : incVal}
                                      onChange={(e) => {
                                        const copy = [...(project.indirectLabor || [])];
                                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                        copy[idx].annualSalaryIncreaseValue = val;
                                        if (!copy[idx].annualSalaryIncreaseType) {
                                          copy[idx].annualSalaryIncreaseType = 'percentage';
                                        }
                                        updateIndirectLabor(copy);
                                      }}
                                      className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                                    />
                                    <select
                                      value={incType}
                                      onChange={(e) => {
                                        const copy = [...(project.indirectLabor || [])];
                                        copy[idx].annualSalaryIncreaseType = e.target.value as 'percentage' | 'amount';
                                        updateIndirectLabor(copy);
                                      }}
                                      className="text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded px-1 py-0.5 focus:outline-none"
                                      title="Select increase mode: % (percentage per year) or Amount (fixed ₱/month increase each year)"
                                    >
                                      <option value="percentage">% / yr</option>
                                      <option value="amount">{c}/mo / yr</option>
                                    </select>
                                  </div>
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="12"
                                    max="14"
                                    value={lab.monthsPerYear}
                                    onChange={(e) => {
                                      const copy = [...(project.indirectLabor || [])];
                                      copy[idx].monthsPerYear = parseInt(e.target.value) || 12;
                                      updateIndirectLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                                  {formatCurrency(annual, c)}
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => {
                                      updateIndirectLabor((project.indirectLabor || []).filter((_, i) => i !== idx));
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-1 transition"
                                    title="Delete role"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {(project.indirectLabor && project.indirectLabor.length > 0) && (
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                          <tr>
                            <td className="p-2.5">Total Indirect Labor</td>
                            <td className="p-2.5 text-right font-financial font-bold text-amber-700">
                              {totalIndirectLaborHeadcount} pax
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-amber-700 text-xs">
                              {formatCurrency(selectedIndirectLaborMonthly, c)}
                              <span className="block text-[10px] text-slate-400 font-normal">
                                / month ({fohViewYear > 1 ? `Yr ${fohViewYear} Escalated` : 'Yr 1'})
                              </span>
                            </td>
                            <td colSpan={2} className="p-2.5 text-right text-slate-500">
                              {fohViewYear > 1 ? `Total Year ${fohViewYear} Cost:` : 'Annual Total:'}
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-amber-700 text-sm">
                              {formatCurrency(selectedYearFohSummary.indirectLaborAnnual, c)}
                              {fohViewYear > 1 && (
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  (Escalated)
                                </span>
                              )}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* 2. UTILITIES EXPENSE ATTRIBUTED TO PRODUCTION */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-amber-100 text-amber-700 rounded-lg">
                          <Zap className="w-4 h-4" />
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          2. Utilities Expense Attributed to Production
                        </h4>
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Factory Utilities
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateProductionUtilities([
                            ...(project.productionUtilities || []),
                            {
                              id: `pu-${Date.now()}`,
                              name: 'Factory Electricity (Machinery & Plant Power)',
                              monthlyAmount: 3000,
                              annualAmountYear1: 36000,
                              annualGrowthRate: 5,
                            },
                          ])
                        }
                        className="px-3 py-1.5 text-xs bg-amber-700 text-white hover:bg-amber-800 rounded-lg font-medium flex items-center gap-1.5 transition shadow-2xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Production Utility
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Production Utility Item</th>
                          <th className="p-3 text-right">
                            {fohViewYear > 1 ? `Monthly Amount (Yr ${fohViewYear}) (${c})` : `Monthly Amount (${c})`}
                          </th>
                          <th className="p-3 text-right">
                            {fohViewYear > 1 ? `Year ${fohViewYear} Annual Amount (${c})` : `Year 1 Annual Amount (${c})`}
                          </th>
                          <th className="p-3 text-right">Annual Escalation Rate (%)</th>
                          <th className="p-3 text-center w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(!project.productionUtilities || project.productionUtilities.length === 0) ? (
                          <tr>
                            <td colSpan={5} className="text-center py-6 text-slate-400">
                              No production utilities added yet. Click "Add Production Utility" above.
                            </td>
                          </tr>
                        ) : (
                          project.productionUtilities.map((util, idx) => {
                            const baseMonthlyVal =
                              util.monthlyAmount !== undefined
                                ? util.monthlyAmount
                                : (util.annualAmountYear1 ? Math.round((util.annualAmountYear1 / 12) * 100) / 100 : 0);
                            const growth = Math.pow(1 + (util.annualGrowthRate || 0) / 100, fohViewYear - 1);
                            const escalatedMonthlyVal = Math.round(baseMonthlyVal * growth * 100) / 100;
                            const annualVal = baseMonthlyVal * 12 * growth;

                            return (
                              <tr key={util.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    value={util.name}
                                    placeholder="e.g. Factory Electricity, Water for Food Processing, Plant Fuel"
                                    onChange={(e) => {
                                      const copy = [...(project.productionUtilities || [])];
                                      copy[idx].name = e.target.value;
                                      updateProductionUtilities(copy);
                                    }}
                                    className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={fohViewYear === 1 ? (baseMonthlyVal === 0 ? '' : baseMonthlyVal) : (escalatedMonthlyVal === 0 ? '' : escalatedMonthlyVal)}
                                    placeholder="0"
                                    onChange={(e) => {
                                      const copy = [...(project.productionUtilities || [])];
                                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                      if (fohViewYear === 1) {
                                        copy[idx].monthlyAmount = val;
                                        copy[idx].annualAmountYear1 = Math.round(val * 12 * 100) / 100;
                                      } else {
                                        const baseMonthly = growth > 0 ? Math.round((val / growth) * 100) / 100 : val;
                                        copy[idx].monthlyAmount = baseMonthly;
                                        copy[idx].annualAmountYear1 = Math.round(baseMonthly * 12 * 100) / 100;
                                      }
                                      updateProductionUtilities(copy);
                                    }}
                                    className="w-28 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5 focus:border-amber-500 focus:outline-none"
                                  />
                                  {fohViewYear > 1 && (
                                    <span className="block text-[10px] text-amber-700 font-normal">
                                      Base Yr 1: {formatCurrency(baseMonthlyVal, c)}
                                      {util.annualGrowthRate ? ` (+${((growth - 1) * 100).toFixed(1)}%)` : ''}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                                  {formatCurrency(annualVal, c)}
                                </td>
                                <td className="p-2.5 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={util.annualGrowthRate}
                                      onChange={(e) => {
                                        const copy = [...(project.productionUtilities || [])];
                                        copy[idx].annualGrowthRate = parseFloat(e.target.value) || 0;
                                        updateProductionUtilities(copy);
                                      }}
                                      className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                    />
                                    <span className="text-slate-400">%</span>
                                  </div>
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => {
                                      updateProductionUtilities(
                                        (project.productionUtilities || []).filter((_, i) => i !== idx)
                                      );
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-1 transition"
                                    title="Delete utility"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {(project.productionUtilities && project.productionUtilities.length > 0) && (
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                          <tr>
                            <td className="p-2.5">Total Production Utilities</td>
                            <td className="p-2.5 text-right font-financial font-bold text-slate-800 text-xs">
                              {formatCurrency(selectedYearFohSummary.productionUtilitiesAnnual / 12, c)}
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {fohViewYear > 1 ? `/ month (Yr ${fohViewYear} Escalated)` : '/ month'}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-amber-700 text-sm">
                              {formatCurrency(selectedYearFohSummary.productionUtilitiesAnnual, c)}
                              <span className="block text-[10px] text-slate-400 font-normal">
                                / year ({fohViewYear > 1 ? `Yr ${fohViewYear} Escalated` : '12 mos'})
                              </span>
                            </td>
                            <td colSpan={2} className="p-2.5 text-right text-slate-400 text-[11px]">
                              Included in Factory Overhead (COGS)
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* 3. DEPRECIATION EXPENSE ATTRIBUTED TO PRODUCTION */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                        <Building className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          3. Depreciation Expense Attributed to Production
                        </h4>
                      </div>
                    </div>

                    {/* Attribution Mode Switcher */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateFactoryDepreciationMethod('percentage')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          factoryDeprMethod === 'percentage'
                            ? 'bg-white text-amber-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Global % Allocation
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFactoryDepreciationMethod('specific_assets')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                          factoryDeprMethod === 'specific_assets'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        Specific Asset Selection
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Global Percentage */}
                  {factoryDeprMethod === 'percentage' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50/40 p-4 rounded-xl border border-amber-200/70">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                          Total Fixed Assets Depreciation (Yr 1)
                        </span>
                        <span className="text-base font-bold font-financial text-slate-800">
                          {formatCurrency(totalYear1Depreciation, c)}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Computed from {project.fixedAssets.length} asset(s) in Capital Outlay schedule
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] text-amber-900 uppercase tracking-wider font-bold block mb-1">
                          % Attributed to Factory / Production
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={factoryDeprPercent}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              updateFactoryDepreciationPercent(isNaN(val) ? 0 : val);
                            }}
                            className="w-24 font-financial font-bold text-right border border-amber-300 bg-white rounded-lg px-2.5 py-1.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <span className="text-sm font-bold text-amber-800">%</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Remaining {Math.max(0, 100 - factoryDeprPercent)}% is attributed to Office / SG&A OPEX
                        </span>
                      </div>

                      <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-amber-200/80 pt-2 sm:pt-0 sm:pl-4">
                        <div>
                          <span className="text-[10px] text-amber-800 uppercase tracking-wider font-bold block">
                            Factory Depreciation (COGS)
                          </span>
                          <span className="text-base font-bold font-financial text-amber-700">
                            {formatCurrency(factoryDepreciationAmountYr1, c)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                            Office / SG&A Depreciation (OPEX)
                          </span>
                          <span className="text-xs font-semibold font-financial text-slate-600">
                            {formatCurrency(opexDepreciationAmountYr1, c)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Specific Asset Selection */}
                  {factoryDeprMethod === 'specific_assets' && (
                    <div className="space-y-3 bg-amber-50/30 p-4 rounded-xl border border-amber-200/80">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
                            Select Assets 100% Attributed to Factory / Production
                          </h5>
                          <p className="text-[11px] text-slate-600">
                            Checked assets are 100% capitalized into Factory Overhead (COGS). Unchecked assets are attributed to Office / SG&A OPEX.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => selectAllFactoryAssets(true)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 transition"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => selectAllFactoryAssets(false)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      {project.fixedAssets.length === 0 ? (
                        <div className="text-center py-6 bg-white rounded-lg border border-dashed border-amber-200 text-slate-400 text-xs">
                          No fixed assets recorded yet. Add machinery, equipment, or plant fixtures in Tab 1 (Capital Outlay).
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-amber-200/80 rounded-xl bg-white shadow-2xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-amber-100/60 text-amber-950 font-semibold border-b border-amber-200">
                              <tr>
                                <th className="p-2.5 text-center w-12">Factory</th>
                                <th className="p-2.5">Asset Particulars</th>
                                <th className="p-2.5">Depreciation Method</th>
                                <th className="p-2.5 text-right">Cost ({c})</th>
                                <th className="p-2.5 text-right">Life (Yrs)</th>
                                <th className="p-2.5 text-right">Year 1 Depreciation ({c})</th>
                                <th className="p-2.5 text-center">Cost Classification</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100">
                              {project.fixedAssets.map((asset) => {
                                const isSelected = factoryAssetIds.includes(asset.id);
                                const deprItem = deprSchedule.find((d) => d.assetId === asset.id);
                                const yr1Depr = deprItem?.yearValues.find((y) => y.year === 1)?.depreciation ?? deprItem?.annualDepreciation ?? 0;

                                return (
                                  <tr
                                    key={asset.id}
                                    onClick={() => toggleFactoryAsset(asset.id)}
                                    className={`cursor-pointer transition ${
                                      isSelected ? 'bg-amber-50/70 hover:bg-amber-100/60' : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleFactoryAsset(asset.id)}
                                        className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
                                      />
                                    </td>
                                    <td className="p-2.5 font-medium text-slate-900">
                                      <div className="flex items-center gap-1.5">
                                        <span>{asset.name || 'Unnamed Asset'}</span>
                                        {isSelected && (
                                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-semibold">
                                            100% Factory
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2.5 text-slate-600">
                                      <span className="text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                        {asset.depreciationMethod || 'Straight-Line'}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-right font-financial text-slate-700">
                                      {formatCurrency(asset.cost, c)}
                                    </td>
                                    <td className="p-2.5 text-right font-financial text-slate-600">
                                      {asset.usefulLifeYears} yrs
                                    </td>
                                    <td className="p-2.5 text-right font-financial font-semibold text-slate-900">
                                      {formatCurrency(yr1Depr, c)}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      {isSelected ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                                          <Factory className="w-3 h-3 text-amber-700" />
                                          Factory (COGS)
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                          Office (SG&A)
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Summary breakdown bar */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-amber-200">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                            Selected Factory Assets
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {factoryAssetIds.length} of {project.fixedAssets.length} Assets
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-800 uppercase tracking-wider font-bold block">
                            Factory Depreciation (Yr {fohViewYear} COGS)
                          </span>
                          <span className="text-base font-bold font-financial text-amber-700">
                            {formatCurrency(selectedYearFohSummary.factoryDepreciationAnnual, c)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                            Office / SG&A Depreciation (Yr 1 OPEX)
                          </span>
                          <span className="text-sm font-bold font-financial text-slate-700">
                            {formatCurrency(opexDepreciationAmountYr1, c)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. OTHER FACTORY SUPPLIES & MISCELLANEOUS OVERHEAD */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-indigo-600" />
                        Other Factory Supplies & Miscellaneous Overhead
                      </h4>
                    </div>

                    {/* Button to list/itemize indirect supplies */}
                    <button
                      type="button"
                      onClick={() => setShowSuppliesList(!showSuppliesList)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 flex items-center gap-1.5 shadow-2xs transition shrink-0"
                    >
                      <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{showSuppliesList ? 'Hide Supplies List' : 'List Indirect Supplies & Items'}</span>
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {factorySuppliesList.length}
                      </span>
                    </button>
                  </div>

                  {/* Summary inputs: Annual Factory Overhead and Growth Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-slate-700">
                          Other Annual Factory Overhead (Year 1) ({c})
                        </label>
                        {totalItemizedSuppliesAnnual > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateProject({
                                ...project,
                                factoryOverheadAnnual: totalItemizedSuppliesAnnual,
                              });
                              setSuppliesSyncFeedback('Updated Annual Factory Overhead to match itemized supplies sum!');
                              setTimeout(() => setSuppliesSyncFeedback(null), 3500);
                            }}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                            title="Click to copy sum of itemized supplies"
                          >
                            Set to Itemized Total ({formatCurrency(totalItemizedSuppliesAnnual, c)})
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        value={project.factoryOverheadAnnual || 0}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            factoryOverheadAnnual: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full font-financial font-semibold text-right border border-slate-200 bg-white rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                        placeholder="e.g. Plant maintenance supplies, cleaning & safety gear"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Annual Overhead Escalation Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={project.factoryOverheadGrowthRate || 0}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            factoryOverheadGrowthRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full font-financial text-right border border-slate-200 bg-white rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {fohViewYear > 1 && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-medium flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Boxes className="w-4 h-4 text-amber-700" />
                        Year {fohViewYear} Escalated Supplies & Miscellaneous Overhead:
                      </span>
                      <div className="text-right">
                        <span className="font-bold font-financial text-amber-800 text-sm">
                          {formatCurrency(selectedYearFohSummary.suppliesAndOverheadAnnual, c)} / year
                        </span>
                        <span className="block text-[10px] text-amber-700 font-financial">
                          {formatCurrency(selectedYearFohSummary.suppliesAndOverheadAnnual / 12, c)} / month
                          {project.factoryOverheadGrowthRate ? ` (escalated at ${project.factoryOverheadGrowthRate}% / yr)` : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  {suppliesSyncFeedback && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {suppliesSyncFeedback}
                    </div>
                  )}

                  {/* Expandable Itemized Supplies Table */}
                  {showSuppliesList && (
                    <div className="space-y-3 bg-white p-3.5 rounded-xl border border-indigo-200/70 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <PackageCheck className="w-4 h-4 text-indigo-600" />
                            Indirect Production Supplies & Consumables Breakdown {fohViewYear > 1 ? `(Year ${fohViewYear} Escalated)` : `(Year 1)`}
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            Specify auxiliary items indirect to production, their quantity, unit, and unit cost.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateFactorySupplies([
                              ...factorySuppliesList,
                              {
                                id: `sup-${Date.now()}`,
                                name: 'Sanitation Chemicals & Cleaning Agents',
                                quantity: 12,
                                unit: 'packs/year',
                                unitCost: 1500,
                                annualAmount: 18000,
                                notes: 'Plant hygiene and machine degreaser',
                              },
                            ])
                          }
                          className="px-3 py-1.5 text-xs bg-indigo-700 text-white hover:bg-indigo-800 rounded-lg font-semibold flex items-center gap-1.5 transition shadow-2xs shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Supply Item
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Indirect Supply / Item Particulars</th>
                              <th className="p-2.5 text-right w-20">Quantity</th>
                              <th className="p-2.5 w-24">Unit</th>
                              <th className="p-2.5 text-right w-24">Unit Cost ({c})</th>
                              <th className="p-2.5 text-right w-28">
                                {fohViewYear > 1 ? `Monthly (Yr ${fohViewYear})` : `Monthly Amount`}
                              </th>
                              <th className="p-2.5 text-right w-32">
                                {fohViewYear > 1 ? `Annual (Yr ${fohViewYear})` : `Annual Amount ({c})`}
                              </th>
                              <th className="p-2.5">Purpose / Notes</th>
                              <th className="p-2.5 text-center w-12">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {factorySuppliesList.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="text-center py-6 text-slate-400 text-xs">
                                  No itemized supplies added yet. Click "Add Supply Item" above to list indirect production supplies.
                                </td>
                              </tr>
                            ) : (
                              factorySuppliesList.map((sup, idx) => {
                                const supGrowth = Math.pow(1 + (project.factoryOverheadGrowthRate || 0) / 100, fohViewYear - 1);
                                const baseAnnual = sup.annualAmount !== undefined ? sup.annualAmount : Math.round((sup.quantity || 0) * (sup.unitCost || 0));
                                const annualYr = baseAnnual * supGrowth;
                                const monthlyYr = annualYr / 12;

                                return (
                                  <tr key={sup.id} className="hover:bg-slate-50/50">
                                    <td className="p-2">
                                      <input
                                        type="text"
                                        value={sup.name}
                                        placeholder="e.g. Machine Lubricant, Hairnets & Gloves, QC Vials"
                                        onChange={(e) => {
                                          const copy = [...factorySuppliesList];
                                          copy[idx].name = e.target.value;
                                          updateFactorySupplies(copy);
                                        }}
                                        className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                                      />
                                    </td>
                                    <td className="p-2 text-right">
                                      <input
                                        type="number"
                                        min="0"
                                        value={sup.quantity}
                                        onChange={(e) => {
                                          const copy = [...factorySuppliesList];
                                          const q = parseFloat(e.target.value) || 0;
                                          copy[idx].quantity = q;
                                          copy[idx].annualAmount = Math.round(q * (copy[idx].unitCost || 0));
                                          updateFactorySupplies(copy);
                                        }}
                                        className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <input
                                        type="text"
                                        value={sup.unit}
                                        placeholder="e.g. boxes, liters"
                                        onChange={(e) => {
                                          const copy = [...factorySuppliesList];
                                          copy[idx].unit = e.target.value;
                                          updateFactorySupplies(copy);
                                        }}
                                        className="w-20 text-slate-600 border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                                      />
                                    </td>
                                    <td className="p-2 text-right">
                                      <input
                                        type="number"
                                        min="0"
                                        value={sup.unitCost}
                                        onChange={(e) => {
                                          const copy = [...factorySuppliesList];
                                          const u = parseFloat(e.target.value) || 0;
                                          copy[idx].unitCost = u;
                                          copy[idx].annualAmount = Math.round((copy[idx].quantity || 0) * u);
                                          updateFactorySupplies(copy);
                                        }}
                                        className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                      />
                                    </td>
                                    <td className="p-2 text-right font-financial text-slate-700">
                                      {formatCurrency(monthlyYr, c)}
                                      {fohViewYear > 1 && (
                                        <span className="block text-[9px] text-slate-400">
                                          Base: {formatCurrency(baseAnnual / 12, c)}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-right">
                                      <input
                                        type="number"
                                        min="0"
                                        value={fohViewYear === 1 ? sup.annualAmount : Math.round(annualYr * 100) / 100}
                                        onChange={(e) => {
                                          const copy = [...factorySuppliesList];
                                          const val = parseFloat(e.target.value) || 0;
                                          if (fohViewYear === 1) {
                                            copy[idx].annualAmount = val;
                                          } else {
                                            copy[idx].annualAmount = supGrowth > 0 ? Math.round((val / supGrowth) * 100) / 100 : val;
                                          }
                                          updateFactorySupplies(copy);
                                        }}
                                        className="w-24 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5 text-indigo-950 focus:border-indigo-500 focus:outline-none"
                                      />
                                      {fohViewYear > 1 && (
                                        <span className="block text-[9px] text-amber-700">
                                          Base: {formatCurrency(baseAnnual, c)}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2">
                                      <input
                                        type="text"
                                        value={sup.notes || ''}
                                        placeholder="e.g. For weekly machine sanitation"
                                        onChange={(e) => {
                                          const copy = [...factorySuppliesList];
                                          copy[idx].notes = e.target.value;
                                          updateFactorySupplies(copy);
                                        }}
                                        className="w-full text-slate-500 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none text-[11px]"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateFactorySupplies(factorySuppliesList.filter((_, i) => i !== idx))
                                        }
                                        className="text-slate-400 hover:text-red-600 p-1 transition"
                                        title="Delete supply item"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                          {factorySuppliesList.length > 0 && (
                            <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-900">
                              <tr>
                                <td colSpan={4} className="p-2.5">
                                  Total Itemized Indirect Supplies & Consumables {fohViewYear > 1 ? `(Yr ${fohViewYear} Escalated)` : ''}
                                </td>
                                <td className="p-2.5 text-right font-financial font-bold text-slate-700 text-xs">
                                  {formatCurrency(totalItemizedSuppliesAnnual * Math.pow(1 + (project.factoryOverheadGrowthRate || 0) / 100, fohViewYear - 1) / 12, c)}
                                  <span className="block text-[10px] text-slate-400 font-normal">/ month</span>
                                </td>
                                <td className="p-2.5 text-right font-financial font-bold text-indigo-950 text-sm">
                                  {formatCurrency(totalItemizedSuppliesAnnual * Math.pow(1 + (project.factoryOverheadGrowthRate || 0) / 100, fohViewYear - 1), c)}
                                </td>
                                <td colSpan={2} className="p-2.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateProject({
                                        ...project,
                                        factoryOverheadAnnual: totalItemizedSuppliesAnnual,
                                      });
                                      setSuppliesSyncFeedback('Updated Annual Factory Overhead to match itemized supplies sum!');
                                      setTimeout(() => setSuppliesSyncFeedback(null), 3500);
                                    }}
                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition"
                                  >
                                    Apply Total to Overhead
                                  </button>
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. PRODUCTION EMPLOYEE BENEFITS SCHEDULE (DIRECT & INDIRECT LABOR) */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
                  {/* Header & Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-200 pb-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shadow-2xs shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-700" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            5. Production Employee Benefits Schedule {fohViewYear > 1 ? `(Year ${fohViewYear} Escalated)` : `(Year 1)`}
                          </h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {fohViewYear > 1 ? `Year ${fohViewYear} Statutory Table` : `Official Statutory Table Engine`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                      <button
                        type="button"
                        onClick={() => setShowSssTableModal(true)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 transition shadow-2xs"
                        title="Open Official SSS Contribution Table & MSC Brackets (RA 11199)"
                      >
                        <Table className="w-3.5 h-3.5 text-indigo-600" />
                        View Official SSS Table
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandEmployeeHeadcount(!expandEmployeeHeadcount)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition shadow-2xs flex items-center gap-1.5 ${
                          expandEmployeeHeadcount
                            ? 'bg-slate-800 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                        title="Toggle between grouped by role or itemized individual staff members"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {expandEmployeeHeadcount ? 'Group by Labor Position' : 'Expand All Staff'}
                      </button>
                    </div>
                  </div>

                  {benefitsFeedback && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {benefitsFeedback}
                    </div>
                  )}

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        SSS Employer Share
                      </span>
                      <span className="text-base font-bold text-slate-900 font-financial block mt-0.5">
                        {formatCurrency(compiledProductionBenefits.summary.totalSssErAnnual, c)}
                        <span className="text-xs font-normal text-slate-500"> /yr</span>
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        PhilHealth Employer Share
                      </span>
                      <span className="text-base font-bold text-slate-900 font-financial block mt-0.5">
                        {formatCurrency(compiledProductionBenefits.summary.totalPhilHealthErAnnual, c)}
                        <span className="text-xs font-normal text-slate-500"> /yr</span>
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        Pag-IBIG Employer Share
                      </span>
                      <span className="text-base font-bold text-slate-900 font-financial block mt-0.5">
                        {formatCurrency(compiledProductionBenefits.summary.totalPagIbigErAnnual, c)}
                        <span className="text-xs font-normal text-slate-500"> /yr</span>
                      </span>
                    </div>

                    <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold block">
                        Total Statutory Benefits
                      </span>
                      <span className="text-base font-bold text-emerald-950 font-financial block mt-0.5">
                        {formatCurrency(compiledProductionBenefits.summary.totalStatutoryAnnual, c)}
                        <span className="text-xs font-semibold text-emerald-800"> /yr</span>
                      </span>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-600 mr-1">Filter View:</span>
                      <button
                        type="button"
                        onClick={() => setBenefitsClassificationFilter('all')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                          benefitsClassificationFilter === 'all'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        All Workforce ({compiledProductionBenefits.records.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBenefitsClassificationFilter('direct')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                          benefitsClassificationFilter === 'direct'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        Direct Labor Only ({project.directLabor.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBenefitsClassificationFilter('indirect')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                          benefitsClassificationFilter === 'indirect'
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        Indirect Labor Only ({(project.indirectLabor || []).length})
                      </button>
                    </div>

                    <span className="text-xs text-slate-500 font-financial hidden sm:inline">
                      Total Production Staff: <strong className="text-slate-800">{compiledProductionBenefits.summary.totalHeadcount} workers</strong>
                    </span>
                  </div>

                  {/* Formatted Production Employee Benefits Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3 w-48">Employee / Labor Role</th>
                          <th className="py-3 px-2 text-center w-24">Type</th>
                          <th className="py-3 px-2 text-center w-16">Staff</th>
                          <th className="py-3 px-3 text-right w-32">
                            {fohViewYear > 1 ? `Monthly Salary (Yr ${fohViewYear}) (${c})` : `Monthly Salary (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-36 bg-indigo-50/50 text-indigo-950">
                            {fohViewYear > 1 ? `SSS ER Share (Yr ${fohViewYear}) (${c})` : `SSS ER Share (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-32 bg-blue-50/50 text-blue-950">
                            {fohViewYear > 1 ? `PhilHealth ER (Yr ${fohViewYear}) (${c})` : `PhilHealth ER (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-32 bg-emerald-50/50 text-emerald-950">
                            {fohViewYear > 1 ? `Pag-IBIG ER (Yr ${fohViewYear}) (${c})` : `Pag-IBIG ER (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-32 font-bold text-slate-900">
                            {fohViewYear > 1 ? `Monthly ER Total (Yr ${fohViewYear}) (${c})` : `Monthly ER Total (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-36 font-bold text-purple-950 bg-purple-50/50">
                            {fohViewYear > 1 ? `13th Month Pay (Yr ${fohViewYear}) (${c})` : `13th Month Pay (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-36 font-bold text-emerald-950 bg-emerald-50/40">
                            {fohViewYear > 1 ? `Total Statutory (Yr ${fohViewYear}) (${c})` : `Total Statutory (${c})`}
                          </th>
                          <th className="py-3 px-2 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {compiledProductionBenefits.records.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="text-center py-10 text-slate-400">
                              <p className="font-semibold text-slate-600">No production employees found.</p>
                              <div className="mt-3 flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={loadStandardFactoryRoles}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                >
                                  Load Factory Roles
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <>
                            {/* 1. DIRECT LABOR SECTION */}
                            {(benefitsClassificationFilter === 'all' || benefitsClassificationFilter === 'direct') && (
                              <>
                                {compiledProductionBenefits.directLaborRecords.length === 0 ? (
                                  <tr className="text-slate-400 text-xs italic">
                                    <td colSpan={11} className="py-3 px-3 text-center">
                                      No direct labor positions added.
                                    </td>
                                  </tr>
                                ) : (
                                  compiledProductionBenefits.directLaborRecords.map((r) => {
                                    return (
                                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* Employee / Role */}
                                        <td className="py-2.5 px-3">
                                          <span className="font-semibold text-slate-900 block">
                                            {r.role}
                                          </span>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                                              {r.classification}
                                            </span>
                                          </div>
                                        </td>

                                        {/* Classification */}
                                        <td className="py-2.5 px-2 text-center">
                                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block bg-blue-50 text-blue-700 border border-blue-200">
                                            Direct
                                          </span>
                                        </td>

                                        {/* Headcount (read-only) */}
                                        <td className="py-2.5 px-2 text-center font-financial font-semibold text-slate-800">
                                          {expandEmployeeHeadcount ? '1' : r.headcount}
                                        </td>

                                        {/* Monthly Salary (read-only, projected by year) */}
                                        <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-800">
                                          {formatCurrency(r.monthlySalary, c)}
                                        </td>

                                        {/* SSS Employer Share */}
                                        <td className="py-2.5 px-3 text-right bg-indigo-50/20 font-financial">
                                          <span className="font-bold text-indigo-950 block" title={r.sss.bracketRange}>
                                            {formatCurrency(r.sss.totalErTotalRole, c)}
                                          </span>
                                        </td>

                                        {/* PhilHealth Employer Share */}
                                        <td className="py-2.5 px-3 text-right bg-blue-50/20 font-financial">
                                          <span className="font-bold text-blue-950 block">
                                            {formatCurrency(r.philHealth.monthlyErTotalRole, c)}
                                          </span>
                                        </td>

                                        {/* Pag-IBIG Employer Share */}
                                        <td className="py-2.5 px-3 text-right bg-emerald-50/20 font-financial">
                                          <span className="font-bold text-emerald-950 block">
                                            {formatCurrency(r.pagIbig.monthlyErTotalRole, c)}
                                          </span>
                                        </td>

                                        {/* Monthly ER Total */}
                                        <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900">
                                          {formatCurrency(r.totalMonthlyBenefitsTotalRole, c)}
                                        </td>

                                        {/* 13th Month Pay */}
                                        <td className="py-2.5 px-3 text-right font-financial font-bold text-purple-950 bg-purple-50/30">
                                          {formatCurrency(r.thirteenthMonthPayTotalRole, c)}
                                        </td>

                                        {/* Total Statutory Benefits */}
                                        <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-950 bg-emerald-50/30">
                                          {formatCurrency(r.totalAnnualBenefitsTotalRole, c)}
                                        </td>

                                        {/* Action */}
                                        <td className="py-2.5 px-2 text-center">
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteEmployeeRole(r.sourceId, r.classification)}
                                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                                            title={`Delete ${r.role} from ${r.classification}`}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}

                                {/* Direct Labor Subtotal Row - Positioned immediately after Direct Labor roles */}
                                <tr className="bg-blue-50/70 font-semibold text-slate-800 border-t-2 border-b-2 border-blue-200">
                                  <td className="py-2.5 px-3 text-blue-900 font-bold" colSpan={2}>
                                    Direct Labor Subtotal ({compiledProductionBenefits.summary.directLabor.headcount} {compiledProductionBenefits.summary.directLabor.headcount === 1 ? 'worker' : 'workers'})
                                  </td>
                                  <td className="py-2.5 px-2 text-center font-financial text-blue-900 font-bold">
                                    {compiledProductionBenefits.summary.directLabor.headcount}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-financial text-blue-900 font-bold">
                                    {formatCurrency(compiledProductionBenefits.summary.directLabor.monthlyBasicTotal, c)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-financial text-indigo-900 font-bold">
                                    {formatCurrency(compiledProductionBenefits.summary.directLabor.sssErMonthlyTotal, c)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-financial text-blue-900 font-bold">
                                    {formatCurrency(compiledProductionBenefits.summary.directLabor.philHealthErMonthlyTotal, c)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-financial text-emerald-900 font-bold">
                                    {formatCurrency(compiledProductionBenefits.summary.directLabor.pagIbigErMonthlyTotal, c)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900">
                                    {formatCurrency(compiledProductionBenefits.summary.directLabor.totalMonthlyBenefits, c)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-financial font-bold text-purple-950 bg-purple-100/50">
                                    {formatCurrency(compiledProductionBenefits.summary.directLabor.thirteenthMonthTotal, c)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-financial font-bold text-blue-950 bg-blue-100/50">
                                    {formatCurrency(compiledProductionBenefits.summary.directLabor.totalAnnualBenefits, c)}
                                  </td>
                                  <td></td>
                                </tr>
                              </>
                            )}

                            {/* 2. INDIRECT LABOR SECTION - Positioned STRICTLY in between Direct Labor Subtotal and Total Production Benefits */}
                            {(benefitsClassificationFilter === 'all' || benefitsClassificationFilter === 'indirect') && (
                              <>
                                {compiledProductionBenefits.indirectLaborRecords.length === 0 ? (
                                  <tr className="text-slate-400 text-xs italic">
                                    <td colSpan={11} className="py-3 px-3 text-center">
                                      No indirect labor positions added.
                                    </td>
                                  </tr>
                                ) : (
                                  compiledProductionBenefits.indirectLaborRecords.map((r) => {
                                    return (
                                      <tr key={r.id} className="hover:bg-amber-50/40 bg-amber-50/15 transition-colors">
                                        {/* Employee / Role */}
                                        <td className="py-2.5 px-3">
                                          <span className="font-semibold text-slate-900 block">
                                            {r.role}
                                          </span>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                              {r.classification}
                                            </span>
                                          </div>
                                        </td>

                                        {/* Classification */}
                                        <td className="py-2.5 px-2 text-center">
                                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block bg-amber-50 text-amber-700 border border-amber-200">
                                            Indirect
                                          </span>
                                        </td>

                                        {/* Headcount (read-only) */}
                                        <td className="py-2.5 px-2 text-center font-financial font-semibold text-slate-800">
                                          {expandEmployeeHeadcount ? '1' : r.headcount}
                                        </td>

                                        {/* Monthly Salary (read-only, projected by year) */}
                                        <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-800">
                                          {formatCurrency(r.monthlySalary, c)}
                                        </td>

                                        {/* SSS Employer Share */}
                                        <td className="py-2.5 px-3 text-right bg-indigo-50/20 font-financial">
                                          <span className="font-bold text-indigo-950 block" title={r.sss.bracketRange}>
                                            {formatCurrency(r.sss.totalErTotalRole, c)}
                                          </span>
                                        </td>

                                        {/* PhilHealth Employer Share */}
                                        <td className="py-2.5 px-3 text-right bg-blue-50/20 font-financial">
                                          <span className="font-bold text-blue-950 block">
                                            {formatCurrency(r.philHealth.monthlyErTotalRole, c)}
                                          </span>
                                        </td>

                                        {/* Pag-IBIG Employer Share */}
                                        <td className="py-2.5 px-3 text-right bg-emerald-50/20 font-financial">
                                          <span className="font-bold text-emerald-950 block">
                                            {formatCurrency(r.pagIbig.monthlyErTotalRole, c)}
                                          </span>
                                        </td>

                                        {/* Monthly ER Total */}
                                        <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900">
                                          {formatCurrency(r.totalMonthlyBenefitsTotalRole, c)}
                                        </td>

                                        {/* 13th Month Pay */}
                                        <td className="py-2.5 px-3 text-right font-financial font-bold text-purple-950 bg-purple-50/30">
                                          {formatCurrency(r.thirteenthMonthPayTotalRole, c)}
                                        </td>

                                        {/* Total Statutory Benefits */}
                                        <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-950 bg-emerald-50/30">
                                          {formatCurrency(r.totalAnnualBenefitsTotalRole, c)}
                                        </td>

                                        {/* Action */}
                                        <td className="py-2.5 px-2 text-center">
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteEmployeeRole(r.sourceId, r.classification)}
                                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                                            title={`Delete ${r.role} from ${r.classification}`}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}

                                {/* Indirect Labor Subtotal Row (shown when there are multiple indirect labor records to avoid duplicate salary display if only 1 role) */}
                                {compiledProductionBenefits.indirectLaborRecords.length > 1 && (
                                  <tr className="bg-amber-50/70 font-semibold text-slate-800 border-t border-b border-amber-200">
                                    <td className="py-2.5 px-3 text-amber-900 font-bold" colSpan={2}>
                                      Indirect Labor / FOH Subtotal ({compiledProductionBenefits.summary.indirectLabor.headcount} {compiledProductionBenefits.summary.indirectLabor.headcount === 1 ? 'worker' : 'workers'})
                                    </td>
                                    <td className="py-2.5 px-2 text-center font-financial text-amber-900 font-bold">
                                      {compiledProductionBenefits.summary.indirectLabor.headcount}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-financial text-amber-900 font-bold">
                                      {formatCurrency(compiledProductionBenefits.summary.indirectLabor.monthlyBasicTotal, c)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-financial text-indigo-900 font-bold">
                                      {formatCurrency(compiledProductionBenefits.summary.indirectLabor.sssErMonthlyTotal, c)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-financial text-blue-900 font-bold">
                                      {formatCurrency(compiledProductionBenefits.summary.indirectLabor.philHealthErMonthlyTotal, c)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-financial text-emerald-900 font-bold">
                                      {formatCurrency(compiledProductionBenefits.summary.indirectLabor.pagIbigErMonthlyTotal, c)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900">
                                      {formatCurrency(compiledProductionBenefits.summary.indirectLabor.totalMonthlyBenefits, c)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-financial font-bold text-purple-950 bg-purple-100/50">
                                      {formatCurrency(compiledProductionBenefits.summary.indirectLabor.thirteenthMonthTotal, c)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-financial font-bold text-amber-950 bg-amber-100/50">
                                      {formatCurrency(compiledProductionBenefits.summary.indirectLabor.totalAnnualBenefits, c)}
                                    </td>
                                    <td></td>
                                  </tr>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </tbody>

                      {/* Subtotals & Grand Totals */}
                      {compiledProductionBenefits.records.length > 0 && (
                        <tfoot className="border-t-2 border-slate-300">
                          {/* Combined Grand Total Row */}
                          <tr className="bg-emerald-100/70 font-bold text-slate-900 text-sm">
                            <td className="py-3 px-3 text-emerald-950 font-black" colSpan={2}>
                              {benefitsClassificationFilter === 'direct'
                                ? `Total Direct Labor Benefits & 13th Month (Year ${benefitsViewYear})`
                                : benefitsClassificationFilter === 'indirect'
                                ? `Total Indirect Labor Benefits & 13th Month (Year ${benefitsViewYear})`
                                : `Total Production Benefits & 13th Month (Year ${benefitsViewYear})`}
                            </td>
                            <td className="py-3 px-2 text-center font-financial font-black text-emerald-950">
                              {benefitsClassificationFilter === 'direct'
                                ? compiledProductionBenefits.summary.directLabor.headcount
                                : benefitsClassificationFilter === 'indirect'
                                ? compiledProductionBenefits.summary.indirectLabor.headcount
                                : compiledProductionBenefits.summary.totalHeadcount}
                            </td>
                            <td className="py-3 px-3 text-right font-financial font-black text-slate-900">
                              {formatCurrency(
                                benefitsClassificationFilter === 'direct'
                                  ? compiledProductionBenefits.summary.directLabor.monthlyBasicTotal
                                  : benefitsClassificationFilter === 'indirect'
                                  ? compiledProductionBenefits.summary.indirectLabor.monthlyBasicTotal
                                  : compiledProductionBenefits.summary.totalMonthlyBasic,
                                c
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-financial font-black text-indigo-950">
                              {formatCurrency(
                                benefitsClassificationFilter === 'direct'
                                  ? compiledProductionBenefits.summary.directLabor.sssErMonthlyTotal
                                  : benefitsClassificationFilter === 'indirect'
                                  ? compiledProductionBenefits.summary.indirectLabor.sssErMonthlyTotal
                                  : compiledProductionBenefits.summary.totalSssErMonthly,
                                c
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-financial font-black text-blue-950">
                              {formatCurrency(
                                benefitsClassificationFilter === 'direct'
                                  ? compiledProductionBenefits.summary.directLabor.philHealthErMonthlyTotal
                                  : benefitsClassificationFilter === 'indirect'
                                  ? compiledProductionBenefits.summary.indirectLabor.philHealthErMonthlyTotal
                                  : compiledProductionBenefits.summary.totalPhilHealthErMonthly,
                                c
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-financial font-black text-emerald-950">
                              {formatCurrency(
                                benefitsClassificationFilter === 'direct'
                                  ? compiledProductionBenefits.summary.directLabor.pagIbigErMonthlyTotal
                                  : benefitsClassificationFilter === 'indirect'
                                  ? compiledProductionBenefits.summary.indirectLabor.pagIbigErMonthlyTotal
                                  : compiledProductionBenefits.summary.totalPagIbigErMonthly,
                                c
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-financial font-black text-slate-950">
                              {formatCurrency(
                                benefitsClassificationFilter === 'direct'
                                  ? compiledProductionBenefits.summary.directLabor.totalMonthlyBenefits
                                  : benefitsClassificationFilter === 'indirect'
                                  ? compiledProductionBenefits.summary.indirectLabor.totalMonthlyBenefits
                                  : compiledProductionBenefits.summary.totalStatutoryMonthly,
                                c
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-financial font-black text-purple-950 bg-purple-200/60">
                              {formatCurrency(
                                benefitsClassificationFilter === 'direct'
                                  ? compiledProductionBenefits.summary.directLabor.thirteenthMonthTotal
                                  : benefitsClassificationFilter === 'indirect'
                                  ? compiledProductionBenefits.summary.indirectLabor.thirteenthMonthTotal
                                  : compiledProductionBenefits.summary.totalThirteenthMonth,
                                c
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-financial font-black text-emerald-950 bg-emerald-200/60">
                              {formatCurrency(
                                benefitsClassificationFilter === 'direct'
                                  ? compiledProductionBenefits.summary.directLabor.totalAnnualBenefits
                                  : benefitsClassificationFilter === 'indirect'
                                  ? compiledProductionBenefits.summary.indirectLabor.totalAnnualBenefits
                                  : compiledProductionBenefits.summary.totalStatutoryAnnual,
                                c
                              )}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>

                  {/* COGS Capitalization Setting & Statutory Compliance Note */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 select-none">
                      <input
                        type="checkbox"
                        checked={includeBenefitsInCOGS}
                        onChange={(e) => toggleIncludeLaborBenefitsInCOGS(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div>
                        <span>Capitalize Production Statutory Benefits in Factory Overhead (Cost of Goods Sold)</span>
                        <span className="block text-[11px] font-normal text-slate-500">
                          Includes mandatory SSS, PhilHealth, Pag-IBIG contributions and 13th Month Pay (P.D. 851)
                        </span>
                      </div>
                    </label>

                    <div className="flex items-center gap-2 text-xs font-financial">
                      <span className="text-slate-500">
                        Status:
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        includeBenefitsInCOGS
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {includeBenefitsInCOGS
                          ? `+${formatCurrency(compiledProductionBenefits.summary.totalStatutoryAnnual, c)} capitalized into COGS`
                          : 'Excluded from COGS (Operating Expenses)'}
                      </span>
                    </div>
                  </div>

                  {/* Supplementary / Custom Non-Statutory Benefits Accordion (13th Month, Uniforms, etc.) */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setShowCustomBenefitsSection(!showCustomBenefitsSection)}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 transition"
                    >
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-emerald-600" />
                        <span>Additional / Non-Statutory Supplemental Benefits (Uniforms, PPE, Subsidies, Fringe Benefits)</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          ({laborBenefitsList.length} configured)
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          showCustomBenefitsSection ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showCustomBenefitsSection && (
                      <div className="p-4 space-y-3 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-600">
                            Configure supplemental benefits beyond mandatory statutory benefits (SSS, PhilHealth, Pag-IBIG, and 13th Month Pay). These will be added on top in Factory Overhead.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={loadStandardLaborBenefitsPresets}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                            >
                              Load Preset Rows
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateProductionLaborBenefits([
                                  ...laborBenefitsList,
                                  {
                                    id: `ben-${Date.now()}`,
                                    name: 'Plant Welfare & PPE Allowance',
                                    type: 'fixed_monthly_per_head',
                                    rateOrAmount: 300,
                                    appliesTo: 'both',
                                    notes: 'Monthly protective gear & welfare allowance for factory crew',
                                  },
                                ])
                              }
                              className="px-2.5 py-1 text-xs bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-semibold flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Custom Benefit
                            </button>
                          </div>
                        </div>

                        {laborBenefitsList.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                            No additional non-statutory benefits configured. Statutory SSS, PhilHealth, Pag-IBIG, and 13th Month Pay are automatically calculated in the main table above.
                          </div>
                        ) : (
                          <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="p-2">Benefit Particulars</th>
                                  <th className="p-2 w-44">Calculation Mode</th>
                                  <th className="p-2 text-right w-28">Rate / Amount</th>
                                  <th className="p-2 w-36">Applies To</th>
                                  <th className="p-2 text-right w-36 text-emerald-800 bg-emerald-50/50">Capitalized in FOH ({c})</th>
                                  <th className="p-2 text-center w-12">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {laborBenefitsList.map((b, idx) => {
                                  const capitalizedAmount = calculateLaborBenefitAmount(
                                    b,
                                    project.directLabor || [],
                                    project.indirectLabor || [],
                                    benefitsViewYear
                                  );
                                  return (
                                    <tr key={b.id} className="hover:bg-slate-50/50">
                                      <td className="p-2">
                                        <input
                                          type="text"
                                          value={b.name}
                                          placeholder="Benefit Name"
                                          onChange={(e) => {
                                            const copy = [...laborBenefitsList];
                                            copy[idx].name = e.target.value;
                                            updateProductionLaborBenefits(copy);
                                          }}
                                          className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
                                        />
                                      </td>
                                      <td className="p-2">
                                        <select
                                          value={b.type}
                                          onChange={(e) => {
                                            const copy = [...laborBenefitsList];
                                            const newType = e.target.value as BenefitCalculationType;
                                            copy[idx].type = newType;
                                            if (newType === 'one_month_salary' && !copy[idx].rateOrAmount) {
                                              copy[idx].rateOrAmount = 1;
                                            }
                                            updateProductionLaborBenefits(copy);
                                          }}
                                          className="w-full text-xs border border-slate-200 rounded px-1.5 py-1 bg-white focus:outline-none"
                                        >
                                          <option value="one_month_salary">1 Month Salary (13th Month)</option>
                                          <option value="percentage">% of Basic Salary</option>
                                          <option value="fixed_monthly_per_head">Monthly Fixed / Head</option>
                                          <option value="fixed_annual">Annual Lump Sum</option>
                                        </select>
                                      </td>
                                      <td className="p-2 text-right">
                                        {b.type === 'one_month_salary' ? (
                                          <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            1 Mo. Salary
                                          </span>
                                        ) : (
                                          <div className="flex items-center justify-end gap-1">
                                            <input
                                              type="number"
                                              step={b.type === 'percentage' ? '0.01' : '10'}
                                              min="0"
                                              value={b.rateOrAmount}
                                              onChange={(e) => {
                                                const copy = [...laborBenefitsList];
                                                copy[idx].rateOrAmount = parseFloat(e.target.value) || 0;
                                                updateProductionLaborBenefits(copy);
                                              }}
                                              className="w-20 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                                            />
                                            <span className="text-[11px] text-slate-500">
                                              {b.type === 'percentage' ? '%' : b.type === 'fixed_monthly_per_head' ? '/mo' : c}
                                            </span>
                                          </div>
                                        )}
                                      </td>
                                      <td className="p-2">
                                        <select
                                          value={b.appliesTo}
                                          onChange={(e) => {
                                            const copy = [...laborBenefitsList];
                                            copy[idx].appliesTo = e.target.value as BenefitAppliesTo;
                                            updateProductionLaborBenefits(copy);
                                          }}
                                          className="w-full text-xs border border-slate-200 rounded px-1.5 py-1 bg-white focus:outline-none"
                                        >
                                          <option value="both">Both (Direct & Indirect)</option>
                                          <option value="direct_only">Direct Labor Only</option>
                                          <option value="indirect_only">Indirect Labor Only</option>
                                        </select>
                                      </td>
                                      <td className="p-2 text-right font-financial font-bold text-emerald-700 bg-emerald-50/40">
                                        {formatCurrency(capitalizedAmount, c)}
                                      </td>
                                      <td className="p-2 text-center">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateProductionLaborBenefits(laborBenefitsList.filter((_, i) => i !== idx))
                                          }
                                          className="text-slate-400 hover:text-red-600 p-1"
                                          title="Remove Benefit"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot className="bg-slate-50 font-semibold border-t border-slate-200 text-slate-800">
                                <tr>
                                  <td colSpan={4} className="p-2.5 text-slate-700 font-bold">
                                    Total Additional / Non-Statutory Benefits Capitalized into Factory Overhead (Year {benefitsViewYear})
                                  </td>
                                  <td className="p-2.5 text-right font-financial font-bold text-emerald-800 text-sm bg-emerald-100/50">
                                    {formatCurrency(
                                      laborBenefitsList.reduce(
                                        (sum, b) =>
                                          sum +
                                          calculateLaborBenefitAmount(
                                            b,
                                            project.directLabor || [],
                                            project.indirectLabor || [],
                                            benefitsViewYear
                                          ),
                                        0
                                      ),
                                      c
                                    )}
                                  </td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 13th Month Double Counting Auditor Check */}
                  {project.directLabor.some((l) => (l.monthsPerYear || 12) >= 13) && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">13th Month Pay Alignment Notice:</span>
                          Direct Labor roles in Tab 4 are configured with 13 months/year (which already embeds 13th Month Pay in base wages). If you also add 13th Month Pay as a benefit, ensure it is not double-counted.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={adjustDirectLaborTo12Months}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shrink-0 self-start sm:self-center"
                      >
                        Adjust Tab 4 to 12 Months
                      </button>
                    </div>
                  )}

                  {/* SSS Contribution Table Modal */}
                  {showSssTableModal && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
                              <Table className="w-5 h-5 text-indigo-700" />
                            </span>
                            <div>
                              <h3 className="text-base font-bold text-slate-900">
                                Official Social Security System (SSS) Contribution Table
                              </h3>
                              <p className="text-xs text-slate-500">
                                Republic Act No. 11199 (Social Security Act of 2018) Official Contribution Schedule for Employers & Employees
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowSssTableModal(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Modal Search & Highlight Filter */}
                        <div className="p-3 sm:px-5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 w-full sm:w-72">
                            <input
                              type="text"
                              value={sssSearchQuery}
                              onChange={(e) => setSssSearchQuery(e.target.value)}
                              placeholder="Search salary or bracket (e.g. 17000)..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                            />
                            {sssSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setSssSearchQuery('')}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                              <span>Matched by Your Current Staff</span>
                            </span>
                            <span className="text-slate-400">|</span>
                            <span>Total Brackets: {SSS_CONTRIBUTION_TABLE.length}</span>
                          </div>
                        </div>

                        {/* Modal Table Body */}
                        <div className="overflow-y-auto flex-1 p-3 sm:p-5">
                          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                              <tr>
                                <th className="p-2.5">Range of Compensation ({c})</th>
                                <th className="p-2.5 text-right">Monthly Salary Credit (MSC)</th>
                                <th className="p-2.5 text-right text-indigo-900 bg-indigo-50/60">
                                  ER Share (Reg + WISP)
                                </th>
                                <th className="p-2.5 text-right text-indigo-900 bg-indigo-50/60">
                                  ER EC Fund
                                </th>
                                <th className="p-2.5 text-right font-bold text-indigo-950 bg-indigo-100/70">
                                  Total ER Share
                                </th>
                                <th className="p-2.5 text-right text-slate-700">EE Share (4.5%)</th>
                                <th className="p-2.5 text-right font-bold text-slate-900">Total Contribution</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {SSS_CONTRIBUTION_TABLE.filter((b) => {
                                if (!sssSearchQuery) return true;
                                const q = sssSearchQuery.toLowerCase();
                                return (
                                  b.msc.toString().includes(q) ||
                                  b.minSalary.toString().includes(q) ||
                                  b.maxSalary.toString().includes(q) ||
                                  b.totalEr.toString().includes(q)
                                );
                              }).map((b) => {
                                // Check if any current production employee falls in this bracket
                                const matchingStaff = compiledProductionBenefits.records.filter((r) => {
                                  const sal = r.monthlySalary;
                                  return sal >= b.minSalary && sal <= b.maxSalary;
                                });
                                const isMatched = matchingStaff.length > 0;

                                return (
                                  <tr
                                    key={b.msc}
                                    className={`transition-colors ${
                                      isMatched
                                        ? 'bg-emerald-50/80 hover:bg-emerald-100/70 font-semibold'
                                        : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <td className="p-2.5 font-financial">
                                      <div className="flex items-center gap-1.5">
                                        {isMatched && (
                                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" title="Matched staff" />
                                        )}
                                        <span>
                                          {b.minSalary.toLocaleString()} -{' '}
                                          {b.maxSalary === Infinity ? 'Over' : b.maxSalary.toLocaleString()}
                                        </span>
                                      </div>
                                      {isMatched && (
                                        <span className="text-[10px] text-emerald-800 font-normal block pl-3.5">
                                          {matchingStaff.map((s) => s.role).join(', ')}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2.5 text-right font-financial font-medium text-slate-800">
                                      {formatCurrency(b.msc, c)}
                                    </td>
                                    <td className="p-2.5 text-right font-financial text-indigo-900 bg-indigo-50/30">
                                      {formatCurrency(b.regularEr + b.wispEr, c)}
                                    </td>
                                    <td className="p-2.5 text-right font-financial text-indigo-900 bg-indigo-50/30">
                                      {formatCurrency(b.ecEr, c)}
                                    </td>
                                    <td className="p-2.5 text-right font-financial font-bold text-indigo-950 bg-indigo-100/50">
                                      {formatCurrency(b.totalEr, c)}
                                    </td>
                                    <td className="p-2.5 text-right font-financial text-slate-600">
                                      {formatCurrency(b.totalEe, c)}
                                    </td>
                                    <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                                      {formatCurrency(b.totalContribution, c)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 sm:px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Employer Social Security (9.5%) + EC Fund (₱10/₱30) + WISP are automatically calculated per employee.
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowSssTableModal(false)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-2xs"
                          >
                            Close Reference
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: NON-MANUFACTURING */}
            {activeTab === 'nonManufacturing' && (
              <div id="assumptions-tab-nonManufacturing" className="space-y-6">
                {/* Header & Context */}
                <div className="bg-gradient-to-r from-blue-50/80 via-white to-slate-50 border border-blue-200/70 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-2xs">
                        <UserCheck className="w-4 h-4" />
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Non-Manufacturing Personnel (SG&A Staff)
                      </h3>
                      <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Operating Expenses
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <PdfDownloadButton
                      targetId="assumptions-tab-nonManufacturing"
                      title="7. Non-Manufacturing Personnel (SG&A Staff)"
                      subtitle={`${project.title} • Assumptions Tab 7`}
                      projectTitle={project.title}
                      buttonText="Download Tab PDF"
                      size="sm"
                      variant="indigo"
                      orientation="landscape"
                      format="a4"
                      fitToSinglePage={true}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateNonManufacturingLabor([
                          ...(project.nonManufacturingLabor || []),
                          {
                            id: `nml-${Date.now()}`,
                            role: 'Administrative Officer',
                            account: 'Salary',
                            headcount: 1,
                            monthlyWage: 20000,
                            monthsPerYear: 12,
                          },
                        ])
                      }
                      className="px-3.5 py-2 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-1.5 transition shadow-2xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Non-Manufacturing Employee
                    </button>
                  </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Total Headcount
                    </span>
                    <span className="text-base font-bold font-financial text-slate-800">
                      {totalNonMfgHeadcount} pax
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Monthly Salary Payroll
                    </span>
                    <span className="text-base font-bold font-financial text-blue-700">
                      {formatCurrency(totalNonMfgMonthly, c)}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Annual Basic Salary (12 Mos)
                    </span>
                    <span className="text-base font-bold font-financial text-indigo-700">
                      {formatCurrency(totalNonMfgMonthly * 12, c)}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
                    <span className="text-[10px] uppercase tracking-wider text-blue-900 font-bold block">
                      Total Annual Cost (Yr 1)
                    </span>
                    <span className="text-base font-bold font-financial text-blue-900">
                      {formatCurrency(totalNonMfgAnnual, c)}
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Position / Role Title</th>
                          <th className="p-3">Account</th>
                          <th className="p-3 text-right">Headcount</th>
                          <th className="p-3 text-right">Monthly Salary / Wage ({c})</th>
                          <th className="p-3 text-center">Annual Salary Increase</th>
                          <th className="p-3 text-right">Months / Year</th>
                          <th className="p-3 text-right">Total Annual Cost (Yr 1)</th>
                          <th className="p-3 text-center w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(!project.nonManufacturingLabor || project.nonManufacturingLabor.length === 0) ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-slate-400">
                              No non-manufacturing personnel added yet. Click "Add Non-Manufacturing Employee" above to add staff.
                            </td>
                          </tr>
                        ) : (
                          project.nonManufacturingLabor.map((emp, idx) => {
                            const annual = emp.monthlyWage * emp.monthsPerYear * emp.headcount;
                            const incType = emp.annualSalaryIncreaseType || 'percentage';
                            const incVal = emp.annualSalaryIncreaseValue ?? 0;
                            return (
                              <tr key={emp.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    value={emp.role}
                                    placeholder="e.g. General Manager, Accountant, Sales Executive, Cashier"
                                    onChange={(e) => {
                                      const copy = [...(project.nonManufacturingLabor || [])];
                                      copy[idx].role = e.target.value;
                                      updateNonManufacturingLabor(copy);
                                    }}
                                    className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2.5">
                                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                    {emp.account || 'Salary'}
                                  </span>
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="1"
                                    value={emp.headcount}
                                    onChange={(e) => {
                                      const copy = [...(project.nonManufacturingLabor || [])];
                                      copy[idx].headcount = parseInt(e.target.value) || 1;
                                      updateNonManufacturingLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    value={emp.monthlyWage}
                                    onChange={(e) => {
                                      const copy = [...(project.nonManufacturingLabor || [])];
                                      copy[idx].monthlyWage = parseFloat(e.target.value) || 0;
                                      updateNonManufacturingLabor(copy);
                                    }}
                                    className="w-24 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5">
                                  <div className="flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      step={incType === 'percentage' ? '0.1' : '50'}
                                      min="0"
                                      placeholder={incType === 'percentage' ? `${project.inflationRatePercent || 0}%` : '0'}
                                      value={incVal === 0 && !emp.annualSalaryIncreaseValue ? '' : incVal}
                                      onChange={(e) => {
                                        const copy = [...(project.nonManufacturingLabor || [])];
                                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                        copy[idx].annualSalaryIncreaseValue = val;
                                        if (!copy[idx].annualSalaryIncreaseType) {
                                          copy[idx].annualSalaryIncreaseType = 'percentage';
                                        }
                                        updateNonManufacturingLabor(copy);
                                      }}
                                      className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                                    />
                                    <select
                                      value={incType}
                                      onChange={(e) => {
                                        const copy = [...(project.nonManufacturingLabor || [])];
                                        copy[idx].annualSalaryIncreaseType = e.target.value as 'percentage' | 'amount';
                                        updateNonManufacturingLabor(copy);
                                      }}
                                      className="text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded px-1 py-0.5 focus:outline-none"
                                      title="Select increase mode: % (percentage per year) or Amount (fixed ₱/month increase each year)"
                                    >
                                      <option value="percentage">% / yr</option>
                                      <option value="amount">{c}/mo / yr</option>
                                    </select>
                                  </div>
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="12"
                                    max="14"
                                    value={emp.monthsPerYear}
                                    onChange={(e) => {
                                      const copy = [...(project.nonManufacturingLabor || [])];
                                      copy[idx].monthsPerYear = parseInt(e.target.value) || 12;
                                      updateNonManufacturingLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                                  {formatCurrency(annual, c)}
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => {
                                      updateNonManufacturingLabor(
                                        (project.nonManufacturingLabor || []).filter((_, i) => i !== idx)
                                      );
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-1 transition"
                                    title="Delete role"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {(project.nonManufacturingLabor && project.nonManufacturingLabor.length > 0) && (
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                          <tr>
                            <td className="p-2.5">
                              Total Non-Manufacturing Personnel
                            </td>
                            <td className="p-2.5">
                              <span className="text-xs text-slate-500 font-normal">Account: Salary</span>
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-blue-700">
                              {totalNonMfgHeadcount} pax
                            </td>
                            <td colSpan={3} className="p-2.5 text-right text-slate-500">
                              Grand Total Annual Payroll:
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-blue-700 text-sm">
                              {formatCurrency(totalNonMfgAnnual, c)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* SECTION: NON-MANUFACTURING EMPLOYEE BENEFITS SCHEDULE (STATUTORY BENEFITS) */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
                  {/* Header & Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-slate-200">
                    <div className="flex items-start gap-2.5">
                      <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shadow-2xs shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-700" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            Employee Benefits Schedule (Non-Manufacturing Staff) {nonMfgViewYear > 1 ? `(Year ${nonMfgViewYear} Escalated)` : `(Year 1)`}
                          </h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Statutory & 13th Month Pay
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                      {/* View Year Selector */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                        <span className="text-[11px] font-semibold text-slate-600 px-1.5">Year:</span>
                        {[1, 2, 3, 4, 5].map((yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setNonMfgViewYear(yr)}
                            className={`px-2 py-0.5 rounded font-semibold text-xs transition ${
                              nonMfgViewYear === yr
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Y{yr}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowSssTableModal(true)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 transition shadow-2xs"
                        title="Open Official SSS Contribution Table & MSC Brackets (RA 11199)"
                      >
                        <Table className="w-3.5 h-3.5 text-indigo-600" />
                        View Official SSS Table
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandNonMfgEmployeeHeadcount(!expandNonMfgEmployeeHeadcount)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition shadow-2xs flex items-center gap-1.5 ${
                          expandNonMfgEmployeeHeadcount
                            ? 'bg-slate-800 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                        title="Toggle between grouped by role or itemized individual staff members"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {expandNonMfgEmployeeHeadcount ? 'Group by Labor Position' : 'Expand All Staff'}
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        SSS (Account: SSS)
                      </span>
                      <span className="text-base font-bold text-slate-900 font-financial block mt-0.5">
                        {formatCurrency(compiledNonMfgBenefits.summary.totalSssErAnnual, c)}
                        <span className="text-xs font-normal text-slate-500"> /yr</span>
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        Philhealth (Account: Philhealth)
                      </span>
                      <span className="text-base font-bold text-slate-900 font-financial block mt-0.5">
                        {formatCurrency(compiledNonMfgBenefits.summary.totalPhilHealthErAnnual, c)}
                        <span className="text-xs font-normal text-slate-500"> /yr</span>
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        Pag-ibig (Account: Pag-ibig)
                      </span>
                      <span className="text-base font-bold text-slate-900 font-financial block mt-0.5">
                        {formatCurrency(compiledNonMfgBenefits.summary.totalPagIbigErAnnual, c)}
                        <span className="text-xs font-normal text-slate-500"> /yr</span>
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-amber-800 uppercase tracking-wider font-bold block">
                        13th Month Pay
                      </span>
                      <span className="text-base font-bold text-amber-900 font-financial block mt-0.5">
                        {formatCurrency(compiledNonMfgBenefits.summary.totalThirteenthMonth, c)}
                        <span className="text-xs font-normal text-amber-700"> /yr</span>
                      </span>
                    </div>

                    <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold block">
                        Total Statutory Benefits
                      </span>
                      <span className="text-base font-bold text-emerald-950 font-financial block mt-0.5">
                        {formatCurrency(compiledNonMfgBenefits.summary.totalStatutoryAnnual, c)}
                        <span className="text-xs font-semibold text-emerald-800"> /yr</span>
                      </span>
                    </div>
                  </div>

                  {/* Header Row info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        All Non-Manufacturing Personnel ({compiledNonMfgBenefits.records.length} roles)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        (Flows into SSS, Philhealth, Pag-ibig, and 13th Month Pay in Operating Expenses)
                      </span>
                    </div>

                    <span className="text-xs text-slate-500 font-financial">
                      Total Staff: <strong className="text-slate-800">{compiledNonMfgBenefits.summary.totalHeadcount} pax</strong>
                    </span>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3 w-56">Position / Role Title</th>
                          <th className="py-3 px-2 text-center w-16">Staff</th>
                          <th className="py-3 px-3 text-right w-32">
                            {nonMfgViewYear > 1 ? `Monthly Salary (Yr ${nonMfgViewYear}) (${c})` : `Monthly Salary (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-36 bg-indigo-50/50 text-indigo-950">
                            {nonMfgViewYear > 1 ? `SSS ER (Yr ${nonMfgViewYear}) (${c})` : `SSS ER (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-32 bg-blue-50/50 text-blue-950">
                            {nonMfgViewYear > 1 ? `PhilHealth ER (Yr ${nonMfgViewYear}) (${c})` : `PhilHealth ER (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-32 bg-emerald-50/50 text-emerald-950">
                            {nonMfgViewYear > 1 ? `Pag-IBIG ER (Yr ${nonMfgViewYear}) (${c})` : `Pag-IBIG ER (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-32 font-bold text-slate-900">
                            {nonMfgViewYear > 1 ? `Monthly ER Total (Yr ${nonMfgViewYear}) (${c})` : `Monthly ER Total (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-36 font-bold text-amber-950 bg-amber-50/50">
                            {nonMfgViewYear > 1 ? `13th Month Pay (Yr ${nonMfgViewYear}) (${c})` : `13th Month Pay (${c})`}
                          </th>
                          <th className="py-3 px-3 text-right w-36 font-bold text-emerald-950 bg-emerald-50/40">
                            {nonMfgViewYear > 1 ? `Total Statutory (Yr ${nonMfgViewYear}) (${c})` : `Total Statutory (${c})`}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {compiledNonMfgBenefits.records.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-8 text-slate-400">
                              No non-manufacturing employees found. Add personnel in the table above.
                            </td>
                          </tr>
                        ) : (
                          compiledNonMfgBenefits.records.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{r.role}</td>
                              <td className="py-2.5 px-2 text-center font-financial font-semibold text-slate-800">
                                {expandNonMfgEmployeeHeadcount ? '1' : r.headcount}
                              </td>
                              <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-800">
                                {formatCurrency(r.monthlySalary, c)}
                              </td>
                              <td className="py-2.5 px-3 text-right bg-indigo-50/20 font-financial">
                                <span className="font-bold text-indigo-950 block" title={r.sss.bracketRange}>
                                  {formatCurrency(r.sss.totalErTotalRole, c)}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right bg-blue-50/20 font-financial">
                                <span className="font-bold text-blue-950 block">
                                  {formatCurrency(r.philHealth.monthlyErTotalRole, c)}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right bg-emerald-50/20 font-financial">
                                <span className="font-bold text-emerald-950 block">
                                  {formatCurrency(r.pagIbig.monthlyErTotalRole, c)}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900">
                                {formatCurrency(r.totalMonthlyBenefitsTotalRole, c)}
                              </td>
                              <td className="py-2.5 px-3 text-right bg-amber-50/20 font-financial font-bold text-amber-900">
                                {formatCurrency(r.thirteenthMonthPayTotalRole, c)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-900 bg-emerald-50/30">
                                {formatCurrency(r.totalStatutoryAnnualAll, c)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      {compiledNonMfgBenefits.records.length > 0 && (
                        <tfoot className="bg-slate-50/90 border-t-2 border-slate-200 font-semibold text-slate-800">
                          <tr>
                            <td className="py-2.5 px-3 text-slate-700 font-bold">
                              Grand Total Statutory Benefits & 13th Month Pay (Year {nonMfgViewYear})
                            </td>
                            <td className="py-2.5 px-2 text-center font-financial font-bold text-slate-900">
                              {compiledNonMfgBenefits.summary.totalHeadcount} pax
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900">
                              {formatCurrency(compiledNonMfgBenefits.summary.totalMonthlySalary, c)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950 bg-indigo-50/40">
                              {formatCurrency(compiledNonMfgBenefits.summary.totalSssErMonthly, c)}/mo
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-blue-950 bg-blue-50/40">
                              {formatCurrency(compiledNonMfgBenefits.summary.totalPhilHealthErMonthly, c)}/mo
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-950 bg-emerald-50/40">
                              {formatCurrency(compiledNonMfgBenefits.summary.totalPagIbigErMonthly, c)}/mo
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900">
                              {formatCurrency(compiledNonMfgBenefits.summary.totalStatutoryMonthly, c)}/mo
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-amber-900 bg-amber-50/40">
                              {formatCurrency(compiledNonMfgBenefits.summary.totalThirteenthMonth, c)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-950 bg-emerald-100/50 text-sm">
                              {formatCurrency(compiledNonMfgBenefits.summary.totalStatutoryAnnual, c)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>

                  {/* SECTION: ADDITIONAL / NON-STATUTORY BENEFITS (ACCORDION) */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mt-4">
                    <button
                      type="button"
                      onClick={() => setShowNonMfgCustomBenefits(!showNonMfgCustomBenefits)}
                      className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 transition"
                    >
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-emerald-600" />
                        <span>Additional / Non-Statutory Benefits (Uniforms, Allowances, De Minimis, Incentives)</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          ({nonMfgLaborBenefitsList.length} configured)
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          showNonMfgCustomBenefits ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showNonMfgCustomBenefits && (
                      <div className="p-4 space-y-3 border-t border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="text-xs text-slate-600">
                            Configure supplemental benefits for non-manufacturing staff beyond statutory contributions. These reflect under the <strong>Non-Statutory Benefits</strong> account in Operating Expenses.
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={loadStandardNonMfgBenefitsPresets}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                            >
                              Load Preset Rows
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateNonManufacturingLaborBenefits([
                                  ...nonMfgLaborBenefitsList,
                                  {
                                    id: `nml-ben-${Date.now()}`,
                                    name: 'Staff Allowance / Subsidy',
                                    type: 'fixed_monthly_per_head',
                                    rateOrAmount: 1000,
                                    appliesTo: 'both',
                                    notes: 'Monthly allowance for non-manufacturing personnel',
                                  },
                                ])
                              }
                              className="px-2.5 py-1 text-xs bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-semibold flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Custom Benefit
                            </button>
                          </div>
                        </div>

                        {nonMfgLaborBenefitsList.length === 0 ? (
                          <div className="text-center py-5 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                            No additional non-statutory benefits configured. Statutory SSS, PhilHealth, Pag-IBIG, and 13th Month Pay are already included in the schedule above.
                          </div>
                        ) : (
                          <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="p-2">Benefit Particulars</th>
                                  <th className="p-2 w-48">Calculation Mode</th>
                                  <th className="p-2 text-right w-36">Rate / Amount</th>
                                  <th className="p-2 text-right w-44 text-emerald-800 bg-emerald-50/50">
                                    Non-Statutory Benefits ({c})
                                  </th>
                                  <th className="p-2 text-center w-12">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {nonMfgLaborBenefitsList.map((b, idx) => {
                                  const totalBasic = projectedNonMfgList.reduce((sum, e) => sum + (e.monthlyWage || 0) * (e.headcount || 1), 0);
                                  const totalHead = projectedNonMfgList.reduce((sum, e) => sum + (e.headcount || 1), 0);
                                  const nmlInflation = Math.pow(1 + (project.inflationRatePercent || 0) / 100, nonMfgViewYear - 1);

                                  let itemCost = 0;
                                  if (b.type === 'percentage') {
                                    const rate = (b.rateOrAmount || 0) / 100;
                                    itemCost = totalBasic * 12 * rate;
                                  } else if (b.type === 'fixed_monthly_per_head') {
                                    const monthly = (b.rateOrAmount || 0) * nmlInflation;
                                    itemCost = monthly * 12 * totalHead;
                                  } else if (b.type === 'fixed_annual') {
                                    const annual = (b.rateOrAmount || 0) * nmlInflation;
                                    itemCost = annual;
                                  } else if (b.type === 'one_month_salary') {
                                    const mult = b.rateOrAmount || 1;
                                    itemCost = totalBasic * mult;
                                  }

                                  return (
                                    <tr key={b.id} className="hover:bg-slate-50/50">
                                      <td className="p-2">
                                        <input
                                          type="text"
                                          value={b.name}
                                          placeholder="e.g. Rice Subsidy, Clothing Allowance"
                                          onChange={(e) => {
                                            const copy = [...nonMfgLaborBenefitsList];
                                            copy[idx].name = e.target.value;
                                            updateNonManufacturingLaborBenefits(copy);
                                          }}
                                          className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                                        />
                                      </td>
                                      <td className="p-2">
                                        <select
                                          value={b.type}
                                          onChange={(e) => {
                                            const copy = [...nonMfgLaborBenefitsList];
                                            const newType = e.target.value as BenefitCalculationType;
                                            copy[idx].type = newType;
                                            if (newType === 'one_month_salary' && !copy[idx].rateOrAmount) {
                                              copy[idx].rateOrAmount = 1;
                                            }
                                            updateNonManufacturingLaborBenefits(copy);
                                          }}
                                          className="w-full text-xs border border-slate-200 rounded px-1.5 py-1 bg-white focus:outline-none"
                                        >
                                          <option value="fixed_monthly_per_head">Monthly Fixed / Head</option>
                                          <option value="fixed_annual">Annual Lump Sum</option>
                                          <option value="percentage">% of Basic Salary</option>
                                          <option value="one_month_salary">1 Month Salary</option>
                                        </select>
                                      </td>
                                      <td className="p-2 text-right">
                                        {b.type === 'one_month_salary' ? (
                                          <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            1 Mo. Salary
                                          </span>
                                        ) : (
                                          <div className="flex items-center justify-end gap-1">
                                            <input
                                              type="number"
                                              step={b.type === 'percentage' ? '0.01' : '10'}
                                              min="0"
                                              value={b.rateOrAmount}
                                              onChange={(e) => {
                                                const copy = [...nonMfgLaborBenefitsList];
                                                copy[idx].rateOrAmount = parseFloat(e.target.value) || 0;
                                                updateNonManufacturingLaborBenefits(copy);
                                              }}
                                              className="w-20 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                                            />
                                            <span className="text-[11px] text-slate-500">
                                              {b.type === 'percentage' ? '%' : b.type === 'fixed_monthly_per_head' ? '/mo' : c}
                                            </span>
                                          </div>
                                        )}
                                      </td>
                                      <td className="p-2 text-right font-financial font-bold text-emerald-700 bg-emerald-50/40">
                                        {formatCurrency(itemCost, c)}
                                      </td>
                                      <td className="p-2 text-center">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateNonManufacturingLaborBenefits(
                                              nonMfgLaborBenefitsList.filter((_, i) => i !== idx)
                                            )
                                          }
                                          className="text-slate-400 hover:text-red-600 p-1"
                                          title="Remove Benefit"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot className="bg-slate-50 font-semibold border-t border-slate-200 text-slate-800">
                                <tr>
                                  <td colSpan={3} className="p-2.5 text-slate-700 font-bold">
                                    Total Non-Statutory Benefits in Operating Expenses (Year {nonMfgViewYear})
                                  </td>
                                  <td className="p-2.5 text-right font-financial font-bold text-emerald-800 text-sm bg-emerald-100/50">
                                    {formatCurrency(totalNonMfgAdditionalBenefits.totalCustom, c)}
                                  </td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: OPERATING EXPENSES (SG&A) */}
            {activeTab === 'opex' && (
              <div id="assumptions-tab-opex" className="space-y-5">
                {/* Header with quick stats & add actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Operating Expenses (SG&A) Schedule</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        Account Titles presented in Financial Statements
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <PdfDownloadButton
                      targetId="assumptions-tab-opex"
                      title="8. Operating Expenses (SG&A) Schedule"
                      subtitle={`${project.title} • Assumptions Tab 8`}
                      projectTitle={project.title}
                      buttonText="Download Tab PDF"
                      size="xs"
                      variant="slate"
                      orientation="landscape"
                      format="a4"
                      fitToSinglePage={true}
                    />
                    <button
                      onClick={() => setShow5YearOpexSchedule(!show5YearOpexSchedule)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium border flex items-center gap-1.5 transition ${
                        show5YearOpexSchedule
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                      title="Toggle 5-Year Operating Expenses matrix schedule"
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>{show5YearOpexSchedule ? 'Hide 5-Year Schedule' : 'View 5-Year Schedule'}</span>
                    </button>
                    <button
                      onClick={() =>
                        updateOpex([
                          ...project.operatingExpenses,
                          {
                            id: `opex-${Date.now()}`,
                            name: 'Office Rental & Occupancy',
                            annualAmountYear1: 36000,
                            annualGrowthRate: 5,
                          },
                        ])
                      }
                      className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Expense Account
                    </button>
                  </div>
                </div>

                {/* Quick Add Presets for Standard SG&A Accounting Accounts */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1.5 text-[11px] uppercase tracking-wider">
                    Quick Add Standard Account Titles:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Office / Store Space Rental', amount: 60000, growth: 5 },
                      { name: 'Telecommunications & Internet', amount: 18000, growth: 4 },
                      { name: 'Marketing, Promotions & Advertising', amount: 24000, growth: 5 },
                      { name: 'Office Supplies & Stationeries', amount: 12000, growth: 4 },
                      { name: 'Business Permits, Licenses & Local Taxes', amount: 15000, growth: 5 },
                      { name: 'Accounting, Audit & Legal Fees', amount: 20000, growth: 5 },
                      { name: 'Travel, Transportation & Freight', amount: 15000, growth: 4 },
                      { name: 'Repairs & Office Facility Maintenance', amount: 12000, growth: 5 },
                      { name: 'Representation & Public Relations', amount: 10000, growth: 4 },
                      { name: 'Insurance Expense', amount: 12000, growth: 4 },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          if (project.operatingExpenses.some((o) => o.name.toLowerCase() === preset.name.toLowerCase())) {
                            return;
                          }
                          updateOpex([
                            ...project.operatingExpenses,
                            {
                              id: `opex-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                              name: preset.name,
                              annualAmountYear1: preset.amount,
                              annualGrowthRate: preset.growth,
                            },
                          ]);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-lg text-[11px] font-medium transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-slate-400" />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year Navigation Bar */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-3.5 rounded-xl text-white shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block text-indigo-200">
                        Year-by-Year OPEX Navigation
                      </span>
                      <span className="text-xs text-slate-300">
                        Viewing <span className="font-bold text-white">Year {opexViewYear}</span> Projected Operating Expenses
                        {opexViewYear === 1 ? ' (Baseline Year)' : ` (${project.inflationRatePercent}% base escalation)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
                    <button
                      onClick={() => setOpexViewYear((prev) => Math.max(1, prev - 1))}
                      disabled={opexViewYear === 1}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                      title="Previous Year"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[1, 2, 3, 4, 5].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setOpexViewYear(yr)}
                        className={`px-3 py-1 rounded text-xs font-bold transition ${
                          opexViewYear === yr
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                        }`}
                      >
                        Year {yr}
                      </button>
                    ))}
                    <button
                      onClick={() => setOpexViewYear((prev) => Math.min(5, prev + 1))}
                      disabled={opexViewYear === 5}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                      title="Next Year"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Selected Year Summary Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-[11px] font-medium text-slate-500 block">
                      Year {opexViewYear} Total OPEX
                    </span>
                    <span className="text-base font-bold font-financial text-slate-900 block mt-0.5">
                      {formatCurrency(selectedYearOpexSummary.currentYearTotal, c)}
                    </span>
                    <span className="text-[10px] text-slate-500">Annual sum for Year {opexViewYear}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-[11px] font-medium text-slate-500 block">
                      Year {opexViewYear} Monthly Run Rate
                    </span>
                    <span className="text-base font-bold font-financial text-indigo-700 block mt-0.5">
                      {formatCurrency(selectedYearOpexSummary.currentYearMonthly, c)}
                    </span>
                    <span className="text-[10px] text-slate-500">Average monthly outlay</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-[11px] font-medium text-slate-500 block">
                      YoY Change ({opexViewYear === 1 ? 'Base' : `vs Year ${opexViewYear - 1}`})
                    </span>
                    <span className="text-base font-bold font-financial text-slate-900 block mt-0.5">
                      {opexViewYear === 1
                        ? '– (Baseline)'
                        : `${selectedYearOpexSummary.yoyDiff >= 0 ? '+' : ''}${formatCurrency(selectedYearOpexSummary.yoyDiff, c)}`}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {opexViewYear === 1
                        ? 'Initial projection year'
                        : `${selectedYearOpexSummary.yoyPct >= 0 ? '+' : ''}${selectedYearOpexSummary.yoyPct.toFixed(1)}% growth`}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-[11px] font-medium text-slate-500 block">
                      Active Accounts
                    </span>
                    <span className="text-base font-bold font-financial text-slate-900 block mt-0.5">
                      {project.operatingExpenses.length} Account Titles
                    </span>
                    <span className="text-[10px] text-slate-500">Presented on Income Statement</span>
                  </div>
                </div>

                {/* 5-Year Schedule View (collapsible) */}
                {show5YearOpexSchedule && (
                  <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Table className="w-4 h-4 text-indigo-600" />
                        <span>5-Year Schedule of Operating Expenses (SG&A Matrix)</span>
                      </h4>
                      <span className="text-[11px] text-slate-500 italic">
                        Click on any year header to jump to that year
                      </span>
                    </div>

                    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold">
                          <tr>
                            <th className="p-2.5 pl-3">Account Title (Income Statement Row)</th>
                            {[1, 2, 3, 4, 5].map((yr) => (
                              <th
                                key={yr}
                                onClick={() => setOpexViewYear(yr)}
                                className={`p-2.5 text-right font-financial cursor-pointer transition ${
                                  opexViewYear === yr
                                    ? 'bg-indigo-100/70 text-indigo-900 font-bold underline decoration-indigo-500'
                                    : 'hover:bg-slate-200/60'
                                }`}
                                title={`Click to navigate to Year ${yr}`}
                              >
                                Year {yr} ({c})
                              </th>
                            ))}
                            <th className="p-2.5 text-right font-financial pr-3 bg-slate-100">
                              5-Yr Total ({c})
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {project.operatingExpenses.map((opex) => {
                            let itemTotal5Y = 0;
                            return (
                              <tr key={opex.id} className="hover:bg-slate-50/60">
                                <td className="p-2 pl-3 font-medium text-slate-900">{opex.name}</td>
                                {[1, 2, 3, 4, 5].map((yr) => {
                                  const amt = getOpexAmountForYear(opex, yr);
                                  itemTotal5Y += amt;
                                  return (
                                    <td
                                      key={yr}
                                      className={`p-2 text-right font-financial ${
                                        opexViewYear === yr ? 'bg-indigo-50/50 font-semibold text-slate-900' : 'text-slate-700'
                                      }`}
                                    >
                                      {formatCurrency(amt, c)}
                                    </td>
                                  );
                                })}
                                <td className="p-2 text-right font-financial font-bold text-slate-900 pr-3 bg-slate-50/50">
                                  {formatCurrency(itemTotal5Y, c)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-100/90 font-bold border-t border-slate-200 text-slate-900">
                          <tr>
                            <td className="p-2.5 pl-3 uppercase text-[11px] font-bold">Total Operating Expenses</td>
                            {[1, 2, 3, 4, 5].map((yr) => (
                              <td
                                key={yr}
                                className={`p-2.5 text-right font-financial ${
                                  opexViewYear === yr ? 'bg-indigo-100/80 text-indigo-950 text-sm' : ''
                                }`}
                              >
                                {formatCurrency(selectedYearOpexSummary.fiveYearTotals[yr], c)}
                              </td>
                            ))}
                            <td className="p-2.5 text-right font-financial text-sm pr-3 bg-slate-200/70 text-indigo-950">
                              {formatCurrency(selectedYearOpexSummary.grandTotal5Years, c)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Main Operating Expenses Table - No Category Column, Only Account Title */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3 pl-4 min-w-[220px]">
                          <span>Account Title (Expense Name)</span>
                          <span className="block text-[10px] font-normal text-slate-500">
                            Presented on Projected Income Statement
                          </span>
                        </th>
                        <th className="p-3 text-right min-w-[140px]">
                          <span>Year {opexViewYear} Annual ({c})</span>
                          <span className="block text-[10px] font-normal text-slate-500">
                            {opexViewYear === 1 ? 'Base Annual Outlay' : 'Custom or Escalated'}
                          </span>
                        </th>
                        <th className="p-3 text-right min-w-[120px]">
                          <span>Monthly ({c})</span>
                          <span className="block text-[10px] font-normal text-slate-500">
                            Year {opexViewYear} Monthly Rate
                          </span>
                        </th>
                        <th className="p-3 text-right min-w-[130px]">
                          <span>Annual Growth %</span>
                          <span className="block text-[10px] font-normal text-slate-500">
                            Annual Escalation
                          </span>
                        </th>
                        <th className="p-3 text-right min-w-[130px]">
                          <span>YoY Change</span>
                          <span className="block text-[10px] font-normal text-slate-500">
                            vs Prior Year
                          </span>
                        </th>
                        <th className="p-3 text-center w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.operatingExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                            No operating expense accounts configured. Click "+ Add Expense Account" or select standard preset account titles above.
                          </td>
                        </tr>
                      ) : (
                        project.operatingExpenses.map((opex, idx) => {
                          const currentAmount = getOpexAmountForYear(opex, opexViewYear);
                          const prevAmount = opexViewYear > 1 ? getOpexAmountForYear(opex, opexViewYear - 1) : currentAmount;
                          const diff = currentAmount - prevAmount;
                          const hasCustomOverride =
                            opexViewYear > 1 &&
                            opex.customYearAmounts &&
                            opex.customYearAmounts[opexViewYear] !== undefined;

                          return (
                            <tr key={opex.id} className="hover:bg-slate-50/60 transition">
                              <td className="p-3 pl-4">
                                <input
                                  type="text"
                                  value={opex.name}
                                  placeholder="e.g. Office Rental & Utilities"
                                  onChange={(e) => {
                                    const copy = [...project.operatingExpenses];
                                    copy[idx].name = e.target.value;
                                    updateOpex(copy);
                                  }}
                                  className="w-full font-semibold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none bg-transparent py-0.5"
                                />
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex flex-col items-end gap-0.5">
                                  <input
                                    type="number"
                                    value={currentAmount}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      const copy = [...project.operatingExpenses];
                                      if (opexViewYear === 1) {
                                        copy[idx].annualAmountYear1 = val;
                                        if (copy[idx].customYearAmounts) {
                                          copy[idx].customYearAmounts![1] = val;
                                        }
                                      } else {
                                        if (!copy[idx].customYearAmounts) {
                                          copy[idx].customYearAmounts = {};
                                        }
                                        copy[idx].customYearAmounts![opexViewYear] = val;
                                      }
                                      updateOpex(copy);
                                    }}
                                    className="w-28 font-financial font-semibold text-right border border-slate-200 rounded px-2 py-1 text-slate-900 focus:border-indigo-500 focus:outline-none"
                                  />
                                  {hasCustomOverride && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1">
                                        Custom
                                      </span>
                                      <button
                                        onClick={() => {
                                          const copy = [...project.operatingExpenses];
                                          if (copy[idx].customYearAmounts) {
                                            delete copy[idx].customYearAmounts![opexViewYear];
                                          }
                                          updateOpex(copy);
                                        }}
                                        className="text-[10px] text-indigo-600 hover:underline"
                                        title="Reset to calculated growth rate amount"
                                      >
                                        Reset
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-right font-financial text-slate-600">
                                {formatCurrency(Math.round((currentAmount / 12) * 100) / 100, c)}
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={opex.annualGrowthRate}
                                    onChange={(e) => {
                                      const copy = [...project.operatingExpenses];
                                      copy[idx].annualGrowthRate = parseFloat(e.target.value) || 0;
                                      updateOpex(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-1 text-slate-900 focus:border-indigo-500 focus:outline-none"
                                  />
                                  <span className="text-slate-500">%</span>
                                </div>
                              </td>
                              <td className="p-3 text-right font-financial text-slate-600">
                                {opexViewYear === 1 ? (
                                  <span className="text-slate-400 italic text-[11px]">Base Year</span>
                                ) : (
                                  <span className={diff >= 0 ? 'text-emerald-700 font-medium' : 'text-slate-600'}>
                                    {diff >= 0 ? '+' : ''}{formatCurrency(diff, c)}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => {
                                    updateOpex(project.operatingExpenses.filter((_, i) => i !== idx));
                                  }}
                                  className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition"
                                  title="Delete operating expense account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    {project.operatingExpenses.length > 0 && (
                      <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-slate-900">
                        <tr>
                          <td className="p-3 pl-4 uppercase text-[11px]">
                            Total Year {opexViewYear} Operating Expenses
                          </td>
                          <td className="p-3 text-right font-financial text-sm text-indigo-900">
                            {formatCurrency(selectedYearOpexSummary.currentYearTotal, c)}
                          </td>
                          <td className="p-3 text-right font-financial text-slate-700">
                            {formatCurrency(selectedYearOpexSummary.currentYearMonthly, c)}
                          </td>
                          <td className="p-3 text-right text-slate-500 text-[11px]">
                            Avg {((project.operatingExpenses.reduce((s, o) => s + (o.annualGrowthRate || 0), 0)) / Math.max(1, project.operatingExpenses.length)).toFixed(1)}%
                          </td>
                          <td className="p-3 text-right font-financial text-slate-700">
                            {opexViewYear === 1
                              ? '–'
                              : `${selectedYearOpexSummary.yoyDiff >= 0 ? '+' : ''}${formatCurrency(selectedYearOpexSummary.yoyDiff, c)}`}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}

            {/* TAB 9: WORKING CAPITAL POLICY */}
            {activeTab === 'workingCapital' && (
              <div id="assumptions-tab-workingCapital" className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>9. Working Capital Policies & Cash Management</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Accounts receivable days/rates, ending inventory safety stock, accounts payable settlement terms, discounts, and owner/s profit withdrawals.
                    </p>
                  </div>
                  <PdfDownloadButton
                    targetId="assumptions-tab-workingCapital"
                    title="9. Working Capital Policies & Cash Management"
                    subtitle={`${project.title} • Assumptions Tab 9`}
                    projectTitle={project.title}
                    buttonText="Download Tab PDF"
                    size="sm"
                    variant="indigo"
                    orientation="landscape"
                    format="a4"
                    fitToSinglePage={true}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {/* 1. Discounts & Allowances Policy */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-900">
                          Discounts & Allowances Policy
                        </label>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Revenue Deduction
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="50"
                          value={
                            project.workingCapital.discountsAndAllowancesPercent !== undefined
                              ? project.workingCapital.discountsAndAllowancesPercent
                              : project.salesDiscountsPercent || 0
                          }
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            onUpdateProject({
                              ...project,
                              salesDiscountsPercent: val,
                              workingCapital: {
                                ...project.workingCapital,
                                discountsAndAllowancesPercent: val,
                              },
                            });
                          }}
                          className="w-20 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-financial font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                        />
                        <span className="text-xs font-semibold text-slate-700">% of Gross Sales</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
                          Credit Terms / Settlement Terms:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2/10, n/30 prompt settlement"
                          value={project.workingCapital.discountsAndAllowancesTerms || ''}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              workingCapital: {
                                ...project.workingCapital,
                                discountsAndAllowancesTerms: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Accounts Receivable Policy */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-900">
                          Accounts Receivable Policy
                        </label>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          Current Asset
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={project.workingCapital.accountsReceivablePercentOfSales}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            workingCapital: {
                              ...project.workingCapital,
                              accountsReceivablePercentOfSales: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-20 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-financial font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-slate-700">% of Net Sales</span>
                    </div>
                  </div>

                  {/* 3. Ending Inventory Policy */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-900">
                          Ending Inventory Policy
                        </label>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Current Asset
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={project.workingCapital.inventoryPercentOfCOGS}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            workingCapital: {
                              ...project.workingCapital,
                              inventoryPercentOfCOGS: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-20 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-financial font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-slate-700">% of COGS</span>
                    </div>
                  </div>

                  {/* 4. Accounts Payable Policy */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-900">
                          Accounts Payable Policy
                        </label>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                          Current Liability
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={project.workingCapital.accountsPayablePercentOfPurchases}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            workingCapital: {
                              ...project.workingCapital,
                              accountsPayablePercentOfPurchases: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-20 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-financial font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-slate-700">% of Direct Materials</span>
                    </div>
                  </div>

                  {/* 5. Owner/s Withdrawals Policy */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-900">
                          Owner/s Withdrawals Policy
                        </label>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                          Equity Drawings
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={
                            project.workingCapital.ownerWithdrawalsPercent !== undefined
                              ? project.workingCapital.ownerWithdrawalsPercent
                              : project.dividendPayoutPercent || 0
                          }
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                            onUpdateProject({
                              ...project,
                              dividendPayoutPercent: val,
                              workingCapital: {
                                ...project.workingCapital,
                                ownerWithdrawalsPercent: val,
                              },
                            });
                          }}
                          className="w-20 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-financial font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                        />
                        <span className="text-xs font-semibold text-slate-700">% of Net Income</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
                          Withdrawal Terms / Frequency:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Annual dividends / periodic owner drawings"
                          value={project.workingCapital.ownerWithdrawalsTerms || ''}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              workingCapital: {
                                ...project.workingCapital,
                                ownerWithdrawalsTerms: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Working Capital Policy Impact Live Preview */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Year 1 Working Capital Policy Computed Impact</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Calculated automatically from Year 1 product pricing and sales volume
                    </span>
                  </div>

                  {(() => {
                    const grossY1 = (project.products || []).reduce(
                      (sum, p) => sum + (p.year1Volume || 0) * (p.unitPrice || 0),
                      0
                    );
                    const discRate =
                      project.workingCapital.discountsAndAllowancesPercent !== undefined
                        ? project.workingCapital.discountsAndAllowancesPercent
                        : project.salesDiscountsPercent || 0;
                    const discountsY1 = grossY1 * (discRate / 100);
                    const netSalesY1 = grossY1 - discountsY1;
                    const arY1 = netSalesY1 * ((project.workingCapital.accountsReceivablePercentOfSales || 0) / 100);

                    const dmY1 = (project.products || []).reduce(
                      (sum, p) =>
                        sum +
                        (p.year1Volume || 0) *
                          (p.rawMaterialsCostPerUnit !== undefined ? p.rawMaterialsCostPerUnit : p.unitCost || 0),
                      0
                    );
                    const apY1 = dmY1 * ((project.workingCapital.accountsPayablePercentOfPurchases || 0) / 100);

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 block">Gross Sales (Yr 1)</span>
                          <span className="font-bold font-financial text-slate-900 block mt-0.5">
                            {formatCurrency(grossY1, c)}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-amber-200 bg-amber-50/30">
                          <span className="text-[11px] text-amber-800 font-medium block">
                            Discounts & Allowances ({discRate}%)
                          </span>
                          <span className="font-bold font-financial text-amber-900 block mt-0.5">
                            –{formatCurrency(discountsY1, c)}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 block">Net Sales (Yr 1)</span>
                          <span className="font-bold font-financial text-emerald-700 block mt-0.5">
                            {formatCurrency(netSalesY1, c)}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 block">
                            Accounts Receivable ({project.workingCapital.accountsReceivablePercentOfSales}%)
                          </span>
                          <span className="font-bold font-financial text-blue-700 block mt-0.5">
                            {formatCurrency(arY1, c)}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 block">
                            Accounts Payable ({project.workingCapital.accountsPayablePercentOfPurchases}%)
                          </span>
                          <span className="font-bold font-financial text-purple-700 block mt-0.5">
                            {formatCurrency(apY1, c)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
