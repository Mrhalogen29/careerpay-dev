import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";

import { getPayrollById, payrollApproval } from "../../services/payroll.js";

export default function PayrollApproval({ payrollId, onBack, onApproved }) {
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD PAYROLL
  // ==========================================

  const loadPayroll = async () => {
    if (!payrollId) return;

    try {
      setLoading(true);
      setError("");

      const response = await getPayrollById(payrollId);

      setPayroll(response?.data || response || null);
    } catch (err) {
      console.error("Failed to load payroll:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load payroll.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, [payrollId]);

  // ==========================================
  // APPROVE PAYROLL
  // ==========================================

  const handleApprove = async () => {
    if (!payroll?._id) return;

    try {
      setApproving(true);
      setError("");

      await payrollApproval(payroll._id);

      const updated = await getPayrollById(payroll._id);

      setPayroll(updated?.data || updated || null);

      if (onApproved) {
        onApproved(updated?.data || updated);
      }
    } catch (err) {
      console.error("Payroll approval failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Payroll approval failed.",
      );
    } finally {
      setApproving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#1D4EFF]" />

          <p className="text-gray-500">Loading payroll approval...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // NO PAYROLL
  // ==========================================

  if (!payroll) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-10 text-center">
          <AlertTriangle className="mx-auto text-orange-500 mb-4" size={40} />

          <h2 className="text-xl font-black">Payroll not found</h2>

          <button
            onClick={onBack}
            className="mt-6 px-5 py-2.5 bg-[#1D4EFF] text-white rounded-lg font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const employees = payroll.payrollItems || [];

  const totalNet =
    payroll.summary?.totalNet ||
    employees.reduce((total, item) => total + Number(item.netSalary || 0), 0);

  const totalOvertime = employees.reduce(
    (total, item) => total + Number(item.additions?.overtime || 0),
    0,
  );

  const totalLoanRepayments = employees.reduce(
    (total, item) => total + Number(item.deductions?.loanRepayment || 0),
    0,
  );

  const isApproved = payroll.status === "approved";

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* BACK */}

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition mb-4"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        {/* ERROR */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-center gap-3">
            <AlertTriangle size={18} />

            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* MAIN CARD */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* HEADER */}

          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  Payroll Approval
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Payroll ID: {payroll._id}
                </p>

                <p className="text-sm text-gray-500">
                  Period: {payroll.payrollPeriod?.month}{" "}
                  {payroll.payrollPeriod?.year}
                </p>
              </div>

              <span
                className={`px-4 py-2 rounded-lg text-xs font-bold ${
                  isApproved
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {isApproved ? "Approved" : "Awaiting Approval"}
              </span>
            </div>
          </div>

          {/* SUMMARY */}

          <div className="px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
              <div>
                <p className="text-sm text-gray-600 font-medium">Employees</p>

                <p className="text-xl font-black text-gray-900 mt-1">
                  {employees.length}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium">Net Payroll</p>

                <p className="text-xl font-black text-gray-900 mt-1">
                  ₦{Number(totalNet).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium">Status</p>

                <p className="text-xl font-black text-gray-900 mt-1 capitalize">
                  {payroll.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Overtime (untaxed)
                </p>

                <p className="text-xl font-black text-gray-900 mt-1">
                  ₦{totalOvertime.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Loan Repayments
                </p>

                <p className="text-xl font-black text-gray-900 mt-1">
                  ₦{totalLoanRepayments.toLocaleString()}
                </p>
              </div>
            </div>

            {/* APPROVAL TIMELINE */}

            <div>
              <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide mb-6">
                Approval Timeline
              </h2>

              <div className="relative">
                <div className="relative flex gap-4 min-h-[65px]">
                  <div className="relative z-10 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <CheckCircle2 size={17} />
                    </div>
                  </div>

                  <div className="pb-5">
                    <p className="font-bold text-sm text-gray-900">
                      Payroll Calculated
                    </p>

                    <p className="text-xs mt-1 text-gray-400">
                      System calculated payroll
                    </p>
                  </div>
                </div>

                <div className="relative flex gap-4 min-h-[65px]">
                  <div className="absolute left-[12px] top-[-5px] w-[2px] h-[70px] bg-green-500" />

                  <div className="relative z-10 shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                        isApproved ? "bg-green-500" : "bg-orange-400"
                      }`}
                    >
                      {isApproved ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <Clock3 size={15} />
                      )}
                    </div>
                  </div>

                  <div className="pb-5">
                    <p className="font-bold text-sm text-gray-900">
                      Finance Approval
                    </p>

                    <p className="text-xs mt-1 text-gray-400">
                      {isApproved ? "Payroll approved" : "Action required"}
                    </p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className="absolute left-[12px] top-[-5px] w-[2px] h-[45px] bg-gray-300" />

                  <div className="relative z-10 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-gray-400" />
                  </div>

                  <div>
                    <p className="font-bold text-sm text-gray-500">Payment</p>

                    <p className="text-xs mt-1 text-gray-400">
                      Pending payroll approval
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* VALIDATION */}

            <div className="mt-8 bg-[#0a2342] text-orange-400 rounded-lg px-5 py-4 flex items-center gap-3">
              <AlertTriangle size={18} />

              <p className="text-sm font-semibold">
                Review all payroll employees and payment details before
                approval.
              </p>
            </div>

            {/* EMPLOYEE VALIDATION */}

            <div className="mt-6 border border-gray-200 rounded-xl p-5">
              <h3 className="font-black text-gray-900 mb-4">
                Payroll Validation
              </h3>

              <div className="space-y-3">
                {employees.map((item, index) => {
                  const employee = item.employee || {};

                  const hasBankAccount =
                    Boolean(employee?.bankDetails?.accountNumber) ||
                    Boolean(item?.bankDetails?.accountNumber);

                  return (
                    <div
                      key={item._id || employee._id || index}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {employee.user?.firstName} {employee.user?.lastName}
                        </p>

                        <p className="text-xs text-gray-500">
                          Net salary: ₦
                          {Number(item.netSalary || 0).toLocaleString()}
                        </p>

                        {Number(item.additions?.overtime) > 0 && (
                          <p className="text-xs text-blue-600">
                            Includes overtime ₦
                            {Number(item.additions.overtime).toLocaleString()}{" "}
                            (untaxed)
                          </p>
                        )}

                        {Number(item.deductions?.loanRepayment) > 0 && (
                          <p className="text-xs text-orange-600">
                            Loan repayment −₦
                            {Number(
                              item.deductions.loanRepayment,
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {hasBankAccount ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                          <CheckCircle2 size={15} />
                          Bank details available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                          <XCircle size={15} />
                          Missing bank details
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:text-gray-900"
            >
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                disabled
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-200 text-red-400 font-bold text-sm opacity-50 cursor-not-allowed"
              >
                <XCircle size={17} />
                Reject
              </button>

              <button
                onClick={handleApprove}
                disabled={
                  approving || isApproved || payroll.status !== "calculated"
                }
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1D4EFF] text-white font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50"
              >
                {approving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Approving...
                  </>
                ) : isApproved ? (
                  <>
                    <CheckCircle2 size={17} />
                    Payroll Approved
                  </>
                ) : (
                  "Approve Payroll"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
