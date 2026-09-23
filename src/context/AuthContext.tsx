import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  loginWithGoogle,
  loginWithGoogleRedirect,
  checkRedirectResult,
  logoutUser,
  AuthCancelledError,
} from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  authNotice: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // Check for redirect sign-in result first
    checkRedirectResult().catch((e) => {
      console.warn('Redirect check failed:', e);
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        console.warn('Auth state error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    try {
      setAuthError(null);
      setAuthNotice(null);
      await loginWithGoogle();
      setIsLoginModalOpen(false);
    } catch (err: any) {
      if (err instanceof AuthCancelledError || err?.isCancelled) {
        // User closed or dismissed the popup. This is an expected cancellation, not a crash.
        console.info('Google sign-in popup was closed by user.');
        setAuthNotice('Google sign-in popup was closed before completing. Click "Sign in with Google" to try again.');
        return;
      }

      console.warn('Google sign-in issue:', err);
      setAuthError(err?.message || 'Failed to sign in with Google Account.');
    }
  };

  const handleSignInWithGoogleRedirect = async () => {
    try {
      setAuthError(null);
      setAuthNotice(null);
      await loginWithGoogleRedirect();
    } catch (err: any) {
      console.warn('Google redirect sign-in issue:', err);
      setAuthError(err?.message || 'Failed to initiate Google sign-in redirect.');
    }
  };

  const handleLogout = async () => {
    try {
      setAuthError(null);
      setAuthNotice(null);
      await logoutUser();
    } catch (err: any) {
      console.warn('Logout issue:', err);
      setAuthError(err?.message || 'Failed to sign out.');
    }
  };

  const clearError = () => {
    setAuthError(null);
    setAuthNotice(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        authNotice,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithGoogleRedirect: handleSignInWithGoogleRedirect,
        logout: handleLogout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
