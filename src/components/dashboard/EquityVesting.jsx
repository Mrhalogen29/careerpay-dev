import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getMyEquity } from "../../services/equity";
import EquityGrantsPage from "./EquityGrantsPage";
import EquityLoading from "./EquityLoading";
import MyVested from "./MyVested";

const numberFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function formatMoney(value) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

export default function EquityVesting({ showVested, setShowVested }) {
  const [showGrants, setShowGrants] = useState(false);
  const [equity, setEquity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getMyEquity(controller.signal).then((response) => {
      if (controller.signal.aborted) return;
      if (!response?.success || !response.data || !Array.isArray(response.data.grants)) {
        throw new Error(response?.message || "Unable to load your equity.");
      }
      setEquity(response.data);
    }).catch((requestError) => {
      if (!controller.signal.aborted) setError(requestError.response?.data?.message || requestError.message || "Unable to load your equity.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [attempt]);

  const grants = equity?.grants;
  const timeline = useMemo(() => {
    const events = new Map();
    for (const grant of grants ?? []) {
      for (const milestone of grant.vestingSchedule ?? []) {
        const key = new Date(milestone.vestingDate).toISOString().slice(0, 10);
        const current = events.get(key) ?? { date: milestone.vestingDate, shares: 0, cumulative: 0, processed: false };
        current.shares += Number(milestone.sharesVested) || 0;
        current.cumulative += Number(milestone.cumulativeVested) || 0;
        current.processed ||= Boolean(milestone.isProcessed);
        events.set(key, current);
      }
    }
    return [...events.values()].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [grants]);

  if (loading) return <EquityLoading label="Loading your equity…" />;
  if (error) return <div role="alert" className="p-10 text-center"><p>{error}</p><button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2">Retry</button></div>;
  const equityGrants = grants ?? [];
  if (showVested) return <MyVested equity={equity} onBack={() => setShowVested(false)} />;
  if (showGrants) return <EquityGrantsPage grants={equityGrants} onBack={() => setShowGrants(false)} />;

  const vestedShares = Number(equity?.totalVested) || 0;
  const unvestedShares = Number(equity?.totalUnvested) || 0;
  const totalShares = vestedShares + unvestedShares;
  const totalValue = equityGrants.reduce((sum, grant) => sum + (Number(grant.currentFMV) || 0) * (Number(grant.totalShares) || 0), 0);
  const hasValuation = equityGrants.length > 0 && equityGrants.every((grant) => Number.isFinite(grant.currentFMV) && grant.currentFMV >= 0);
  const percentage = totalShares > 0 ? Math.min(100, (vestedShares / totalShares) * 100) : 0;
  const today = new Date();
  const currentEvent = timeline.find((event) => new Date(event.date) >= today);
  const shownEvents = timeline.length <= 4 ? timeline : [timeline[0], timeline[Math.floor((timeline.length - 1) / 3)], timeline[Math.floor(2 * (timeline.length - 1) / 3)], timeline[timeline.length - 1]];
  const distinctEvents = [...new Map(shownEvents.map((event) => [event.date, event])).values()];

  return (
    <section aria-labelledby="equity-heading" className="min-h-full bg-[#F1F2F4] px-5 py-10 text-[#111827] sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h1 id="equity-heading" className="text-2xl font-semibold">Your Equity</h1>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-gray-700">Updated {dateFormat.format(new Date())}</p>
            <button type="button" onClick={() => setShowVested(true)} className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">My Vested</button>
          </div>
        </div>

        {!equityGrants.length ? (
          <div className="rounded-xl bg-white px-6 py-12 text-center shadow-sm"><p className="text-lg font-medium">You don’t have any equity grants yet.</p><p className="mt-2 text-gray-600">When your company issues a grant, its details will appear here.</p></div>
        ) : <>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="min-h-[160px] rounded-lg bg-[#0B2545] px-8 py-6 text-white sm:px-12">
              <h2 className="text-xl font-semibold">Current equity value</h2>
              <p className="mt-2 text-4xl font-bold sm:text-[42px]">{hasValuation ? formatMoney(totalValue) : "Unavailable"}</p>
              <p className="mt-1 text-sm text-slate-200">{hasValuation ? "Based on the latest grant valuations" : "Your company has not provided a current valuation."}</p>
            </article>
            <article className="min-h-[160px] rounded-lg bg-[#0B2545] px-8 py-6 text-white sm:px-12">
              <h2 className="text-xl font-semibold">Shares vested</h2>
              <p className="mt-2 text-4xl font-bold sm:text-[42px]">{numberFormat.format(vestedShares)}</p>
              <p className="mt-1 text-sm text-slate-200">{numberFormat.format(unvestedShares)} shares remain unvested</p>
            </article>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#0B2545] px-6 py-5 text-white sm:px-10">
            <p className="flex items-start gap-3 text-base font-medium sm:text-lg"><AlertTriangle className="mt-0.5 shrink-0 text-[#F58A1F]" size={22} aria-hidden="true" /><span>Ownership percentage and dilution details aren’t available from your current grant data.</span></p>
            <button type="button" onClick={() => setShowGrants(true)} className="shrink-0 rounded-lg bg-white px-5 py-3 font-semibold text-[#0B2545] hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B2545]">View all grants</button>
          </div>

          <section aria-labelledby="vesting-timeline-heading" className="mt-8 min-h-[430px] rounded-lg bg-[#0B2545] px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 id="vesting-timeline-heading" className="text-2xl font-semibold">Vesting timeline</h2>
              <span className="rounded-full bg-[#27C76B] px-3 py-1 text-xs font-semibold">{equityGrants.length} {equityGrants.length === 1 ? "grant" : "grants"}</span>
            </div>
            {!timeline.length ? <p className="mt-16 text-center text-slate-200">No vesting milestones are available yet.</p> : <>
              <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {distinctEvents.map((event, index) => <div key={`${event.date}-${index}`} className="min-w-0 px-1 sm:px-2">
                  <p className="text-sm text-slate-300">{dateFormat.format(new Date(event.date))}</p>
                  <p className="mt-2 text-xl font-semibold sm:text-2xl">{numberFormat.format(event.cumulative || event.shares)} shares</p>
                  {event.date === currentEvent?.date && <p className="text-sm font-medium text-[#F58A1F]">Next vesting</p>}
                </div>)}
              </div>
              <div className="relative mx-2 mt-12 h-3 rounded-full bg-[#D3D5D9] sm:mx-4 sm:mt-16">
                <div className="absolute inset-y-0 left-0 rounded-full bg-[#27C76B]" style={{ width: `${percentage}%` }} />
                {distinctEvents.map((event, index) => {
                  const position = distinctEvents.length < 2 ? 0 : (index / (distinctEvents.length - 1)) * 100;
                  return <span key={`${event.date}-dot`} aria-hidden="true" className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0B2545] ${event.processed ? "bg-[#27C76B]" : "bg-[#F58A1F]"}`} style={{ left: `${position}%` }} />;
                })}
              </div>
              <div className="mt-5 flex justify-between text-sm text-slate-300"><span>{numberFormat.format(vestedShares)} vested</span><span>{numberFormat.format(totalShares)} total shares</span></div>
            </>}
          </section>
        </>}
      </div>
    </section>
  );
}
