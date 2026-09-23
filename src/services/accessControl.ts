import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  onSnapshot,
  Unsubscribe,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebase';

export const PRIMARY_ADMIN_EMAIL = 'suarezjohnjoebertcpa@gmail.com';
export const SECONDARY_ADMIN_EMAIL = 'gerbertovirtudazo2@gmail.com';

export const ADMIN_EMAILS = [
  PRIMARY_ADMIN_EMAIL.toLowerCase(),
  SECONDARY_ADMIN_EMAIL.toLowerCase(),
];

export interface AccessRequest {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  approvalToken: string;
  rejectionReason?: string | null;
  notificationSent?: boolean;
}

/**
 * Check if the email belongs to the authorized administrator
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Generate a random security token for 1-click email action verification
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Send email notification to suarezjohnjoebertcpa@gmail.com
 * Dispatches via multiple resilient channels:
 * 1. FormSubmit email dispatch endpoint (delivers clean email directly to suarezjohnjoebertcpa@gmail.com)
 * 2. Prepares a fallback direct mailto link
 */
export async function sendAccessNotificationToAdmin(
  request: AccessRequest
): Promise<{ success: boolean; method: string }> {
  const origin = window.location.origin;
  const approveUrl = `${origin}/?action=approve_access&userId=${encodeURIComponent(
    request.userId
  )}&token=${encodeURIComponent(request.approvalToken)}`;
  const denyUrl = `${origin}/?action=deny_access&userId=${encodeURIComponent(
    request.userId
  )}&token=${encodeURIComponent(request.approvalToken)}`;
  const adminDashboardUrl = `${origin}/?action=admin_approvals`;

  const payload = {
    _subject: `[URGENT] Website Access Request from ${request.displayName || request.email} - Feasibility Study Builder`,
    _template: 'table',
    _captcha: 'false',
    approver: PRIMARY_ADMIN_EMAIL,
    requester_name: request.displayName || 'Unspecified Name',
    requester_email: request.email,
    requested_at: new Date(request.requestedAt).toLocaleString(),
    system: 'Feasibility Study Financial Statements Builder',
    instructions:
      'A user is requesting authorization to access the Feasibility Study Financial Statements Builder website. As the CPA owner, please click one of the decision links below to approve or deny access.',
    approve_access_link: approveUrl,
    deny_access_link: denyUrl,
    open_cpa_dashboard: adminDashboardUrl,
  };

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${PRIMARY_ADMIN_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.info('Notification email dispatched to suarezjohnjoebertcpa@gmail.com via FormSubmit');
      return { success: true, method: 'email_api' };
    }
  } catch (err) {
    console.warn('Could not dispatch via automated email endpoint:', err);
  }

  return { success: false, method: 'in_app' };
}

/**
 * Generate a mailto link for direct manual email dispatch
 */
