import { useState, useMemo } from 'react';
import {
  AccessRequest,
  approveAccessRequest,
  rejectAccessRequest,
  revokeAccessRequest,
  PRIMARY_ADMIN_EMAIL,
} from '../services/accessControl';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  Search,
  Check,
  Copy,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface AdminApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: AccessRequest[];
  adminEmail: string;
}

type TabType = 'pending' | 'approved' | 'rejected';

export default function AdminApprovalModal({
  isOpen,
  onClose,
  requests,
  adminEmail,
}: AdminApprovalModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const pendingList = requests.filter((r) => r.status === 'pending');
  const approvedList = requests.filter((r) => r.status === 'approved');
  const rejectedList = requests.filter((r) => r.status === 'rejected');

  const currentList = useMemo(() => {
    let list: AccessRequest[] = [];
    if (activeTab === 'pending') list = pendingList;
    else if (activeTab === 'approved') list = approvedList;
    else list = rejectedList;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        r.displayName?.toLowerCase().includes(q)
    );
  }, [activeTab, pendingList, approvedList, rejectedList, searchQuery]);

  const handleApprove = async (userId: string, name: string) => {
    setProcessingId(userId);
    setFeedback(null);
    try {
      await approveAccessRequest(userId, adminEmail);
      setFeedback({
        type: 'success',
        message: `Approved access for ${name || 'User'}! They can now access the website.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to approve user.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string, name: string) => {
    setProcessingId(userId);
    setFeedback(null);
    try {
      await rejectAccessRequest(userId, adminEmail);
      setFeedback({
        type: 'success',
        message: `Declined access for ${name || 'User'}.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to decline request.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (userId: string, name: string) => {
    setProcessingId(userId);
    setFeedback(null);
    try {
      await revokeAccessRequest(userId, adminEmail);
      setFeedback({
        type: 'success',
        message: `Access revoked for ${name || 'User'}.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to revoke access.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const copyApprovalLink = (req: AccessRequest) => {
    const origin = window.location.origin;
    const link = `${origin}/?action=approve_access&userId=${encodeURIComponent(
      req.userId
    )}&token=${encodeURIComponent(req.approvalToken)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(req.userId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 text-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-approval-modal-title"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="admin-approval-modal-title" className="text-lg font-bold text-white tracking-tight">
                  Access Authorization Console
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CPA Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Owner & Approver: <strong className="text-amber-300">{PRIMARY_ADMIN_EMAIL}</strong>
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-5 border-b border-white/10 pb-0">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Requests</span>
              {pendingList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {pendingList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'approved'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approved Users ({approvedList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'rejected'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Declined / Revoked ({rejectedList.length})</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 text-xs font-semibold flex items-center justify-between gap-2 shrink-0 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-3 sm:px-6 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* User List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          {currentList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Clock className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-600">
                {activeTab === 'pending'
                  ? 'No pending access requests'
                  : activeTab === 'approved'
                  ? 'No approved users found'
                  : 'No declined requests'}
              </p>
              <p className="text-xs text-slate-400">
                {activeTab === 'pending'
                  ? 'When someone attempts to log in via Google, their request will appear here.'
                  : 'Use the tabs above to manage authorized users.'}
              </p>
            </div>
          ) : (
            currentList.map((req) => (
              <div
                key={req.userId}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  {req.photoURL ? (
                    <img
                      src={req.photoURL}
                      alt={req.displayName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {(req.displayName || req.email).charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {req.displayName || 'Google User'}
                      </span>
                      {req.status === 'approved' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Approved
                        </span>
                      ) : req.status === 'rejected' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          Declined
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                          Pending Approval
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{req.email}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Requested: {new Date(req.requestedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => copyApprovalLink(req)}
                    title="Copy 1-Click Approval Link"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs transition cursor-pointer"
                  >
                    {copiedId === req.userId ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {req.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        disabled={processingId === req.userId}
                        onClick={() => handleApprove(req.userId, req.displayName)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {processingId === req.userId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Approve Access</span>
                      </button>

                      <button
                        type="button"
                        disabled={processingId === req.userId}
                        onClick={() => handleReject(req.userId, req.displayName)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Deny</span>
                      </button>
                    </>
                  )}

                  {req.status === 'approved' && (
                    <button
                      type="button"
                      disabled={processingId === req.userId}
                      onClick={() => handleRevoke(req.userId, req.displayName)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Revoke Access</span>
                    </button>
                  )}

                  {req.status === 'rejected' && (
                    <button
                      type="button"
                      disabled={processingId === req.userId}
                      onClick={() => handleApprove(req.userId, req.displayName)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Re-Approve</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Decisions update the requester's screen in real-time</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
