import { useState } from 'react';
import { FeasibilityProject, FeasibilityMetrics, YearFinancials } from '../types';
import {
  GraduationCap,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Check,
  Landmark,
} from 'lucide-react';
import { formatCurrency } from '../utils/financialCalculations';
import { useAuth } from '../context/AuthContext';

interface ProjectInfoCardProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  metrics: FeasibilityMetrics;
  financials: YearFinancials[];
  onOpenBankModal?: () => void;
  onOpenCompanyModal?: () => void;
}

export default function ProjectInfoCard({
  project,
  onUpdateProject,
  metrics,
  financials,
  onOpenBankModal,
  onOpenCompanyModal,
}: ProjectInfoCardProps) {
  const { user, setIsLoginModalOpen } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Check balance sheet integrity across all years
  const allBalanced = financials.every((f) => f.isBalanced);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-4 sm:mb-6 transition">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-100">
        <div className="min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={project.title}
              onChange={(e) => onUpdateProject({ ...project, title: e.target.value })}
              className="text-lg sm:text-2xl font-bold text-slate-900 w-full border-b-2 border-indigo-500 focus:outline-none pb-1 bg-slate-50/70 px-2 py-1 rounded-t-lg"
              placeholder="Feasibility Study Title"
            />
          ) : (
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 break-words sm:truncate">
              {project.title}
            </h1>
          )}

          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-2 sm:mt-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              {isEditing ? (
                <input
                  type="text"
                  value={project.proponents}
                  onChange={(e) => onUpdateProject({ ...project, proponents: e.target.value })}
                  className="border border-slate-300 rounded px-1.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  placeholder="Proponents / Authors"
                />
              ) : (
                <span>{project.proponents}</span>
              )}
            </span>

            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {isEditing ? (
                <input
                  type="text"
                  value={project.academicProgram}
                  onChange={(e) => onUpdateProject({ ...project, academicProgram: e.target.value })}
                  className="border border-slate-300 rounded px-1.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  placeholder="Degree Program"
                />
              ) : (
                <span>{project.academicProgram}</span>
              )}
            </span>

            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {isEditing ? (
                <input
                  type="text"
                  value={project.institution}
                  onChange={(e) => onUpdateProject({ ...project, institution: e.target.value })}
                  className="border border-slate-300 rounded px-1.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  placeholder="University / College"
                />
              ) : (
                <span>{project.institution} ({project.academicYear})</span>
              )}
            </span>
          </div>
        </div>

        {/* Action button & Balancing Pill */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
          {/* Google Auth Status Pill */}
          {user ? (
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              title={`Logged in with Google as ${user.email}`}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[160px]">
                {user.displayName || user.email}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              title="Sign in with your Google Account only"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
              <span>Google Login</span>
            </button>
          )}

          {!allBalanced && (
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>BS Discrepancy</span>
            </span>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 sm:px-3.5 py-1.5 sm:py-1 rounded-lg text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition cursor-pointer min-h-[38px] sm:min-h-0"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Done
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                Edit Details
              </>
            )}
          </button>
        </div>
      </div>

      {/* Company Account Profile Ribbon */}
      {project.companyAccount ? (
        <div className="mt-3.5 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/70 via-slate-50 to-emerald-50/60 border border-indigo-100/90 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-indigo-100/80">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                {project.companyAccount.entityName}
              </span>
              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200">
                {project.companyAccount.classification}
              </span>
            </div>

            {onOpenCompanyModal && (
              <button
                type="button"
                onClick={onOpenCompanyModal}
                className="px-2.5 py-1.5 sm:py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-200 transition shadow-2xs flex items-center gap-1 cursor-pointer min-h-[36px] sm:min-h-0"
              >
                <Edit3 className="w-3 h-3 text-indigo-600" />
                <span>Configure Account</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-2 pt-2 text-slate-600">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Nature of Operations:
              </span>
              <span className="font-medium text-slate-800 line-clamp-1">
                {project.companyAccount.natureOfCompany || 'Not specified'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Capital & Equity Structure:
              </span>
              <span className="font-medium text-slate-800 font-financial text-xs">
                {project.companyAccount.classification === 'Sole Proprietorship' &&
                  `Owner's Capital: ${formatCurrency(project.companyAccount.soleProprietorship?.ownerCapital || project.financing.equityContribution, project.currency)}`}
                {project.companyAccount.classification === 'Partnership' &&
                  `Partners' Equity: ${formatCurrency(project.companyAccount.partnership?.totalPartnersCapital || project.financing.equityContribution, project.currency)} (${project.companyAccount.partnership?.partners.length || 0} partners)`}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Mandate / Business Purpose:
              </span>
              <span className="font-normal text-slate-700 line-clamp-1 italic" title={project.companyAccount.purposeOfEntity}>
                "{project.companyAccount.purposeOfEntity || '–'}"
              </span>
            </div>
          </div>
        </div>
      ) : (
        onOpenCompanyModal && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Company Account:</strong> Define entity name, legal classification (Sole Proprietorship or Partnership), and initial equity structure.
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenCompanyModal}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-2xs shrink-0 cursor-pointer w-full sm:w-auto text-center min-h-[38px] sm:min-h-0 flex items-center justify-center"
            >
              Add Company Account
            </button>
          </div>
        )
      )}
    </section>
  );
}
