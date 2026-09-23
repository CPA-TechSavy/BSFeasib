import { FeasibilityProject, YearFinancials, PartnerContribution, EntityClassification } from '../types';

export interface PartnerYearMovement {
  year: number;
  beginningCapital: number;
  additionalContribution: number;
  shareOfNetIncome: number;
  drawings: number;
  endingCapital: number;
}

export interface PartnerEquitySchedule {
  id: string;
  name: string;
  profitSharePercent: number;
  profitShareRatio: number;
  initialContribution: number;
  yearlyData: { [year: number]: PartnerYearMovement };
}

export interface SoleProprietorYearMovement {
  year: number;
  beginningCapital: number;
  additionalContribution: number;
  netIncome: number;
  drawings: number;
  endingCapital: number;
}

/**
 * Returns the effective entity classification: Sole Proprietorship or Partnership.
 * Defaults to Sole Proprietorship if unspecified.
 */
export function getEffectiveClassification(project: FeasibilityProject): EntityClassification {
  if (project.companyAccount?.classification === 'Corporation') {
    return 'Corporation';
  }
  return project.companyAccount?.classification === 'Partnership' ? 'Partnership' : 'Sole Proprietorship';
}

/**
 * Returns the name of the sole proprietor / owner.
 */
export function getOwnerName(project: FeasibilityProject): string {
  if (project.companyAccount?.soleProprietorship?.ownerName?.trim()) {
    return project.companyAccount.soleProprietorship.ownerName.trim();
  }
  if (project.proponents?.trim()) {
    return project.proponents.trim();
  }
  return 'Sole Proprietor';
}

/**
 * Retrieves the partners array. If none is explicitly stored yet,
 * intelligently derives default partners from proponents or standard defaults (50/50).
 */
export function getPartners(project: FeasibilityProject): PartnerContribution[] {
  if (
    project.companyAccount?.classification === 'Partnership' &&
    project.companyAccount.partnership?.partners &&
    project.companyAccount.partnership.partners.length > 0
  ) {
    return project.companyAccount.partnership.partners;
  }

  // Fallback: derive from comma-separated proponents or default partners
  const proponents = project.proponents
    ? project.proponents.split(/,|&|and/i).map((s) => s.trim()).filter(Boolean)
    : [];

  const totalEquity = project.financing?.equityContribution || 500000;

  if (proponents.length >= 2) {
    const count = proponents.length;
    const baseShare = Math.round((100 / count) * 100) / 100;
    const baseCapital = Math.round((totalEquity / count) * 100) / 100;

    return proponents.map((name, idx) => {
      const isLast = idx === count - 1;
      const share = isLast ? Math.round((100 - baseShare * (count - 1)) * 100) / 100 : baseShare;
      const capital = isLast ? totalEquity - baseCapital * (count - 1) : baseCapital;
      return {
        id: `partner-${idx + 1}`,
        name,
        capitalContribution: capital,
        profitSharePercent: share,
      };
    });
  }

  // Default two partners
  return [
    {
      id: 'partner-1',
      name: 'Partner 1',
      capitalContribution: Math.round(totalEquity * 0.5),
      profitSharePercent: 50,
    },
    {
      id: 'partner-2',
      name: 'Partner 2',
      capitalContribution: totalEquity - Math.round(totalEquity * 0.5),
      profitSharePercent: 50,
    },
  ];
}

/**
 * Calculates the year-by-year capital account movements and ending balances for each partner.
 * Ensures the sum of all partners' ending capital matches the Balance Sheet totalEquity exactly for each year.
 */
