import React, { useEffect, useState } from "react";
import {
  Search,
  Calendar,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  History,
  Download,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import {
  getCurrentPayroll,
  calculatePayroll,
  resetPayroll,
  correctPayrollItem,
} from "../../services/payroll.js";

import { exportToCSV } from "../../utils/exportCSV";

import { motion } from "framer-motion";

export default function Payroll({ onNext, onPaymentStarted, setActivePage }) {
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [overtimeInputs, setOvertimeInputs] = useState({});
  const [savingOvertime, setSavingOvertime] = useState(null);

  // FETCH CURRENT PAYROLL

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCurrentPayroll();

      setPayroll(response?.data || response || null);

      const initialOvertime = {};
      (response?.data?.payrollItems || response?.payrollItems || []).forEach(
        (item) => {
          initialOvertime[item.employee?._id] = item.additions?.overtime || 0;
        },
      );
      setOvertimeInputs(initialOvertime);
    } catch (err) {
      console.error("Failed to fetch payroll:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load current payroll.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  // CALCULATE PAYROLL

  const handleCalculate = async () => {
    if (!payroll?._id) return;

    try {
      setCalculating(true);
      setError("");

      await calculatePayroll(payroll._id);

      await fetchPayroll();
    } catch (err) {
      console.error("Payroll calculation failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Payroll calculation failed.",
      );
    } finally {
      setCalculating(false);
    }
  };

  // OPEN APPROVAL SCREEN (approval happens there)

  const handleOpenApproval = () => {
    if (!payroll?._id) return;

    if (onNext) {
      onNext(payroll._id);
    }
  };

  // GO TO GATEWAY PAGE (it chooses the gateway and starts the payment)

  const handleGoToGateway = () => {
    if (!payroll?._id) return;
    onPaymentStarted?.(payroll._id);
  };

  // SAVE OVERTIME (before approval, untaxed)

  const handleSaveOvertime = async (employeeId) => {
    if (!payroll?._id) return;

    setSavingOvertime(employeeId);
    setError("");

    try {
      const overtime = Number(overtimeInputs[employeeId]) || 0;

      await correctPayrollItem(payroll._id, employeeId, { overtime });

      if (payroll.status === "calculated") {
        await calculatePayroll(payroll._id);
      }

      await fetchPayroll();
    } catch (err) {
      console.error("Save overtime failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save overtime.",
      );
    } finally {
      setSavingOvertime(null);
    }
  };

  const handleExportPayroll = () => {
    const rows = filteredItems.map((item) => {
      const employee = item.employee || {};
      return {
        "Employee Name":
          `${employee.user?.firstName || ""} ${employee.user?.lastName || ""}`.trim(),
        Email: employee.user?.email || "",
        "Gross Salary": item.grossSalary || 0,
        Tax: item.deductions?.tax || 0,
        Pension: item.deductions?.pension || 0,
        NHF: item.deductions?.nhf || 0,
        "Loan Repayment": item.deductions?.loanRepayment || 0,
        Overtime: item.additions?.overtime || 0,
        "Net Salary": item.netSalary || 0,
        "Payment Status": item.paymentStatus || "pending",
      };
    });

    exportToCSV(
      `payroll-${payroll?.payrollPeriod?.month}-${payroll?.payrollPeriod?.year}.csv`,
      rows,
    );
  };

  // RESET PAYROLL

  const handleResetPayroll = async () => {
    if (!payroll?._id) return;

    const confirmed = window.confirm(
      "This will cancel any pending/failed payments and return this payroll to draft so you can start over. Continue?",
    );
    if (!confirmed) return;

    try {
      setResetting(true);
      setError("");

      await resetPayroll(payroll._id);

      await fetchPayroll();
    } catch (err) {
      console.error("Payroll reset failed:", err);

      setError(
        err?.response?.data?.message || err?.message || "Payroll reset failed.",
      );
    } finally {
      setResetting(false);
    }
  };

  // SEARCH

  const filteredItems =
    payroll?.payrollItems?.filter((item) => {
      const employee = item?.employee;

      const search = `${employee?.user.firstName || ""} ${
        employee?.user.lastName || ""
      } ${employee?.user.email || ""}`.toLowerCase();

      return search.includes(searchTerm.toLowerCase());
    }) || [];

  // LOADING

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#1D4EFF]" />

          <p className="text-gray-500 font-medium">Loading payroll...</p>
        </div>
      </div>
    );
  }

  // NO PAYROLL

  if (!payroll) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <AlertCircle size={40} className="mx-auto text-orange-500 mb-4" />

          <h2 className="text-xl font-black text-gray-900">
            No Current Payroll
          </h2>

          <p className="text-gray-500 mt-2">
            There is no payroll available for the current period.
          </p>

          <button
            onClick={fetchPayroll}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1D4EFF] text-white font-bold"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const status = payroll.status;

  const isDraft = status === "draft";
  const isCalculated = status === "calculated";
  const isApproved = status === "approved";
  const isProcessing = status === "processing";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const canEditOvertime = isDraft || isCalculated;

  // STATUS TEXT

  const getStatusText = () => {
    if (isDraft) return "Draft";
    if (isCalculated) return "Ready for Approval";
    if (isApproved) return "Approved — Ready for Payment";
    if (isProcessing) return "Payment Processing";
    if (isCompleted) return "Completed";
    if (isFailed) return "Payment Failed";

    return status;
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Calendar size={16} />

              <span>
                {payroll.payrollPeriod?.month} {payroll.payrollPeriod?.year}
              </span>
            </div>

            <h1 className="text-3xl font-black text-gray-900">
              Payroll Current Review
            </h1>

            <p className="text-gray-500 mt-1">
              Review, approve and process employee payroll.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPayroll}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              onClick={() => setActivePage?.("audit-log")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700"
            >
              <History size={17} />
              Audit Logs
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
            <AlertCircle size={20} />

            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* ACTION BAR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Payroll Status
              </p>

              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    isDraft
                      ? "bg-gray-100 text-gray-700"
                      : isCalculated
                        ? "bg-blue-100 text-blue-700"
                        : isApproved
                          ? "bg-green-100 text-green-700"
                          : isProcessing
                            ? "bg-orange-100 text-orange-700"
                            : isCompleted
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                  }`}
                >
                  {getStatusText()}
                </span>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex items-center gap-3">
              {isDraft && (
                <button
                  onClick={handleCalculate}
                  disabled={calculating}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1D4EFF] text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {calculating ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Run Payroll
                    </>
                  )}
                </button>
              )}

              {isCalculated && (
                <button
                  onClick={handleOpenApproval}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1D4EFF] text-white font-bold text-sm hover:bg-blue-700"
                >
                  <ShieldCheck size={17} />
                  Review
                </button>
              )}

              {isApproved && (
                <button
                  onClick={handleGoToGateway}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700"
                >
                  <CreditCard size={17} />
                  Select Payment Gateway
                </button>
              )}

              {(isProcessing || isCompleted || isFailed) && (
                <button
                  onClick={handleGoToGateway}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50"
                >
                  <CreditCard size={17} />
                  View Payment Status
                </button>
              )}

              {(isCalculated || isApproved || isProcessing || isFailed) && (
                <button
                  onClick={handleResetPayroll}
                  disabled={resetting}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold text-sm hover:bg-red-100 disabled:opacity-50"
                >
                  {resetting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={17} />
                      Reset Payroll
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS  */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Total Employees</p>

            <p className="text-2xl font-black text-gray-900 mt-2">
              {payroll.summary?.totalEmployees ??
                payroll.payrollItems?.length ??
                0}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Gross Payroll</p>

            <p className="text-2xl font-black text-gray-900 mt-2">
              ₦{Number(payroll.summary?.totalGross || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Deductions</p>

            <p className="text-2xl font-black text-gray-900 mt-2">
              ₦{Number(payroll.summary?.totalDeductions || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Net Payroll</p>

            <p className="text-2xl font-black text-gray-900 mt-2">
              ₦{Number(payroll.summary?.totalNet || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* PAYROLL TABLE*/}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="font-black text-gray-900">Payroll Employees</h2>

              <p className="text-sm text-gray-500 mt-1">
                Employees included in this payroll run.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employee..."
                  className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                onClick={handleExportPayroll}
                className="p-2.5 border border-gray-200 rounded-lg text-gray-600"
              >
                <Download size={17} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Gross
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Tax
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Pension
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    NHF
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Loan
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Overtime
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Net pay{" "}
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No employees found in this payroll.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => {
                    const employee = item.employee || {};

                    return (
                      <motion.tr
                        key={item._id || employee._id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900">
                              {employee.user?.firstName}{" "}
                              {employee.user?.lastName}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {employee.user?.email}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          ₦{Number(item.grossSalary || 0).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-right text-gray-700">
                          ₦{Number(item.deductions?.tax || 0).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-right text-gray-700">
                          ₦
                          {Number(
                            item.deductions?.pension || 0,
                          ).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-right text-gray-700">
                          ₦{Number(item.deductions?.nhf || 0).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-right text-gray-700">
                          ₦
                          {Number(
                            item.deductions?.loanRepayment || 0,
                          ).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              min="0"
                              disabled={!canEditOvertime}
                              value={overtimeInputs[employee._id] ?? 0}
                              onChange={(e) =>
                                setOvertimeInputs((prev) => ({
                                  ...prev,
                                  [employee._id]: e.target.value,
                                }))
                              }
                              className="w-20 px-2 py-1.5 text-right text-sm font-semibold border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:opacity-60"
                            />
                            <button
                              onClick={() => handleSaveOvertime(employee._id)}
                              disabled={
                                !canEditOvertime ||
                                savingOvertime === employee._id
                              }
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {savingOvertime === employee._id ? "..." : "Save"}
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right font-black text-gray-900">
                          ₦{Number(item.netSalary || 0).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${
                              item.paymentStatus === "paid"
                                ? "bg-green-100 text-green-700"
                                : item.paymentStatus === "processing"
                                  ? "bg-orange-100 text-orange-700"
                                  : item.paymentStatus === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.paymentStatus || "pending"}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          <FileSpreadsheet size={15} />
          Payroll ID:
          <span className="font-semibold text-gray-700">{payroll._id}</span>
        </div>
      </div>
    </div>
  );
}
