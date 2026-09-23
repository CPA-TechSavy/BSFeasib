import React, { useState, useEffect } from 'react';
import {
  Building2,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  User,
  PieChart,
  Plus,
  Trash2,
  HelpCircle,
  Briefcase,
  AlertCircle,
  Coins,
} from 'lucide-react';
import {
  FeasibilityProject,
  EntityClassification,
  CompanyAccount,
  PartnerContribution,
} from '../types';
import { formatCurrency } from '../utils/financialCalculations';

interface CompanyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
}

const NATURE_PRESETS = [
  'Manufacturing (Transformation of raw materials into finished products)',
];

export default function CompanyAccountModal({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}: CompanyAccountModalProps) {
  const c = project.currency;

  // Step indicator: 1 = Entity Basic Info, 2 = Capital & Equity Structure
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 Form States
  const [entityName, setEntityName] = useState('');
  const [classification, setClassification] = useState<EntityClassification>('Sole Proprietorship');
  const [natureOfCompany, setNatureOfCompany] = useState(
    'Manufacturing (Transformation of raw materials into finished products)'
  );
  const [customNature, setCustomNature] = useState('');
  const [purposeOfEntity, setPurposeOfEntity] = useState('');

  // Step 2 Form States - Sole Proprietorship
  const [ownerName, setOwnerName] = useState('');
  const [ownerCapital, setOwnerCapital] = useState<number>(0);
  const [ownerDrawings, setOwnerDrawings] = useState<number>(0);

  // Step 2 Form States - Partnership
  const [partners, setPartners] = useState<PartnerContribution[]>([
    { id: 'p-1', name: 'Partner 1', capitalContribution: 250000, profitSharePercent: 50 },
    { id: 'p-2', name: 'Partner 2', capitalContribution: 250000, profitSharePercent: 50 },
  ]);

  // Error validation messages
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Initialize or load from existing project
  useEffect(() => {
    if (project.companyAccount) {
      const ca = project.companyAccount;
      setEntityName(ca.entityName || project.title || '');
      setClassification(
        ca.classification === 'Partnership'
          ? 'Partnership'
          : ca.classification === 'Corporation'
          ? 'Corporation'
          : 'Sole Proprietorship'
      );
      setPurposeOfEntity(ca.purposeOfEntity || '');
      setNatureOfCompany('Manufacturing (Transformation of raw materials into finished products)');
      setCustomNature('');

      if (ca.soleProprietorship) {
        setOwnerName(ca.soleProprietorship.ownerName || project.proponents || '');
        setOwnerCapital(ca.soleProprietorship.ownerCapital || project.financing.equityContribution || 0);
        setOwnerDrawings(ca.soleProprietorship.drawingsAnnual || 0);
      } else {
        setOwnerName(project.proponents || '');
        setOwnerCapital(project.financing.equityContribution || 500000);
      }

      if (ca.partnership && ca.partnership.partners.length > 0) {
        setPartners(ca.partnership.partners);
      }
    } else {
      // Defaults from current project
      setEntityName(project.title || '');
      setClassification('Sole Proprietorship');
      setNatureOfCompany('Manufacturing (Transformation of raw materials into finished products)');
      setCustomNature('');
      setOwnerName(project.proponents || '');
      setOwnerCapital(project.financing.equityContribution || 500000);
      setPurposeOfEntity('');
    }
  }, [project, isOpen]);

  // Calculations for Step 2
  const totalPartnersCapital = partners.reduce((sum, p) => sum + (Number(p.capitalContribution) || 0), 0);
  const totalProfitSharePercent = partners.reduce((sum, p) => sum + (Number(p.profitSharePercent) || 0), 0);

  // Handlers for Step 1 Validation
  const handleProceedToStep2 = () => {
    setStep1Error(null);
    if (!entityName.trim()) {
      setStep1Error('Please enter the Name of the Entity.');
      return;
    }
    const finalNature = 'Manufacturing (Transformation of raw materials into finished products)';
    if (!purposeOfEntity.trim()) {
      setStep1Error('Please state the primary purpose or business objective of the entity.');
      return;
    }
    setStep(2);
  };

  // Handlers for Partnership Step 2
  const handleAddPartner = () => {
    const newId = `p-${Date.now()}`;
    const newPartnerNum = partners.length + 1;
    setPartners([
      ...partners,
      { id: newId, name: `Partner ${newPartnerNum}`, capitalContribution: 100000, profitSharePercent: 0 },
    ]);
  };

  const handleRemovePartner = (id: string) => {
    if (partners.length <= 2) {
      alert('A partnership must have at least two (2) partners.');
      return;
    }
    setPartners(partners.filter((p) => p.id !== id));
  };

  const handleUpdatePartner = (id: string, field: keyof PartnerContribution, value: any) => {
    setPartners(
      partners.map((p) => {
        if (p.id !== id) return p;
        return { ...p, [field]: value };
      })
    );
  };

  const handleEqualizePartnerShares = () => {
    const count = partners.length;
    if (count === 0) return;
    const equalShare = Math.round((100 / count) * 100) / 100;
    setPartners(
      partners.map((p, idx) => ({
        ...p,
        profitSharePercent: idx === count - 1 ? Math.round((100 - equalShare * (count - 1)) * 100) / 100 : equalShare,
      }))
    );
  };

  // Final Submission: Proceed to Main Screen
  const handleSaveAndProceedToMainScreen = () => {
    setStep2Error(null);
    const finalNature = 'Manufacturing (Transformation of raw materials into finished products)';

    let equityContribution = 0;

    const companyAccountData: CompanyAccount = {
      entityName: entityName.trim(),
      classification,
      natureOfCompany: finalNature,
      purposeOfEntity: purposeOfEntity.trim(),
    };

    if (classification === 'Sole Proprietorship') {
      if (ownerCapital <= 0) {
        setStep2Error('Please enter a positive Owner Capital amount.');
        return;
      }
      companyAccountData.soleProprietorship = {
        ownerName: ownerName.trim() || 'Sole Proprietor',
        ownerCapital,
        drawingsAnnual: ownerDrawings,
      };
      equityContribution = ownerCapital;
    } else if (classification === 'Partnership') {
      if (partners.length < 2) {
        setStep2Error('A partnership requires at least two partners.');
        return;
      }
      if (totalPartnersCapital <= 0) {
        setStep2Error('Total partners capital contribution must be greater than zero.');
        return;
      }
      if (Math.abs(totalProfitSharePercent - 100) > 0.1) {
        setStep2Error(`Profit and loss sharing ratios must equal exactly 100% (currently ${totalProfitSharePercent.toFixed(1)}%).`);
        return;
      }
      companyAccountData.partnership = {
        partners,
        totalPartnersCapital,
      };
      equityContribution = totalPartnersCapital;
    }

    // Update project
    const updatedProject: FeasibilityProject = {
      ...project,
      title: entityName.trim() || project.title,
      companyAccount: companyAccountData,
      financing: {
        ...project.financing,
        equityContribution,
      },
    };

    onUpdateProject(updatedProject);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Company Account Profile
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                  Legal & Capital Setup
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Wizard Indicator */}
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => setStep(1)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition text-left cursor-pointer ${
                step === 1
                  ? 'bg-indigo-600/60 border-indigo-400 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                  step === 1 ? 'bg-white text-indigo-950' : 'bg-slate-700 text-slate-300'
                }`}
              >
                1
              </div>
              <div className="truncate">
                <div className="font-bold">Entity Basic Profile</div>
                <div className="text-[10px] font-normal text-slate-300 truncate">
                  Name, Form & Purpose
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                if (entityName.trim() && purposeOfEntity.trim()) {
                  setStep(2);
                }
              }}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition text-left cursor-pointer ${
                step === 2
                  ? 'bg-indigo-600/60 border-indigo-400 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                  step === 2 ? 'bg-white text-indigo-950' : 'bg-slate-700 text-slate-300'
                }`}
              >
                2
              </div>
              <div className="truncate">
                <div className="font-bold">Capital & Equity Structure</div>
                <div className="text-[10px] font-normal text-slate-300 truncate">
                  {classification === 'Sole Proprietorship' && "Owner's Capital"}
                  {classification === 'Partnership' && 'Partners Contribution & Sharing'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* ========================================================= */}
          {/* STEP 1: ENTITY BASIC PROFILE */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {step1Error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{step1Error}</span>
                </div>
              )}

              {/* 1. Name of the Entity */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  1. Name of the Entity <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g. EcoWash Commercial Laundry Services, Apex Trading"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-hidden font-medium text-slate-900 transition shadow-2xs"
                />
              </div>

              {/* 2. Classification of the Entity */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  2. Classification of the Entity <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Sole Proprietorship */}
                  <button
                    type="button"
                    onClick={() => setClassification('Sole Proprietorship')}
                    className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer ${
                      classification === 'Sole Proprietorship'
                        ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                        <User className="w-4 h-4" />
                      </div>
                      {classification === 'Sole Proprietorship' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <div className="font-bold text-sm text-slate-900">Sole Proprietorship</div>
                  </button>

                  {/* Partnership */}
                  <button
                    type="button"
                    onClick={() => setClassification('Partnership')}
                    className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer ${
                      classification === 'Partnership'
                        ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <Users className="w-4 h-4" />
                      </div>
                      {classification === 'Partnership' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="font-bold text-sm text-slate-900">Partnership</div>
                  </button>
                </div>
              </div>

              {/* 3. Nature of the Company */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  3. Nature of the Company <span className="text-red-500">*</span>
                </label>
                <select
                  value={natureOfCompany}
                  onChange={(e) => setNatureOfCompany(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl outline-hidden text-slate-900 font-medium cursor-pointer"
                >
                  {NATURE_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  Focus: Manufacturing operations and raw material conversion.
                </p>
              </div>

              {/* 4. Purpose of the Entity */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  4. Purpose of the Entity <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={purposeOfEntity}
                  onChange={(e) => setPurposeOfEntity(e.target.value)}
                  placeholder="State the primary business purpose, operational objective, or mandate of the organization..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl outline-hidden text-slate-900 font-medium"
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: CAPITAL & OWNERSHIP STRUCTURE (CONDITIONAL) */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {step2Error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{step2Error}</span>
                </div>
              )}

              {/* Banner Showing Selected Classification */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Entity:</span>{' '}
                  <span className="font-bold text-slate-900">{entityName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-indigo-900 bg-indigo-100/80 px-2.5 py-1 rounded-md">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{classification}</span>
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* IF SOLE PROPRIETORSHIP */}
              {/* -------------------------------------------------- */}
              {classification === 'Sole Proprietorship' && (
                <div className="space-y-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm border-b border-indigo-100 pb-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>Sole Proprietor Capital Contribution</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Owner / Proprietor Full Name
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. John Doe, Sole Proprietor"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-hidden text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Owner's Capital Contribution ({c}) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={ownerCapital || ''}
                        onChange={(e) => setOwnerCapital(parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 500000"
                        className="w-full px-3 py-2 text-sm bg-white border border-indigo-400 rounded-lg outline-hidden font-financial text-indigo-950 font-bold text-base"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Formatted: {formatCurrency(ownerCapital, c)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expected Annual Owner's Personal Drawings ({c}) (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={ownerDrawings || ''}
                      onChange={(e) => setOwnerDrawings(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 0 or 60000"
                      className="w-full max-w-xs px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg outline-hidden font-financial"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Personal cash withdrawals deducted against the proprietor's equity in the Statement of Changes in Equity.
                    </p>
                  </div>

                  <div className="p-3 bg-indigo-100/60 rounded-xl text-xs text-indigo-950 leading-relaxed">
                    💡 <strong>Accounting Treatment:</strong> For a Sole Proprietorship, this amount becomes the initial
                    <strong> Owner's Capital (Year 0)</strong>. Annual net earnings increase capital while proprietor drawings reduce capital.
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* IF PARTNERSHIP */}
              {/* -------------------------------------------------- */}
              {classification === 'Partnership' && (
                <div className="space-y-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Partners' Capital Contribution & Profit Sharing</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleEqualizePartnerShares}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg transition cursor-pointer"
                      >
                        Equalize Profit %
                      </button>
                      <button
                        type="button"
                        onClick={handleAddPartner}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 transition cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Partner</span>
                      </button>
                    </div>
                  </div>

                  {/* Partners Contribution Table */}
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full min-w-[460px] text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-emerald-200 text-emerald-950 font-semibold">
                          <th className="py-2 pl-2">Partner Name</th>
                          <th className="py-2 text-right">Capital Contribution ({c})</th>
                          <th className="py-2 text-right">Profit/Loss Share (%)</th>
                          <th className="py-2 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100">
                        {partners.map((partner, index) => (
                          <tr key={partner.id} className="hover:bg-emerald-50/70">
                            <td className="py-2 pl-2">
                              <input
                                type="text"
                                value={partner.name}
                                onChange={(e) => handleUpdatePartner(partner.id, 'name', e.target.value)}
                                placeholder={`Partner ${index + 1}`}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-medium text-slate-800"
                              />
                            </td>
                            <td className="py-2 text-right">
                              <input
                                type="number"
                                min="0"
                                step="1000"
                                value={partner.capitalContribution || ''}
                                onChange={(e) =>
                                  handleUpdatePartner(
                                    partner.id,
                                    'capitalContribution',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                                className="w-32 text-right px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-financial font-semibold"
                              />
                            </td>
                            <td className="py-2 text-right">
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={partner.profitSharePercent || ''}
                                  onChange={(e) =>
                                    handleUpdatePartner(
                                      partner.id,
                                      'profitSharePercent',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0"
                                  className="w-16 text-right px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-financial font-semibold"
                                />
                                <span className="text-slate-500 font-semibold">%</span>
                              </div>
                            </td>
                            <td className="py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePartner(partner.id)}
                                disabled={partners.length <= 2}
                                title={
                                  partners.length <= 2
                                    ? 'Partnerships must have at least 2 partners'
                                    : 'Remove partner'
                                }
                                className={`p-1.5 rounded transition ${
                                  partners.length <= 2
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-emerald-300 font-bold bg-emerald-100/60 text-emerald-950">
                          <td className="py-2 pl-2">Total Partners' Equity</td>
                          <td className="py-2 text-right font-financial font-bold text-sm">
                            {formatCurrency(totalPartnersCapital, c)}
                          </td>
                          <td
                            className={`py-2 text-right font-financial font-bold text-sm ${
                              Math.abs(totalProfitSharePercent - 100) < 0.1
                                ? 'text-emerald-800'
                                : 'text-red-600'
                            }`}
                          >
                            {totalProfitSharePercent.toFixed(1)}%
                          </td>
                          <td className="py-2 text-center text-[10px]">
                            {Math.abs(totalProfitSharePercent - 100) < 0.1 ? '✓ 100%' : 'Must = 100%'}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="p-3 bg-emerald-100/60 rounded-xl text-xs text-emerald-950 leading-relaxed">
                    💡 <strong>Partnership Accounting:</strong> Total partners contribution ({formatCurrency(totalPartnersCapital, c)})
                    will be distributed across individual capital accounts in the <strong>Statement of Changes in Partners' Equity</strong>,
                    with yearly net profit allocated according to the agreed profit/loss sharing ratios.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Navigation */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProceedToStep2}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer"
              >
                <span>Proceed to Capital & Equity Structure</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Entity Info</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndProceedToMainScreen}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Proceed to Main Screen</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