export function generateAdminMailtoUrl(request: AccessRequest): string {
  const origin = window.location.origin;
  const approveUrl = `${origin}/?action=approve_access&userId=${encodeURIComponent(
    request.userId
  )}&token=${encodeURIComponent(request.approvalToken)}`;
  const denyUrl = `${origin}/?action=deny_access&userId=${encodeURIComponent(
    request.userId
  )}&token=${encodeURIComponent(request.approvalToken)}`;

  const subject = encodeURIComponent(
    `[Website Access Request] ${request.displayName || request.email}`
  );
  const body = encodeURIComponent(
    `Hello Sir Suarez,\n\n` +
      `I am requesting permission to log in and use the Feasibility Study Financial Statements Builder.\n\n` +
      `Requester Details:\n` +
      `- Name: ${request.displayName || 'Not specified'}\n` +
      `- Google Account: ${request.email}\n` +
      `- Requested At: ${new Date(request.requestedAt).toLocaleString()}\n\n` +
      `To approve my access, click this link:\n${approveUrl}\n\n` +
      `To deny access, click this link:\n${denyUrl}\n\n` +
      `Thank you!`
  );

  return `mailto:${PRIMARY_ADMIN_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Create or retrieve access request for a user
 */
export async function getOrCreateAccessRequest(
  user: User
): Promise<{ request: AccessRequest; isNew: boolean }> {
  // If the user is the admin himself, automatically approve
  const isAdmin = isUserAdmin(user.email);
  const requestRef = doc(db, 'access_requests', user.uid);

  try {
    const snap = await getDoc(requestRef);
    if (snap.exists()) {
      const data = snap.data() as AccessRequest;
      // If admin, ensure approved
      if (isAdmin && data.status !== 'approved') {
        const updated: AccessRequest = {
          ...data,
          status: 'approved',
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'system_admin_override',
        };
        await setDoc(requestRef, updated, { merge: true });
        return { request: updated, isNew: false };
      }
      return { request: data, isNew: false };
    }

    // Create new request
    const token = generateToken();
    const newRequest: AccessRequest = {
      userId: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || '',
      status: isAdmin ? 'approved' : 'pending',
      requestedAt: new Date().toISOString(),
      approvalToken: token,
      notificationSent: false,
    };

    if (isAdmin) {
      newRequest.reviewedAt = new Date().toISOString();
      newRequest.reviewedBy = 'system_admin_override';
    }

    await setDoc(requestRef, newRequest);

    // If regular user, send notification to CPA admin
    if (!isAdmin) {
      sendAccessNotificationToAdmin(newRequest)
        .then(async ({ success }) => {
          if (success) {
            await updateDoc(requestRef, { notificationSent: true }).catch(() => {});
          }
        })
        .catch(() => {});
    }

    return { request: newRequest, isNew: true };
  } catch (err) {
    console.error('Error fetching or creating access request:', err);
    throw err;
  }
}

/**
 * Subscribe in real-time to a user's access status
 */
export function subscribeToUserAccessStatus(
  userId: string,
  onUpdate: (request: AccessRequest | null) => void
): Unsubscribe {
  const requestRef = doc(db, 'access_requests', userId);
  return onSnapshot(
    requestRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as AccessRequest);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn('Error listening to user access status:', err);
    }
  );
}

/**
 * Subscribe in real-time to all access requests (Admin only)
 */
export function subscribeToAllAccessRequests(
  onUpdate: (requests: AccessRequest[]) => void
): Unsubscribe {
  const reqCol = collection(db, 'access_requests');
  const q = query(reqCol, orderBy('requestedAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const list: AccessRequest[] = [];
      snap.forEach((d) => {
        list.push(d.data() as AccessRequest);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Error listening to all access requests:', err);
    }
  );
}

/**
 * Approve access request
 */
export async function approveAccessRequest(
  userId: string,
  reviewerEmail: string
): Promise<void> {
  const requestRef = doc(db, 'access_requests', userId);
  await updateDoc(requestRef, {
    status: 'approved',
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerEmail,
    rejectionReason: null,
  });
}

/**
 * Reject access request
 */
export async function rejectAccessRequest(
  userId: string,
  reviewerEmail: string,
  reason?: string
): Promise<void> {
  const requestRef = doc(db, 'access_requests', userId);
  await updateDoc(requestRef, {
    status: 'rejected',
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerEmail,
    rejectionReason: reason || 'Access request was not authorized by the administrator.',
  });
}

/**
 * Revoke existing approval
 */
export async function revokeAccessRequest(
  userId: string,
  reviewerEmail: string
): Promise<void> {
  const requestRef = doc(db, 'access_requests', userId);
  await updateDoc(requestRef, {
    status: 'rejected',
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerEmail,
    rejectionReason: 'Access was revoked by the administrator.',
  });
}

/**
 * Handle 1-click token action from email link
 */
export async function handleEmailActionToken(
  action: 'approve_access' | 'deny_access',
  userId: string,
  token: string,
  reviewerEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    const requestRef = doc(db, 'access_requests', userId);
    const snap = await getDoc(requestRef);
    if (!snap.exists()) {
      return { success: false, message: 'Request record not found.' };
    }

    const data = snap.data() as AccessRequest;
    if (data.approvalToken !== token && !isUserAdmin(reviewerEmail)) {
      return { success: false, message: 'Invalid or expired authorization token.' };
    }

    if (action === 'approve_access') {
      await updateDoc(requestRef, {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewerEmail || PRIMARY_ADMIN_EMAIL,
        rejectionReason: null,
      });
      return {
        success: true,
        message: `Successfully approved access for ${data.displayName || data.email}!`,
      };
    } else {
      await updateDoc(requestRef, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewerEmail || PRIMARY_ADMIN_EMAIL,
        rejectionReason: 'Access request declined via email link.',
      });
      return {
        success: true,
        message: `Declined access for ${data.displayName || data.email}.`,
      };
    }
  } catch (err: any) {
    console.error('Error handling email action token:', err);
    return { success: false, message: err?.message || 'Failed to process authorization action.' };
  }
}
