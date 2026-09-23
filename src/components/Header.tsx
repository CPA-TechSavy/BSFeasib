import React, { useRef, useState } from 'react';
import {
  Calculator,
  Cloud,
  Building2,
  PlusCircle,
  FileDown,
  Upload,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { CurrencySymbol, FeasibilityProject, YearFinancials, FeasibilityMetrics } from '../types';
import { exportProjectJSON } from '../utils/exportHelpers';
import { BLANK_PROJECT } from '../data/sampleProjects';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  financials: YearFinancials[];
  metrics: FeasibilityMetrics;
  onOpenCloudflareModal: () => void;
  onOpenBankModal?: () => void;
  onOpenCompanyModal: () => void;
  onOpenGoogleLoginModal: () => void;
  isAdmin?: boolean;
  pendingAccessCount?: number;
  onOpenAdminModal?: () => void;
}

const CURRENCIES: { symbol: CurrencySymbol; label: string }[] = [
  { symbol: '₱', label: '₱ (PHP)' },
  { symbol: '$', label: '$ (USD)' },
  { symbol: '€', label: '€ (EUR)' },
  { symbol: '£', label: '£ (GBP)' },
  { symbol: '¥', label: '¥ (JPY)' },
  { symbol: '₹', label: '₹ (INR)' },
  { symbol: 'S$', label: 'S$ (SGD)' },
];

