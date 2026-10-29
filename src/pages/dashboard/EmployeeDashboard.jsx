import { useEffect, useState } from "react";
import {
  Calendar,
  FileText,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Award,
  Wallet,
  Receipt,
  Percent,
} from "lucide-react";
import { getMyPayslips } from "../../services/myPayslips";
import { getMyLoans } from "../../services/employeeLoans";
import { getAccess } from "../../services/access";

const money = (n, cur = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  }).format(n || 0);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function EmployeeDashboard({ user, setActivePage }) {
  const [latest, setLatest] = useState(null);
  const [loan, setLoan] = useState(null);
  const [canBorrow, setCanBorrow] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [slips, access] = await Promise.allSettled([
        getMyPayslips(),
        getAccess(),
      ]);

      if (!alive) return;
      if (slips.status === "fulfilled")
        setLatest(slips.value.data?.[0] || null);

      const a = access.status === "fulfilled" ? access.value.data : null;
      const borrow = !!(a?.financing && a?.payroll);
      setCanBorrow(borrow);

      if (borrow) {
        try {
          const res = await getMyLoans();
          const active = (res.data || []).find((l) => l.status === "active");
          if (alive) setLoan(active || null);
        } catch {
          /* loan card just shows no balance */
        }
      }
      if (alive) setLoaded(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const deductions = latest
    ? latest.deductions.tax +
      latest.deductions.pension +
      latest.deductions.nhf +
      latest.deductions.loanRepayment +
      latest.deductions.other
    : 0;

  const stats = [
    {
      label: "Latest net pay",
      value: latest ? money(latest.netSalary, latest.currency) : "—",
      icon: <CreditCard size={20} />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Pay period",
      value: latest
        ? `${MONTHS[latest.period.month - 1]} ${latest.period.year}`
        : "—",
      icon: <Calendar size={20} />,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Total deductions",
      value: latest ? money(deductions, latest.currency) : "—",
      icon: <Percent size={20} />,
      color: "bg-blue-50 text-blue-600",
    },
    ...(canBorrow
      ? [
          {
            label: "Loan balance",
            value: loan ? money(loan.outstandingBalance) : "No active loan",
            icon: <Wallet size={20} />,
            color: "bg-green-50 text-green-600",
          },
        ]
      : []),
  ];

  const links = [
    {
      title: "My Payslips",
      desc: "View and print your payslips",
      icon: <Receipt className="text-blue-500" />,
      page: "payslip",
    },
    {
      title: "Request Leave",
      desc: "Coming soon",
      icon: <Calendar className="text-gray-400" />,
    },
    {
      title: "My Benefits",
      desc: "Coming soon",
      icon: <Award className="text-gray-400" />,
    },
    {
      title: "Tax Documents",
      desc: "Coming soon",
      icon: <TrendingUp className="text-gray-400" />,
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.firstName || "User"}!
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Here's a summary of your pay.
          </p>
        </div>
      </div>

      <button
        onClick={() => setActivePage?.("my-loans")}
        disabled={loaded && !canBorrow}
        title={
          loaded && !canBorrow
            ? "Staff loans are not enabled for your company"
            : ""
        }
        className="flex items-center gap-2 bg-[#1D4EFF] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet size={18} />
        Request a Loan
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4`}
            >
              {stat.icon}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {loaded && !latest && (
        <p className="text-sm text-gray-500">
          Your first payslip will appear here after your company pays a payroll.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {links.map((link) => {
          const enabled = !!link.page;
          return (
            <button
              key={link.title}
              type="button"
              disabled={!enabled}
              onClick={() => enabled && setActivePage?.(link.page)}
              className={`bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-4 text-left transition-all ${
                enabled
                  ? "hover:shadow-lg cursor-pointer group"
                  : "opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                {link.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{link.title}</p>
                <p className="text-[10px] text-gray-500 font-medium">
                  {link.desc}
                </p>
              </div>
              {enabled && (
                <ArrowUpRight
                  size={16}
                  className="ml-auto text-gray-300 group-hover:text-[#1D4EFF] transition-all"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