export function calculatePartnersEquitySchedule(
  project: FeasibilityProject,
  financials: YearFinancials[]
): PartnerEquitySchedule[] {
  const partners = getPartners(project);
  if (partners.length === 0) return [];

  // Calculate total profit share percent to normalize ratios
  const totalPercent = partners.reduce((sum, p) => sum + (Number(p.profitSharePercent) || 0), 0) || 100;
  const totalPartnerInitialCap = partners.reduce((sum, p) => sum + (Number(p.capitalContribution) || 0), 0);
  const targetYear0PaidIn = financials[0]?.paidInCapital ?? project.financing.equityContribution ?? 0;

  // Initialize schedules
  const schedules: PartnerEquitySchedule[] = partners.map((p) => {
    const shareRatio = (Number(p.profitSharePercent) || 0) / totalPercent;
    // If user specified individual capital contributions and they sum > 0, use them;
    // otherwise distribute targetYear0PaidIn by profit share
    let initialContribution = p.capitalContribution || 0;
    if (totalPartnerInitialCap <= 0 && targetYear0PaidIn > 0) {
      initialContribution = targetYear0PaidIn * shareRatio;
    }

    return {
      id: p.id,
      name: p.name || 'Partner',
      profitSharePercent: p.profitSharePercent || 0,
      profitShareRatio: shareRatio,
      initialContribution,
      yearlyData: {},
    };
  });

  // Scale initial contributions if needed to match Year 0 paidInCapital exactly
  const sumInitial = schedules.reduce((s, p) => s + p.initialContribution, 0);
  if (targetYear0PaidIn > 0 && Math.abs(sumInitial - targetYear0PaidIn) > 0.01) {
    schedules.forEach((p, idx) => {
      if (idx === schedules.length - 1) {
        const others = schedules.slice(0, -1).reduce((s, item) => s + item.initialContribution, 0);
        p.initialContribution = targetYear0PaidIn - others;
      } else {
        p.initialContribution = Math.round(targetYear0PaidIn * p.profitShareRatio * 100) / 100;
      }
    });
  }

  // Iterate across all years (0 through 5)
  for (let yrIndex = 0; yrIndex < financials.length; yrIndex++) {
    const y = financials[yrIndex];
    const yr = y.year;

    const totalNetIncome = y.netIncome;
    const withdrawalPercent =
      project.workingCapital?.ownerWithdrawalsPercent !== undefined
        ? project.workingCapital.ownerWithdrawalsPercent
        : (project.dividendPayoutPercent || 0);
    const totalDividends =
      yr > 0 && totalNetIncome > 0 ? totalNetIncome * (withdrawalPercent / 100) : 0;
    const targetTotalEquity = y.totalEquity;

    schedules.forEach((p) => {
      const prevEnding = yr === 0 ? 0 : p.yearlyData[yr - 1]?.endingCapital || 0;
      const addContrib = yr === 0 ? p.initialContribution : 0;
      const shareOfIncome = totalNetIncome * p.profitShareRatio;
      const shareOfDrawings = totalDividends * p.profitShareRatio;
      const endCapital = prevEnding + addContrib + shareOfIncome - shareOfDrawings;

      p.yearlyData[yr] = {
        year: yr,
        beginningCapital: prevEnding,
        additionalContribution: addContrib,
        shareOfNetIncome: shareOfIncome,
        drawings: shareOfDrawings,
        endingCapital: endCapital,
      };
    });

    // Reconcile rounding differences on ending capital to match targetTotalEquity exactly
    const computedTotalEnding = schedules.reduce((sum, p) => sum + p.yearlyData[yr].endingCapital, 0);
    const roundDiff = targetTotalEquity - computedTotalEnding;
    if (Math.abs(roundDiff) > 0.001 && schedules.length > 0) {
      // Allocate the fractional discrepancy to the primary/first partner
      const last = schedules[schedules.length - 1];
      last.yearlyData[yr].endingCapital += roundDiff;
    }
  }

  return schedules;
}

/**
 * Calculates the year-by-year capital movements for Sole Proprietorship.
 */
export function calculateSoleProprietorEquitySchedule(
  project: FeasibilityProject,
  financials: YearFinancials[]
): SoleProprietorYearMovement[] {
  const movements: SoleProprietorYearMovement[] = [];

  for (let yrIndex = 0; yrIndex < financials.length; yrIndex++) {
    const y = financials[yrIndex];
    const yr = y.year;
    const prevEnding = yr === 0 ? 0 : movements[yrIndex - 1].endingCapital;
    const addContrib = yr === 0 ? y.paidInCapital : 0;
    const netIncome = y.netIncome;
    const withdrawalPercent =
      project.workingCapital?.ownerWithdrawalsPercent !== undefined
        ? project.workingCapital.ownerWithdrawalsPercent
        : (project.dividendPayoutPercent || 0);
    const drawings = yr > 0 && netIncome > 0 ? netIncome * (withdrawalPercent / 100) : 0;
    const endingCapital = y.totalEquity;

    movements.push({
      year: yr,
      beginningCapital: prevEnding,
      additionalContribution: addContrib,
      netIncome,
      drawings,
      endingCapital,
    });
  }

  return movements;
}
