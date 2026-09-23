import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  ShieldCheck,
  Cloud,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  LogOut,
  UserCheck,
  ExternalLink,
} from 'lucide-react';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCloud?: () => void;
  isSavingCloud?: boolean;
}

export default function GoogleLoginModal({
  isOpen,
  onClose,
  onSaveCloud,
  isSavingCloud,
}: GoogleLoginModalProps) {
  const {
    user,
    signInWithGoogle,
    signInWithGoogleRedirect,
    logout,
    authError,
    authNotice,
    clearError,
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    clearError();
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    setIsSubmitting(true);
    clearError();
    try {
      await signInWithGoogleRedirect();
    } catch {
      // handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await logout();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="google-login-modal-title"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
              {/* Colorful Google G Logo */}
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h2 id="google-login-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                {user ? 'Google Account Connected' : 'Sign in with Google'}
              </h2>
              <p className="text-xs text-slate-300">
                {user ? 'Manage your Google login and cloud backups' : 'Log in via your Google Account only'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {authNotice && !authError && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-start gap-2.5">
              <span className="text-sm shrink-0">ℹ️</span>
              <div className="flex-1">
                <p className="font-semibold text-indigo-950">Notice</p>
                <p className="text-indigo-800">{authNotice}</p>
              </div>
            </div>
          )}

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Sign in notice</p>
                <p>{authError}</p>
                <button
                  type="button"
                  onClick={handleGoogleRedirectSignIn}
                  className="mt-1.5 text-xs font-semibold text-rose-900 underline hover:text-black cursor-pointer"
                >
                  Try redirect sign-in instead →
                </button>
              </div>
            </div>
          )}

          {user ? (
            /* Signed In State */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google Profile'}
                    className="w-12 h-12 rounded-full border-2 border-indigo-500/40 shadow-xs object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {user.displayName || 'Google User'}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                      <UserCheck className="w-3 h-3 mr-0.5" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                    ID: {user.uid.slice(0, 14)}...
                  </p>
                </div>
              </div>

              {/* Status and Cloud Backup Action */}
              <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-indigo-600" />
                    Google Cloud Auto-Backup
                  </span>
                  <span className="text-indigo-600 font-medium text-[11px]">Active</span>
                </div>
                <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                  Your feasibility model inputs, financial schedules, and thesis details are securely synced to your private Google user profile in the cloud.
                </p>

                {onSaveCloud && (
                  <button
                    onClick={onSaveCloud}
                    disabled={isSavingCloud}
                    className="w-full mt-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    {isSavingCloud ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Save Current Study to Cloud Now</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {/* Google Mini Icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  Switch Google Account
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out from Google
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out / Needs Google Sign-In */
            <div className="space-y-4">
              <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Direct Google Account Authentication</strong>
                    <p className="text-slate-500 text-[11px]">
                      Access is restricted exclusively to authenticated Google Accounts. No passwords to remember or reset.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Cloud className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Persistent Cloud Backup</strong>
                    <p className="text-slate-500 text-[11px]">
                      Save and automatically restore your financial feasibility studies across any browser or device.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <FileSpreadsheet className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Defense-Ready Financials</strong>
                    <p className="text-slate-500 text-[11px]">
                      Your 5-Year Income Statements, Balance Sheets, Cash Flows, and Break-Even analyses remain linked to your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Google Sign-In Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-400 font-semibold text-sm shadow-sm flex items-center justify-center gap-3 transition-all duration-150 cursor-pointer active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      {/* Standard Google G Logo */}
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                      <span>Sign in with Google Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <span>Powered by Google Authentication</span>
            <span>•</span>
            <span className="text-slate-400">Google accounts only</span>
          </p>
        </div>
      </div>
    </div>
  );
}
