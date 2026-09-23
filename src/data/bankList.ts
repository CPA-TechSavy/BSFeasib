import { DepreciationMethod } from '../types';

export interface LocalBank {
  id: string;
  name: string;
  shortName: string;
  category: 'Universal / Commercial' | 'Government' | 'Digital / Commercial';
  benchmarkSavingsRate: number; // Benchmark interest rate (% p.a.)
}

export const LOCAL_BANKS: LocalBank[] = [
  { id: 'bdo', name: 'BDO Unibank, Inc.', shortName: 'BDO Unibank', category: 'Universal / Commercial', benchmarkSavingsRate: 0.75 },
  { id: 'bpi', name: 'Bank of the Philippine Islands (BPI)', shortName: 'BPI', category: 'Universal / Commercial', benchmarkSavingsRate: 0.75 },
  { id: 'metrobank', name: 'Metropolitan Bank & Trust Company (Metrobank)', shortName: 'Metrobank', category: 'Universal / Commercial', benchmarkSavingsRate: 0.75 },
  { id: 'landbank', name: 'Land Bank of the Philippines (LandBank)', shortName: 'LandBank', category: 'Government', benchmarkSavingsRate: 1.00 },
  { id: 'pnb', name: 'Philippine National Bank (PNB)', shortName: 'PNB', category: 'Universal / Commercial', benchmarkSavingsRate: 0.75 },
  { id: 'securitybank', name: 'Security Bank Corporation', shortName: 'Security Bank', category: 'Universal / Commercial', benchmarkSavingsRate: 1.25 },
  { id: 'chinabank', name: 'China Banking Corporation (China Bank)', shortName: 'China Bank', category: 'Universal / Commercial', benchmarkSavingsRate: 0.85 },
  { id: 'rcbc', name: 'Rizal Commercial Banking Corporation (RCBC)', shortName: 'RCBC', category: 'Universal / Commercial', benchmarkSavingsRate: 1.00 },
  { id: 'unionbank', name: 'Union Bank of the Philippines (UnionBank)', shortName: 'UnionBank', category: 'Universal / Commercial', benchmarkSavingsRate: 1.00 },
  { id: 'dbp', name: 'Development Bank of the Philippines (DBP)', shortName: 'DBP', category: 'Government', benchmarkSavingsRate: 1.00 },
  { id: 'eastwest', name: 'EastWest Banking Corporation', shortName: 'EastWest Bank', category: 'Universal / Commercial', benchmarkSavingsRate: 1.25 },
  { id: 'aub', name: 'Asia United Bank (AUB)', shortName: 'AUB', category: 'Universal / Commercial', benchmarkSavingsRate: 0.85 },
  { id: 'pbcom', name: 'Philippine Bank of Communications (PBCom)', shortName: 'PBCom', category: 'Universal / Commercial', benchmarkSavingsRate: 0.85 },
  { id: 'robinsons', name: 'Robinsons Bank / Maya Bank', shortName: 'Robinsons / Maya', category: 'Digital / Commercial', benchmarkSavingsRate: 1.50 },
  { id: 'other', name: 'Other Local Commercial Bank', shortName: 'Other Local Bank', category: 'Universal / Commercial', benchmarkSavingsRate: 1.00 },
];

export interface DepreciationMethodOption {
  id: DepreciationMethod;
  name: string;
  description: string;
  isDefault?: boolean;
}

export const DEPRECIATION_METHODS: DepreciationMethodOption[] = [
  {
    id: 'Straight-Line',
    name: 'Straight-Line Method (Default)',
    description: 'Equal annual expense: (Cost - Salvage Value) / Useful Life.',
    isDefault: true,
  },
  {
    id: 'Double Declining Balance',
    name: 'Double Declining Balance (200% Accelerated)',
    description: 'Rate = 2 / Life applied to net book value, capped at salvage value.',
  },
  {
    id: '150% Declining Balance',
    name: '150% Declining Balance',
    description: 'Rate = 1.5 / Life applied to net book value, capped at salvage value.',
  },
  {
    id: 'Sum-of-the-Years-Digits',
    name: 'Sum-of-the-Years\'-Digits (SYD)',
    description: 'Accelerated fraction based on remaining years / sum of years.',
  },
];
