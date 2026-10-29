import { useState, useEffect, useCallback } from "react";
import { Check, X, Banknote, Loader2 } from "lucide-react";
import {
  getCompanyLoans,
  approveLoan,
  rejectLoan,
  activateLoan,
} from "../../services/employeeLoans";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "active", label: "Active" },
  { key: "", label: "All" },
];

const STATUS_STYLES = {
  pending: "bg-yellow-50 text-yellow-600 ring-1 ring-yellow-500/20",
  approved: "bg-blue-50 text-blue-600 ring-1 ring-blue-500/20",
  active: "bg-green-50 text-green-600 ring-1 ring-green-500/20",
  rejected: "bg-red-50 text-red-600 ring-1 ring-red-500/20",
  completed: "bg-gray-100 text-gray-600 ring-1 ring-gray-500/20",
  cancelled: "bg-gray-100 text-gray-500 ring-1 ring-gray-500/20",
};

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function LoanApprovals({ embedded = false }) {
  const [tab, setTab] = useState("pending");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  // One dialog at a time: { type: "approve" | "reject" | "activate", loan }
  const [dialog, setDialog] = useState(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [installment, setInstallment] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const res = await getCompanyLoans(tab ? { status: tab } : {});
      if (res.success) setLoans(res.data);
    } catch (err) {
      setPageError(
        err?.response?.data?.message || "Could not load loan requests",
      );
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const openDialog = (type, loan) => {
    setDialog({ type, loan });
    setDialogError("");
    setReason("");
    if (type === "approve") {
      setApprovedAmount(String(loan.requestedAmount));
      setInstallment(String(Math.ceil(loan.requestedAmount / loan.termMonths)));
    }
  };

  const closeDialog = () => {
    if (!submitting) setDialog(null);
  };

  // Changing the amount re-suggests the installment for the employee's chosen term
  const onAmountChange = (value) => {
    setApprovedAmount(value);
    const n = Number(value);
    if (n > 0 && dialog) {
      setInstallment(String(Math.ceil(n / dialog.loan.termMonths)));
    }
  };

  const handleSubmit = async () => {
    if (!dialog) return;
    const { type, loan } = dialog;
    setSubmitting(true);
    setDialogError("");

    try {
      let res;
      if (type === "approve") {
        const amount = Number(approvedAmount);
        const inst = Number(installment);
        if (!(amount > 0) || amount > loan.requestedAmount) {
          throw new Error(
            `Approved amount must be above 0 and not more than ${naira(loan.requestedAmount)}`,
          );
        }
        if (!(inst > 0) || inst > amount) {
          throw new Error(
            "Monthly installment must be above 0 and not more than the approved amount",
          );
        }
        res = await approveLoan(loan._id, {
          approvedAmount: amount,
          monthlyInstallment: inst,
        });
      } else if (type === "reject") {
        if (!reason.trim())
          throw new Error("Please give a reason for rejecting");
        res = await rejectLoan(loan._id, reason.trim());
      } else {
        res = await activateLoan(loan._id);
      }

      setNotice(res?.message || "Done");
      setDialog(null);
      await fetchLoans();
    } catch (err) {
      setDialogError(
        err?.response?.data?.message || err.message || "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const name = (loan) =>
    `${loan.employee?.user?.firstName || ""} ${loan.employee?.user?.lastName || ""}`.trim() ||
    "Unknown employee";

  return (
    <div
      className={
        embedded
          ? "space-y-6"
          : "p-8 lg:p-12 max-w-[1600px] mx-auto space-y-8 animate-fadeIn"
      }
    >
      <div>
        {embedded ? (
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
            Employee Loan Requests
          </h2>
        ) : (
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Employee Loan Requests
          </h1>
        )}
        <p className="text-gray-500 font-medium">
          Review requests, then activate a loan once the employee has been paid.
          Payroll then deducts the repayments.
        </p>
      </div>

      {notice && (
        <div className="flex items-center justify-between rounded-2xl bg-green-50 border border-green-100 px-5 py-3 text-sm font-semibold text-green-700">
          {notice}
          <button onClick={() => setNotice("")} title="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t.key
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : pageError ? (
          <p className="p-10 text-center text-sm font-semibold text-red-600">
            {pageError}
          </p>
        ) : loans.length === 0 ? (
          <p className="p-16 text-center text-sm font-semibold text-gray-400">
            No loan requests here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {[
                    "Employee",
                    "Requested",
                    "Term",
                    "Purpose",
                    "Date",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-gray-900">
                        {name(loan)}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        {loan.employee?.position || ""}
                        {loan.employee?.department
                          ? ` · ${loan.employee.department}`
                          : ""}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-800">
                      {naira(loan.requestedAmount)}
                      {loan.approvedAmount != null &&
                        loan.approvedAmount !== loan.requestedAmount && (
                          <span className="block text-xs text-gray-400 font-medium">
                            approved {naira(loan.approvedAmount)}
                          </span>
                        )}
                      {loan.status === "active" && (
                        <span className="block text-xs text-gray-400 font-medium">
                          remaining {naira(loan.outstandingBalance)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                      {loan.termMonths} month{loan.termMonths > 1 ? "s" : ""}
                      <span className="block text-xs text-gray-400">
                        {naira(
                          loan.monthlyInstallment ||
                            Math.ceil(loan.requestedAmount / loan.termMonths),
                        )}
                        /month
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500 font-medium max-w-[220px] truncate">
                      {loan.purpose || "—"}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500 font-medium">
                      {loan.createdAt
                        ? new Date(loan.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          STATUS_STYLES[loan.status] || STATUS_STYLES.completed
                        }`}
                      >
                        {loan.status}
                      </span>
                      {loan.status === "rejected" && loan.rejectionReason && (
                        <span className="block text-xs text-gray-400 mt-1 max-w-[180px] truncate">
                          {loan.rejectionReason}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {loan.status === "pending" && (
                          <>
                            <button
                              onClick={() => openDialog("approve", loan)}
                              style={{
                                backgroundColor: "#16a34a",
                                color: "#fff",
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => openDialog("reject", loan)}
                              style={{
                                color: "#dc2626",
                                borderColor: "#fecaca",
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border bg-white hover:bg-red-50"
                            >
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}
                        {loan.status === "approved" && (
                          <button
                            onClick={() => openDialog("activate", loan)}
                            style={{
                              backgroundColor: "#2563eb",
                              color: "#fff",
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90"
                          >
                            <Banknote size={14} /> Mark as Paid &amp; Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog (approve / reject / activate) */}
      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
          onClick={closeDialog}
        >
          <div
            className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-black text-gray-900">
              {dialog.type === "approve" && "Approve loan"}
              {dialog.type === "reject" && "Reject loan"}
              {dialog.type === "activate" && "Activate loan"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {name(dialog.loan)} requested {naira(dialog.loan.requestedAmount)}{" "}
              over {dialog.loan.termMonths} month
              {dialog.loan.termMonths > 1 ? "s" : ""}.
            </p>

            {dialog.type === "approve" && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                    Approved amount (₦)
                  </label>
                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    className="mt-1 w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                    Monthly installment (₦)
                  </label>
                  <input
                    type="number"
                    value={installment}
                    onChange={(e) => setInstallment(e.target.value)}
                    className="mt-1 w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Pre-filled from the term the employee chose. Lower it to
                    spread repayment over more months.
                  </p>
                </div>
              </div>
            )}

            {dialog.type === "reject" && (
              <div className="mt-5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  Reason (the employee will see this)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                />
              </div>
            )}

            {dialog.type === "activate" && (
              <p className="mt-5 text-sm text-gray-600">
                Only activate after you have paid{" "}
                <b>{naira(dialog.loan.approvedAmount)}</b> to the employee. From
                the next payroll, {naira(dialog.loan.monthlyInstallment)} a
                month will be deducted from their salary.
              </p>
            )}

            {dialogError && (
              <p className="mt-4 text-sm font-semibold text-red-600">
                {dialogError}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeDialog}
                disabled={submitting}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  backgroundColor:
                    dialog.type === "reject"
                      ? "#dc2626"
                      : dialog.type === "approve"
                        ? "#16a34a"
                        : "#2563eb",
                  color: "#fff",
                }}
                className="flex-1 py-3 rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-60"
              >
                {submitting
                  ? "Please wait..."
                  : dialog.type === "approve"
                    ? "Approve"
                    : dialog.type === "reject"
                      ? "Reject"
                      : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
