import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import GrantActionDialog from "./GrantActionDialog";
import EquityLoading from "./EquityLoading";

const numberFormat = new Intl.NumberFormat("en-NG");

function formatNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? numberFormat.format(value)
    : "Not provided";
}

function formatDate(value, includeDay = true) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    ...(includeDay ? { day: "numeric" } : {}),
    year: "numeric",
    timeZone: "UTC",
  });
}

function duration(months) {
  if (typeof months !== "number" || !Number.isFinite(months) || months < 0) return null;
  if (months > 0 && months % 12 === 0) {
    const years = months / 12;
    return `${years} ${years === 1 ? "year" : "years"}`;
  }
  return `${months} ${months === 1 ? "month" : "months"}`;
}

export default function AdminEmployeeEquity({ grant, employee, onBack, onSaved, onDeleted, canManage = false, successMessage, refreshing, dataError }) {
  const [action, setAction] = useState(null);
  const [notice, setNotice] = useState("");
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "start" });
  }, [grant._id]);

  const person = employee?.user || grant.employee?.user;
  const name = [person?.firstName, person?.lastName].filter(Boolean).join(" ") || "Employee";
  const initials = [person?.firstName, person?.lastName]
    .filter(Boolean).map((part) => part.charAt(0)).join("").toUpperCase() || "?";
  const department = employee?.department || grant.employee?.department;
  const joined = formatDate(employee?.startDate || grant.employee?.startDate, false);
  const vesting = duration(grant.vestingPeriodMonths);
  const cliff = duration(grant.cliffMonths);
  const schedule = vesting && cliff
    ? `${vesting}, ${grant.cliffMonths === 0 ? "no cliff" : `${cliff.replace(" ", "-")} cliff`}`
    : "Not provided";
  // Show counts supplied by the API; a rounded vesting percentage cannot
  // reliably reconstruct an exact vested share count.
  const stats = [
    ["Total granted", grant.totalShares],
    ["Vested", grant.vestedShares ?? grant.sharesVested],
    ["Exercised", grant.exercisedShares ?? grant.sharesExercised],
  ];
  const details = [
    ...(grant.employeeDecision ? [["Employee decision", grant.employeeDecision.replace(/^./, (letter) => letter.toUpperCase())]] : []),
    ["Status", (grant.status || "Unknown").replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase())],
    ...(grant.respondedAt ? [["Employee response date", formatDate(grant.respondedAt) || "Not provided"]] : []),
    ["Grant date", formatDate(grant.grantDate) || "Not provided"],
    ["Vesting schedule", schedule],
    ["Strike price", typeof grant.strikePrice === "number" && Number.isFinite(grant.strikePrice)
      ? `₦${numberFormat.format(grant.strikePrice)} / share` : "Not provided"],
  ];

  return (
    <section aria-labelledby="employee-equity-heading" className="min-h-full bg-white px-5 py-8 sm:px-10 lg:px-[4.3%] lg:py-10">
      <div className="mx-auto max-w-[1800px]">
        {successMessage && <p role="status" className="mb-4 rounded-lg bg-green-50 p-4 text-green-800">{successMessage}</p>}
        {refreshing && <div className="mb-4 text-blue-700"><EquityLoading inline label="Refreshing equity overview…" /></div>}
        {dataError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">{dataError}</p>}
        <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-md py-2 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
          <ArrowLeft size={18} aria-hidden="true" /> Back to all grants
        </button>

        <header className="mb-4 flex items-center gap-5">
          <div aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1E73EC] text-2xl font-semibold text-white lg:h-20 lg:w-20 lg:text-3xl">{initials}</div>
          <div className="min-w-0">
            <h1 ref={headingRef} tabIndex={-1} id="employee-equity-heading" className="break-words text-2xl font-semibold leading-tight text-black outline-none lg:text-3xl">{name}</h1>
            <p className="mt-1 text-base leading-tight text-black lg:text-2xl">{[department, joined ? `Joined ${joined}` : null].filter(Boolean).join(" · ") || "Employee equity grant"}</p>
          </div>
        </header>

        <div aria-label="Selected grant summary" className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:gap-10 xl:gap-14">
          {stats.map(([label, value]) => (
            <article key={label} className="rounded-lg bg-[#0B2545] px-7 py-8 text-white lg:px-9 lg:py-9">
              <h2 className="text-xl font-semibold leading-tight lg:text-3xl">{label}</h2>
              <p className="mt-1 break-words text-3xl font-semibold leading-tight">{formatNumber(value)}</p>
            </article>
          ))}
        </div>

        <section aria-labelledby="grant-details-heading" className="mt-8">
          <h2 id="grant-details-heading" className="mb-2 text-2xl font-semibold text-black lg:text-3xl">GRANT DETAILS</h2>
          <dl className="overflow-hidden rounded-xl bg-[#0B2545] text-white">
            {details.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-2 border-b border-white/60 px-6 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between lg:px-16">
                <dt className="text-lg lg:text-2xl">{label}</dt>
                <dd className="text-lg sm:text-right lg:text-2xl">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-24 lg:gap-14">
          {[["Adjust grant", "edit"], ["Delete grant", "delete"]].map(([label, mode]) => (
            <button key={mode} type="button" disabled={!canManage} onClick={() => { setNotice(""); setAction(mode); }} className="min-h-16 rounded-lg bg-[#C4C4C4] px-6 py-4 text-xl font-medium text-black hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60 lg:text-2xl">{label}</button>
          ))}
        </div>
        {!canManage && <p className="mt-4 text-sm text-gray-500">Only founders and admins can adjust or delete grants.</p>}
        {notice && <p role="status" className="mt-4 text-sm text-green-700">{notice}</p>}
        {action && <GrantActionDialog mode={action} grant={grant} employeeName={name} onClose={() => setAction(null)} onSaved={(updated) => { setAction(null); setNotice("Grant updated."); onSaved(updated); }} onDeleted={onDeleted} />}
      </div>
    </section>
  );
}
