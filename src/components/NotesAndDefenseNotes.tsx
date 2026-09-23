import { useState, useEffect } from 'react';
import {
  FeasibilityProject,
  FeasibilityMetrics,
  YearFinancials,
  CurrencySymbol,
  EntityClassification,
  CompanyAccount,
} from '../types';
import {
  BookOpen,
  HelpCircle,
  Edit3,
  Check,
  Building2,
  Scale,
  ShieldCheck,
  Coins,
  Layers,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Landmark,
  UserCheck,
  FileText,
  Users,
  User,
  Briefcase,
  Factory,
  Receipt,
  DollarSign,
  ArrowUpRight,
  Tag,
  Percent,
  Sparkles,
  AlertCircle,
  Package,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/financialCalculations';
import PdfDownloadButton from './PdfDownloadButton';

interface NotesAndDefenseNotesProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  metrics: FeasibilityMetrics;
  financials?: YearFinancials[];
}

export default function NotesAndDefenseNotes({
  project,
  onUpdateProject,
  metrics,
  financials = [],
}: NotesAndDefenseNotesProps) {
  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'defense'>('notes');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(project.academicNotes || '');

  const c = project.currency;
  const years5 = financials && financials.length > 1 ? financials.slice(1) : [];
  const wcPolicy = project.workingCapitalPolicy || project.workingCapital;

  const handleSaveNotes = () => {
    onUpdateProject({ ...project, academicNotes: notesText });
    setIsEditingNotes(false);
  };

  // Note 1.1 Edit State & Handlers
  const [isEditing1_1, setIsEditing1_1] = useState(false);
  const [draftEntityName, setDraftEntityName] = useState(
    project.companyAccount?.entityName || project.title || ''
  );
  const [draftClassification, setDraftClassification] = useState<EntityClassification>(
    project.companyAccount?.classification || 'Sole Proprietorship'
  );
  const [draftNature, setDraftNature] = useState(
    project.companyAccount?.natureOfCompany ||
      'Manufacturing (Transformation of raw materials into finished products)'
  );
  const [draftDateEstablished, setDraftDateEstablished] = useState(
    project.companyAccount?.dateEstablished || 'Year 0 (Pre-Operating Period)'
  );
  const [draftCurrency, setDraftCurrency] = useState<CurrencySymbol>(
    project.currency || '₱'
  );

  // Note 1.2 Edit State & Handlers
  const [isEditing1_2, setIsEditing1_2] = useState(false);
  const [draftProponents, setDraftProponents] = useState(project.proponents || '');
  const [draftProgram, setDraftProgram] = useState(project.academicProgram || '');
  const [draftInstitution, setDraftInstitution] = useState(project.institution || '');
  const [draftAcademicYear, setDraftAcademicYear] = useState(project.academicYear || '');
  const [draftResearchClass, setDraftResearchClass] = useState(
    project.researchClassification || 'Undergraduate Feasibility Study & Business Plan'
  );

  useEffect(() => {
    if (!isEditing1_1) {
      setDraftEntityName(project.companyAccount?.entityName || project.title || '');
      setDraftClassification(
        project.companyAccount?.classification || 'Sole Proprietorship'
      );
      setDraftNature(
        project.companyAccount?.natureOfCompany ||
          'Manufacturing (Transformation of raw materials into finished products)'
      );
      setDraftDateEstablished(
        project.companyAccount?.dateEstablished || 'Year 0 (Pre-Operating Period)'
      );
      setDraftCurrency(project.currency || '₱');
    }
  }, [project.companyAccount, project.title, project.currency, isEditing1_1]);

  useEffect(() => {
    if (!isEditing1_2) {
      setDraftProponents(project.proponents || '');
      setDraftProgram(project.academicProgram || '');
      setDraftInstitution(project.institution || '');
      setDraftAcademicYear(project.academicYear || '');
      setDraftResearchClass(
        project.researchClassification || 'Undergraduate Feasibility Study & Business Plan'
      );
    }
  }, [
    project.proponents,
    project.academicProgram,
    project.institution,
    project.academicYear,
    project.researchClassification,
    isEditing1_2,
  ]);

  const handleSave1_1 = () => {
    const existingCompany = project.companyAccount;
    const updatedCompany: CompanyAccount = {
      entityName: draftEntityName.trim() || project.title,
      classification: draftClassification,
      natureOfCompany: draftNature.trim(),
      purposeOfEntity:
        existingCompany?.purposeOfEntity ||
        'Engaged in the development, production, and commercial marketing of high-quality goods designed to cater to target market demand efficiently and profitably.',
      dateEstablished: draftDateEstablished.trim(),
      soleProprietorship: existingCompany?.soleProprietorship,
      partnership: existingCompany?.partnership,
      corporation: existingCompany?.corporation,
    };
    onUpdateProject({
      ...project,
      title: draftEntityName.trim() || project.title,
      currency: draftCurrency,
      companyAccount: updatedCompany,
    });
    setIsEditing1_1(false);
  };

  const handleCancel1_1 = () => {
    setDraftEntityName(project.companyAccount?.entityName || project.title || '');
    setDraftClassification(
      project.companyAccount?.classification || 'Sole Proprietorship'
    );
    setDraftNature(
      project.companyAccount?.natureOfCompany ||
        'Manufacturing, Merchandising & Commercial Production'
    );
    setDraftDateEstablished(
      project.companyAccount?.dateEstablished || 'Year 0 (Pre-Operating Period)'
    );
    setDraftCurrency(project.currency || '₱');
    setIsEditing1_1(false);
  };

  const handleSave1_2 = () => {
    onUpdateProject({
      ...project,
      proponents: draftProponents.trim(),
      academicProgram: draftProgram.trim(),
      institution: draftInstitution.trim(),
      academicYear: draftAcademicYear.trim(),
      researchClassification: draftResearchClass.trim(),
    });
    setIsEditing1_2(false);
  };

  const handleCancel1_2 = () => {
    setDraftProponents(project.proponents || '');
    setDraftProgram(project.academicProgram || '');
    setDraftInstitution(project.institution || '');
    setDraftAcademicYear(project.academicYear || '');
    setDraftResearchClass(
      project.researchClassification || 'Undergraduate Feasibility Study & Business Plan'
    );
    setIsEditing1_2(false);
  };

  // Calculations for Note 4: Initial Capital Investment
  const preOpTotal = (project.preOperatingExpenses || []).reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  const ppeTotal = (project.fixedAssets || []).reduce(
    (sum, item) => sum + (item.cost || 0),
    0
  );
  const initialWorkingCapital = project.initialWorkingCapitalBuffer || 0;
  const totalProjectCapital = preOpTotal + ppeTotal + initialWorkingCapital;

  const equityAmount = project.financing?.equityContribution || 0;
  const loanAmount = project.financing?.bankLoanAmount || 0;
  const equitySharePercent =
    totalProjectCapital > 0 ? (equityAmount / totalProjectCapital) * 100 : 0;
  const loanSharePercent =
    totalProjectCapital > 0 ? (loanAmount / totalProjectCapital) * 100 : 0;

  // Company details
  const company = project.companyAccount;
  const entityName = company?.entityName || project.title;
  const legalForm = company?.classification || 'Sole Proprietorship';
  const natureOfBusiness =
    company?.natureOfCompany || 'Manufacturing (Transformation of raw materials into finished products)';
  const businessPurpose =
    company?.purposeOfEntity ||
    `Engaged in the development, production, and commercial marketing of high-quality goods designed to cater to target market demand efficiently and profitably.`;

  return (
    <div className="space-y-6 mb-12">
      {/* Top Header & Mode Toggle Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Notes to Financial Statements
              </h2>
              <p className="text-xs text-slate-500">
                Standard PFRS Disclosures, Accounting Policies, Schedules (Notes 1–7) & Defense Talking Points
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveSubTab('notes')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeSubTab === 'notes'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Standard Notes to FS (PFRS)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('defense')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeSubTab === 'defense'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Panel Defense Guide & Q&A</span>
            </button>
          </div>

          <PdfDownloadButton
            targetId="notes-to-fs-document"
            title="Notes to Projected Financial Statements"
            subtitle={`${entityName} • PFRS for Small Entities Disclosures (Notes 1 to 7)`}
            projectTitle={project.title}
            buttonText="Download Notes PDF (A4)"
            size="sm"
            variant="indigo"
            format="a4"
            orientation="portrait"
          />
        </div>
      </div>

      {/* QUICK JUMP NAVIGATION (Notes View Only, Screen Only) */}
      {activeSubTab === 'notes' && (
        <div className="no-print bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex items-center gap-2 overflow-x-auto text-xs text-slate-600">
          <span className="font-semibold text-slate-500 shrink-0 px-1 text-[11px] uppercase tracking-wider">
            Quick Jump:
          </span>
          <a
            href="#note-1"
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0"
          >
            Note 1: Corporate Info
          </a>
          <a
            href="#note-2"
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0"
          >
            Note 2: Basis of Prep
          </a>
          <a
            href="#note-3"
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0"
          >
            Note 3: Accounting Policies
          </a>
          <a
            href="#note-4"
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0"
          >
            Note 4: Capital & Financing
          </a>
          <a
            href="#note-5"
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0"
          >
            Note 5: 5-Year Schedules
          </a>
          <a
            href="#note-6"
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0"
          >
            Note 6: Risk Management
          </a>
          <a
            href="#note-7"
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0"
          >
            Note 7: Authorization & Approval
          </a>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STANDARD NOTES TO FINANCIAL STATEMENTS (FULL FORMAL DISCLOSURE)        */}
      {/* ========================================================================= */}
      {(activeSubTab === 'notes' || true) && (
        <div
          id="notes-to-fs-document"
          className={`${activeSubTab !== 'notes' ? 'hidden print:block' : ''} space-y-6`}
        >
          {/* Formal Academic & Professional Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="text-center pb-6 border-b border-slate-200">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[11px] uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PFRS for Small Entities & SMEs Compliant
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif-title uppercase text-slate-900 tracking-tight">
                {entityName}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                {project.academicProgram} • {project.institution}
              </p>
              <p className="text-xs text-slate-500 italic mt-0.5">
                Proponents: {project.proponents} ({project.academicYear})
              </p>
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 mt-3 pt-3 border-t border-slate-100">
                NOTES TO PROJECTED FINANCIAL STATEMENTS
              </h2>
              <p className="text-[11px] text-slate-500">
                For the 5-Year Planning Horizon: Years 1 through 5 (Amounts in {project.currency}, Philippine Currency)
              </p>
            </div>

            {/* Custom Notes / Specific Academic Adviser Instructions Edit Box */}
            <div className="mt-5 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  Custom Feasibility Notes & Specific Academic Disclosures:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingNotes) handleSaveNotes();
                    else setIsEditingNotes(true);
                  }}
                  className="no-print text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition"
                >
                  {isEditingNotes ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" /> Edit Custom Notes
                    </>
                  )}
                </button>
              </div>

              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Enter any specific accounting assumptions, school adviser guidelines, regulatory permits, or custom project disclosures here..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed text-slate-800 font-sans"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                    >
                      Save Custom Notes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic leading-relaxed bg-white p-3 rounded-lg border border-slate-200/70">
                  "{project.academicNotes || 'No custom academic disclosures added. Click "Edit Custom Notes" above to add project-specific defense remarks or thesis adviser instructions.'}"
                </p>
              )}
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* NOTE 1: CORPORATE INFORMATION & OPERATIONAL BASIS                  */}
            {/* ------------------------------------------------------------------- */}
            <div id="note-1" className="mt-8 pt-6 border-t border-slate-200 space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Note 1 — Corporate Information & General Operational Basis
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Note 1.1: Entity Profile & Legal Structure */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                          Table 1.1 — Entity Profile & Legal Structure
                        </span>
                      </div>
                      <div className="no-print flex items-center gap-1.5">
                        {isEditing1_1 ? (
                          <>
                            <button
                              type="button"
                              onClick={handleCancel1_1}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSave1_1}
                              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition cursor-pointer shadow-2xs"
                            >
                              <Check className="w-3 h-3" /> Save 1.1
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsEditing1_1(true)}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 flex items-center gap-1 transition cursor-pointer shadow-2xs"
                            title="Edit Note 1.1 Information"
                          >
                            <Edit3 className="w-3 h-3 text-indigo-600" /> Edit 1.1
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing1_1 ? (
                      <div className="space-y-2.5 py-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Business / Entity Name
                          </label>
                          <input
                            type="text"
                            value={draftEntityName}
                            onChange={(e) => setDraftEntityName(e.target.value)}
                            placeholder="e.g. EcoBrew Cafe"
                            className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Form of Organization
                            </label>
                            <select
                              value={draftClassification}
                              onChange={(e) =>
                                setDraftClassification(e.target.value as EntityClassification)
                              }
                              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                            >
                              <option value="Sole Proprietorship">Sole Proprietorship</option>
                              <option value="Partnership">Partnership</option>
                              <option value="Corporation">Corporation</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Operating Currency
                            </label>
                            <select
                              value={draftCurrency}
                              onChange={(e) =>
                                setDraftCurrency(e.target.value as CurrencySymbol)
                              }
                              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                            >
                              <option value="₱">₱ (PHP - Philippine Peso)</option>
                              <option value="$">$ (USD - US Dollar)</option>
                              <option value="€">€ (EUR - Euro)</option>
                              <option value="£">£ (GBP - British Pound)</option>
                              <option value="¥">¥ (JPY - Japanese Yen)</option>
                              <option value="₹">₹ (INR - Indian Rupee)</option>
                              <option value="S$">S$ (SGD - Singapore Dollar)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Nature of Business
                          </label>
                          <input
                            type="text"
                            value={draftNature}
                            onChange={(e) => setDraftNature(e.target.value)}
                            placeholder="e.g. Manufacturing, Merchandising & Commercial Production"
                            className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Study Inception / Date Established
                          </label>
                          <input
                            type="text"
                            value={draftDateEstablished}
                            onChange={(e) => setDraftDateEstablished(e.target.value)}
                            placeholder="e.g. Year 0 (Pre-Operating Period)"
                            className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-xs text-left bg-white">
                          <thead className="bg-slate-100/90 text-slate-600 font-bold text-[10px] uppercase border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3 w-5/12">Corporate Parameter</th>
                              <th className="py-2 px-3">Disclosure Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-600">Business / Entity Name</td>
                              <td className="py-2 px-3 font-bold text-slate-900">{entityName}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-600">Form of Organization</td>
                              <td className="py-2 px-3 font-semibold text-indigo-900">{legalForm}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-600">Nature of Business</td>
                              <td className="py-2 px-3 text-slate-800">{natureOfBusiness}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-600">Study Inception / Date</td>
                              <td className="py-2 px-3 text-slate-700">
                                {company?.dateEstablished || 'Year 0 (Pre-Operating Period)'}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-600">Operating Currency</td>
                              <td className="py-2 px-3 font-medium text-slate-900">
                                Philippine Peso ({project.currency})
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Note 1.2: Academic Proponents & Institution */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                          Table 1.2 — Academic Proponents & Institution
                        </span>
                      </div>
                      <div className="no-print flex items-center gap-1.5">
                        {isEditing1_2 ? (
                          <>
                            <button
                              type="button"
                              onClick={handleCancel1_2}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSave1_2}
                              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition cursor-pointer shadow-2xs"
                            >
                              <Check className="w-3 h-3" /> Save 1.2
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsEditing1_2(true)}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 flex items-center gap-1 transition cursor-pointer shadow-2xs"
                            title="Edit Note 1.2 Information"
                          >
                            <Edit3 className="w-3 h-3 text-indigo-600" /> Edit 1.2
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing1_2 ? (
                      <div className="space-y-2.5 py-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Lead Proponents / Authors
                          </label>
                          <input
                            type="text"
                            value={draftProponents}
                            onChange={(e) => setDraftProponents(e.target.value)}
                            placeholder="e.g. Juan Dela Cruz, Maria Santos, Pedro Reyes"
                            className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Academic Degree Program
                          </label>
                          <input
                            type="text"
                            value={draftProgram}
                            onChange={(e) => setDraftProgram(e.target.value)}
                            placeholder="e.g. BS in Accountancy / BSBA Financial Management"
                            className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Higher Education Institution / College
                          </label>
                          <input
                            type="text"
                            value={draftInstitution}
                            onChange={(e) => setDraftInstitution(e.target.value)}
                            placeholder="e.g. University of the Philippines Diliman"
                            className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Academic School Year
                            </label>
                            <input
                              type="text"
                              value={draftAcademicYear}
                              onChange={(e) => setDraftAcademicYear(e.target.value)}
                              placeholder="e.g. A.Y. 2025–2026"
                              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Research Classification
                            </label>
                            <input
                              type="text"
                              value={draftResearchClass}
                              onChange={(e) => setDraftResearchClass(e.target.value)}
                              placeholder="e.g. Undergraduate Feasibility Study & Business Plan"
                              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-xs text-left bg-white">
                          <thead className="bg-slate-100/90 text-slate-600 font-bold text-[10px] uppercase border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3 w-5/12">Academic Parameter</th>
                              <th className="py-2 px-3">Proponents & Institution Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-600">Lead Proponents</td>
                              <td className="py-2 px-3 font-bold text-slate-900">{project.proponents}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-600">Academic Degree Program</td>
                              <td className="py-2 px-3 text-slate-800">{project.academicProgram}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-600">Institution / College</td>
                              <td className="py-2 px-3 font-medium text-slate-900">{project.institution}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-600">Academic Year</td>
                              <td className="py-2 px-3 text-slate-700">{project.academicYear}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-600">Research Classification</td>
                              <td className="py-2 px-3 text-slate-700">
                                {project.researchClassification ||
                                  'Undergraduate Feasibility Study & Business Plan'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Structure & Ownership Details */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  1.3 Ownership Structure & Legal Capitalization Details ({legalForm})
                </span>

                {legalForm === 'Sole Proprietorship' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Registered Proprietor</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {company?.soleProprietorship?.ownerName || project.proponents.split(',')[0].trim() || 'Principal Owner'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Registered Initial Capital</span>
                      <span className="font-bold text-indigo-900 text-xs font-financial">
                        {formatCurrency(company?.soleProprietorship?.ownerCapital || equityAmount, c)}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Target Annual Drawings</span>
                      <span className="font-bold text-slate-800 text-xs font-financial">
                        {company?.soleProprietorship?.drawingsAnnual ? formatCurrency(company.soleProprietorship.drawingsAnnual, c) : `${project.dividendPayoutPercent}% of Net Income`}
                      </span>
                    </div>
                  </div>
                )}

                {legalForm === 'Partnership' && (
                  <div className="space-y-2 pt-1">
                    <div className="overflow-x-auto border border-slate-200 rounded-lg scrollbar-thin">
                      <table className="w-full min-w-[460px] text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                          <tr>
                            <th className="py-2 px-3">Partner Name</th>
                            <th className="py-2 px-3 text-right">Agreed Capital Contribution ({c})</th>
                            <th className="py-2 px-3 text-right">Profit / Loss Share (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-financial">
                          {(company?.partnership?.partners && company.partnership.partners.length > 0) ? (
                            company.partnership.partners.map((p, idx) => (
                              <tr key={p.id || idx}>
                                <td className="py-2 px-3 font-sans font-medium text-slate-800">{p.name || `Partner ${idx + 1}`}</td>
                                <td className="py-2 px-3 text-right text-slate-700">{formatCurrency(p.capitalContribution || 0, c)}</td>
                                <td className="py-2 px-3 text-right text-indigo-900 font-semibold">{p.profitSharePercent || 0}%</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="py-2 px-3 font-sans font-medium text-slate-800">{project.proponents}</td>
                              <td className="py-2 px-3 text-right text-slate-700">{formatCurrency(equityAmount, c)}</td>
                              <td className="py-2 px-3 text-right text-indigo-900 font-semibold">100.0%</td>
                            </tr>
                          )}
                          <tr className="bg-slate-50 font-bold border-t border-slate-200">
                            <td className="py-2 px-3 font-sans">Total Partners' Capital</td>
                            <td className="py-2 px-3 text-right text-indigo-950">
                              {formatCurrency(company?.partnership?.totalPartnersCapital || equityAmount, c)}
                            </td>
                            <td className="py-2 px-3 text-right text-indigo-950">100.0%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {company?.partnership?.partnershipAgreementSummary && (
                      <p className="text-[11px] text-slate-600 italic">
                        <strong>Agreement Summary:</strong> {company.partnership.partnershipAgreementSummary}
                      </p>
                    )}
                  </div>
                )}

                {legalForm === 'Corporation' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Authorized Capital</span>
                      <span className="font-bold text-slate-900 font-financial">
                        {formatCurrency(company?.corporation?.authorizedCapital || (equityAmount * 2) || 1000000, c)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Par Value per Share</span>
                      <span className="font-bold text-slate-900 font-financial">
                        {formatCurrency(company?.corporation?.parValuePerShare || 100, c)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Subscribed Capital</span>
                      <span className="font-bold text-slate-900 font-financial">
                        {formatCurrency(company?.corporation?.subscribedCapital || equityAmount, c)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Paid-Up Capital</span>
                      <span className="font-bold text-indigo-900 font-financial">
                        {formatCurrency(company?.corporation?.paidUpCapital || equityAmount, c)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p>
                  <strong>1.4 Principal Business Purpose & Operational Scope:</strong> {businessPurpose} The
                  enterprise is established to capitalize on market opportunities within its target geographical territory,
                  delivering value to customers while generating a sustainable financial return for its equity holders.
                </p>
                <p>
                  <strong>1.5 5-Year Planning Horizon & Going Concern Assumption:</strong> The accompanying projected
                  financial statements encompass a five-year operating horizon (Years 1 to 5) following a pre-operating
                  setup period (Year 0). The projected financial statements have been prepared on a{' '}
                  <span className="font-semibold text-slate-900">going concern assumption</span>, which contemplates the
                  realization of assets and the satisfaction of liabilities in the normal course of commercial operations.
                </p>
                <p>
                  <strong>1.6 Authorization of Financial Projections:</strong> The projected financial statements were
                  formulated by the academic proponents under the supervision of the faculty feasibility study adviser
                  and officially authorized for undergraduate thesis defense and academic submission on the designated defense date.
                </p>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* NOTE 2: BASIS OF PREPARATION & STATEMENT OF COMPLIANCE             */}
            {/* ------------------------------------------------------------------- */}
            <div id="note-2" className="mt-8 pt-6 border-t border-slate-200 space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Note 2 — Basis of Preparation & Crucial Forecasting Assumptions
                </h3>
              </div>

              <p>
                <strong>2.1 Statement of Compliance:</strong> The projected financial statements have been prepared in
                accordance with the <em>Philippine Financial Reporting Standard for Small Entities (PFRS for Small Entities)</em>{' '}
                and the <em>Philippine Financial Reporting Standard for Medium-sized Entities (PFRS for SMEs)</em>,
                incorporating relevant standards from the Philippine Institute of Certified Public Accountants (PICPA) and
                Board of Accountancy (BOA) guidelines for feasibility forecasting.
              </p>

              <p>
                <strong>2.2 Measurement Basis & Accrual Accounting:</strong> The projected financial statements are
                prepared under the historical cost convention. The accrual basis of accounting is consistently applied in the
                preparation of the Statement of Comprehensive Income, Statement of Financial Position, and Statement of
                Changes in Equity. Revenues are recognized when earned and expenses are recognized when incurred, regardless of
                when cash is received or paid. The Statement of Cash Flows is presented using the direct/indirect method.
              </p>

              <p>
                <strong>2.3 Functional and Presentation Currency:</strong> Items included in the financial statements
                are measured using the currency of the primary economic environment in which the entity operates (the
                functional currency). The financial statements are presented in Philippine Peso ({project.currency}), which is the
                project's functional and presentation currency. All values are rounded to the nearest peso, unless otherwise
                indicated.
              </p>

              <p>
                <strong>2.4 Critical Accounting Estimates and Judgments:</strong> The preparation of financial projections
                in conformity with PFRS requires management to make judgments, estimates, and assumptions that affect the
                amounts reported in the financial statements. Although these estimates are based on historical industry
                benchmarks and market validation, actual future results may vary from these projections.
              </p>

              {/* 2.5 COMPREHENSIVE ESCALATION RATES & OPERATIONAL DRIVERS SCHEDULE */}
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      2.5 Comprehensive Escalation Rates & Operational Forecasting Drivers
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                      Coinciding Model Assumptions
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    To capture realistic macroeconomic dynamics, market expansion, and price adjustments over the 5-year study
                    horizon, the financial model incorporates specific, cross-verified escalation rates across revenue, materials,
                    labor, utilities, and general overhead:
                  </p>

                  {/* 2.5.1 Product Volume Escalation */}
                  <div className="space-y-1.5 bg-white p-3 rounded-lg border border-indigo-100">
                    <span className="font-bold text-slate-900 text-xs block">
                      A. Product Sales Volume Escalation & Revenue Trajectory
                    </span>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg scrollbar-thin">
                      <table className="w-full min-w-[520px] text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                          <tr>
                            <th className="py-2 px-3">Product Description</th>
                            <th className="py-2 px-2 text-right">Selling Price</th>
                            <th className="py-2 px-2 text-right">Year 1 Volume</th>
                            <th className="py-2 px-2 text-right">Annual Escalation</th>
                            <th className="py-2 px-2 text-right">Projected Year 5 Volume</th>
                            <th className="py-2 px-2 text-right">Yr 1 Gross Sales</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-financial">
                          {(project.products || []).map((prod) => {
                            const yr5Vol = Math.round(
                              (prod.year1Volume || 0) * Math.pow(1 + (prod.annualGrowthRate || 0) / 100, 4)
                            );
                            const yr1Sales = (prod.year1Volume || 0) * (prod.unitPrice || 0);
                            return (
                              <tr key={prod.id}>
                                <td className="py-1.5 px-3 font-sans text-slate-900 font-medium">{prod.name}</td>
                                <td className="py-1.5 px-2 text-right text-slate-700">{formatCurrency(prod.unitPrice, c)}</td>
                                <td className="py-1.5 px-2 text-right text-slate-700">{(prod.year1Volume || 0).toLocaleString()}</td>
                                <td className="py-1.5 px-2 text-right text-indigo-700 font-semibold">{prod.annualGrowthRate}% p.a.</td>
                                <td className="py-1.5 px-2 text-right text-indigo-900 font-semibold">{yr5Vol.toLocaleString()}</td>
                                <td className="py-1.5 px-2 text-right text-slate-900 font-bold">{formatCurrency(yr1Sales, c)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2.5.2 Cost, Labor & Overhead Escalation Rates Matrix */}
                  <div className="space-y-1.5 bg-white p-3 rounded-lg border border-indigo-100">
                    <span className="font-bold text-slate-900 text-xs block">
                      B. Direct Costs, Labor Wages & Factory Overhead Escalation Parameters
                    </span>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg scrollbar-thin">
                      <table className="w-full min-w-[500px] text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                          <tr>
                            <th className="py-2 px-3">Cost / Expense Category</th>
                            <th className="py-2 px-3">Escalation Basis / Policy</th>
                            <th className="py-2 px-3 text-right">Escalation Rate</th>
                            <th className="py-2 px-3 text-right">Effective Year</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">Direct Materials & Packaging</td>
                            <td className="py-2 px-3 text-slate-500">Compounded baseline raw material procurement inflation</td>
                            <td className="py-2 px-3 text-right font-financial text-indigo-900 font-semibold">{project.inflationRatePercent}% p.a.</td>
                            <td className="py-2 px-3 text-right font-financial">Year 2–5</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">Direct Labor Basic Wages</td>
                            <td className="py-2 px-3 text-slate-500">
                              Production worker wage escalation ({project.directLabor?.[0]?.annualSalaryIncreaseType || 'percentage'})
                            </td>
                            <td className="py-2 px-3 text-right font-financial text-indigo-900 font-semibold">
                              {project.directLabor?.[0]?.annualSalaryIncreaseType === 'amount'
                                ? `${formatCurrency(project.directLabor?.[0]?.annualSalaryIncreaseValue || 0, c)}/mo`
                                : `${project.directLabor?.[0]?.annualSalaryIncreaseValue || project.inflationRatePercent}% p.a.`}
                            </td>
                            <td className="py-2 px-3 text-right font-financial">
                              Year {project.directLabor?.[0]?.annualSalaryIncreaseStartYear || project.directLaborSalaryIncreaseStartYear || 2}
                            </td>
                          </tr>
                          {project.indirectLabor && project.indirectLabor.length > 0 && (
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-900">Indirect Labor Basic Wages</td>
                              <td className="py-2 px-3 text-slate-500">Plant supervisory & quality maintenance compensation</td>
                              <td className="py-2 px-3 text-right font-financial text-indigo-900 font-semibold">
                                {project.indirectLabor[0]?.annualSalaryIncreaseType === 'amount'
                                  ? `${formatCurrency(project.indirectLabor[0]?.annualSalaryIncreaseValue || 0, c)}/mo`
                                  : `${project.indirectLabor[0]?.annualSalaryIncreaseValue || project.inflationRatePercent}% p.a.`}
                              </td>
                              <td className="py-2 px-3 text-right font-financial">
                                Year {project.indirectLabor[0]?.annualSalaryIncreaseStartYear || project.indirectLaborSalaryIncreaseStartYear || 2}
                              </td>
                            </tr>
                          )}
                          {project.nonManufacturingLabor && project.nonManufacturingLabor.length > 0 && (
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-900">Non-Manufacturing (SG&A) Salaries</td>
                              <td className="py-2 px-3 text-slate-500">Administrative, accounting, and sales personnel pay</td>
                              <td className="py-2 px-3 text-right font-financial text-indigo-900 font-semibold">
                                {project.nonManufacturingLabor[0]?.annualSalaryIncreaseType === 'amount'
                                  ? `${formatCurrency(project.nonManufacturingLabor[0]?.annualSalaryIncreaseValue || 0, c)}/mo`
                                  : `${project.nonManufacturingLabor[0]?.annualSalaryIncreaseValue || project.inflationRatePercent}% p.a.`}
                              </td>
                              <td className="py-2 px-3 text-right font-financial">
                                Year {project.nonManufacturingLabor[0]?.annualSalaryIncreaseStartYear || project.nonManufacturingSalaryIncreaseStartYear || 2}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">Factory Overhead General Growth</td>
                            <td className="py-2 px-3 text-slate-500">General manufacturing supplies and indirect support expenses</td>
                            <td className="py-2 px-3 text-right font-financial text-indigo-900 font-semibold">{project.factoryOverheadGrowthRate}% p.a.</td>
                            <td className="py-2 px-3 text-right font-financial">Year 2–5</td>
                          </tr>
                          {project.productionUtilities && project.productionUtilities.length > 0 && (
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-900">Production Utilities (Power, Water, Gas)</td>
                              <td className="py-2 px-3 text-slate-500">
                                {project.productionUtilities.map((u) => `${u.name} (${u.annualGrowthRate}% p.a.)`).join(', ')}
                              </td>
                              <td className="py-2 px-3 text-right font-financial text-indigo-900 font-semibold">
                                {(
                                  project.productionUtilities.reduce((sum, u) => sum + (u.annualGrowthRate || 0), 0) /
                                  project.productionUtilities.length
                                ).toFixed(1)}% avg
                              </td>
                              <td className="py-2 px-3 text-right font-financial">Year 2–5</td>
                            </tr>
                          )}
                          {project.operatingExpenses && project.operatingExpenses.length > 0 && (
                            <tr>
                              <td className="py-2 px-3 font-semibold text-slate-900">Operating Expenses (SG&A Overhead)</td>
                              <td className="py-2 px-3 text-slate-500">Office supplies, marketing, permits, and professional fees</td>
                              <td className="py-2 px-3 text-right font-financial text-indigo-900 font-semibold">
                                {(
                                  project.operatingExpenses.reduce((sum, o) => sum + (o.annualGrowthRate || 0), 0) /
                                  project.operatingExpenses.length
                                ).toFixed(1)}% avg
                              </td>
                              <td className="py-2 px-3 text-right font-financial">Year 2–5</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2.5.3 Macro, Tax & Working Capital Parameter Matrix */}
                  <div className="space-y-1.5 bg-white p-3 rounded-lg border border-indigo-100">
                    <span className="font-bold text-slate-900 text-xs block">
                      C. Macroeconomic, Financing, Tax & Working Capital Policy Parameters
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Statutory Income Tax</span>
                        <span className="font-bold text-slate-900 font-financial">{project.taxRatePercent}%</span>
                        <span className="text-[10px] text-slate-500 block">CREATE Act standard</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Hurdle Discount Rate</span>
                        <span className="font-bold text-indigo-900 font-financial">{project.discountRatePercent}%</span>
                        <span className="text-[10px] text-slate-500 block">WACC baseline</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Commercial Loan Rate</span>
                        <span className="font-bold text-slate-900 font-financial">{project.financing?.annualInterestRate}% p.a.</span>
                        <span className="text-[10px] text-slate-500 block">{project.financing?.loanTermYears}-Year term</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Bank Deposit Rate</span>
                        <span className="font-bold text-emerald-800 font-financial">
                          {project.workingCapitalBufferDetails?.bankInterestRatePercent || 0.5}% p.a.
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {project.workingCapitalBufferDetails?.bankName || 'Depository Bank'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Dividend / Drawing Payout</span>
                        <span className="font-bold text-slate-900 font-financial">{project.dividendPayoutPercent}%</span>
                        <span className="text-[10px] text-slate-500 block">{100 - project.dividendPayoutPercent}% retained</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sales Discounts Rate</span>
                        <span className="font-bold text-rose-700 font-financial">{project.salesDiscountsPercent}%</span>
                        <span className="text-[10px] text-slate-500 block">Trade allowances</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Receivables Credit Terms</span>
                        <span className="font-bold text-slate-900 font-financial">
                          {wcPolicy?.accountsReceivablePercentOfSales}% of Sales
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ~{Math.round(((wcPolicy?.accountsReceivablePercentOfSales || 0) / 100) * 365)} days cycle
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Inventory Safety Buffer</span>
                        <span className="font-bold text-slate-900 font-financial">
                          {wcPolicy?.inventoryPercentOfCOGS}% of COGS
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ~{Math.round(((wcPolicy?.inventoryPercentOfCOGS || 0) / 100) * 365)} days buffer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* NOTE 3: SUMMARY OF SIGNIFICANT ACCOUNTING POLICIES                 */}
            {/* ------------------------------------------------------------------- */}
            <div id="note-3" className="mt-8 pt-6 border-t border-slate-200 space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Note 3 — Summary of Significant Accounting Policies
                </h3>
              </div>

              <div className="space-y-3.5">
                <p>
                  <strong>3.1 Cash and Cash Equivalents:</strong> Cash and cash equivalents include cash on hand (petty
                  cash fund for immediate small operating expenditures) and cash in bank (demand deposits/savings accounts
                  maintained with a local commercial bank). Cash in bank balances earn annual interest based on prevailing
                  commercial banking deposit rates ({project.workingCapitalBufferDetails?.bankInterestRatePercent || 0.5}% p.a.
                  at {project.workingCapitalBufferDetails?.bankName || 'Partner Commercial Bank'}), calculated dynamically on
                  average liquid bank funds.
                </p>

                <p>
                  <strong>3.2 Trade and Other Receivables:</strong> Trade receivables arising from sales on account are
                  recognized initially at the transaction price. The credit policy assumes that{' '}
                  <span className="font-semibold text-slate-900">
                    {wcPolicy?.accountsReceivablePercentOfSales || 0}%
                  </span>{' '}
                  of annual gross sales is extended on credit terms, collected within standard commercial billing cycles
                  (e.g., 30-day terms). Trade receivables are assessed annually for impairment; bad debts are recognized
                  when objective evidence indicates that the entity will not be able to collect all amounts due.
                </p>

                <p>
                  <strong>3.3 Inventories:</strong> Inventories comprise raw materials, ingredients, direct packaging
                  materials, and finished manufactured goods. Inventories are stated at the{' '}
                  <span className="font-semibold text-slate-900">lower of cost and net realizable value (NRV)</span>. Cost is
                  determined using the <span className="font-semibold text-slate-900">First-In, First-Out (FIFO)</span> formula.
                  The cost of finished goods comprises raw materials, direct labor, and a proportionate share of fixed and
                  variable factory overhead. A safety inventory buffer equal to{' '}
                  <span className="font-semibold text-slate-900">
                    {wcPolicy?.inventoryPercentOfCOGS || 0}% of Cost of Goods Sold
                  </span>{' '}
                  is maintained to guard against stockouts and supply disruptions.
                </p>

                <p>
                  <strong>3.4 Property, Plant and Equipment (PPE):</strong> Property, plant and equipment are stated at
                  historical cost less accumulated depreciation and accumulated impairment losses. Historical cost includes
                  expenditures directly attributable to the acquisition of the asset, including purchase price, import duties,
                  freight, delivery, and installation costs necessary to bring the asset into working condition for its intended
                  use. Subsequent costs are capitalized only when it is probable that future economic benefits associated with
                  the item will flow to the entity.
                </p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-800 mb-1">
                    Depreciation Method & Useful Lives:
                  </p>
                  <p className="text-slate-600">
                    Depreciation is computed using the{' '}
                    <span className="font-semibold text-slate-900">Straight-Line Method</span> over the estimated useful
                    lives of the respective assets, after deducting an estimated salvage value (typically 10% of acquisition cost):
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-600">
                    <li>Production Machinery & Processing Equipment: 5 to 10 years</li>
                    <li>Transportation & Delivery Equipment: 5 years</li>
                    <li>Leasehold Improvements: 5 years or lease term</li>
                    <li>Office Furniture & Fixtures: 5 years</li>
                  </ul>
                </div>

                <p>
                  <strong>3.5 Pre-Operating Expenses:</strong> Costs incurred during Year 0 prior to the commencement of
                  commercial operations (e.g., business name registration, DTI/SEC registration, BIR tax mapping, municipal
                  permits, sanitation and health clearances, brand identity design, and recipe/product test runs) are accounted
                  for as pre-operating capital requirements.
                </p>

                <p>
                  <strong>3.6 Trade Accounts Payable:</strong> Trade accounts payable are recognized when raw materials,
                  ingredients, or factory supplies are delivered. The working capital assumption maintains trade payables at{' '}
                  <span className="font-semibold text-slate-900">
                    {wcPolicy?.accountsPayablePercentOfPurchases || 0}%
                  </span>{' '}
                  of annual direct material purchases, settled within standard supplier trade terms (30 days).
                </p>

                <p>
                  <strong>3.7 Bank Loans, Borrowing Costs and Debt Classification:</strong> Bank borrowings are recognized
                  initially at the principal amount received. Principal repayments due within twelve (12) months from the
                  balance sheet date are classified under <span className="font-semibold text-slate-900">Current Liabilities</span>{' '}
                  as Current Portion of Long-Term Debt, while balances due beyond twelve months are classified under{' '}
                  <span className="font-semibold text-slate-900">Non-Current Liabilities</span>. Interest expense is recognized
                  in the income statement on an accrual basis using the contract loan rate ({project.financing?.annualInterestRate}% p.a.).
                </p>

                <p>
                  <strong>3.8 Equity, Retained Earnings and Drawings Policy:</strong> Paid-in equity represents initial
                  capital invested by the proponents. Annual net income is added to retained earnings. The study implements a{' '}
                  <span className="font-semibold text-slate-900">
                    {project.dividendPayoutPercent}% Dividend / Drawing Policy
                  </span>
                  , distributing a portion of annual net earnings to proponents while retaining{' '}
                  <span className="font-semibold text-slate-900">{100 - project.dividendPayoutPercent}%</span> as accumulated
                  retained earnings to support working capital liquidity and future operations.
                </p>

                <p>
                  <strong>3.9 Revenue Recognition (PFRS 15):</strong> Revenue from contracts with customers is recognized
                  upon delivery and acceptance of finished products by customers, at which point the performance obligation is
                  satisfied and control of the asset is transferred. Revenue is measured net of trade discounts, rebates, and
                  sales allowances ({wcPolicy?.discountsAndAllowancesPercent || project.salesDiscountsPercent || 0}%).
                </p>

                <p>
                  <strong>3.10 Cost of Goods Sold (COGS) & Statutory Benefits:</strong> Cost of goods sold reflects all direct
                  and indirect costs incurred in manufacturing finished inventory. Direct labor includes basic wages plus
                  mandatory Philippine statutory benefits:{' '}
                  <em>Social Security System (SSS)</em>, <em>Philippine Health Insurance Corporation (PhilHealth)</em>,{' '}
                  <em>Home Development Mutual Fund (Pag-IBIG)</em> employer contributions, and{' '}
                  <em>13th Month Pay</em> pursuant to Philippine Presidential Decree No. 851. Factory overhead includes indirect labor,
                  factory utilities (power, water, fuel), production supplies, maintenance, and factory machinery depreciation.
                </p>

                <p>
                  <strong>3.11 Operating Expenses (SG&A):</strong> General, administrative, and selling expenditures are
                  expensed in the period in which they are incurred. These include administrative personnel salaries, sales
                  commissions, marketing and advertising, office supplies, and non-manufacturing depreciation.
                </p>

                <p>
                  <strong>3.12 Provision for Income Taxes:</strong> Current corporate income tax is provided at the statutory
                  rate of <span className="font-semibold text-slate-900">{project.taxRatePercent}%</span> on taxable operating
                  profits, after deducting allowable manufacturing, administrative, and financing expense deductions in
                  compliance with the National Internal Revenue Code (NIRC) and the CREATE Act.
                </p>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* NOTE 4: CAPITAL OUTLAY & FINANCING STRUCTURE                       */}
            {/* ------------------------------------------------------------------- */}
            <div id="note-4" className="mt-8 pt-6 border-t border-slate-200 space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Note 4 — Pre-Operating Capital Outlay & Financing Structure
                </h3>
              </div>

              <p>
                The total initial capital outlay required to establish the venture prior to commercial launch in Year 1
                amounts to <span className="font-bold text-slate-900">{formatCurrency(totalProjectCapital, c)}</span>.
                This encompasses pre-operating registration and preparation costs, initial acquisition of property, plant,
                and equipment, and the initial working capital cash reserve:
              </p>

              {/* 4.1 Summary of Initial Capital Requirements */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-900 text-xs block">
                  4.1 Summary of Initial Capital Requirements (Year 0)
                </span>
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[520px] text-xs text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Capital Outlay Component</th>
                        <th className="py-2.5 px-3">Description / Accounting Treatment</th>
                        <th className="py-2.5 px-3 text-right">Amount ({c})</th>
                        <th className="py-2.5 px-3 text-right">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">Pre-Operating Organization Expenses</td>
                        <td className="py-2 px-3 text-slate-500">
                          Permits, DTI/SEC registration, health/sanitary, recipe development & test runs
                        </td>
                        <td className="py-2 px-3 text-right font-financial">{formatCurrency(preOpTotal, c)}</td>
                        <td className="py-2 px-3 text-right font-financial">
                          {totalProjectCapital > 0 ? ((preOpTotal / totalProjectCapital) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">Property, Plant and Equipment (PPE)</td>
                        <td className="py-2 px-3 text-slate-500">
                          Production machinery, delivery vehicle, leasehold improvements, and furniture
                        </td>
                        <td className="py-2 px-3 text-right font-financial">{formatCurrency(ppeTotal, c)}</td>
                        <td className="py-2 px-3 text-right font-financial">
                          {totalProjectCapital > 0 ? ((ppeTotal / totalProjectCapital) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">Initial Working Capital Buffer</td>
                        <td className="py-2 px-3 text-slate-500">
                          Cash on Hand ({formatCurrency(project.workingCapitalBufferDetails?.cashOnHand || 0, c)}) + Cash in Bank ({formatCurrency(project.workingCapitalBufferDetails?.cashInBank || 0, c)})
                        </td>
                        <td className="py-2 px-3 text-right font-financial">{formatCurrency(initialWorkingCapital, c)}</td>
                        <td className="py-2 px-3 text-right font-financial">
                          {totalProjectCapital > 0 ? ((initialWorkingCapital / totalProjectCapital) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                      <tr className="bg-indigo-50/60 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td className="py-2.5 px-3 uppercase tracking-wide">Total Project Capital Requirement</td>
                        <td className="py-2.5 px-3 text-indigo-700 text-[11px]">Total Initial Year 0 Investment</td>
                        <td className="py-2.5 px-3 text-right font-financial text-indigo-900">
                          {formatCurrency(totalProjectCapital, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-indigo-900">100.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4.2 Itemized Pre-Operating Expenses Schedule */}
              <div className="space-y-1.5 pt-2">
                <span className="font-bold text-slate-900 text-xs block">
                  4.2 Itemized Pre-Operating Expenses Breakdown
                </span>
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[500px] text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Expense Item Description</th>
                        <th className="py-2 px-3">Category / Nature</th>
                        <th className="py-2 px-3 text-right">Cost Amount ({c})</th>
                        <th className="py-2 px-3 text-right">% of Pre-Op</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-financial">
                      {(project.preOperatingExpenses || []).map((item) => (
                        <tr key={item.id}>
                          <td className="py-1.5 px-3 font-sans font-medium text-slate-800">{item.name}</td>
                          <td className="py-1.5 px-3 font-sans text-slate-500">Organization & Launch Expense</td>
                          <td className="py-1.5 px-3 text-right text-slate-700">{formatCurrency(item.amount, c)}</td>
                          <td className="py-1.5 px-3 text-right text-indigo-900 font-semibold">
                            {preOpTotal > 0 ? (((item.amount || 0) / preOpTotal) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold border-t border-slate-200">
                        <td className="py-2 px-3 font-sans" colSpan={2}>Total Pre-Operating Expenses</td>
                        <td className="py-2 px-3 text-right text-indigo-950">{formatCurrency(preOpTotal, c)}</td>
                        <td className="py-2 px-3 text-right text-indigo-950">100.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4.3 Itemized Property, Plant and Equipment (Fixed Assets) Schedule */}
              <div className="space-y-1.5 pt-2">
                <span className="font-bold text-slate-900 text-xs block">
                  4.3 Itemized Property, Plant and Equipment (PPE) Acquisition & Depreciation Schedule
                </span>
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[560px] text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Fixed Asset / Equipment</th>
                        <th className="py-2 px-2 text-right">Acquisition Cost ({c})</th>
                        <th className="py-2 px-2 text-right">Useful Life</th>
                        <th className="py-2 px-2 text-right">Salvage Value</th>
                        <th className="py-2 px-2 text-right">Annual Depr. ({c})</th>
                        <th className="py-2 px-2 text-right">% of PPE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-financial">
                      {(project.fixedAssets || []).map((asset) => {
                        const annualDepr =
                          (asset.usefulLifeYears || 5) > 0
                            ? ((asset.cost || 0) - (asset.salvageValue || 0)) / (asset.usefulLifeYears || 5)
                            : 0;
                        return (
                          <tr key={asset.id}>
                            <td className="py-1.5 px-3 font-sans font-medium text-slate-800">{asset.name}</td>
                            <td className="py-1.5 px-2 text-right text-slate-700">{formatCurrency(asset.cost, c)}</td>
                            <td className="py-1.5 px-2 text-right text-slate-600">{asset.usefulLifeYears} yrs</td>
                            <td className="py-1.5 px-2 text-right text-slate-500">{formatCurrency(asset.salvageValue, c)}</td>
                            <td className="py-1.5 px-2 text-right text-indigo-700 font-semibold">{formatCurrency(annualDepr, c)}</td>
                            <td className="py-1.5 px-2 text-right text-indigo-900 font-semibold">
                              {ppeTotal > 0 ? (((asset.cost || 0) / ppeTotal) * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50 font-bold border-t border-slate-200">
                        <td className="py-2 px-3 font-sans">Total Property, Plant and Equipment</td>
                        <td className="py-2 px-2 text-right text-indigo-950">{formatCurrency(ppeTotal, c)}</td>
                        <td className="py-2 px-2 text-right font-sans text-slate-500">-</td>
                        <td className="py-2 px-2 text-right font-sans text-slate-500">-</td>
                        <td className="py-2 px-2 text-right text-indigo-950">
                          {formatCurrency(
                            (project.fixedAssets || []).reduce(
                              (sum, a) =>
                                sum +
                                ((a.usefulLifeYears || 5) > 0
                                  ? ((a.cost || 0) - (a.salvageValue || 0)) / (a.usefulLifeYears || 5)
                                  : 0),
                              0
                            ),
                            c
                          )}
                        </td>
                        <td className="py-2 px-2 text-right text-indigo-950">100.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4.4 Working Capital Buffer Cash Allocation */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  4.4 Initial Working Capital Buffer & Depository Banking Allocation
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Cash on Hand (Petty Fund)</span>
                    <span className="font-bold text-slate-900 font-financial">
                      {formatCurrency(project.workingCapitalBufferDetails?.cashOnHand || 0, c)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Immediate operating disbursements</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Cash in Depository Bank</span>
                    <span className="font-bold text-indigo-900 font-financial">
                      {formatCurrency(project.workingCapitalBufferDetails?.cashInBank || 0, c)}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {project.workingCapitalBufferDetails?.bankName || 'Commercial Bank'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Deposit Savings Rate</span>
                    <span className="font-bold text-emerald-800 font-financial">
                      {project.workingCapitalBufferDetails?.bankInterestRatePercent || 0.5}% p.a.
                    </span>
                    <span className="text-[10px] text-slate-500 block">Annual interest yield on bank balance</span>
                  </div>
                </div>
              </div>

              {/* 4.5 Financing Structure Breakdown */}
              <div className="space-y-1.5 pt-2">
                <span className="font-bold text-slate-900 text-xs block">
                  4.5 Financing Sources Breakdown & Commercial Bank Debt Terms
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-2">
                      Financing Sources Breakdown
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span>Proponents' Equity Contribution:</span>
                        <span className="font-bold text-slate-900 font-financial">
                          {formatCurrency(equityAmount, c)} ({equitySharePercent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span>Commercial Bank Loan Financing:</span>
                        <span className="font-bold text-slate-900 font-financial">
                          {formatCurrency(loanAmount, c)} ({loanSharePercent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 font-bold text-slate-900">
                        <span>Total Project Financing:</span>
                        <span className="font-financial text-indigo-900">{formatCurrency(totalProjectCapital, c)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-2">
                      Commercial Bank Loan Terms
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <p>
                        <strong>Loan Principal Borrowed:</strong> {formatCurrency(loanAmount, c)}
                      </p>
                      <p>
                        <strong>Nominal Annual Interest Rate:</strong> {project.financing?.annualInterestRate}% p.a.
                      </p>
                      <p>
                        <strong>Loan Amortization Period:</strong> {project.financing?.loanTermYears} Years
                      </p>
                      <p>
                        <strong>Repayment Schedule:</strong> Equal annual installments covering interest expense and principal reduction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* NOTE 5: DETAILED 5-YEAR SCHEDULES SUPPORTING FS LINE ITEMS         */}
            {/* ------------------------------------------------------------------- */}
            <div id="note-5" className="mt-8 pt-6 border-t border-slate-200 space-y-6 text-xs leading-relaxed text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  5
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Note 5 — Notes Supporting Line Items in the Financial Statements
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Itemized 5-year schedules cross-referencing the Balance Sheet, Income Statement, and Cash Flows
                  </p>
                </div>
              </div>

              {/* Note 5.0: Product Costing, BOM & Unit Economics */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="text-indigo-600">5.0</span> Product Costing, Bill of Materials (BOM) & Unit Economics
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[620px] text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Product Description</th>
                        <th className="py-2 px-2 text-right">Selling Price ({c})</th>
                        <th className="py-2 px-2 text-right">Direct Materials</th>
                        <th className="py-2 px-2 text-right">Direct Labor</th>
                        <th className="py-2 px-2 text-right">Factory Overhead</th>
                        <th className="py-2 px-2 text-right">Unit COGS ({c})</th>
                        <th className="py-2 px-2 text-right">Contribution Margin</th>
                        <th className="py-2 px-2 text-right">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-financial">
                      {(project.products || []).map((prod) => {
                        const matCost =
                          prod.rawMaterialsCostPerUnit !== undefined
                            ? prod.rawMaterialsCostPerUnit
                            : (prod.costBreakdown || []).reduce((sum, cb) => sum + (cb.totalCost || 0), 0);
                        const laborCost = prod.directLaborCostPerUnit || 0;
                        const fohCost = prod.factoryOverheadCostPerUnit || 0;
                        const totalUnitCost = prod.unitCost || (matCost + laborCost + fohCost);
                        const unitMargin = (prod.unitPrice || 0) - totalUnitCost;
                        const marginPct = (prod.unitPrice || 0) > 0 ? (unitMargin / (prod.unitPrice || 1)) * 100 : 0;
                        return (
                          <tr key={prod.id}>
                            <td className="py-1.5 px-3 font-sans font-medium text-slate-900">{prod.name}</td>
                            <td className="py-1.5 px-2 text-right text-slate-800 font-bold">{formatCurrency(prod.unitPrice, c)}</td>
                            <td className="py-1.5 px-2 text-right text-slate-600">{formatCurrency(matCost, c)}</td>
                            <td className="py-1.5 px-2 text-right text-slate-600">{formatCurrency(laborCost, c)}</td>
                            <td className="py-1.5 px-2 text-right text-slate-600">{formatCurrency(fohCost, c)}</td>
                            <td className="py-1.5 px-2 text-right text-amber-900 font-semibold">{formatCurrency(totalUnitCost, c)}</td>
                            <td className="py-1.5 px-2 text-right text-emerald-800 font-bold">{formatCurrency(unitMargin, c)}</td>
                            <td className="py-1.5 px-2 text-right text-indigo-900 font-semibold">{marginPct.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note 5.1: Cash & Cash Equivalents */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="text-indigo-600">5.1</span> Cash and Cash Equivalents
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[560px] text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Account Breakdown</th>
                        <th className="py-2 px-2 text-right">Year 0</th>
                        <th className="py-2 px-2 text-right">Year 1</th>
                        <th className="py-2 px-2 text-right">Year 2</th>
                        <th className="py-2 px-2 text-right">Year 3</th>
                        <th className="py-2 px-2 text-right">Year 4</th>
                        <th className="py-2 px-2 text-right">Year 5</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-financial">
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Cash on Hand (Petty Cash Reserve)</td>
                        <td className="py-1.5 px-2 text-right text-slate-600">{formatCurrency(project.workingCapitalBufferDetails?.cashOnHand || 0, c)}</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                            {formatCurrency(project.workingCapitalBufferDetails?.cashOnHand || 0, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Cash in Bank (Savings / Demand Deposit)</td>
                        <td className="py-1.5 px-2 text-right text-slate-600">{formatCurrency(project.workingCapitalBufferDetails?.cashInBank || 0, c)}</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                            {formatCurrency(Math.max(0, y.cash - (project.workingCapitalBufferDetails?.cashOnHand || 0)), c)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-300">
                        <td className="py-2 px-3 font-sans">Total Cash and Cash Equivalents</td>
                        <td className="py-2 px-2 text-right">{formatCurrency(initialWorkingCapital, c)}</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-2 px-2 text-right text-indigo-900">
                            {formatCurrency(y.cash, c)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note 5.2: Trade Receivables & Inventory */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="text-indigo-600">5.2</span> Trade Accounts Receivable
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                    <table className="w-full min-w-[480px] text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="py-2 px-3">Item</th>
                          {years5.map((y) => (
                            <th key={y.year} className="py-2 px-2 text-right">Yr {y.year}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-financial">
                        <tr>
                          <td className="py-1.5 px-3 font-sans text-slate-800">Gross Sales Revenue</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                              {formatCurrency(y.grossSales, c)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 font-sans text-slate-800">Credit Terms Rate</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-1.5 px-2 text-right text-slate-500 font-sans">
                              {wcPolicy?.accountsReceivablePercentOfSales}%
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                          <td className="py-2 px-3 font-sans">Accounts Receivable (Ending)</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-2 px-2 text-right text-indigo-900">
                              {formatCurrency(y.accountsReceivable, c)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="text-indigo-600">5.3</span> Inventories
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                    <table className="w-full min-w-[480px] text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="py-2 px-3">Item</th>
                          {years5.map((y) => (
                            <th key={y.year} className="py-2 px-2 text-right">Yr {y.year}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-financial">
                        <tr>
                          <td className="py-1.5 px-3 font-sans text-slate-800">Total Cost of Goods Sold</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                              {formatCurrency(y.totalCOGS, c)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 font-sans text-slate-800">Safety Buffer % of COGS</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-1.5 px-2 text-right text-slate-500 font-sans">
                              {wcPolicy?.inventoryPercentOfCOGS}%
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                          <td className="py-2 px-3 font-sans">Ending Safety Stock Inventory</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-2 px-2 text-right text-indigo-900">
                              {formatCurrency(y.inventory, c)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Note 5.4: Property, Plant and Equipment Schedule */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="text-indigo-600">5.4</span> Property, Plant and Equipment (PPE) Carrying Value
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[580px] text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">PPE Schedule</th>
                        <th className="py-2 px-2 text-right">Year 0</th>
                        <th className="py-2 px-2 text-right">Year 1</th>
                        <th className="py-2 px-2 text-right">Year 2</th>
                        <th className="py-2 px-2 text-right">Year 3</th>
                        <th className="py-2 px-2 text-right">Year 4</th>
                        <th className="py-2 px-2 text-right">Year 5</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-financial">
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Gross Acquisition Cost (Historical Cost)</td>
                        <td className="py-1.5 px-2 text-right text-slate-700">{formatCurrency(ppeTotal, c)}</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-700">
                            {formatCurrency(y.grossPPE, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Less: Accumulated Depreciation</td>
                        <td className="py-1.5 px-2 text-right text-slate-500 font-sans">-</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-rose-600">
                            ({formatCurrency(y.accumulatedDepreciation, c)})
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-300">
                        <td className="py-2 px-3 font-sans">Net Book Value (Carrying Amount)</td>
                        <td className="py-2 px-2 text-right text-indigo-900">{formatCurrency(ppeTotal, c)}</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-2 px-2 text-right text-indigo-900">
                            {formatCurrency(y.netPPE, c)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note 5.5 & 5.6: Payables and Bank Loan */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="text-indigo-600">5.5</span> Trade Accounts Payable
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                    <table className="w-full min-w-[480px] text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="py-2 px-3">Item</th>
                          {years5.map((y) => (
                            <th key={y.year} className="py-2 px-2 text-right">Yr {y.year}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-financial">
                        <tr>
                          <td className="py-1.5 px-3 font-sans text-slate-800">Direct Material Purchases</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                              {formatCurrency(y.directMaterials, c)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 font-sans text-slate-800">Trade Credit Terms Rate</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-1.5 px-2 text-right text-slate-500 font-sans">
                              {wcPolicy?.accountsPayablePercentOfPurchases}%
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                          <td className="py-2 px-3 font-sans">Ending Trade Accounts Payable</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-2 px-2 text-right text-indigo-900">
                              {formatCurrency(y.accountsPayable, c)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="text-indigo-600">5.6</span> Commercial Bank Loan Amortization
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                    <table className="w-full min-w-[480px] text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="py-2 px-3">Debt Breakdown</th>
                          {years5.map((y) => (
                            <th key={y.year} className="py-2 px-2 text-right">Yr {y.year}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-financial">
                        <tr>
                          <td className="py-1.5 px-3 font-sans text-slate-800">Current Portion of Bank Debt</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-1.5 px-2 text-right text-amber-700">
                              {formatCurrency(y.currentPortionOfDebt, c)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 font-sans text-slate-800">Long-Term Bank Loan (Non-Current)</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                              {formatCurrency(y.longTermDebt, c)}
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                          <td className="py-1.5 px-3 font-sans">Total Outstanding Debt</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-1.5 px-2 text-right text-indigo-900">
                              {formatCurrency(y.totalLiabilities - y.accountsPayable, c)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 font-sans text-slate-800">Annual Interest Expense (Financing Cost)</td>
                          {years5.map((y) => (
                            <td key={y.year} className="py-1.5 px-2 text-right text-rose-600">
                              {formatCurrency(y.interestExpense, c)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Note 5.7: Owner's Equity & Retained Earnings Movement */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="text-indigo-600">5.7</span> Owner's Equity & Retained Earnings Movement
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[580px] text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Equity Statement Line Item</th>
                        <th className="py-2 px-2 text-right">Year 0</th>
                        <th className="py-2 px-2 text-right">Year 1</th>
                        <th className="py-2 px-2 text-right">Year 2</th>
                        <th className="py-2 px-2 text-right">Year 3</th>
                        <th className="py-2 px-2 text-right">Year 4</th>
                        <th className="py-2 px-2 text-right">Year 5</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-financial">
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Paid-In Equity Capital (Proponents' Investment)</td>
                        <td className="py-1.5 px-2 text-right text-slate-700">{formatCurrency(equityAmount, c)}</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-700">
                            {formatCurrency(y.paidInCapital, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Annual Net Income After Tax</td>
                        <td className="py-1.5 px-2 text-right text-slate-400 font-sans">-</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-emerald-700">
                            {formatCurrency(y.netIncome, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">
                          Less: Owner Drawings / Dividends ({project.dividendPayoutPercent}%)
                        </td>
                        <td className="py-1.5 px-2 text-right text-slate-400 font-sans">-</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-rose-600">
                            ({formatCurrency((y.netIncome * project.dividendPayoutPercent) / 100, c)})
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Accumulated Retained Earnings (Ending)</td>
                        <td className="py-1.5 px-2 text-right text-slate-400 font-sans">-</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-700">
                            {formatCurrency(y.retainedEarnings, c)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-indigo-50/70 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td className="py-2 px-3 font-sans uppercase tracking-wide">Total Owner's Equity (Ending)</td>
                        <td className="py-2 px-2 text-right text-indigo-900">{formatCurrency(equityAmount, c)}</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-2 px-2 text-right text-indigo-950 font-bold">
                            {formatCurrency(y.totalEquity, c)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note 5.8: Direct Labor & Statutory Benefits Schedule */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="text-indigo-600">5.8</span> Direct Labor & Philippine Statutory Benefits Schedule
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[560px] text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Position / Labor Role</th>
                        <th className="py-2 px-2 text-right">Headcount</th>
                        <th className="py-2 px-2 text-right">Monthly Wage ({c})</th>
                        <th className="py-2 px-2 text-right">Months/Yr</th>
                        <th className="py-2 px-2 text-right">Annual Basic ({c})</th>
                        <th className="py-2 px-2 text-right">13th Mo. + Benefits ({c})</th>
                        <th className="py-2 px-2 text-right">Total Annual Cost ({c})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-financial">
                      {(project.directLabor || []).map((dl) => {
                        const basicAnnual = (dl.headcount || 1) * (dl.monthlyWage || 0) * (dl.monthsPerYear || 12);
                        // Approx benefits (13th month ~ 1 month + statutory ~ 10-14%)
                        const thirteenthMonth = basicAnnual / (dl.monthsPerYear || 12);
                        const statutory = basicAnnual * 0.115;
                        const totalLabor = basicAnnual + thirteenthMonth + statutory;
                        return (
                          <tr key={dl.id}>
                            <td className="py-1.5 px-3 font-sans font-medium text-slate-800">{dl.role}</td>
                            <td className="py-1.5 px-2 text-right text-slate-700">{dl.headcount}</td>
                            <td className="py-1.5 px-2 text-right text-slate-700">{formatCurrency(dl.monthlyWage, c)}</td>
                            <td className="py-1.5 px-2 text-right text-slate-600">{dl.monthsPerYear || 12}</td>
                            <td className="py-1.5 px-2 text-right text-slate-800 font-semibold">{formatCurrency(basicAnnual, c)}</td>
                            <td className="py-1.5 px-2 text-right text-indigo-700 font-semibold">{formatCurrency(thirteenthMonth + statutory, c)}</td>
                            <td className="py-1.5 px-2 text-right text-indigo-950 font-bold">{formatCurrency(totalLabor, c)}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50 font-bold border-t border-slate-200">
                        <td className="py-2 px-3 font-sans">Total Direct Labor (Year 1 Base)</td>
                        <td className="py-2 px-2 text-right font-financial">
                          {(project.directLabor || []).reduce((sum, dl) => sum + (dl.headcount || 1), 0)}
                        </td>
                        <td className="py-2 px-2 text-right font-sans text-slate-500">-</td>
                        <td className="py-2 px-2 text-right font-sans text-slate-500">-</td>
                        <td className="py-2 px-2 text-right text-slate-900">
                          {formatCurrency(
                            (project.directLabor || []).reduce(
                              (sum, dl) => sum + (dl.headcount || 1) * (dl.monthlyWage || 0) * (dl.monthsPerYear || 12),
                              0
                            ),
                            c
                          )}
                        </td>
                        <td className="py-2 px-2 text-right text-indigo-700 font-semibold">
                          {formatCurrency(
                            (project.directLabor || []).reduce((sum, dl) => {
                              const basic = (dl.headcount || 1) * (dl.monthlyWage || 0) * (dl.monthsPerYear || 12);
                              return sum + (basic / (dl.monthsPerYear || 12)) + basic * 0.115;
                            }, 0),
                            c
                          )}
                        </td>
                        <td className="py-2 px-2 text-right text-indigo-950">
                          {formatCurrency(years5[0]?.directLabor || 0, c)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note 5.9: Factory Overhead (FOH) 5-Year Schedule */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="text-indigo-600">5.9</span> Factory Overhead (FOH) 5-Year Schedule
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[540px] text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Factory Overhead Cost Component</th>
                        {years5.map((y) => (
                          <th key={y.year} className="py-2 px-2 text-right">Year {y.year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-financial">
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Manufacturing Utilities (Power, Water, Gas)</td>
                        {years5.map((y, idx) => {
                          const baseUtilities = (project.productionUtilities || []).reduce(
                            (s, u) => s + (u.annualAmountYear1 || 0),
                            0
                          );
                          const escalated = baseUtilities * Math.pow(1 + (project.inflationRatePercent || 4) / 100, idx);
                          return (
                            <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                              {formatCurrency(escalated, c)}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Factory Supplies & Sanitation Consumables</td>
                        {years5.map((y, idx) => {
                          const baseSupplies = (project.factorySupplies || []).reduce(
                            (s, fs) => s + (fs.annualAmount || 0),
                            0
                          );
                          const escalated = baseSupplies * Math.pow(1 + (project.inflationRatePercent || 4) / 100, idx);
                          return (
                            <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                              {formatCurrency(escalated, c)}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Production Machinery & Equipment Depreciation</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                            {formatCurrency(y.factoryDepreciation || 0, c)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                        <td className="py-2 px-3 font-sans">Total Factory Overhead (FOH)</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-2 px-2 text-right text-indigo-900">
                            {formatCurrency(y.factoryOverhead, c)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note 5.10: Operating Expenses (SG&A Overhead) 5-Year Schedule */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="text-indigo-600">5.10</span> Operating Expenses (SG&A Overhead) 5-Year Schedule
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[540px] text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">SG&A Expense Category</th>
                        {years5.map((y) => (
                          <th key={y.year} className="py-2 px-2 text-right">Year {y.year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-financial">
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">General Administrative Expenses</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                            {formatCurrency(y.adminExpenses || 0, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Selling, Marketing & Delivery Expenses</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                            {formatCurrency(y.sellingExpenses || 0, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Non-Manufacturing Furniture & Vehicle Depreciation</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                            {formatCurrency(y.opexDepreciation || 0, c)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                        <td className="py-2 px-3 font-sans">Total Operating Expenses (SG&A)</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-2 px-2 text-right text-rose-700">
                            {formatCurrency(y.totalOpex, c)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note 5.11: Comprehensive Income Statement Reconciliation */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="text-indigo-600">5.11</span> Comprehensive Income Statement Component Summary
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl scrollbar-thin">
                  <table className="w-full min-w-[520px] text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Revenue, Cost & Profit Component</th>
                        {years5.map((y) => (
                          <th key={y.year} className="py-2 px-2 text-right">Year {y.year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-financial">
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Gross Sales Revenue</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-700">
                            {formatCurrency(y.grossSales, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">Less: Sales Discounts & Trade Allowances</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-rose-600">
                            ({formatCurrency(y.salesDiscounts, c)})
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-slate-50 font-semibold text-slate-900">
                        <td className="py-1.5 px-3 font-sans">Net Sales Revenue</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-indigo-900">
                            {formatCurrency(y.netSales, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-600 pl-6">• Direct Materials Consumed</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                            {formatCurrency(y.directMaterials, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-600 pl-6">• Direct Labor & Statutory Benefits</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                            {formatCurrency(y.directLabor, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-600 pl-6">• Factory Overhead (FOH & Depr.)</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">
                            {formatCurrency(y.factoryOverhead, c)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-amber-50/50 font-semibold text-amber-950">
                        <td className="py-1.5 px-3 font-sans">Total Cost of Goods Sold (COGS)</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-amber-900">
                            ({formatCurrency(y.totalCOGS, c)})
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-slate-100/70 font-bold text-slate-900">
                        <td className="py-2 px-3 font-sans">Gross Profit</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-2 px-2 text-right text-indigo-900">
                            {formatCurrency(y.grossProfit, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-800">
                          Less: Operating Expenses (SG&A Overhead + Non-Mfg Depr.)
                        </td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-rose-600">
                            ({formatCurrency(y.totalOpex, c)})
                          </td>
                        ))}
                      </tr>
                      <tr className="font-semibold text-slate-800">
                        <td className="py-1.5 px-3 font-sans">Operating Income (EBIT)</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right">
                            {formatCurrency(y.ebit, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-700">Add: Bank Interest Income (Cash Deposits)</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-emerald-600">
                            {formatCurrency(y.interestIncome || 0, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-700">Less: Financing Cost (Bank Loan Interest)</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-rose-600">
                            ({formatCurrency(y.interestExpense, c)})
                          </td>
                        ))}
                      </tr>
                      <tr className="font-semibold text-slate-800 bg-slate-50">
                        <td className="py-1.5 px-3 font-sans">Income Before Tax (EBT)</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right">
                            {formatCurrency(y.ebt, c)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-700">
                          Less: Provision for Income Tax ({project.taxRatePercent}%)
                        </td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-1.5 px-2 text-right text-rose-600">
                            ({formatCurrency(y.taxExpense, c)})
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-emerald-50/70 font-bold text-emerald-950 border-t-2 border-emerald-300">
                        <td className="py-2.5 px-3 font-sans uppercase tracking-wide">Net Income After Tax</td>
                        {years5.map((y) => (
                          <td key={y.year} className="py-2.5 px-2 text-right text-emerald-900 font-bold">
                            {formatCurrency(y.netIncome, c)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* NOTE 6: FINANCIAL RISK MANAGEMENT & CAPITAL OBJECTIVES              */}
            {/* ------------------------------------------------------------------- */}
            <div id="note-6" className="mt-8 pt-6 border-t border-slate-200 space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  6
                </span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Note 6 — Financial Risk Management & Capital Management Objectives
                </h3>
              </div>

              <p>
                The venture's activities expose it to a variety of financial risks: liquidity risk, credit risk, market/price
                inflation risk, and capital management solvency risk. The proponents manage these risks through established
                operating policies:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    6.1 Liquidity & Cash Flow Risk
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Liquidity risk is mitigated by maintaining an initial cash buffer of{' '}
                    <strong>{formatCurrency(initialWorkingCapital, c)}</strong>, enforcing timely customer collections (30-day terms),
                    and retaining {100 - project.dividendPayoutPercent}% of annual net profits. The projected 5-year average Current
                    Ratio is <strong>{metrics.avgCurrentRatio.toFixed(2)}x</strong>, confirming adequate liquid asset coverage over
                    short-term obligations.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-indigo-600" />
                    6.2 Credit & Receivables Risk
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Credit risk is contained by capping credit sales at{' '}
                    <strong>{wcPolicy?.accountsReceivablePercentOfSales}% of annual revenue</strong> and prioritizing
                    prompt cash-on-delivery settlements for retail channels. Institutional wholesale buyers are evaluated prior to
                    granting 30-day commercial terms.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    6.3 Price & Cost Inflation Risk
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    The enterprise monitors raw material and ingredient procurement prices continually. A {project.inflationRatePercent}%
                    annual cost escalation is budgeted. Price adjustments and margin monitoring ensure contribution margins remain
                    robust against market volatility.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    6.4 Capital Management & Solvency
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    The primary objective of capital management is to ensure the entity continues as a going concern while
                    maintaining an optimal debt-to-equity ratio ({metrics.avgDebtToEquity.toFixed(2)}x average). The bank loan is
                    fully amortized over its {project.financing?.loanTermYears}-year term, de-leveraging the balance sheet.
                  </p>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* NOTE 7: APPROVAL AND SIGN-OFF FOR THESIS / PROJECT DEFENSE          */}
            {/* ------------------------------------------------------------------- */}
            <div id="note-7" className="mt-8 pt-6 border-t border-slate-200 space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  7
                </span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Note 7 — Approval and Authorization of Financial Feasibility Study
                </h3>
              </div>

              <p>
                These projected financial statements and accompanying notes were prepared and submitted by the academic
                proponents in partial fulfillment of the requirements for the degree of{' '}
                <span className="font-semibold text-slate-900">{project.academicProgram}</span> at{' '}
                <span className="font-semibold text-slate-900">{project.institution}</span>, and have been examined and approved
                for official presentation and defense before the academic faculty panel.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. THESIS PANEL DEFENSE GUIDE & COMMON QUESTION PREPARATION               */}
      {/* ========================================================================= */}
      {(activeSubTab === 'defense' || false) && (
        <div className="space-y-6 no-print">
          <section className="bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 border border-indigo-200/90 rounded-2xl p-5 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-indigo-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-2xs">
                  <HelpCircle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-indigo-950 uppercase tracking-wide">
                    Undergraduate Panel Defense Guide & Common Question Preparation
                  </h3>
                  <p className="text-xs text-indigo-900/80 mt-0.5">
                    Essential financial explanations and talking points to ace your thesis panel defense with confidence
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Financial Feasibility Status: {metrics.isFeasible ? 'Feasible & Viable' : 'Under Review'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Question 1: Feasibility */}
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs hover:border-indigo-300 transition space-y-2">
                <h4 className="font-bold text-slate-900 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Why is your proposed venture considered financially feasible?</span>
                </h4>
                <p className="text-slate-600 leading-relaxed pl-7">
                  "Our venture satisfies all standard capital budgeting criteria under discounted cash flow analysis:
                  it achieves a positive Net Present Value (NPV) of{' '}
                  <strong className="text-indigo-900">{formatCurrency(metrics.npv, c)}</strong>; an Internal Rate of Return
                  (IRR) of <strong className="text-indigo-900">{metrics.irr.toFixed(1)}%</strong> which significantly
                  exceeds our {project.discountRatePercent}% hurdle rate; and an estimated Payback Period of{' '}
                  <strong className="text-indigo-900">{metrics.paybackPeriodYears.toFixed(2)} years</strong>, well within
                  our 5-year study horizon."
                </p>
              </div>

              {/* Question 2: Balance Sheet Tie-up */}
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs hover:border-indigo-300 transition space-y-2">
                <h4 className="font-bold text-slate-900 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>How did you balance the Balance Sheet and ensure financial statement integration?</span>
                </h4>
                <p className="text-slate-600 leading-relaxed pl-7">
                  "Every projected year strictly complies with the fundamental accounting equation:{' '}
                  <strong>Total Assets = Total Liabilities + Owner's Equity</strong>. The ending cash balance from the
                  Statement of Cash Flows ties directly into Cash in the Balance Sheet. In turn, annual net income after owner
                  drawings/dividends ({project.dividendPayoutPercent}%) flows directly into Ending Retained Earnings."
                </p>
              </div>

              {/* Question 3: Break-Even Point */}
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs hover:border-indigo-300 transition space-y-2">
                <h4 className="font-bold text-slate-900 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>What is your Break-Even Point (BEP) and Margin of Safety in Year 1?</span>
                </h4>
                <p className="text-slate-600 leading-relaxed pl-7">
                  "Our Year 1 fixed manufacturing and operating overhead is covered once we achieve our Break-Even Sales
                  volume. Our projected sales volume provides a substantial Margin of Safety buffer, ensuring that even if initial
                  launch sales fluctuate, operations remain solvent without sustaining cash losses."
                </p>
              </div>

              {/* Question 4: Inflation & Sensitivity */}
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs hover:border-indigo-300 transition space-y-2">
                <h4 className="font-bold text-slate-900 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    4
                  </span>
                  <span>How resilient is your project to inflation or economic shocks?</span>
                </h4>
                <p className="text-slate-600 leading-relaxed pl-7">
                  "We have incorporated a {project.inflationRatePercent}% annual cost inflation factor across operating expenses,
                  utilities, and direct supplies. Furthermore, under our Sensitivity Analysis stress tests (evaluating a 15% drop
                  in sales volume and an 8% surge in costs), the project maintains positive operating cash flows and adequate
                  debt service coverage."
                </p>
              </div>

              {/* Question 5: Labor & Benefits */}
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs hover:border-indigo-300 transition space-y-2">
                <h4 className="font-bold text-slate-900 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    5
                  </span>
                  <span>How did you compute Direct Labor and Philippine statutory employee benefits?</span>
                </h4>
                <p className="text-slate-600 leading-relaxed pl-7">
                  "All labor personnel are compensated in compliance with Philippine Department of Labor and Employment (DOLE)
                  minimum wage regulations. Mandatory employer contributions for SSS, PhilHealth, and Pag-IBIG are calculated
                  using official statutory contribution brackets, and 13th Month Pay is provided pursuant to Presidential Decree No. 851."
                </p>
              </div>

              {/* Question 6: Working Capital Management */}
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs hover:border-indigo-300 transition space-y-2">
                <h4 className="font-bold text-slate-900 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    6
                  </span>
                  <span>Explain your Working Capital Policy and cash conversion cycle.</span>
                </h4>
                <p className="text-slate-600 leading-relaxed pl-7">
                  "Our working capital policy establishes an initial cash buffer of {formatCurrency(initialWorkingCapital, c)},
                  trade receivables at {wcPolicy?.accountsReceivablePercentOfSales}% of sales (collected within
                  30 days), finished goods and materials safety buffer at {wcPolicy?.inventoryPercentOfCOGS}% of COGS,
                  and trade accounts payable at {wcPolicy?.accountsPayablePercentOfPurchases}% of purchases. This ensures
                  smooth cash conversion throughout all operating cycles."
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
