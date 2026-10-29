import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Loader2,
  AlertCircle,
  Printer,
} from "lucide-react";
import { getCurrentPayroll, getEmployeePayslip } from "../../services/payroll";

const Row = ({ label, value, bold, negative }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span
      className={`text-sm ${bold ? "font-black text-gray-900" : "text-gray-500 font-medium"}`}
    >
      {label}
    </span>
    <span
      className={`text-sm font-bold ${negative ? "text-red-500" : "text-gray-900"} ${bold ? "text-lg font-black" : ""}`}
    >
      {negative && "-"}₦{Number(value || 0).toLocaleString()}
    </span>
  </div>
);

export default function Payslip() {
  const [payroll, setPayroll] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPayslip, setLoadingPayslip] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await getCurrentPayroll();
        if (res.success) setPayroll(res.data);
      } catch (err) {
        console.error("Failed to load payroll:", err);
        setError("Failed to load current payroll.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  const handleSelectEmployee = async (employeeId) => {
    setSelectedEmployeeId(employeeId);
    if (!employeeId || !payroll?._id) {
      setPayslip(null);
      return;
    }
    setLoadingPayslip(true);
    setError("");
    try {
      const res = await getEmployeePayslip(payroll._id, employeeId);
      if (res.success) setPayslip(res.data);
    } catch (err) {
      console.error("Failed to load payslip:", err);
      setError(err.response?.data?.message || "Failed to load payslip.");
      setPayslip(null);
    } finally {
      setLoadingPayslip(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Loading Payroll...
        </p>
      </div>
    );
  }

  const payrollItems = payroll?.payrollItems || [];

  return (
    <div className="p-8 lg:p-12 space-y-8 max-w-4xl mx-auto animate-fadeIn">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
          Payslips
        </h1>
        <p className="text-gray-500 font-medium">
          View a detailed salary breakdown for any employee in the current
          payroll run.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Select Employee
        </label>
        <select
          value={selectedEmployeeId}
          onChange={(e) => handleSelectEmployee(e.target.value)}
          className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-50 border border-transparent outline-none focus:ring-2 focus:ring-[#1D4EFF] text-sm font-medium appearance-none cursor-pointer"
        >
          <option value="">Choose an employee...</option>
          {payrollItems.map((item) => (
            <option key={item.employee?._id} value={item.employee?._id}>
              {item.employee?.user?.firstName} {item.employee?.user?.lastName} —{" "}
              {item.employee?.position}
            </option>
          ))}
        </select>
      </div>

      {loadingPayslip && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      {payslip && !loadingPayslip && (
        <div
          id="payslip-print"
          className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10"
        >
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {payslip.company?.name}
              </h2>
              <p className="text-sm text-gray-400">{payslip.company?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-100"
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Employee
              </p>
              <p className="text-lg font-black text-gray-900">
                {payslip.employee?.name}
              </p>
              <p className="text-sm text-gray-500">
                {payslip.employee?.position} · {payslip.employee?.department}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ID: {payslip.employee?.employeeId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Pay Period
              </p>
              <p className="text-lg font-black text-gray-900">
                {payslip.payrollPeriod?.month}/{payslip.payrollPeriod?.year}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Generated {new Date(payslip.generatedDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Earnings
              </h4>
              <Row label="Base Salary" value={payslip.payslip?.baseSalary} />
              <Row label="Bonus" value={payslip.payslip?.additions?.bonus} />

              <Row
                label="Allowances"
                value={(payslip.payslip?.additions?.allowances || []).reduce(
                  (sum, a) => sum + (a.amount || 0),
                  0,
                )}
              />

              <Row
                label="Overtime (untaxed)"
                value={payslip.payslip?.additions?.overtime}
              />
              <Row
                label="Gross Salary"
                value={payslip.payslip?.grossSalary}
                bold
              />
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Deductions
              </h4>
              <Row
                label="Tax (PAYE)"
                value={payslip.payslip?.deductions?.tax}
                negative
              />
              <Row
                label="Pension (8%)"
                value={payslip.payslip?.deductions?.pension}
                negative
              />
              <Row
                label="NHF (2.5%)"
                value={payslip.payslip?.deductions?.nhf}
                negative
              />

              {Number(payslip.payslip?.deductions?.loanRepayment) > 0 && (
                <Row
                  label="Loan Repayment"
                  value={payslip.payslip?.deductions?.loanRepayment}
                  negative
                />
              )}

              <Row
                label="Total Deductions"
                value={
                  (payslip.payslip?.deductions?.tax || 0) +
                  (payslip.payslip?.deductions?.pension || 0) +
                  (payslip.payslip?.deductions?.nhf || 0) +
                  (payslip.paysip?.deductions?.loanRepayment || 0)
                }
                bold
                negative
              />
            </div>
          </div>

          {payslip.payslip?.prorationDetails?.isProrated && (
            <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-orange-700">
                {payslip.payslip.prorationDetails.note}
              </p>
            </div>
          )}

          <div className="mt-8 pt-8 border-t-2 border-gray-900 flex items-center justify-between">
            <span className="text-xl font-black text-gray-900">Net Pay</span>
            <span className="text-3xl font-black text-blue-600">
              ₦{Number(payslip.payslip?.netSalary || 0).toLocaleString()}{" "}
              {payslip.currency}
            </span>
          </div>
        </div>
      )}

      {!selectedEmployeeId && !loadingPayslip && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-16 text-center">
          <FileText size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm">
            Select an employee above to view their payslip.
          </p>
        </div>
      )}
    </div>
  );
}
