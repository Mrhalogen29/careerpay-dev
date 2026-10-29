import React, { useState, useEffect } from "react";
import {
  History,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  getAllTransactions,
  getAuditLogsByModule,
} from "../../services/payroll";

const STATUS_CONFIG = {
  success: {
    label: "Success",
    color: "bg-green-50 text-green-600",
    icon: CheckCircle2,
  },
  failed: { label: "Failed", color: "bg-red-50 text-red-600", icon: XCircle },
  processing: {
    label: "Processing",
    color: "bg-orange-50 text-orange-600",
    icon: Loader2,
  },
  pending: {
    label: "Pending",
    color: "bg-gray-100 text-gray-500",
    icon: Clock,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-200 text-gray-600",
    icon: XCircle,
  },
};

const FILTERS = [
  { value: "", label: "All" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "processing", label: "Processing" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const SUMMARY_CARDS = [
  { key: "total", label: "Total", color: "text-gray-500" },
  { key: "success", label: "Success", color: "text-green-600" },
  { key: "failed", label: "Failed", color: "text-red-600" },
  { key: "processing", label: "Processing", color: "text-orange-600" },
  { key: "pending", label: "Pending", color: "text-gray-500" },
  { key: "cancelled", label: "Cancelled", color: "text-gray-500" },
];

export default function AuditLog() {
  const [summary, setSummary] = useState({
    total: 0,
    success: 0,
    failed: 0,
    pending: 0,
    processing: 0,
    cancelled: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [txRes, activityRes] = await Promise.all([
        getAllTransactions(statusFilter ? { status: statusFilter } : {}),
        getAuditLogsByModule("payroll"),
      ]);
      if (txRes.success) {
        setSummary(txRes.data.summary);
        setTransactions(txRes.data.transactions);
      }
      if (activityRes.success) {
        setActivity(activityRes.data);
      }
    } catch (err) {
      console.error("Failed to load audit data:", err);
      setError(err.response?.data?.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const formatAction = (action) =>
    action
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Loading Audit Data...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Audit & Payment Logs
          </h1>
          <p className="text-gray-500 font-medium">
            Track every payment's status and the activity trail behind it.
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 bg-white text-gray-700 px-5 py-3 rounded-2xl font-bold text-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {SUMMARY_CARDS.map((card) => (
          <div
            key={card.key}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
          >
            <p className={`text-xs font-bold uppercase ${card.color}`}>
              {card.label}
            </p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {summary[card.key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900">
            Payment Transactions
          </h3>
          <div className="flex items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === f.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {[
                  "Employee",
                  "Amount",
                  "Gateway",
                  "Reference",
                  "Date",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-400 text-sm"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const config =
                    STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
                  const StatusIcon = config.icon;
                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-gray-50/50 transition-all"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">
                          {tx.employee?.user?.firstName}{" "}
                          {tx.employee?.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {tx.employee?.employeeId}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        ₦{Number(tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                        {tx.gateway || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                        {tx.paymentReference}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${config.color}`}
                        >
                          <StatusIcon
                            size={12}
                            className={
                              tx.status === "processing" ? "animate-spin" : ""
                            }
                          />
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <History size={20} className="text-gray-400" />
          <h3 className="text-xl font-black text-gray-900">
            Payroll Activity Trail
          </h3>
        </div>
        <div className="space-y-4">
          {activity.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No activity recorded yet.
            </p>
          ) : (
            activity.map((log) => (
              <div
                key={log._id}
                className="flex items-start justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {formatAction(log.action)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.user?.firstName} {log.user?.lastName} ·{" "}
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    log.status === "success"
                      ? "bg-green-50 text-green-600"
                      : log.status === "failure"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {log.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
