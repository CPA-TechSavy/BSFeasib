import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with databaseId as required by AI Studio guidelines
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export class AuthCancelledError extends Error {
  readonly isCancelled = true;
  constructor(message = 'Google sign-in was closed before completing. Click "Sign in with Google" to try again.') {
    super(message);
    this.name = 'AuthCancelledError';
  }
}

// Operation Types for error logging
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is unreachable.');
    }
  }
}
testConnection();

/**
 * Sync user profile to Firestore
 */
export async function syncUserProfile(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to sync user profile document:', err);
  }
}

/**
 * Check if a redirect result exists on boot
 */
export async function checkRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      await syncUserProfile(result.user);
      return result.user;
    }
    return null;
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      return null;
    }
    console.warn('Redirect auth check notice:', error);
    return null;
  }
}

/**
 * Sign in specifically with Google Account via popup
 */
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (user) {
      await syncUserProfile(user);
    }

    return user;
  } catch (error: any) {
    // Check if user dismissed popup or cancelled
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      throw new AuthCancelledError();
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Google sign-in popup was blocked by your browser. Please allow popups or try redirect sign-in.');
    }
    throw error;
  }
}

/**
 * Sign in specifically with Google Account via redirect fallback
 */
export async function loginWithGoogleRedirect(): Promise<void> {
  await signInWithRedirect(auth, googleProvider);
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Save user project to cloud
 */
export async function saveUserProjectToCloud(
  userId: string,
  projectId: string,
  projectData: any
): Promise<void> {
  const path = `users/${userId}/projects/${projectId}`;
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await setDoc(projectRef, {
      id: projectId,
      userId,
      title: projectData.title || 'Untitled Feasibility Study',
      projectJson: JSON.stringify(projectData),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Load user project from cloud
 */
export async function loadUserProjectFromCloud(
  userId: string,
  projectId: string
): Promise<any | null> {
  const path = `users/${userId}/projects/${projectId}`;
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    const snapshot = await getDoc(projectRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    if (data?.projectJson) {
      return JSON.parse(data.projectJson);
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
