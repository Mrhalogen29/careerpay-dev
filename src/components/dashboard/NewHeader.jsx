import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Menu,
  HelpCircle,
  Settings,
  X,
  Mail,
} from "lucide-react";

// Edit these to match your product and support process
const FAQ_ITEMS = [
  {
    q: "How do I run payroll?",
    a: "Go to Payroll → Run Payroll, click Run Payroll to calculate, review the amounts, approve, then process the payment.",
  },
  {
    q: "Where can I see whether payments succeeded?",
    a: "Open Audit log. It lists every payment with its status (success, failed, processing, pending or cancelled).",
  },
  {
    q: "How do I add an employee?",
    a: "Open Employee → Add Employees and fill in their details, salary and bank account. They receive login details by email.",
  },
  {
    q: "I forgot my password.",
    a: "Use the Forgot password link on the login page. A reset link is sent to your email and expires after 15 minutes.",
  },
];

const SUPPORT_EMAIL = "support@careerpay.ng";

function HelpModal({ onClose }) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] max-w-lg w-full p-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900">Help & FAQ</h2>
          <button
            onClick={onClose}
            aria-label="Close help"
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q}>
              <p className="text-sm font-black text-gray-900">{item.q}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Still need help?
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 bg-[#1D4EFF] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
          >
            <Mail size={16} />
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function NewHeader({
  toggleSidebar,
  user,
  setActivePage,
  unreadCount = 0,
}) {
  const [helpOpen, setHelpOpen] = useState(false);

  // Settings is the company settings page, so employees don't get the icon
  const showSettings = user?.role !== "employee";

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const avatarName = `${firstName}+${lastName}`.replace(/^\+$/, "User");

  return (
    <>
      <header className="h-20 bg-white border-b border-gray-100 flex items-center px-8 sticky top-0 z-20 w-full">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition-all border border-gray-100"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar - More Centered */}
          <div className="relative w-full max-w-md hidden md:block mx-auto">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search dashboard..."
              className="w-full pl-11 pr-4 py-2.5 text-xs bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-gray-400 font-bold"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHelpOpen(true)}
            aria-label="Help"
            title="Help & FAQ"
            className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-all relative group"
          >
            <HelpCircle size={20} />
          </button>

          {showSettings && (
            <button
              onClick={() => setActivePage?.("settings")}
              aria-label="Settings"
              title="Settings"
              className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-all relative group"
            >
              <Settings size={20} />
            </button>
          )}

          <button
            onClick={() => setActivePage?.("notification")}
            aria-label="Notifications"
            title="Notifications"
            className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-all relative group"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          <div className="h-8 w-px bg-gray-100 mx-3 hidden sm:block"></div>

          <div className="flex items-center gap-3 pl-1 group cursor-pointer">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-black text-gray-900 leading-none">
                {firstName} {lastName}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                {user?.role || ""}
              </span>
            </div>
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${avatarName}&background=1D4EFF&color=fff`}
                alt="User"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      </header>

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </>
  );
}
