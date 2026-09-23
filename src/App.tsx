import { useState, useMemo, useEffect, ComponentType } from 'react';
import { FeasibilityProject } from './types';
import { BLANK_PROJECT, SAMPLE_PROJECTS } from './data/sampleProjects';
import {
  calculate5YearFinancials,
  calculateFeasibilityMetrics,
} from './utils/financialCalculations';
import Header from './components/Header';
import ProjectInfoCard from './components/ProjectInfoCard';
import AssumptionsEditor from './components/AssumptionsEditor';
import FinancialStatementsView from './components/FinancialStatementsView';
import FeasibilityEvaluationView from './components/FeasibilityEvaluationView';
import SupportingSchedulesView from './components/SupportingSchedulesView';
import NotesAndDefenseNotes from './components/NotesAndDefenseNotes';
import CloudflareDeployModal from './components/CloudflareDeployModal';
import BankInterestAndLoanModal from './components/BankInterestAndLoanModal';
import CompanyAccountModal from './components/CompanyAccountModal';
import {
  FileText,
  BarChart3,
  Sliders,
  Table,
  BookOpen,
  Cloud,
  CheckCircle2,
  Landmark,
  ChevronDown,
} from 'lucide-react';

const STORAGE_KEY = 'undergrad_feasibility_cleanslate_v1';

type MainViewType = 'statements' | 'evaluation' | 'assumptions' | 'schedules' | 'notes';

const NAV_ITEMS: {
  id: MainViewType;
  label: string;
  shortLabel: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: 'statements', label: 'Financial Statements', shortLabel: 'Statements', icon: FileText },
  { id: 'evaluation', label: 'Financial Ratios & Verdict', shortLabel: 'Ratios', icon: BarChart3 },
  { id: 'assumptions', label: 'Assumptions & Inputs', shortLabel: 'Assumptions', icon: Sliders },
  { id: 'schedules', label: 'Notes Schedules', shortLabel: 'Schedules', icon: Table },
  { id: 'notes', label: 'Notes to Statements', shortLabel: 'Notes', icon: BookOpen },
];

