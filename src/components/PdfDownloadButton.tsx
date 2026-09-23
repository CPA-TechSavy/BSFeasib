import React, { useState } from 'react';
import { FileDown, Loader2, Check } from 'lucide-react';
import { exportElementToPdf, PdfExportOptions } from '../utils/pdfExport';

interface PdfDownloadButtonProps {
  targetId: string;
  title: string;
  subtitle?: string;
  filename?: string;
  projectTitle?: string;
  companyName?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'letter' | 'a4';
  fitToSinglePage?: boolean;
  buttonText?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'default' | 'emerald' | 'indigo' | 'slate' | 'outline' | 'amber';
  className?: string;
}

export default function PdfDownloadButton({
  targetId,
  title,
  subtitle,
  filename,
  projectTitle,
  companyName,
  orientation,
  format,
  fitToSinglePage,
  buttonText = 'Download PDF',
  size = 'sm',
  variant = 'default',
  className = '',
}: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGenerating) return;

    setIsGenerating(true);
    setIsSuccess(false);

    try {
      const options: PdfExportOptions = {
        title,
        subtitle,
        filename: filename || `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
        projectTitle,
        companyName,
        orientation,
        format,
        fitToSinglePage,
      };

      const ok = await exportElementToPdf(targetId, options);
      if (ok) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Size styling
  const sizeClasses = {
    xs: 'px-2 py-1 text-[11px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-xs sm:text-sm gap-2',
  }[size];

  // Variant styling
  const variantClasses = {
    default:
      'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-2xs',
    emerald:
      'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 shadow-2xs',
    indigo:
      'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 hover:border-indigo-300 shadow-2xs',
    slate:
      'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-2xs',
    amber:
      'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 hover:border-amber-300 shadow-2xs',
    outline:
      'bg-transparent hover:bg-slate-100/60 text-slate-600 hover:text-slate-900 border border-slate-200/80',
  }[variant];

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      title={`Download ${title} as PDF`}
      className={`no-print pdf-exclude inline-flex items-center font-semibold rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
          <span>Generating PDF...</span>
        </>
      ) : isSuccess ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-emerald-700">Downloaded!</span>
        </>
      ) : (
        <>
          <FileDown className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 shrink-0" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}
