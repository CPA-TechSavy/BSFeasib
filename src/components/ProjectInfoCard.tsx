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
