import React, { useState, useEffect, useRef } from "react";
import EquityGrantsPage from "../../components/dashboard/EquityGrantsPage";
import IssueGrantPage from "./IssueGrantPage";
import EquityLoading from "../../components/dashboard/EquityLoading";
import AdminEmployeeEquity from "../../components/dashboard/AdminEmployeeEquity";
import {
  PieChart as PieIcon,
  Users,
  Award,
  Calendar,
  Plus,
  AlertCircle,
} from "lucide-react";
import {
  getEquityOverview,
  getAllEquityGrants,
} from "../../services/equity";
import { getCompanyEmployees } from "../../services/company";
import { motion } from "framer-motion";

const StatCard = ({ label, value, icon: Icon, bg, iconColor }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
    <div className="flex items-start justify-between relative z-10">
      <div
        className={`p-4 rounded-2xl ${bg} w-fit group-hover:scale-110 transition-transform duration-500`}
      >
        <Icon size={24} strokeWidth={2.5} className={iconColor} />
      </div>
    </div>
    <div className="mt-6 relative z-10">
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-black text-gray-900 tracking-tight">
        {value}
      </h3>
    </div>
  </div>
);

export default function ESOP({ user }) {
  const [showGrants, setShowGrants] = useState(false);
  const [overview, setOverview] = useState(null);
  const [grants, setGrants] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIssuePage, setShowIssuePage] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [actionNotice, setActionNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const grantButtons = useRef(new Map());

  const closeGrant = () => {
    const grantId = selectedGrant?._id;
    setActionNotice("");
    setSelectedGrant(null);
    requestAnimationFrame(() => grantButtons.current.get(grantId)?.focus());
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [overviewRes, grantsRes, employeesRes] = await Promise.all([
        getEquityOverview(),
        getAllEquityGrants(),
        getCompanyEmployees(),
      ]);
      for (const response of [overviewRes, grantsRes, employeesRes]) {
        if (!response.success) throw new Error(response.message || "Failed to load equity data.");
      }
      if (overviewRes.success) setOverview(overviewRes.data);
      if (grantsRes.success) setGrants(grantsRes.data);
      if (employeesRes.success) setEmployees(employeesRes.data);
    } catch (err) {
      console.error("Failed to load ESOP data:", err);
      setError(
        err.response?.data?.message || err.message ||
          "Failed to load equity data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) return <EquityLoading />;

  if (showIssuePage) return <IssueGrantPage employees={employees} onClose={() => setShowIssuePage(false)} onIssued={(grant) => {
    setShowIssuePage(false);
    setSelectedGrant(grant);
    setShowGrants(true);
    setShowGrants(true);
    setActionNotice("Grant issued successfully.");
    fetchAll();
  }} />;

  if (selectedGrant) {
    const employeeId = typeof selectedGrant.employee === "string"
      ? selectedGrant.employee : selectedGrant.employee?._id;
    const employee = employees.find((item) => item._id === employeeId);
    return <AdminEmployeeEquity refreshing={refreshing} dataError={error} successMessage={actionNotice} grant={selectedGrant} employee={employee} onBack={closeGrant}
      canManage={["admin", "founder"].includes(user?.role)}
      onSaved={(updated) => {
        const merged = { ...selectedGrant, ...updated, employee: selectedGrant.employee };
        setSelectedGrant(merged);
        setGrants((previous) => previous.map((grant) => grant._id === merged._id ? merged : grant));
        setRefreshing(true);
        setError("");
        getEquityOverview().then((res) => {
          if (!res.success) throw new Error("Unable to refresh overview");
          setOverview(res.data);
        }).catch(() => setError("Grant saved, but the equity overview could not be refreshed.")).finally(() => setRefreshing(false));
      }}
      onDeleted={(id) => {
        setGrants((previous) => previous.filter((grant) => grant._id !== id));
        setSelectedGrant(null);
        setActionNotice("Grant deleted.");
        fetchAll();
      }} />;
  }

  if (showGrants) return <EquityGrantsPage grants={grants} onBack={() => setShowGrants(false)} onSelectGrant={setSelectedGrant} grantButtons={grantButtons} onRefresh={fetchAll} error={error} />;

  const vestedPercent =
    overview?.totalSharesGranted > 0
      ? (
          (overview.totalSharesVested / overview.totalSharesGranted) *
          100
        ).toFixed(1)
      : "0.0";
  const unvestedPercent =
    overview?.totalSharesGranted > 0 ? (100 - vestedPercent).toFixed(1) : "0.0";

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto animate-fadeIn">
      {actionNotice && <p role="status" className="rounded-lg bg-green-50 p-4 text-green-800">{actionNotice}</p>}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Equity & ESOP
          </h1>
          <p className="text-gray-500 font-medium">
            Manage stock options, vesting schedules, and participant grants.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => { setShowGrants(true); fetchAll(); }} className="rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Get all grants</button>
        <button
          disabled={!["admin", "founder"].includes(user?.role)}
          onClick={() => { setActionNotice(""); setShowIssuePage(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          Issue New Grant
        </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
          <AlertCircle size={16} /> {error}
          <button type="button" onClick={fetchAll} className="ml-auto underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          label="Total Shares Granted"
          value={(overview?.totalSharesGranted || 0).toLocaleString()}
          icon={PieIcon}
          color="bg-blue-500"
        />
        <StatCard
          label="Total Vested"
          value={(overview?.totalSharesVested || 0).toLocaleString()}
          icon={Award}
          color="bg-purple-500"
        />
        <StatCard
          label="Active Participants"
          value={(overview?.totalEmployeesWithEquity || 0).toString()}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          label="Total Grants Issued"
          value={grants.length.toString()}
          icon={Calendar}
          color="bg-orange-500"
        />
      </div>

      <div className="bg-[#0a1628] rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-black text-white">
              Equity Distribution
            </h3>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
              Vested vs Unvested
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative flex justify-center py-4">
            <svg role="img" aria-label={`${vestedPercent}% vested, ${unvestedPercent}% unvested`} viewBox="0 0 32 32" className="w-64 h-64 transform -rotate-90">
              <circle
                r="16"
                cx="16"
                cy="16"
                fill="transparent"
                stroke="#1D4EFF"
                strokeWidth="32"
                pathLength="100"
                strokeDasharray={`${vestedPercent} 100`}
              />
              <circle
                r="16"
                cx="16"
                cy="16"
                fill="transparent"
                stroke="#A855F7"
                strokeWidth="32"
                pathLength="100"
                strokeDasharray={`${unvestedPercent} 100`}
                strokeDashoffset={`-${vestedPercent}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="bg-[#0a1628] w-28 h-28 rounded-full flex flex-col items-center justify-center ring-4 ring-white/5">
                <span className="text-white text-3xl font-black tracking-tight">
                  {vestedPercent}%
                </span>
                <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest mt-1">
                  Vested
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Vested ({vestedPercent}%)
                  </span>
                </div>
                <span className="text-lg font-black text-white">
                  {(overview?.totalSharesVested || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${vestedPercent}%` }}
                  transition={{ duration: 1.5 }}
                  className="bg-blue-600 h-full"
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Unvested ({unvestedPercent}%)
                  </span>
                </div>
                <span className="text-lg font-black text-white">
                  {(overview?.totalSharesUnvested || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${unvestedPercent}%` }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                  className="bg-purple-500 h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
