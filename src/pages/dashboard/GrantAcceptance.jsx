import { useEffect, useRef, useState } from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";
import EquityLoading from "../../components/dashboard/EquityLoading";
import { getMyGrant, respondToGrant } from "../../services/equity";

const duration = (months) => months % 12 === 0
  ? `${months / 12} ${months === 12 ? "year" : "years"}`
  : `${months} ${months === 1 ? "month" : "months"}`;

export default function GrantAcceptance({ grantId, onBack }) {
  const [grant, setGrant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  const [saving, setSaving] = useState("");
  const pending = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setAcknowledged(false);
    getMyGrant(grantId, controller.signal).then((response) => {
      if (!response.success || !response.data?._id) throw new Error(response.message || "Unable to load your grant.");
      if (!controller.signal.aborted) setGrant(response.data);
    }).catch((err) => {
      if (!controller.signal.aborted) setError(err.response?.data?.message || err.message || "Unable to load your grant.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [grantId, attempt]);

  async function respond(decision) {
    if (!acknowledged || pending.current || grant.status !== "pending") return;
    pending.current = true;
    setSaving(decision);
    setSaveError("");
    try {
      const response = await respondToGrant(grantId, decision, acknowledged);
      if (!response.success || !response.data?._id) throw new Error(response.message || "Unable to save your decision.");
      setGrant(response.data);
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || "Unable to save your decision. Please try again.");
    } finally {
      pending.current = false;
      setSaving("");
    }
  }

  if (loading) return <EquityLoading label="Loading your grant…" />;
  if (error) return <div role="alert" className="p-10 text-center"><p>{error}</p><button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white">Retry</button><button type="button" onClick={onBack} className="ml-4 underline">Back to notifications</button></div>;

  const rows = [
    ["Shares granted", grant.totalShares.toLocaleString("en-NG")],
    ["Grant date", new Date(grant.grantDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })],
    ["Vesting schedule", `${duration(grant.vestingPeriodMonths)}, ${grant.cliffMonths ? `${duration(grant.cliffMonths)} cliff` : "no cliff"}`],
    ["Strike price", `${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(grant.strikePrice || 0)} / share`],
  ];
  const disabled = !acknowledged || Boolean(saving);
  return (
    <section aria-labelledby="grant-heading" className="min-h-full bg-[#F3F4F5] px-5 py-10 text-black sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[1254px]">
        <h1 id="grant-heading" className="text-3xl font-semibold sm:text-4xl">{grant.status === "pending" ? "You have a new equity grant" : "Your equity grant"}</h1>
        <p className="mt-3 text-lg text-[#555] sm:text-2xl">Review the details below before accepting.</p>
        <dl className="mt-12 overflow-hidden rounded-2xl bg-[#0B2545] text-white">
          {rows.map(([label, value]) => <div key={label} className="flex flex-col gap-2 border-b border-white/80 px-6 py-6 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:px-12 sm:text-2xl lg:text-3xl"><dt>{label}</dt><dd className="font-medium sm:text-right">{value}</dd></div>)}
        </dl>
        <div className="mt-12 flex items-center gap-5 rounded-xl bg-[#0B2545] px-6 py-5 text-lg text-[#FF8A00] sm:text-2xl">
          <AlertTriangle className="shrink-0" aria-hidden="true" size={28} />
          <p>{grant.cliffMonths ? `No shares vest until ${duration(grant.cliffMonths)} from the vesting start date (the cliff).` : "This grant has no cliff. Shares vest according to the vesting schedule."}</p>
        </div>
        <p className="mt-4 text-gray-600">Vesting starts {new Date(grant.vestingStartDate).toLocaleDateString("en-GB", { timeZone: "UTC" })}; vesting frequency: {grant.vestingFrequency}.</p>
        {grant.notes && <div className="mt-6 whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-6"><h2 className="mb-2 font-semibold">Grant terms</h2>{grant.notes}</div>}
        {grant.status === "pending" ? <>
          <label className="mt-12 flex cursor-pointer items-center gap-5 text-lg sm:text-2xl">
            <input type="checkbox" checked={acknowledged} disabled={Boolean(saving)} onChange={(event) => setAcknowledged(event.target.checked)} className="h-8 w-8 shrink-0 accent-[#0B2545] sm:h-12 sm:w-12" />
            <span>I've read and understand the terms of this equity grant.</span>
          </label>
          {saveError && <div role="alert" className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700"><AlertCircle size={16} />{saveError}</div>}
          <div aria-busy={Boolean(saving)} className="mt-12 grid gap-5 sm:grid-cols-2">
            {[['declined', 'Decline grant'], ['accepted', 'Accept grant']].map(([decision, label]) => <button key={decision} type="button" disabled={disabled} onClick={() => respond(decision)} className="rounded-xl bg-[#0B2545] px-6 py-5 text-xl font-medium text-white hover:bg-[#163B66] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#C5C5C5] disabled:text-gray-600">{saving === decision ? <EquityLoading inline label="Saving your decision…" /> : label}</button>)}
          </div>
        </> : <p role="status" className="mt-10 rounded-xl border border-gray-200 bg-white p-6 text-xl">{grant.employeeDecision ? `You ${grant.employeeDecision} this grant.` : `This grant is ${grant.status.replaceAll("_", " ")}.`} No further response is required.</p>}
        <button type="button" onClick={onBack} disabled={Boolean(saving)} className="mt-8 rounded-md text-gray-600 underline focus-visible:ring-2 focus-visible:ring-blue-600">Back to notifications</button>
      </div>
    </section>
  );
}
