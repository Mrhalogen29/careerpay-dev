import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Eye,
  Pencil,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  X,
  Mail,
  Copy,
  Trash2,
} from "lucide-react";
import { getCompanyEmployees, deleteEmployee } from "../../services/company";
import { motion, AnimatePresence } from "framer-motion";
import { exportToCSV } from "../../utils/exportCSV";

const STATUS_STYLES = {
  Active: "bg-green-50 text-green-600 ring-1 ring-green-500/20",
  "On Leave": "bg-yellow-50 text-yellow-600 ring-1 ring-yellow-500/20",
  Inactive: "bg-red-50 text-red-600 ring-1 ring-red-500/20",
  Suspended: "bg-orange-50 text-orange-600 ring-1 ring-orange-500/20",
};

const PER_PAGE = 8;
const MENU_WIDTH = 208; // w-52
const MENU_HEIGHT = 140; // approx, used to decide whether to flip upward

// One place to work out the status label
const getStatus = (emp) =>
  !emp.isActive
    ? "Inactive"
    : emp.status === "suspended"
      ? "Suspended"
      : emp.status === "on-leave"
        ? "On Leave"
        : "Active";

export default function NewViewEmployees({ setActivePage, onEditEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [page, setPage] = useState(1);

  // Profile modal (eye icon)
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // "..." menu: which row + where to draw it on screen
  const [menu, setMenu] = useState(null); // { emp, top, left } | null
  const menuRef = useRef(null);
  // Delete flow
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getCompanyEmployees();
        if (res.success) {
          setEmployees(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Close menu on outside click / Escape / scroll / resize.
  // Escape also closes the profile modal and the delete dialog.
  useEffect(() => {
    const onMouseDown = (e) => {
      if (!menu) return;
      // Ignore the "..." trigger itself; its own onClick toggles the menu.
      if (e.target.closest("[data-menu-trigger]")) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(null);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenu(null);
        setSelectedEmployee(null);
        if (!deleting) setDeleteTarget(null);
      }
    };
    const closeMenu = () => setMenu(null);

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [menu, deleting]);

  const filtered = employees.filter(
    (e) =>
      (department === "All Departments" || e.department === department) &&
      (e.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // If a delete removes the last row of the last page, step back a page
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const departments = [
    "All Departments",
    ...new Set(employees.map((e) => e.department || "N/A")),
  ];

  const handleExportEmployees = () => {
    const rows = filtered.map((emp) => ({
      "First Name": emp.user?.firstName || "",
      "Last Name": emp.user?.lastName || "",
      Email: emp.user?.email || "",
      "Employee ID": emp.employeeId || "",
      Position: emp.position || "",
      Department: emp.department || "",
      "Join Date": emp.createdAt
        ? new Date(emp.createdAt).toLocaleDateString()
        : "",
      Status: getStatus(emp),
    }));

    exportToCSV("employee-directory.csv", rows);
  };

  // Open/close the "..." menu, positioned just under the clicked button
  const handleMenuToggle = (e, emp) => {
    if (menu?.emp._id === emp._id) {
      setMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const opensUpward = rect.bottom + MENU_HEIGHT > window.innerHeight;
    setMenu({
      emp,
      top: opensUpward ? rect.top - MENU_HEIGHT - 4 : rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_WIDTH),
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Copy failed:", err);
    }
    setMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await deleteEmployee(deleteTarget._id);
      if (res?.success === false)
        throw new Error(res.message || "Delete failed");
      // Remove from local state so the row disappears without refetching
      setEmployees((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message ||
          err.message ||
          "Could not delete employee",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Loading Workforce...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-fadeIn space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Employee Directory
          </h1>
          <p className="text-gray-500 font-medium">
            Manage and view all members of your organization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportEmployees}
            className="flex items-center gap-2 bg-white text-gray-700 px-5 py-3 rounded-2xl font-bold text-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <Download size={18} />
            Export List
          </button>
          <button
            onClick={() => setActivePage("add-employees")}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} />
            Add New Employee
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Filter
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="appearance-none pl-11 pr-10 py-3.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold text-gray-700 outline-none cursor-pointer w-full"
            >
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {[
                  "Employee",
                  "Role",
                  "Department",
                  "Join Date",
                  "Status",
                  "",
                ].map((h, i) => (
                  <th
                    key={`${h}-${i}`}
                    className="text-left px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {paginated.map((emp) => {
                  const status = getStatus(emp);
                  const menuIsOpenForRow = menu?.emp._id === emp._id;

                  return (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={emp._id}
                      className="group hover:bg-gray-50/50 transition-all cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform overflow-hidden">
                            <img
                              src={`https://ui-avatars.com/api/?name=${emp.user?.firstName}+${emp.user?.lastName}&background=random`}
                              alt=""
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-gray-900 leading-none mb-1">
                              {emp.user?.firstName} {emp.user?.lastName}
                            </h4>
                            <p className="text-xs text-gray-400 font-medium">
                              {emp.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-gray-700">
                          {emp.position || "N/A"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-medium text-gray-500">
                          {emp.department || "N/A"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                        {emp.createdAt
                          ? new Date(emp.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[status]}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div
                          className={`flex items-center justify-end gap-2 transition-opacity ${
                            menuIsOpenForRow
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <button
                            className="p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="View Profile"
                            onClick={() => setSelectedEmployee(emp)}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Edit Employee"
                            onClick={() => onEditEmployee?.(emp._id)}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            data-menu-trigger
                            className={`p-2.5 rounded-xl transition-all ${
                              menuIsOpenForRow
                                ? "text-gray-900 bg-gray-100"
                                : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                            title="More actions"
                            onClick={(e) => handleMenuToggle(e, emp)}
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-6 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Showing{" "}
            <span className="text-gray-900">
              {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1} -{" "}
              {Math.min(page * PER_PAGE, filtered.length)}
            </span>{" "}
            of <span className="text-gray-900">{filtered.length}</span>{" "}
            Employees
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                    page === p
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-500 hover:bg-white hover:text-gray-900"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* "..." dropdown. Rendered through a portal into document.body so no parent
          (overflow, transforms, animations) can clip or offset it. */}
      {menu &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menu.top,
              left: menu.left,
              width: MENU_WIDTH,
            }}
            className="z-[100] bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-900/10 py-2"
          >
            <button
              onClick={() => copyToClipboard(menu.emp.user?.email || "")}
              disabled={!menu.emp.user?.email}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <Mail size={16} className="text-gray-400" /> Copy email
            </button>
            <button
              onClick={() => copyToClipboard(menu.emp.employeeId || "")}
              disabled={!menu.emp.employeeId}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <Copy size={16} className="text-gray-400" /> Copy employee ID
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button
              onClick={() => {
                setDeleteTarget(menu.emp);
                setDeleteError("");
                setMenu(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} /> Delete employee
            </button>
          </div>,
          document.body,
        )}

      {/* Profile modal (eye icon) */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEmployee(null)}
          >
            <motion.div
              className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              // stop clicks inside the card from reaching the backdrop and closing it
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img
                    className="w-16 h-16 rounded-2xl"
                    src={`https://ui-avatars.com/api/?name=${selectedEmployee.user?.firstName}+${selectedEmployee.user?.lastName}&background=random`}
                    alt=""
                  />
                  <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">
                      {selectedEmployee.user?.firstName}{" "}
                      {selectedEmployee.user?.lastName}
                    </h2>
                    <p className="text-sm text-gray-400 font-medium">
                      {selectedEmployee.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <dl className="space-y-4">
                {[
                  ["Employee ID", selectedEmployee.employeeId],
                  ["Position", selectedEmployee.position],
                  ["Department", selectedEmployee.department],
                  [
                    "Join date",
                    selectedEmployee.createdAt
                      ? new Date(
                          selectedEmployee.createdAt,
                        ).toLocaleDateString()
                      : null,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-gray-50 pb-3"
                  >
                    <dt className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                      {label}
                    </dt>
                    <dd className="text-sm font-bold text-gray-800">
                      {value || "N/A"}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <dt className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                    Status
                  </dt>
                  <dd>
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        STATUS_STYLES[getStatus(selectedEmployee)]
                      }`}
                    >
                      {getStatus(selectedEmployee)}
                    </span>
                  </dd>
                </div>
              </dl>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const id = selectedEmployee._id;
                    setSelectedEmployee(null);
                    onEditEmployee?.(id);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  Edit employee
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                <Trash2 size={24} />
              </div>
              <h2 className="text-lg font-black text-gray-900">
                Delete employee?
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                {deleteTarget.user?.firstName} {deleteTarget.user?.lastName}{" "}
                will be removed from your organization. This can't be undone.
              </p>
              {deleteError && (
                <p className="mt-3 text-sm font-semibold text-red-600">
                  {deleteError}
                </p>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                {/* Inline colors so the button is visible even if Tailwind
                    doesn't generate bg-red-600 */}
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
