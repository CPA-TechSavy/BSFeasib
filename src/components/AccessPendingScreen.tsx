import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AccessRequest,
  PRIMARY_ADMIN_EMAIL,
  sendAccessNotificationToAdmin,
  generateAdminMailtoUrl,
} from '../services/accessControl';
import {
  Clock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Send,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  ExternalLink,
} from 'lucide-react';

interface AccessPendingScreenProps {
  request: AccessRequest;
  onRefresh?: () => void;
}

export default function AccessPendingScreen({
  request,
  onRefresh,
}: AccessPendingScreenProps) {
  const { user, logout } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const isRejected = request.status === 'rejected';

  const handleResendNotification = async () => {
    setIsResending(true);
    setResendStatus(null);
    try {
      await sendAccessNotificationToAdmin(request);
      setResendStatus('Notification sent to suarezjohnjoebertcpa@gmail.com successfully!');
      setTimeout(() => setResendStatus(null), 5000);
    } catch {
      setResendStatus('Could not send notification. You can use the Direct Email button below.');
    } finally {
      setIsResending(false);
    }
  };

  const mailtoUrl = generateAdminMailtoUrl(request);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="w-full border-b border-white/10 backdrop-blur-md bg-slate-950/40 relative z-10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              Feasibility Study Builder
            </h1>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              Financial Feasibility & Projected Financial Statements
            </p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="max-w-xl w-full">
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Status Icon & Header */}
            <div className="text-center space-y-3">
              {isRejected ? (
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
                  <ShieldAlert className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10 animate-pulse">
                  <Clock className="w-8 h-8" />
                </div>
              )}

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRejected ? 'bg-rose-500' : 'bg-amber-400 animate-ping'
                  }`}
                />
                {isRejected ? 'Access Authorization Declined' : 'Authorization Required'}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isRejected ? 'Access Request Not Approved' : 'Waiting for CPA Approval'}
              </h2>

              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {isRejected
                  ? 'The administrator has declined access for this Google account. If this is an error, please reach out to the CPA directly.'
                  : 'An access notification was sent to John Joebert Suarez, CPA. Only authorized users can enter this website.'}
              </p>
            </div>

            {/* Notification alert banner */}
            {resendStatus && (
              <div
                role="status"
                className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resendStatus}</span>
              </div>
            )}

            {/* Requester Info Card */}
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-700/50">
                <span>Google Account Details</span>
                <span className="font-mono text-[11px] text-slate-400">ID: {request.userId.substring(0, 8)}...</span>
              </div>

              <div className="flex items-center gap-3.5">
                {request.photoURL ? (
                  <img
                    src={request.photoURL}
                    alt={request.displayName}
                    className="w-11 h-11 rounded-full object-cover border border-amber-400/40 shadow-xs"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                    {(request.displayName || request.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{request.displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{request.email}</p>
                </div>
              </div>

              <div className="pt-2 text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Approver:</span>
                  <span className="font-semibold text-amber-300 truncate max-w-[240px]">
                    {PRIMARY_ADMIN_EMAIL}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Submitted at:</span>
                  <span className="text-slate-200">
                    {new Date(request.requestedAt).toLocaleString()}
                  </span>
                </div>
                {isRejected && request.rejectionReason && (
                  <div className="mt-2 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-200 text-xs">
                    <span className="font-bold">Reason: </span>
                    {request.rejectionReason}
                  </div>
                )}
              </div>
            </div>

            {/* Live Synchronizer Notice */}
            {!isRejected && (
              <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/20 text-indigo-200 text-xs flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                <span>
                  <strong>Live Synchronization Active:</strong> You do not need to refresh this page. As soon as the CPA approves your request, you will automatically be directed inside.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {!isRejected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleResendNotification}
                    disabled={isResending}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60 shadow-md shadow-indigo-600/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isResending ? 'Sending...' : 'Resend Notification'}</span>
                  </button>

                  <a
                    href={mailtoUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.99] border border-slate-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>Email CPA Directly</span>
                  </a>
                </div>
              )}

              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Status Now</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => logout()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out / Switch Google Account</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-3.5 px-4 text-center text-xs text-slate-500 relative z-10">
        <p>
          Feasibility Study Financial Statements Builder • Administrator Authorization Gateway
        </p>
      </footer>
    </div>
  );
}
