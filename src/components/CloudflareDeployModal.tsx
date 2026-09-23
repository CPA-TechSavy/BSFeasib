import { useState } from 'react';
import {
  Cloud,
  X,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  FolderArchive,
  GitBranch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface CloudflareDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CloudflareDeployModal({ isOpen, onClose }: CloudflareDeployModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Publish to Cloudflare Pages</h3>
              <p className="text-xs text-orange-100">
                100% Free, Global Edge CDN, Zero Server Maintenance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Cloudflare Compatibility Badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <span className="font-bold block">100% Cloudflare Pages Native & Ready</span>
              This application is engineered as a zero-server client-side Single Page Application (SPA).
              It includes pre-configured <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-semibold">_redirects</code> for
              clean routing and <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-semibold">_headers</code> for optimal caching.
            </div>
          </div>

          {/* Option 1: Git Connection (Recommended) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Method A: Connect via Git (GitHub / GitLab) — Recommended
              </h4>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Push your code to GitHub, then in your Cloudflare dashboard go to{' '}
              <strong>Workers & Pages &gt; Create application &gt; Pages &gt; Connect to Git</strong>.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium">Framework preset:</span>
                <span className="font-mono font-semibold text-slate-900">Vite</span>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium">Build command:</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    npm run build
                  </code>
                  <button
                    onClick={() => copyToClipboard('npm run build', 'build_cmd')}
                    className="text-slate-400 hover:text-slate-700 p-1"
                    title="Copy command"
                  >
                    {copiedKey === 'build_cmd' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium">Build output directory:</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    dist
                  </code>
                  <button
                    onClick={() => copyToClipboard('dist', 'dist_dir')}
                    className="text-slate-400 hover:text-slate-700 p-1"
                    title="Copy folder name"
                  >
                    {copiedKey === 'dist_dir' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Direct Upload / Wrangler CLI */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Method B: Direct Upload or Wrangler CLI (Instant Deploy)
              </h4>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              If you prefer deploying without connecting a Git repository, you can build and publish in seconds:
            </p>

            <div className="space-y-2">
              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                <code>npx wrangler pages deploy dist --project-name=feasibility-app</code>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npm run build && npx wrangler pages deploy dist --project-name=feasibility-app',
                      'wrangler_cmd'
                    )
                  }
                  className="text-slate-400 hover:text-white p-1"
                  title="Copy command"
                >
                  {copiedKey === 'wrangler_cmd' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Or drag and drop the compiled <code className="font-mono font-semibold">dist</code> folder
                directly onto{' '}
                <a
                  href="https://dash.cloudflare.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-600 underline font-medium"
                >
                  dash.cloudflare.com
                </a>{' '}
                under Pages Direct Upload.
              </p>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="border-t border-slate-200 pt-4">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Pre-Configured Files in this Project:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  <code className="font-mono font-semibold text-slate-800">public/_redirects</code> (SPA 200 rewrite)
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  <code className="font-mono font-semibold text-slate-800">public/_headers</code> (Security & CDN Cache)
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero backend dependency (pure client engine)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Local storage auto-save + JSON project files</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <a
            href="https://developers.cloudflare.com/pages/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
          >
            Cloudflare Pages Docs <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition shadow-sm"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
