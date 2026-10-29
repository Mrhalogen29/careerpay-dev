import React, { useState, useEffect } from "react";
import { Wallet, Plus, X, Loader2, AlertCircle } from "lucide-react";
import {
  requestLoan,
  getMyLoans,
  cancelLoan,
} from "../../services/employeeLoans";

const STATUS_STYLES = {
  pending: "bg-yellow-50 text-yellow-600",
  approved: "bg-green-50 text-green-600",
  active: "bg-blue-50 text-blue-600",
  completed: "bg-gray-100 text-gray-600",
  rejected: "bg-red-50 text-red-600",
  cancelled: "bg-gray-100 text-gray-500",
};

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent outline-none focus:ring-2 focus:ring-[#1D4EFF] transition-all text-sm font-medium";

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

function RequestModal({ onClose, onRequested }) {
  const [form, setForm] = useState({
    requestedAmount: "",
    termMonths: "3",
    purpose: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Same formula the backend uses, shown as a preview only
  const amount = Number(form.requestedAmount);
  const months = Number(form.termMonths);
  const installmentPreview =
    amount > 0 && months > 0 ? Math.ceil(amount / months) : 0;

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      setError("Enter the amount you want to borrow.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await requestLoan({
        requestedAmount: amount,
        termMonths: months,
        purpose: form.purpose.trim() || undefined,
      });
      if (res.success) onRequested(res.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not submit your request. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-[2rem] max-w-xl w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900">Request a Loan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Amount (₦)*
            </label>
            <input
              type="number"
              min="1"
              name="requestedAmount"
              value={form.requestedAmount}
              onChange={handleChange}
              placeholder="e.g. 100000"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Repayment Period*
            </label>
            <select
              name="termMonths"
              value={form.termMonths}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              {[1, 2, 3, 4, 6, 9, 12, 18, 24].map((m) => (
                <option key={m} value={m}>
                  {m} {m === 1 ? "month" : "months"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Purpose
            </label>
            <input
              type="text"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="Optional"
              className={inputClass}
            />
          </div>

          {installmentPreview > 0 && (
            <div className="bg-blue-50 text-blue-700 rounded-xl px-4 py-3 text-sm font-bold">
              About {naira(installmentPreview)} will be deducted from your
              salary each month.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-[#1D4EFF] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyLoans();
      if (res.success) setLoans(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your loans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this loan request?")) return;
    setActionLoading(id);
    try {
      await cancelLoan(id);
      await fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel the request.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Loading your loans...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            My Loans
          </h1>
          <p className="text-gray-500 font-medium">
            Request a salary loan. Repayments are deducted automatically from
            your pay.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          Request a Loan
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-black text-gray-900 mb-8">Loan History</h3>
        <div className="space-y-3">
          {loans.length === 0 ? (
            <div className="text-center py-10">
              <Wallet className="mx-auto text-gray-300 mb-3" size={32} />
              <p className="text-gray-400 text-sm">
                You haven't requested any loans yet.
              </p>
            </div>
          ) : (
            loans.map((l) => (
              <div
                key={l._id}
                className="flex items-center justify-between p-5 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-black text-gray-900">
                      {naira(l.approvedAmount || l.requestedAmount)}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[l.status] || "bg-gray-50 text-gray-500"}`}
                    >
                      {l.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    {l.termMonths} {l.termMonths === 1 ? "month" : "months"}
                    {l.monthlyInstallment
                      ? ` · ${naira(l.monthlyInstallment)} per month`
                      : ""}
                    {l.status === "active" &&
                      ` · Remaining: ${naira(l.outstandingBalance)}`}
                    {l.status === "rejected" &&
                      l.rejectionReason &&
                      ` · Reason: ${l.rejectionReason}`}
                  </p>
                </div>

                {l.status === "pending" && (
                  <button
                    onClick={() => handleCancel(l._id)}
                    disabled={actionLoading === l._id}
                    className="flex items-center gap-2 bg-gray-100 text-gray-600 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-200 disabled:opacity-50"
                  >
                    {actionLoading === l._id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      "Cancel Request"
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <RequestModal
          onClose={() => setShowModal(false)}
          onRequested={(message) => {
            setShowModal(false);
            setNotice(message);
            fetchLoans();
          }}
        />
      )}

      {notice && (
        <div className="fixed bottom-8 right-8 bg-[#0a1628] text-white px-6 py-4 rounded-2xl shadow-2xl max-w-sm z-50">
          <p className="text-sm font-bold">{notice}</p>
          <button
            onClick={() => setNotice("")}
            className="text-xs text-gray-400 mt-2 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
