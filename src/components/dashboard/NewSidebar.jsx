import { useEffect, useState } from "react";
import { getMyEquity } from "../../services/equity";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Bell,
  Settings,
  ChevronDown,
  X,
  PieChart as PieIcon,
  Wallet,
  LogOut,
  ShieldCheck,
  History,
  Briefcase,
  UserCheck,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  {
    icon: Users,
    label: "Employee",
    id: "employee",
    children: [
      { label: "Add Employees", id: "add-employees", hideForEmployee: true },
      { label: "View Employees", id: "view-employees" },
    ],
  },
  {
    icon: Briefcase,
    label: "Jobs",
    id: "jobs",
    adminOnly: true,
    children: [
      { label: "Add Job", id: "add-job" },
      { label: "View Jobs", id: "view-jobs" },
    ],
  },
  {
    icon: UserCheck,
    label: "Applicants",
    id: "applicants",
    adminOnly: true,
    children: [{ label: "View Applicants", id: "view-applicants" }],
  },
  {
    icon: CreditCard,
    label: "Payroll",
    id: "payroll",
    children: [
      { label: "Run Payroll", id: "payroll" },
      { laabel: "Overtime", id: "overtime" },
      { label: "Payslips", id: "payslip" },
    ],
  },
  { icon: PieIcon, label: "ESOP", id: "esop", roles: ["admin", "founder", "hr"] },
  { icon: PieIcon, label: "My Equity", id: "my-equity", grantHolderOnly: true },
  { icon: Wallet, label: "Financing", id: "financing" },
  { icon: Bell, label: "Notification", id: "notification" },
  { icon: ShieldCheck, label: "Payment Gateway", id: "payment-gateway" },
  { icon: History, label: "Audit log", id: "audit-log" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export default function NewSidebar({
  activePage,
  setActivePage,
  isOpen,
  onClose,
  onLogout,
  user,
}) {
  const [openMenus, setOpenMenus] = useState({
    employee: true,
    payroll: false,
  });
  const [grantHolder, setGrantHolder] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setGrantHolder(null);
    if (user) {
      getMyEquity(controller.signal).then((response) => {
        if (!controller.signal.aborted && response?.success && Array.isArray(response.data?.grants) && response.data.grants.length > 0) {
          setGrantHolder(user);
        }
      }).catch(() => {
        // Personal equity navigation requires a confirmed grant.
      });
    }
    return () => controller.abort();
  }, [user, activePage]);

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0a1628] flex flex-col transition-all duration-300 border-r border-white/5 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white leading-none tracking-tight">
                CAREERPAY
              </span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-1">
                Founders
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== "admin") return null;
            if (item.roles && !item.roles.includes(user?.role)) return null;
            if (item.grantHolderOnly && (!user || grantHolder !== user)) return null;
            const isActive =
              activePage === item.id ||
              item.children?.some((c) => c.id === activePage);
            const isMenuOpen = openMenus[item.id];

            return (
              <div key={item.id} className="space-y-1">
                <button
                  aria-expanded={item.children ? Boolean(isMenuOpen) : undefined}
                  onClick={() =>
                    item.children ? toggleMenu(item.id) : setActivePage(item.id)
                  }
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 group ${
                    isActive && !item.children
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={
                      isActive
                        ? "text-white"
                        : "text-gray-500 group-hover:text-blue-400 transition-colors"
                    }
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.children && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 opacity-40 ${isMenuOpen ? "rotate-180 opacity-100" : ""}`}
                    />
                  )}
                </button>

                {item.children && isMenuOpen && (
                  <div className="ml-4 pl-8 border-l border-white/5 space-y-1 mt-1">
                    {item.children.filter((child) => !(child.hideForEmployee && user?.role === "employee")).map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setActivePage(child.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          activePage === child.id
                            ? "text-blue-400 bg-blue-400/10"
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer/Logout */}
        <div className="p-4 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5">
                <div className="w-full h-full rounded-full bg-[#0a1628] flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
                    alt="User"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-gray-500 font-medium capitalize">
                  {user?.role || "Founder & CEO"}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
            >
              <LogOut size={14} />
              Logout Session
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
