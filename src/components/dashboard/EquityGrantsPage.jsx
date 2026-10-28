import { useEffect, useRef, useState } from "react";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB");
}

export default function EquityGrantsPage({ grants, onBack, onSelectGrant, grantButtons, onRefresh, error }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const visibleGrants = statusFilter === "all" ? grants : grants.filter((grant) =>
    statusFilter === "accepted" ? grant.employeeDecision === "accepted" : grant.status === statusFilter,
  );
  const heading = useRef(null);
  useEffect(() => {
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <section className="mx-auto max-w-[1600px] px-6 py-8 lg:p-12">
      <button type="button" onClick={onBack} className="mb-8 rounded text-sm font-semibold text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-600">
        ← Back to {onSelectGrant ? "ESOP" : "your equity"}
      </button>
      <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold text-gray-900 outline-none">All grants</h1>
      <p className="mt-2 text-gray-500">{onSelectGrant ? "Company equity grants" : "Your active and fully vested grants"}</p>
      {onSelectGrant && <div className="mt-6 flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="ml-3 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-visible:ring-2 focus-visible:ring-blue-600">
            <option value="all">All statuses</option>
            {["pending", "accepted", "active", "declined", "fully_vested", "terminated", "cancelled"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase())}</option>)}
          </select>
        </label>
        {onRefresh && <button type="button" onClick={onRefresh} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Refresh grants</button>}
      </div>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {!visibleGrants.length ? <p className="py-10 text-center text-gray-500">{statusFilter === "all" ? "No equity grants available." : `No ${statusFilter.replaceAll("_", " ")} grants available.`}</p> : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <caption className="sr-only">{onSelectGrant ? "Company grants" : "Your grants"}</caption>
            <thead className="border-b border-gray-200 text-gray-600">
              <tr>{[...(onSelectGrant ? ["Employee"] : []), "Grant type", "Status", "Grant date", "Total shares", "Vested", "Unvested", "Next vesting", ...(onSelectGrant ? ["Action"] : [])].map((label) => <th key={label} scope="col" className="px-3 py-4 font-semibold">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleGrants.map((grant) => (
                <tr key={grant._id}>
                  {onSelectGrant && <td className="px-3 py-4">{[grant.employee?.user?.firstName, grant.employee?.user?.lastName].filter(Boolean).join(" ") || "Employee"}</td>}
                  <th scope="row" className="px-3 py-4 font-medium capitalize">{grant.grantType?.replaceAll("_", " ") || "Equity grant"}</th>
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      {grant.employeeDecision === "accepted" && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Accepted</span>}
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${grant.status === "declined" ? "bg-red-50 text-red-700" : grant.status === "pending" ? "bg-amber-50 text-amber-800" : "bg-gray-100 text-gray-700"}`}>{grant.status?.replaceAll("_", " ") || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">{formatDate(grant.grantDate)}</td>
                  <td className="px-3 py-4">{grant.totalShares?.toLocaleString("en-NG") ?? "—"}</td>
                  <td className="px-3 py-4">{grant.sharesVested?.toLocaleString("en-NG") ?? "—"}</td>
                  <td className="px-3 py-4">{grant.sharesUnvested?.toLocaleString("en-NG") ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-4">{grant.status === "active" ? formatDate(grant.nextVestingDate) : "Not scheduled"}</td>
                  {onSelectGrant && <td className="px-3 py-4"><button type="button" ref={(node) => { if (node) grantButtons?.current.set(grant._id, node); else grantButtons?.current.delete(grant._id); }} onClick={() => onSelectGrant(grant)} className="rounded font-semibold text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-600">View grant</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
