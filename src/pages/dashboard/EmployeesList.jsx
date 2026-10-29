import  { useEffect, useState } from "react";

import {
  ChevronDown,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { getCompanyEmployees, addEmployee } from "../../services/company";

const EmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add employee modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [warnings, setWarnings] = useState([]);

  // Employee form
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    position: "",
    department: "",
    employmentType: "full-time",
    startDate: new Date().toISOString().split("T")[0],

    salary: {
      amount: "",
      currency: "NGN",
      payFrequency: "monthly",
    },

    bankDetails: {
      bankName: "",
      bankCode: "",
      accountNumber: "",
      accountName: "",
    },
  });

  // ===============================
  // Fetch employees
  // ===============================
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCompanyEmployees();

      console.log("Employees response:", response);

      const employeeData = response?.data || response || [];

      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (err) {
      console.error(
        "Failed to load employees:",
        err.response?.data || err.message,
      );

      setError(err.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ===============================
  // Handle normal input
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===============================
  // Handle salary fields
  // ===============================
  const handleSalaryChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      salary: {
        ...prev.salary,
        [name]: value,
      },
    }));
  };

  // ===============================
  // Handle bank fields
  // ===============================
  const handleBankChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value,
      },
    }));
  };

  // ===============================
  // Reset form
  // ===============================
  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      position: "",
      department: "",
      employmentType: "full-time",
      startDate: new Date().toISOString().split("T")[0],

      salary: {
        amount: "",
        currency: "NGN",
        payFrequency: "monthly",
      },

      bankDetails: {
        bankName: "",
        bankCode: "",
        accountNumber: "",
        accountName: "",
      },
    });

    setFormError("");
    setWarnings([]);
  };

  // ===============================
  // Close modal
  // ===============================
  const closeModal = () => {
    if (saving) return;

    setShowAddModal(false);
    resetForm();
  };

  // ===============================
  // Validate employee
  // ===============================
  const validateForm = () => {
    if (!formData.firstName.trim()) {
      return "First name is required.";
    }

    if (!formData.lastName.trim()) {
      return "Last name is required.";
    }

    if (!formData.email.trim()) {
      return "Email is required.";
    }

    if (!formData.position.trim()) {
      return "Position is required.";
    }

    if (!formData.department.trim()) {
      return "Department is required.";
    }

    if (!formData.startDate) {
      return "Start date is required.";
    }

    if (!formData.salary.amount) {
      return "Salary amount is required.";
    }

    if (Number(formData.salary.amount) <= 0) {
      return "Salary must be greater than zero.";
    }

    // Backend expects Nigerian phone format if provided
    if (formData.phone && !/^\+234\d{10}$/.test(formData.phone)) {
      return "Phone must be in the format +234XXXXXXXXXX.";
    }

    // Bank details are required for payroll
    if (!formData.bankDetails.bankName.trim()) {
      return "Bank name is required for payroll.";
    }

    if (!/^\d{3}$/.test(formData.bankDetails.bankCode)) {
      return "Bank code must contain exactly 3 digits.";
    }

    if (!/^\d{10}$/.test(formData.bankDetails.accountNumber)) {
      return "Account number must contain exactly 10 digits.";
    }

    if (!formData.bankDetails.accountName.trim()) {
      return "Account name is required.";
    }

    return "";
  };

  // ===============================
  // Submit employee
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setSuccessMessage("");
    setWarnings([]);

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        position: formData.position.trim(),
        department: formData.department.trim(),
        employmentType: formData.employmentType,
        startDate: formData.startDate,

        salary: {
          amount: Number(formData.salary.amount),
          currency: formData.salary.currency,
          payFrequency: formData.salary.payFrequency,
        },

        bankDetails: {
          bankName: formData.bankDetails.bankName.trim(),
          bankCode: formData.bankDetails.bankCode.trim(),
          accountNumber: formData.bankDetails.accountNumber.trim(),
          accountName: formData.bankDetails.accountName.trim(),
        },
      };

      console.log("Creating employee:", payload);

      const response = await addEmployee(payload);

      console.log("Create employee response:", response);

      if (response?.success === false) {
        throw new Error(response?.message || "Failed to create employee");
      }

      setSuccessMessage(response?.message || "Employee created successfully.");

      if (response?.warnings) {
        setWarnings(response.warnings);
      }

      // Refresh employee table
      await fetchEmployees();

      // Close after successful creation
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
        setSuccessMessage("");
      }, 1200);
    } catch (err) {
      console.error(
        "Failed to create employee:",
        err.response?.data || err.message,
      );

      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create employee.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ===============================
          HEADER
      =============================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          Employees
        </h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#22C55E] text-white rounded-lg overflow-hidden shadow-lg shadow-green-500/20">
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 font-bold text-sm hover:bg-green-600 transition-all"
            >
              Add Employee
            </button>

            <div className="w-[1px] h-6 bg-white/20"></div>

            <button
              className="px-2 py-2.5 hover:bg-green-600 transition-all"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ===============================
          MAIN CARD
      =============================== */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Filters */}
        <div className="p-4 flex flex-wrap items-center gap-6 border-b border-gray-50 dark:border-gray-700">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
              All Departments
            </span>

            <ChevronDown
              size={14}
              className="text-gray-400 group-hover:text-gray-600"
            />
          </div>

          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
              All Roles
            </span>

            <ChevronDown
              size={14}
              className="text-gray-400 group-hover:text-gray-600"
            />
          </div>

          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
              All Status
            </span>

            <ChevronDown
              size={14}
              className="text-gray-400 group-hover:text-gray-600"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-10 text-center text-gray-500">
            Loading employees...
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-10 text-center text-red-500">{error}</div>
        )}

        {/* ===============================
            EMPLOYEE TABLE
        =============================== */}
        {!loading && !error && (
          <>
            {employees.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No employees found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                      <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                        Name
                      </th>

                      <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 text-center">
                        Employee ID
                      </th>

                      <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 text-center">
                        Role
                      </th>

                      <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 text-center">
                        Department
                      </th>

                      {/* NEW BANK COLUMN */}
                      <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 text-center">
                        Bank
                      </th>

                      <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 text-center">
                        Status
                      </th>

                      <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {employees.map((emp, index) => {
                      const fullName = `${emp.user?.firstName || ""} ${
                        emp.user?.lastName || ""
                      }`.trim();

                      const status = emp.isActive ? "Active" : "Inactive";

                      return (
                        <tr
                          key={emp._id || emp.id || index}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                        >
                          {/* Name */}
                          <td className="px-8 py-5">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {fullName || "N/A"}
                            </span>
                          </td>

                          {/* Employee ID */}
                          <td className="px-8 py-5 text-sm text-gray-500 text-center font-bold uppercase tracking-tighter">
                            {emp.employeeId || emp.id || "N/A"}
                          </td>

                          {/* Role */}
                          <td className="px-8 py-5 text-sm text-gray-500 text-center">
                            {emp.position || "N/A"}
                          </td>

                          {/* Department */}
                          <td className="px-8 py-5 text-sm text-gray-500 text-center">
                            {emp.department || "N/A"}
                          </td>

                          {/* NEW BANK */}
                          <td className="px-8 py-5 text-sm text-gray-500 text-center">
                            {emp.bankDetails?.bankName || "N/A"}
                          </td>

                          {/* Status */}
                          <td className="px-8 py-5 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                status === "Active"
                                  ? "bg-green-50 text-green-500"
                                  : "bg-red-50 text-red-500"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  status === "Active"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></div>

                              {status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-8 py-5">
                            <div className="flex items-center justify-center gap-4 text-gray-400">
                              <button
                                className="hover:text-gray-900 dark:hover:text-white transition-colors p-1"
                                title="View employee"
                              >
                                <Eye size={18} />
                              </button>

                              <button
                                className="hover:text-gray-900 dark:hover:text-white transition-colors p-1"
                                title="Edit employee"
                              >
                                <Edit2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && !error && employees.length > 0 && (
          <div className="p-6 flex items-center justify-between border-t border-gray-50 dark:border-gray-700 bg-white dark:bg-gray-800">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Showing 1 to {employees.length} of {employees.length} results
            </p>

            <div className="flex items-center gap-3">
              <button
                className="p-1 text-gray-300 hover:text-gray-500 transition-colors"
                disabled
              >
                <ChevronLeft size={20} />
              </button>

              <button className="w-8 h-8 flex items-center justify-center bg-[#22C55E] text-white rounded-lg text-xs font-bold shadow-lg shadow-green-500/20">
                1
              </button>

              <button
                className="p-1 text-gray-300 hover:text-gray-500 transition-colors"
                disabled
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===============================
          ADD EMPLOYEE MODAL
      =============================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">
                  Add Employee
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Create an employee record for payroll.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error */}
              {formError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                  {formError}
                </div>
              )}

              {/* Success */}
              {successMessage && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm">
                  {successMessage}
                </div>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 text-sm">
                  {Array.isArray(warnings)
                    ? warnings.map((warning, index) => (
                        <div key={index}>{warning}</div>
                      ))
                    : warnings}
                </div>
              )}

              {/* ===============================
                  PERSONAL INFORMATION
              =============================== */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      First Name *
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. David"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Adewale"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Email *
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="employee@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Phone
                    </label>

                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+2348012345678"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* ===============================
                  EMPLOYMENT INFORMATION
              =============================== */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                  Employment Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Position *
                    </label>

                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Department *
                    </label>

                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Engineering"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Employment Type
                    </label>

                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* ===============================
                  SALARY INFORMATION
              =============================== */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                  Salary Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Monthly Salary *
                    </label>

                    <input
                      type="number"
                      name="amount"
                      min="0"
                      value={formData.salary.amount}
                      onChange={handleSalaryChange}
                      placeholder="250000"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Currency
                    </label>

                    <select
                      name="currency"
                      value={formData.salary.currency}
                      onChange={handleSalaryChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="NGN">NGN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Pay Frequency
                    </label>

                    <select
                      name="payFrequency"
                      value={formData.salary.payFrequency}
                      onChange={handleSalaryChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ===============================
                  BANK INFORMATION
              =============================== */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                  Bank Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Bank Name *
                    </label>

                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankDetails.bankName}
                      onChange={handleBankChange}
                      placeholder="e.g. Access Bank"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Bank Code *
                    </label>

                    <input
                      type="text"
                      name="bankCode"
                      maxLength="3"
                      value={formData.bankDetails.bankCode}
                      onChange={handleBankChange}
                      placeholder="e.g. 044"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Account Number *
                    </label>

                    <input
                      type="text"
                      name="accountNumber"
                      maxLength="10"
                      value={formData.bankDetails.accountNumber}
                      onChange={handleBankChange}
                      placeholder="10 digit account number"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Account Name *
                    </label>

                    <input
                      type="text"
                      name="accountName"
                      value={formData.bankDetails.accountName}
                      onChange={handleBankChange}
                      placeholder="Name on bank account"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* ===============================
                  BUTTONS
              =============================== */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-lg bg-[#22C55E] text-white font-bold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Creating..." : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesList;