export default function App() {
  const [project, setProject] = useState<FeasibilityProject>(() => {
    try {
      // Clear out legacy sample pre-existing data
      localStorage.removeItem('undergrad_feasibility_project_v1');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'cafe-artisan' || parsed.id === 'eco-packaging') {
          return BLANK_PROJECT;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load project from localStorage', e);
    }
    return BLANK_PROJECT;
  });

  const [activeMainView, setActiveMainView] = useState<MainViewType>('statements');

  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [project]);

  // Reactive financial calculations
  const financials = useMemo(() => {
    return calculate5YearFinancials(project);
  }, [project]);

  const metrics = useMemo(() => {
    return calculateFeasibilityMetrics(project, financials);
  }, [project, financials]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 pb-20 md:pb-0">
      {/* Navigation Header */}
      <Header
        project={project}
        onUpdateProject={setProject}
        financials={financials}
        metrics={metrics}
        onOpenCloudflareModal={() => setIsCloudflareModalOpen(true)}
        onOpenBankModal={() => setIsBankModalOpen(true)}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Project Header Info & Assumptions Quick Bar */}
        <ProjectInfoCard
          project={project}
          onUpdateProject={setProject}
          metrics={metrics}
          financials={financials}
          onOpenBankModal={() => setIsBankModalOpen(true)}
          onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        />

        {/* Mobile View Switcher Dropdown (< md screens) */}
        <div className="md:hidden no-print mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <select
              aria-label="Select section view"
              value={activeMainView}
              onChange={(e) => setActiveMainView(e.target.value as MainViewType)}
              className="w-full bg-white border border-slate-300 text-slate-900 font-semibold text-xs rounded-xl py-2.5 pl-3 pr-8 shadow-xs appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[42px]"
            >
              {NAV_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsBankModalOpen(true)}
            title="Breakdown of bank savings interest and loan amortization"
            className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs shrink-0 min-h-[42px]"
          >
            <Landmark className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="hidden xs:inline">Bank & Loan</span>
            <span className="xs:hidden">Bank</span>
          </button>
        </div>

        {/* Navigation Section Tabs (Hidden on Print) */}
        <div className="no-print flex overflow-x-auto gap-1.5 sm:gap-2 mb-4 sm:mb-6 pb-1 border-b border-slate-200 scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeMainView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMainView(item.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shadow-2xs min-h-[40px] sm:min-h-[42px] cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                </span>
              </button>
            );
          })}

          {/* Dedicated Quick-Access Button for Bank Savings Interest & Loan Debt Breakdown */}
          <button
            onClick={() => setIsBankModalOpen(true)}
            title="Breakdown of interest received for bank savings and loan capital/interest to pay"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shadow-2xs bg-gradient-to-r from-emerald-50 via-indigo-50 to-indigo-100 hover:from-emerald-100 hover:to-indigo-200 text-indigo-950 border border-indigo-200/90 cursor-pointer ml-auto min-h-[40px] sm:min-h-[42px] shrink-0"
          >
            <Landmark className="w-4 h-4 text-indigo-700 shrink-0" />
            <span className="hidden sm:inline">Bank Interest & Loan Breakdown</span>
            <span className="sm:hidden">Bank & Loan</span>
          </button>
        </div>

        {/* Print Only Thesis Document Header */}
        <div className="print-only hidden mb-8 text-center pb-4 border-b border-black">
          <h1 className="text-xl font-bold font-serif-title uppercase">{project.title}</h1>
          <p className="text-xs font-semibold">{project.academicProgram} - {project.institution}</p>
          <p className="text-xs italic">{project.proponents} ({project.academicYear})</p>
          <p className="text-[10px] text-slate-600 mt-1">CHAPTER V: FINANCIAL FEASIBILITY & PROJECTED FINANCIAL STATEMENTS</p>
        </div>

        {/* Primary Views */}
        {activeMainView === 'statements' && (
          <FinancialStatementsView
            project={project}
            financials={financials}
            onOpenBankModal={() => setIsBankModalOpen(true)}
            onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
          />
        )}

        {activeMainView === 'evaluation' && (
          <FeasibilityEvaluationView
            project={project}
            financials={financials}
            metrics={metrics}
          />
        )}

        {activeMainView === 'assumptions' && (
          <AssumptionsEditor
            project={project}
            onUpdateProject={setProject}
            onOpenBankModal={() => setIsBankModalOpen(true)}
          />
        )}

        {activeMainView === 'schedules' && (
          <SupportingSchedulesView
            project={project}
            financials={financials}
            onOpenBankModal={() => setIsBankModalOpen(true)}
          />
        )}

        {activeMainView === 'notes' && (
          <NotesAndDefenseNotes
            project={project}
            onUpdateProject={setProject}
            metrics={metrics}
            financials={financials}
          />
        )}

        {/* When Printing: Also display the other core parts sequentially for the complete academic chapter! */}
        <div className="print-only hidden space-y-8">
          <FeasibilityEvaluationView
            project={project}
            financials={financials}
            metrics={metrics}
          />
          <SupportingSchedulesView project={project} financials={financials} />
          <NotesAndDefenseNotes
            project={project}
            onUpdateProject={setProject}
            metrics={metrics}
            financials={financials}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 text-xs text-slate-500 py-4 px-4 sm:px-6 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Financial Statements Generator
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => setIsCloudflareModalOpen(true)}
              className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5" /> Publish on Cloudflare
            </button>
            <span>•</span>
            <span>CPA-Standard Accounting Conventions</span>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Quick Navigation Bar (< md screens) */}
      <nav aria-label="Mobile navigation" className="md:hidden no-print fixed bottom-2.5 left-2.5 right-2.5 z-30 pointer-events-none flex justify-center">
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/90 p-1.5 flex items-center justify-between gap-1 max-w-md w-full">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeMainView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMainView(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-medium transition min-h-[44px] cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate max-w-[54px]">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Cloudflare Deploy Modal */}
      {isCloudflareModalOpen && (
        <CloudflareDeployModal
          isOpen={isCloudflareModalOpen}
          onClose={() => setIsCloudflareModalOpen(false)}
        />
      )}

      {/* Bank Savings Interest & Loan Debt Breakdown Modal */}
      {isBankModalOpen && (
        <BankInterestAndLoanModal
          isOpen={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          project={project}
          onUpdateProject={setProject}
          financials={financials}
        />
      )}

      {/* Company Account Setup Modal */}
      {isCompanyModalOpen && (
        <CompanyAccountModal
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
          project={project}
          onUpdateProject={setProject}
        />
      )}
    </div>
  );
}