export default function Header({
  project,
  onUpdateProject,
  financials,
  metrics,
  onOpenCloudflareModal,
  onOpenBankModal,
  onOpenCompanyModal,
  onOpenGoogleLoginModal,
  isAdmin = false,
  pendingAccessCount = 0,
  onOpenAdminModal,
}: HeaderProps) {
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleDownloadJson = () => {
    exportProjectJSON(project);
    setDownloadSuccess(true);
    setNotification({
      type: 'success',
      message: 'All website details successfully saved to downloadable .json file!',
    });
    setTimeout(() => setDownloadSuccess(false), 2500);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Selected file does not contain valid JSON data.');
        }

        // Sanitize and ensure complete data structure
        const sanitized: FeasibilityProject = {
          ...BLANK_PROJECT,
          ...parsed,
          companyAccount: parsed.companyAccount ?? BLANK_PROJECT.companyAccount,
          preOperatingExpenses: Array.isArray(parsed.preOperatingExpenses)
            ? parsed.preOperatingExpenses
            : BLANK_PROJECT.preOperatingExpenses,
          fixedAssets: Array.isArray(parsed.fixedAssets)
            ? parsed.fixedAssets
            : BLANK_PROJECT.fixedAssets,
          products: Array.isArray(parsed.products)
            ? parsed.products
            : BLANK_PROJECT.products,
          directLabor: Array.isArray(parsed.directLabor)
            ? parsed.directLabor
            : BLANK_PROJECT.directLabor,
          indirectLabor: Array.isArray(parsed.indirectLabor)
            ? parsed.indirectLabor
            : BLANK_PROJECT.indirectLabor,
          productionUtilities: Array.isArray(parsed.productionUtilities)
            ? parsed.productionUtilities
            : BLANK_PROJECT.productionUtilities,
          factorySupplies: Array.isArray(parsed.factorySupplies)
            ? parsed.factorySupplies
            : BLANK_PROJECT.factorySupplies,
          productionLaborBenefits: Array.isArray(parsed.productionLaborBenefits)
            ? parsed.productionLaborBenefits
            : BLANK_PROJECT.productionLaborBenefits,
          nonManufacturingLabor: Array.isArray(parsed.nonManufacturingLabor)
            ? parsed.nonManufacturingLabor
            : BLANK_PROJECT.nonManufacturingLabor,
          nonManufacturingLaborBenefits: Array.isArray(parsed.nonManufacturingLaborBenefits)
            ? parsed.nonManufacturingLaborBenefits
            : BLANK_PROJECT.nonManufacturingLaborBenefits,
          operatingExpenses: Array.isArray(parsed.operatingExpenses)
            ? parsed.operatingExpenses
            : BLANK_PROJECT.operatingExpenses,
          workingCapital: {
            ...BLANK_PROJECT.workingCapital,
            ...(parsed.workingCapital || {}),
          },
          financing: {
            ...BLANK_PROJECT.financing,
            ...(parsed.financing || {}),
          },
        };

        onUpdateProject(sanitized);

        try {
          localStorage.setItem(
            'undergrad_feasibility_cleanslate_v1',
            JSON.stringify(sanitized)
          );
        } catch {
          // ignore localStorage limits
        }

        setNotification({
          type: 'success',
          message: `Successfully loaded "${file.name}"! All details and information previously encoded have been restored.`,
        });
        setTimeout(() => setNotification(null), 5000);
      } catch (err: any) {
        console.error('Failed to import JSON file:', err);
        setNotification({
          type: 'error',
          message: `Could not load file: ${err?.message || 'Invalid feasibility JSON file format.'}`,
        });
        setTimeout(() => setNotification(null), 5000);
      } finally {
        if (e.target) {
          e.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <header className="no-print sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-3">
            {/* App Title & Branding */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-inner shrink-0">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="font-bold text-sm sm:text-base md:text-lg tracking-tight text-white shrink-0">
                    NoBSFeasibility
                  </span>
                  <button
                    type="button"
                    onClick={onOpenCompanyModal}
                    aria-label={
                      project.companyAccount
                        ? 'Configure Company Account'
                        : 'Add Company Account'
                    }
                    title={
                      project.companyAccount
                        ? `Company Account: ${project.companyAccount.entityName} (${project.companyAccount.classification})`
                        : 'Add Company Account (Entity Name, Classification, Nature, Purpose & Capital)'
                    }
                    className={`w-8 h-8 sm:w-auto sm:h-9 p-0 sm:px-2.5 text-xs rounded-lg font-semibold flex items-center justify-center transition cursor-pointer border shrink-0 ${
                      project.companyAccount
                        ? 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-500/60 text-indigo-100 shadow-xs'
                        : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-sm'
                    }`}
                  >
                    {project.companyAccount ? (
                      <>
                        <Building2 className="w-4 h-4 text-indigo-300 shrink-0" />
                        <span className="hidden sm:inline ml-1.5 max-w-[120px] md:max-w-[170px] truncate font-medium">
                          {project.companyAccount.entityName || 'Company'}
                        </span>
                        <span className="hidden lg:inline ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-indigo-900/90 text-indigo-200 border border-indigo-700/50">
                          {project.companyAccount.classification === 'Sole Proprietorship'
                            ? 'Sole Pro'
                            : 'Partnership'}
                        </span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 text-emerald-100 shrink-0" />
                        <span className="hidden sm:inline ml-1.5">Add Company</span>
                      </>
                    )}
                  </button>
                </div>
                {project.title && (
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[120px] xs:max-w-xs sm:max-w-md hidden md:block">
                    {project.title}
                  </p>
                )}
              </div>
            </div>

            {/* Action Tools: Responsive Row for Mobile & Desktop */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Currency Selector: on mobile, shows currency sign ONLY */}
              <div
                className="relative flex items-center justify-center bg-slate-800/90 hover:bg-slate-800 rounded-lg border border-slate-700 h-8 w-8 sm:h-9 sm:w-auto px-0 sm:px-2 shadow-xs transition"
                title={`Operating Currency: ${project.currency} (Click to change)`}
              >
                <span className="text-xs text-slate-400 mr-1 hidden md:inline">
                  Currency:
                </span>
                {/* Mobile View: Currency Sign Only */}
                <span className="sm:hidden text-xs font-bold text-emerald-400 select-none pointer-events-none">
                  {project.currency}
                </span>
                {/* Select dropdown: interactive overlay on mobile, standard inline on desktop */}
                <select
                  aria-label="Select Operating Currency"
                  value={project.currency}
                  onChange={(e) =>
                    onUpdateProject({
                      ...project,
                      currency: e.target.value as CurrencySymbol,
                    })
                  }
                  className="absolute inset-0 opacity-0 sm:opacity-100 sm:static bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer py-0.5"
                >
                  {CURRENCIES.map((c) => (
                    <option
                      key={c.symbol}
                      value={c.symbol}
                      className="bg-slate-800 text-white"
                    >
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Download .json button: on mobile, shows icon ONLY */}
              <button
                type="button"
                onClick={handleDownloadJson}
                aria-label="Download project details as .json file"
                title="Download .json file containing all encoded project details so your content is preserved"
                className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-2.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer shadow-xs shrink-0"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="hidden sm:inline ml-1.5 text-emerald-400 font-semibold">
                      Downloaded!
                    </span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="hidden sm:inline ml-1.5">Download .json</span>
                  </>
                )}
              </button>

              {/* Upload .json file button: on mobile, shows icon ONLY */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload .json file to restore encoded details"
                title="Upload previously saved .json file to automatically populate all encoded information"
                className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-2.5 text-xs rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 font-medium text-indigo-100 hover:text-white flex items-center justify-center transition cursor-pointer shadow-xs shrink-0"
              >
                <Upload className="w-4 h-4 text-indigo-300 shrink-0" />
                <span className="hidden sm:inline ml-1.5">Upload</span>
              </button>

              {/* Hidden File Input for .json Upload */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleUploadFile}
                className="hidden"
              />

              {/* Admin Approvals Console Trigger for CPA */}
              {isAdmin && onOpenAdminModal && (
                <button
                  type="button"
                  onClick={onOpenAdminModal}
                  aria-label="CPA Access Approvals Console"
                  title="CPA Access Approvals Console (Manage login permissions)"
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Approvals</span>
                  {pendingAccessCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 animate-pulse">
                      {pendingAccessCount}
                    </span>
                  )}
                </button>
              )}

              {/* Google Sign In or Connected Google Profile Button */}
              {authLoading ? (
                <div className="h-8 w-8 sm:h-9 sm:w-24 rounded-lg bg-slate-800 animate-pulse shrink-0" />
              ) : user ? (
                <button
                  type="button"
                  onClick={onOpenGoogleLoginModal}
                  aria-label={`Signed in with Google as ${user.email}`}
                  title={`Google Account: ${user.displayName || user.email} (Click to manage account & cloud backup)`}
                  className="h-8 sm:h-9 px-2 sm:px-2.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google Profile'}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-emerald-400"
                    />
                  ) : (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {(user.displayName || user.email || 'G').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline max-w-[90px] truncate">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Google Account Active" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenGoogleLoginModal}
                  aria-label="Sign in with Google Account"
                  title="Sign in with your Google Account"
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-slate-800 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Sign in with Google</span>
                  <span className="sm:hidden font-medium">Log in</span>
                </button>
              )}

              {/* Publish Button: on mobile, shows icon ONLY */}
              <button
                onClick={onOpenCloudflareModal}
                aria-label="How to publish this app to Cloudflare Pages for free"
                title="How to publish this app to Cloudflare Pages for free"
                className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 text-xs rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-semibold shadow flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <Cloud className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline ml-1.5">Publish</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Upload/Download Status Notification Banner */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`no-print fixed top-18 right-4 z-50 max-w-md p-3 rounded-xl shadow-lg border flex items-center gap-2.5 transition-all duration-300 text-xs sm:text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-900/95 text-emerald-100 border-emerald-700 shadow-emerald-950/40'
              : 'bg-rose-900/95 text-rose-100 border-rose-700 shadow-rose-950/40'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          )}
          <span className="flex-1">{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-300 hover:text-white text-xs px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
