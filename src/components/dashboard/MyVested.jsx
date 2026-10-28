import { useState } from "react";

const numberFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });
const moneyFormat = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", notation: "compact", maximumFractionDigits: 1 });

export default function MyVested({ equity, onBack }) {
  const [view, setView] = useState("vested");
  const grants = equity?.grants ?? [];
  const vested = Math.max(0, Number(equity?.totalVested) || 0);
  const unvested = Math.max(0, Number(equity?.totalUnvested) || 0);
  const total = vested + unvested;
  const percentage = total ? (vested / total) * 100 : 0;
  const vestedPercent = Math.round(percentage);
  const unvestedPercent = total ? 100 - vestedPercent : 0;
  const isVested = view === "vested";
  const hasValuation = grants.length > 0 && grants.every((grant) => Number.isFinite(grant.currentFMV) && grant.currentFMV >= 0);
  const value = grants.reduce((sum, grant) => {
    const shares = isVested ? Number(grant.sharesVested) || 0 : Math.max(0, (Number(grant.totalShares) || 0) - (Number(grant.sharesVested) || 0));
    return sum + shares * (Number(grant.currentFMV) || 0);
  }, 0);

  return (
    <section aria-labelledby="my-vested-heading" className="min-h-full bg-[#F1F2F4] px-5 py-8 text-black sm:px-6 lg:py-12">
      <div className="mx-auto max-w-[1440px]">
        <button autoFocus type="button" onClick={onBack} className="mb-8 rounded text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">← Back to My Equity</button>
        <div className="mb-12 flex flex-wrap items-center justify-between gap-6 lg:mb-16">
          <h1 id="my-vested-heading" className="text-2xl font-semibold sm:text-3xl">Your Equity</h1>
          <div role="group" aria-label="Equity status" className="flex rounded-[20px] bg-[#D9D9D9]">
            {["vested", "unvested"].map((status) => <button key={status} type="button" aria-pressed={view === status} onClick={() => setView(status)} className={`rounded-[20px] px-6 py-4 text-xl font-medium capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:px-12 sm:py-5 sm:text-3xl ${view === status ? "bg-[#1C73ED] text-white" : "text-black hover:bg-black/5"}`}>{status}</button>)}
          </div>
        </div>
        {!total && <p role="status" className="mb-6 text-gray-700">You don’t have any equity shares yet.</p>}
        <div className="rounded-[10px] bg-[#0B2545] px-6 py-8 text-white sm:px-9">
          <div aria-live="polite" className="space-y-5 text-center text-2xl sm:text-3xl">
            <h2>{isVested ? "Vested shares" : "Unvested shares"}</h2>
            <p>{numberFormat.format(isVested ? vested : unvested)} shares</p>
            <p>{hasValuation ? `≈ ${moneyFormat.format(value)} at current valuation` : "Current valuation unavailable"}</p>
          </div>
          <div role="progressbar" aria-label="Shares vested" aria-valuemin={0} aria-valuemax={100} aria-valuenow={vestedPercent} className="mt-12 h-10 overflow-hidden rounded-2xl bg-[#D9D9D9] sm:h-14">
            <div className="h-full bg-[#27C76B] transition-[width]" style={{ width: `${percentage}%` }} />
          </div>
          <div className="mt-6 flex justify-between gap-4 text-lg sm:text-3xl"><span>{vestedPercent}% vested</span><span>{unvestedPercent}% unvested</span></div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:mt-20 lg:gap-10">
          <article className="rounded-[10px] bg-[#0B2545] px-8 py-8 text-white sm:px-16">
            <h2 className="flex items-center gap-3 text-2xl"><span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#F58A1F]" />VESTED</h2>
            <p className="mt-3 text-4xl">{numberFormat.format(vested)} units</p>
            <p className="mt-2 text-xl sm:text-2xl">Vesting completed</p>
          </article>
          <article className="rounded-[10px] bg-[#C4C4C4] px-8 py-8 sm:px-16">
            <h2 className="flex items-center gap-3 text-2xl"><span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#F58A1F]" />UNVESTED</h2>
            <p className="mt-3 text-4xl">{numberFormat.format(unvested)} units</p>
            <p className="mt-2 text-xl sm:text-2xl">Locked until future dates</p>
          </article>
        </div>
      </div>
    </section>
  );
}
