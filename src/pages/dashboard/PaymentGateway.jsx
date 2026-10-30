import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Info,
  Landmark,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

// Match these names to what services/payroll.js exports.
// getPayrollById -> GET /payroll/:id (check its exported name in your service file)
import {
  getCurrentPayroll,
  getPayrollById,
  processPayroll,
  resetPayroll,
} from "../../services/payroll.js";

const GATEWAYS = [
  {
    id: "flutterwave",
    label: "Gateway A",
    name: "Flutterwave",
    description: "Supports all banks, 2 min processing, Fee: ₦50/transfer",
  },
  {
    id: "monnify",
    label: "Gateway B",
    name: "Monnify",
    description: "Supports all banks, 3 min processing, Fee: ₦45/transfer",
  },
];

const POLL_MS = 4000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

export default function PaymentGateway({ payrollId, onBack }) {
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gateway, setGateway] = useState("flutterwave");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [timedOut, setTimedOut] = useState(false);
  const pollStart = useRef(null);

  // LOAD PAYROLL

  const load = useCallback(async () => {
    try {
      const res = payrollId
        ? await getPayrollById(payrollId)
        : await getCurrentPayroll();
      setPayroll(res?.data || res || null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load payroll.",
      );
    } finally {
      setLoading(false);
    }
  }, [payrollId]);

  useEffect(() => {
    load();
  }, [load]);

  const status = payroll?.status;

  // While the gateway is working, keep asking our server for the latest status.
  // The real result arrives later through the gateway webhook.
  useEffect(() => {
    if (status !== "processing") {
      pollStart.current = null;
      setTimedOut(false);
      return;
    }

    pollStart.current = pollStart.current ?? Date.now();

    const id = setInterval(() => {
      if (Date.now() - pollStart.current > POLL_TIMEOUT_MS) {
        setTimedOut(true);
        clearInterval(id);
        return;
      }
      load();
    }, POLL_MS);

    return () => clearInterval(id);
  }, [status, load]);

  // PROCESS PAYMENT (approved payrolls only, with the gateway the user picked)

  const handleProcess = async () => {
    if (!payroll?._id || status !== "approved") return;

    setSubmitting(true);
    setError("");

    try {
      await processPayroll(payroll._id, false, gateway);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not start payment.",
      );
    } finally {
      await load(); // status becomes processing (or failed) either way
      setSubmitting(false);
    }
  };

  // RESET (after a failure)

  const handleReset = async () => {
    if (!payroll?._id) return;

    const confirmed = window.confirm(
      "This cancels pending/failed payments and returns the payroll to draft so you can start over. Continue?",
    );
    if (!confirmed) return;

    try {
      await resetPayroll(payroll._id);
      onBack?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Reset failed.");
    }
  };

  // LOADING

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const items = payroll?.payrollItems || [];
  const paid = items.filter((i) => i.paymentStatus === "paid").length;
  const failed = items.filter((i) => i.paymentStatus === "failed").length;
  const total = payroll?.summary?.totalEmployees ?? items.length;
  const amount = payroll?.summary?.totalNet ?? 0;
  const usedGateway =
    GATEWAYS.find((g) => g.id === payroll?.preferredGateway) ||
    GATEWAYS.find((g) => g.id === gateway);

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-b-3xl shadow-sm border border-gray-100 px-8 py-8">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-700 mb-2"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-2xl font-black text-gray-900">
          Select Payment Gateway
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          {payroll?.payrollPeriod
            ? `${payroll.payrollPeriod.month}/${payroll.payrollPeriod.year} payroll run`
            : "Current payroll run"}
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* 1. APPROVED: choose a gateway and pay */}
        {status === "approved" && (
          <>
            <p className="text-gray-700 font-medium mt-6 mb-6">
              Choose which gateway processes this disbursement.{" "}
              <b>{total} employees</b> ·{" "}
              <b>₦{Number(amount).toLocaleString()}</b> total.
            </p>

            <div className="space-y-4">
              {GATEWAYS.map((g) => {
                const selected = gateway === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGateway(g.id)}
                    className={`w-full text-left rounded-2xl p-6 flex items-start gap-4 transition-all ${
                      selected
                        ? "bg-[#1D4EFF] shadow-lg shadow-blue-500/20"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <Landmark
                      size={28}
                      className={selected ? "text-white" : "text-gray-700"}
                    />
                    <div>
                      <h3
                        className={`text-lg font-black ${
                          selected ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {g.label} — {g.name}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          selected ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {g.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={onBack}
                className="text-gray-500 font-bold text-sm"
              >
                Back
              </button>

              <button
                onClick={handleProcess}
                disabled={submitting}
                className="flex items-center gap-2 bg-[#1D4EFF] text-white font-bold px-8 py-3 rounded-xl disabled:opacity-50"
              >
                {submitting && <Loader2 className="animate-spin" size={18} />}
                Process Payment via{" "}
                {GATEWAYS.find((g) => g.id === gateway)?.name}
              </button>
            </div>
          </>
        )}

        {/* 2. PROCESSING: wait for the gateway to confirm */}
        {status === "processing" && (
          <div className="flex flex-col items-center text-center py-14 gap-4">
            <Loader2 className="animate-spin text-orange-500" size={44} />
            <h2 className="text-xl font-black text-gray-900">
              Payment in progress
            </h2>
            <p className="text-gray-600 max-w-sm">
              Sending {total} payments through {usedGateway?.name}. {paid} paid,{" "}
              {failed} failed so far.
            </p>

            {timedOut && (
              <p className="text-sm text-orange-700 bg-orange-50 rounded-xl px-4 py-3">
                This is taking longer than expected. Check the Audit log for
                each transaction&apos;s status.
                <button onClick={load} className="ml-2 font-bold underline">
                  Refresh
                </button>
              </p>
            )}
          </div>
        )}

        {/* 3. COMPLETED: success */}
        {status === "completed" && (
          <div className="flex flex-col items-center text-center py-14 gap-4">
            <CheckCircle2 className="text-green-600" size={52} />
            <h2 className="text-xl font-black text-gray-900">
              Payment successful
            </h2>
            <p className="text-gray-600 max-w-sm">
              {paid} of {total} employees were paid ₦
              {Number(amount).toLocaleString()} via {usedGateway?.name}.
            </p>
            <button
              onClick={onBack}
              className="mt-2 bg-[#1D4EFF] text-white font-bold px-8 py-3 rounded-xl"
            >
              Back to Payroll
            </button>
          </div>
        )}

        {/* 4. FAILED: show what failed and how to recover */}
        {status === "failed" && (
          <div className="flex flex-col items-center text-center py-14 gap-4">
            <XCircle className="text-red-600" size={52} />
            <h2 className="text-xl font-black text-gray-900">Payment failed</h2>
            <p className="text-gray-600 max-w-sm">
              {failed} of {total} payments failed via {usedGateway?.name}
              {paid > 0 ? `, ${paid} succeeded` : ""}. See the Audit log for the
              reason on each one.
            </p>

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 font-bold px-6 py-3 rounded-xl"
              >
                <RefreshCw size={16} /> Reset and try again
              </button>
              <button
                onClick={onBack}
                className="border border-gray-200 font-bold px-6 py-3 rounded-xl"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* 5. Anything else (draft / calculated): not ready for payment */}
        {!["approved", "processing", "completed", "failed"].includes(
          status,
        ) && (
          <div className="flex flex-col items-center text-center py-14 gap-4">
            <Info className="text-gray-400" size={40} />
            <p className="text-gray-600">
              This payroll is <b>{status}</b>. It must be approved before you
              can pay.
            </p>
            <button
              onClick={onBack}
              className="bg-[#1D4EFF] text-white font-bold px-8 py-3 rounded-xl"
            >
              Back to Payroll
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
