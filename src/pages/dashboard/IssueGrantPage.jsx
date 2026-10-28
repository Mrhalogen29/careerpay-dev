import { useEffect, useRef, useState } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { createEquityGrant } from "../../services/equity";
import EquityLoading from "../../components/dashboard/EquityLoading";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent outline-none focus:ring-2 focus:ring-[#1D4EFF] transition-all text-sm font-medium";

export default function IssueGrantPage({ employees, onClose, onIssued }) {
  const [form, setForm] = useState({
    employeeId: "",
    grantType: "stock_option",
    totalShares: "",
    strikePrice: "",
    currentFMV: "",
    grantDate: new Date().toISOString().slice(0, 10),
    vestingStartDate: new Date().toISOString().slice(0, 10),
    vestingPeriodMonths: 48,
    cliffMonths: 12,
    vestingFrequency: "monthly",
  });
  const pendingRef = useRef(false);
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); headingRef.current?.scrollIntoView({ block: "start" }); }, []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (pendingRef.current) return;
    if (!form.employeeId || !form.totalShares || !form.vestingStartDate || !form.grantDate) {
      setError("Employee, total shares, and vesting start date are required.");
      return;
    }
    const total = Number(form.totalShares);
    const months = Number(form.vestingPeriodMonths);
    const cliff = Number(form.cliffMonths);
    if (!Number.isSafeInteger(total) || total <= 0 || !Number.isSafeInteger(months) || months <= 0 || !Number.isSafeInteger(cliff) || cliff < 0 || cliff > months || [form.strikePrice, form.currentFMV].some((value) => !Number.isFinite(Number(value)) || Number(value) < 0)) {
      setError("Enter valid share counts, prices, and a cliff within the vesting period.");
      return;
    }
    pendingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const res = await createEquityGrant({
        employeeId: form.employeeId,
        grantType: form.grantType,
        totalShares: Number(form.totalShares),
        strikePrice: Number(form.strikePrice) || 0,
        currentFMV: Number(form.currentFMV) || 0,
        grantDate: form.grantDate,
        vestingStartDate: form.vestingStartDate,
        vestingPeriodMonths: Number(form.vestingPeriodMonths),
        cliffMonths: Number(form.cliffMonths),
        vestingFrequency: form.vestingFrequency,
      });
      if (!res.success || !res.data?._id) throw new Error(res.message || "The server did not return the issued grant.");
      onIssued(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message ||
          "Failed to issue grant. Please try again.",
      );
    } finally {
      pendingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-6 lg:p-10">
      <div className="w-full rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold text-gray-900 outline-none">Issue New Grant</h1>
          <button
            onClick={onClose}
            disabled={saving}
            aria-label="Back to equity overview"
            className="text-gray-400 hover:text-gray-700"
          >
            <ArrowLeft size={22} />
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} aria-busy={saving}>
        <fieldset disabled={saving}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label htmlFor="issue-employeeId" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Employee*</label>
            <select
              id="issue-employeeId" name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.user?.firstName} {emp.user?.lastName} — {emp.position}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="issue-grantType" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Grant Type</label>
            <select
              id="issue-grantType" name="grantType"
              value={form.grantType}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="stock_option">Stock Option</option>
              <option value="rsu">RSU</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="issue-totalShares" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Total Shares/Options*</label>
            <input
              type="number"
              min="1"
              id="issue-totalShares" name="totalShares"
              value={form.totalShares}
              onChange={handleChange}
              placeholder="e.g. 5000"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="issue-strikePrice" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Strike Price (₦)</label>
            <input
              type="number"
              min="0"
              step="any"
              id="issue-strikePrice" name="strikePrice"
              value={form.strikePrice}
              onChange={handleChange}
              placeholder="e.g. 10"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="issue-currentFMV" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Current FMV (₦)</label>
            <input
              type="number"
              min="0"
              step="any"
              id="issue-currentFMV" name="currentFMV"
              value={form.currentFMV}
              onChange={handleChange}
              placeholder="e.g. 50"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="issue-grantDate" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Grant Date</label>
            <input
              type="date"
              id="issue-grantDate" name="grantDate"
              value={form.grantDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="issue-vestingStartDate" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Vesting Start Date*</label>
            <input
              type="date"
              id="issue-vestingStartDate" name="vestingStartDate"
              value={form.vestingStartDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="issue-vestingPeriodMonths" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Vesting Period (months)</label>
            <input
              type="number"
              min="1"
              id="issue-vestingPeriodMonths" name="vestingPeriodMonths"
              value={form.vestingPeriodMonths}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="issue-cliffMonths" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Cliff (months)</label>
            <input
              type="number"
              min="0"
              id="issue-cliffMonths" name="cliffMonths"
              value={form.cliffMonths}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="issue-vestingFrequency" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Vesting Frequency</label>
            <select
              id="issue-vestingFrequency" name="vestingFrequency"
              value={form.vestingFrequency}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Defaults follow the standard 4-year vesting with a 1-year cliff —
          adjust if this grant uses different terms.
        </p>

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#1D4EFF] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <EquityLoading inline label="Issuing grant…" />
            ) : (
              "Issue Grant"
            )}
          </button>
        </div>
        </fieldset>
        </form>
      </div>
    </div>
  );
}
