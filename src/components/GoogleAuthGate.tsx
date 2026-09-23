import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  BarChart3,
  Cloud,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Calculator,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function GoogleAuthGate() {
  const {
    signInWithGoogle,
    signInWithGoogleRedirect,
    authError,
    authNotice,
    clearError,
  } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    clearError();
    try {
      await signInWithGoogle();
    } catch {
      // Handled in context
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRedirectSignIn = async () => {
    setIsRedirecting(true);
    clearError();
    try {
      await signInWithGoogleRedirect();
    } catch {
      // Handled in context
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="w-full border-b border-white/10 backdrop-blur-md bg-slate-950/40 relative z-10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              Feasibility Study Builder
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Undergrad Edition
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              Financial Feasibility & Projected Financial Statements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Google Login Required</span>
            <span className="sm:hidden">Protected</span>
          </span>
        </div>
      </header>

      {/* Main Authentication Card Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="max-w-xl w-full">
          {/* Card Container */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Header Badge */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Authorized Access Only</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Log In to Continue
              </h2>
            </div>

            {/* Notice (such as when user closed popup without completing) */}
            {authNotice && !authError && (
              <div
                role="status"
                className="p-3.5 bg-indigo-950/70 border border-indigo-400/40 rounded-2xl text-indigo-200 text-xs sm:text-sm flex items-start gap-3 shadow-inner"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ℹ️
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-indigo-100">Sign-In Notice</p>
                  <p className="mt-0.5 text-indigo-300/90">{authNotice}</p>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {authError && (
              <div
                role="alert"
                className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-inner"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-100">Authentication Notice</p>
                  <p className="mt-0.5 text-rose-300/90">{authError}</p>
                  <button
                    type="button"
                    onClick={handleRedirectSignIn}
                    className="mt-2 text-xs font-semibold text-rose-200 underline hover:text-white transition cursor-pointer"
                  >
                    Try signing in via full-page redirect instead →
                  </button>
                </div>
              </div>
            )}

            {/* Big Google Login Action Button */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn || isRedirecting}
                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-bold text-base shadow-xl shadow-black/20 flex items-center justify-center gap-3.5 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group border border-slate-200"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    <span>Opening Google Sign-in...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google 'G' Mark */}
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
                    <span>Sign in with Google</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-transform ml-auto" />
                  </>
                )}
              </button>

              {/* Alternative redirect trigger if popups are troublesome */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>🔒 Google Identity Services</span>
                <button
                  type="button"
                  onClick={handleRedirectSignIn}
                  disabled={isRedirecting || isSigningIn}
                  className="text-indigo-300 hover:text-indigo-200 underline transition cursor-pointer"
                >
                  {isRedirecting ? 'Redirecting...' : 'Popup blocked? Click here'}
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-400">
                🔒 Strict single-sign-on (SSO). Accounts are verified exclusively through Google.
              </p>
            </div>

            {/* Application Features / Value Props */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                What you get access to:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-white">5-Year Financial Statements</h3>
                    <p className="text-[11px] text-slate-400">Income Statement, Balance Sheet, & Cash Flows</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
                  <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-white">Capital Budgeting Ratios</h3>
                    <p className="text-[11px] text-slate-400">NPV, IRR, Payback Period, and Break-even points</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
                  <Cloud className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-white">Cloud Project Sync</h3>
                    <p className="text-[11px] text-slate-400">Automatic backup linked to your Google Account</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-white">CPA Defense Ready</h3>
                    <p className="text-[11px] text-slate-400">EOPT Law 25% Tax</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-4 px-4 text-center text-xs text-slate-500 relative z-10">
        <p>
          Feasibility Study Financial Statements Builder • Google Account Authentication Gate
        </p>
      </footer>
    </div>
  );
}
