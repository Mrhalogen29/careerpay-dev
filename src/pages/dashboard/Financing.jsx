import React, { useState, useEffect } from "react";
import {
  Wallet,
  Landmark,
  ShieldCheck,
  Clock,
  Plus,
  X,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  applyForFinancing,
  getCompanyFinancing,
  disburseFinancing,
  makeRepayment,
  getFinancingStats,
} from "../../services/financing";
import { motion, AnimatePresence } from "framer-motion";
import LoanApprovals from "./LoanApprovals";

// Staff loans are on hold. Set VITE_ENABLE_STAFF_LOANS=true (and restart Vite) to bring them back.
const LOANS_ENABLED = import.meta.env.VITE_ENABLE_STAFF_LOANS === "true";

const STATUS_STYLES = {
  approved: "bg-green-50 text-green-600",
  under_review: "bg-yellow-50 text-yellow-600",
  rejected: "bg-red-50 text-red-600",
  active: "bg-blue-50 text-blue-600",
  completed: "bg-gray-100 text-gray-600",
  defaulted: "bg-red-100 text-red-700",
};

const StatCard = ({ label, value, icon: Icon, bg, iconColor }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all relative overflow-hidden">
    <div className={`p-4 rounded-2xl  ${bg} w-fit`}>
      <Icon size={24} strokeWidth={2.5} className={iconColor} />
    </div>
    <div className="mt-6">
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-black text-gray-900 tracking-tight">
        {value}
      </h3>
    </div>
  </div>
);

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent outline-none focus:ring-2 focus:ring-[#1D4EFF] transition-all text-sm font-medium";

function ApplyModal({ onClose, onApplied }) {
  const [form, setForm] = useState({
    requestedAmount: "",
    purpose: "payroll",
    repaymentTermDays: "30",
    repaymentFrequency: "monthly",
    monthlyPayrollCost: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.requestedAmount || !form.repaymentTermDays) {
      setError("Requested amount and repayment term are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await applyForFinancing({
        requestedAmount: Number(form.requestedAmount),
        currency: "NGN",
        purpose: form.purpose,
        repaymentTermDays: Number(form.repaymentTermDays),
        repaymentFrequency: form.repaymentFrequency,
        companyDetails: {
          monthlyPayrollCost: Number(form.monthlyPayrollCost) || undefined,
        },
      });
      if (res.success) {
        onApplied(res.message);
      }
    } catch (err) {
      const data = err.response?.data;
      let message = data?.message || "Application failed. Please try again.";
      if (data?.reasons?.length) {
        message += " — " + data.reasons.join("; ");
      }
      if (data?.maxCreditLimit) {
        message += ` (Max: ₦${data.maxCreditLimit.toLocaleString()})`;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-[2rem] max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900">
            New Loan Application
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />{" "}
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Requested Amount (₦)*
            </label>
            <input
              type="number"
              min="1"
              name="requestedAmount"
              value={form.requestedAmount}
              onChange={handleChange}
              placeholder="e.g. 2000000"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Monthly Payroll Cost (₦)
            </label>
            <input
              type="number"
              min="0"
              name="monthlyPayrollCost"
              value={form.monthlyPayrollCost}
              onChange={handleChange}
              placeholder="Used to calculate your credit limit"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Purpose
            </label>
            <select
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="payroll">Payroll</option>
              <option value="expansion">Expansion</option>
              <option value="working_capital">Working Capital</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Repayment Term*
            </label>
            <select
              name="repaymentTermDays"
              value={form.repaymentTermDays}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Repayment Frequency
            </label>
            <select
              name="repaymentFrequency"
              value={form.repaymentFrequency}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="monthly">Monthly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
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
              "Submit Application"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Financing() {
  const [stats, setStats] = useState(null);
  const [financings, setFinancings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [notice, setNotice] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [statsRes, listRes] = await Promise.all([
        getFinancingStats(),
        getCompanyFinancing(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (listRes.success) setFinancings(listRes.data);
    } catch (err) {
      console.error("Failed to load financing data:", err);
      setError(err.response?.data?.message || "Failed to load financing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDisburse = async (id) => {
    setActionLoading(id);
    try {
      await disburseFinancing(id);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to disburse financing.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRepay = async (financing) => {
    const amountStr = window.prompt(
      `Outstanding balance: ₦${financing.outstandingBalance.toLocaleString()}\nEnter repayment amount:`,
    );
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return;

    setActionLoading(financing._id);
    try {
      await makeRepayment(financing._id, { amount });
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process repayment.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Accessing Credit Markets...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Financing & Credit
          </h1>
          <p className="text-gray-500 font-medium">
            Access talent credit, manage facilities, and scale operations.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          New Loan Application
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          label="Total Applications"
          value={stats?.totalApplications ?? 0}
          icon={Wallet}
          bg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Active Loans"
          value={stats?.activeLoans ?? 0}
          icon={Landmark}
          bg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatCard
          label="Total Borrowed"
          value={`₦${(stats?.totalBorrowed || 0).toLocaleString()}`}
          icon={ShieldCheck}
          bg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          label="Outstanding Balance"
          value={`₦${(stats?.outstandingBalance || 0).toLocaleString()}`}
          icon={Clock}
          bg="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-black text-gray-900 mb-8">Applications</h3>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {financings.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">
                No financing applications yet.
              </p>
            ) : (
              financings.map((f) => (
                <motion.div
                  key={f._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between p-5 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-black text-gray-900">
                        ₦{f.requestedAmount.toLocaleString()}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[f.status] || "bg-gray-50 text-gray-500"}`}
                      >
                        {f.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                      {f.purpose} · {f.repaymentTermDays}-day term · Credit
                      score {f.creditScore ?? "N/A"}
                      {f.status === "active" &&
                        ` · Outstanding: ₦${f.outstandingBalance.toLocaleString()}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {f.status === "approved" && (
                      <button
                        onClick={() => handleDisburse(f._id)}
                        disabled={actionLoading === f._id}
                        className="flex items-center gap-2 bg-green-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === f._id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          "Disburse"
                        )}
                      </button>
                    )}
                    {f.status === "active" && (
                      <button
                        onClick={() => handleRepay(f)}
                        disabled={actionLoading === f._id}
                        className="flex items-center gap-2 bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading === f._id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          "Make Repayment"
                        )}
                      </button>
                    )}
                    <ChevronRight size={18} className="text-gray-300" />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Staff loan requests from employees (separate from company financing above) */}
      {LOANS_ENABLED && <LoanApprovals embedded />}

      {showModal && (
        <ApplyModal
          onClose={() => setShowModal(false)}
          onApplied={(message) => {
            setShowModal(false);
            setNotice(message);
            fetchAll();
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
