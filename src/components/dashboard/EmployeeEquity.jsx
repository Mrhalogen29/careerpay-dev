import { useState } from "react";
import useNotificationCount from "../../hooks/useNotificationCount";
import { Bell, MessageCircle, Search, UserRound } from "lucide-react";
import EquityVesting from "./EquityVesting";

const destinations = [
  { label: "Your equity", page: "esop" },
  { label: "Employee profile", page: "employee-profile" },
  { label: "Notifications", page: "notification" },
  { label: "Messages", page: "employee-messages" },
  { label: "Dashboard", page: "dashboard" },
];

function EmployeeAvatar({ user, large = false }) {
  const [failedUrl, setFailedUrl] = useState(null);
  // Support photo URLs when supplied by the authenticated user response.
  const photo = [user?.profilePicture, user?.profileImage, user?.avatarUrl]
    .find((value) => typeof value === "string" && value.trim());
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-500 text-white ${large ? "h-20 w-20" : "h-9 w-9"}`}>
      {photo && failedUrl !== photo ? (
        <img src={photo} alt="" onError={() => setFailedUrl(photo)} className="h-full w-full object-cover" />
      ) : <UserRound size={large ? 40 : 23} aria-hidden="true" />}
    </span>
  );
}

export function EmployeeEquityHeader({ user, onNavigate }) {
  const [query, setQuery] = useState("");
  const unreadCount = useNotificationCount(user?._id);
  const results = query.trim() ? destinations.filter(({ label }) => label.toLowerCase().includes(query.trim().toLowerCase())) : [];
  function open(page) {
    setQuery("");
    onNavigate(page);
  }
  return (
    <header className="relative z-20 shrink-0 bg-[#0B2545] shadow-md">
      <div className="mx-auto flex h-[74px] max-w-[1024px] items-center justify-between gap-4 px-5 sm:px-6">
        <div className="relative w-full max-w-[230px]">
          <form role="search" onSubmit={(event) => { event.preventDefault(); if (results.length) open(results[0].page); }} className="flex h-9 items-center rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-white">
            <input aria-label="Search dashboard pages" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }} type="search" placeholder="Search" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-200" />
            <button type="submit" aria-label="Search" className="rounded-lg p-2 text-slate-200 focus-visible:outline focus-visible:outline-white"><Search size={20} aria-hidden="true" /></button>
          </form>
          {query.trim() && <div className="absolute left-0 right-0 top-11 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
            {results.length ? results.map(({ label, page }) => <button key={page} type="button" onClick={() => open(page)} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 focus-visible:bg-gray-100">{label}</button>) : <p role="status" className="px-3 py-2 text-sm text-gray-500">No matching pages</p>}
          </div>}
        </div>
        <nav aria-label="Employee account" className="flex shrink-0 items-center gap-3 sm:gap-5">
          <button type="button" onClick={() => open("employee-messages")} aria-label="Messages" className="rounded-md p-1 text-slate-100 hover:bg-white/10 focus-visible:outline focus-visible:outline-white"><MessageCircle size={27} strokeWidth={1.7} aria-hidden="true" /></button>
          <button type="button" onClick={() => open("notification")} aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"} className="relative rounded-md p-1 text-slate-100 hover:bg-white/10 focus-visible:outline focus-visible:outline-white"><Bell size={32} strokeWidth={1.7} aria-hidden="true" />{unreadCount > 0 && <span aria-hidden="true" className="absolute right-1 top-0 h-1.5 w-1.5 rounded-full bg-red-500" />}</button>
          <button type="button" onClick={() => open("employee-profile")} aria-label="Open employee profile" className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><EmployeeAvatar user={user} /></button>
        </nav>
      </div>
    </header>
  );
}

export default function EmployeeEquity({ onBack }) {
  const [showVested, setShowVested] = useState(false);
  return (
    <div className="min-h-full bg-[#F3F4F5] text-gray-900">
      {!showVested && <div className="px-6 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="rounded text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          ← Back to dashboard
        </button>
      </div>}
      <EquityVesting showVested={showVested} setShowVested={setShowVested} />
    </div>
  );
}

export function EmployeeProfile({ user, onBack, backLabel = "Back to your equity" }) {
  return <section className="mx-auto max-w-3xl px-6 py-12">
    <button type="button" onClick={onBack} className="mb-8 rounded text-sm font-semibold text-blue-700 hover:underline">← {backLabel}</button>
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <EmployeeAvatar user={user} large />
      <h1 className="mt-4 text-3xl font-semibold">My Profile</h1>
      <dl className="mt-6 grid gap-6 sm:grid-cols-2">
        {[['Name', [user?.firstName, user?.lastName].filter(Boolean).join(' ')], ['Email', user?.email], ['Role', user?.role]].map(([label, value]) => <div key={label}><dt className="text-sm text-gray-500">{label}</dt><dd className="mt-1 break-words text-lg">{value || "Not provided"}</dd></div>)}
      </dl>
    </div>
  </section>;
}

export function EmployeeMessages({ onBack }) {
  return <section className="mx-auto max-w-3xl px-6 py-12">
    <button type="button" onClick={onBack} className="mb-8 rounded text-sm font-semibold text-blue-700 hover:underline">← Back to your equity</button>
    <div className="rounded-xl bg-white p-8 shadow-sm"><h1 className="text-3xl font-semibold">Messages</h1><p className="mt-4 text-gray-600">Employee messaging is not available yet.</p></div>
  </section>;
}
