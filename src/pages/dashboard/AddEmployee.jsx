import { Fragment, useState, useEffect } from "react";
import {
  User,
  Briefcase,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  Edit2,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  addEmployee,
  getNigerianBanks,
  uploadEmployeeDocuments,
} from "../../services/company";

// Shared input styling — switches to a red ring + border when this field has a validation error
const inputClass = (hasError) =>
  `w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none transition-all ${
    hasError
      ? "border-red-300 ring-2 ring-red-100 focus:ring-red-200"
      : "border-transparent focus:ring-2 focus:ring-[#1D4EFF]"
  }`;

// Small inline error message shown under a field
const FieldError = ({ message }) => {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 mt-1">
      <AlertCircle size={12} /> {message}
    </p>
  );
};

// Optional documents the founder can attach while adding an employee
const DOC_TYPES = [
  {
    key: "governmentId",
    title: "Government ID",
    desc: "Passport, Driver's License, or State ID",
  },
  {
    key: "taxForm",
    title: "Tax Form",
    desc: "Employee's Withholding certificate",
  },
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const AddEmployee = ({ setActivePage, onNext, onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: "",
    email: "",
    phone: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    homeAddress: "",
    // Step 2: Employment
    department: "",
    jobTitle: "",
    employmentType: "",
    startDate: "",
    reportingManager: "",
    salaryAmount: "",
    salaryCurrency: "NGN",
    payFrequency: "monthly",
    // Step 2: Bank details (for payroll disbursement)
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
    // Step 3: Documents (optional)
    governmentId: null,
    taxForm: null,
  });

  // Load the live Nigerian bank list from the backend (sourced from Flutterwave),
  // so bank codes can never drift out of sync with what the payment gateway accepts.
  useEffect(() => {
    getNigerianBanks()
      .then((res) => setBanks(res.data || []))
      .catch((err) => console.error("Failed to load bank list:", err))
      .finally(() => setBanksLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as soon as the person fixes it
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Validates the chosen file's type and size before keeping it in state
  const handleFileSelect = (key, file) => {
    if (!file) return;
    let error = "";
    if (!ALLOWED_TYPES.includes(file.type))
      error = "Only PDF, JPG or PNG files are allowed";
    else if (file.size > MAX_FILE_SIZE) error = "File must be 5 MB or smaller";

    if (error) {
      setErrors((prev) => ({ ...prev, [key]: error }));
      return;
    }
    setFormData((prev) => ({ ...prev, [key]: file }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const removeFile = (key) => {
    setFormData((prev) => ({ ...prev, [key]: null }));
  };

  // Normalizes common Nigerian phone formats (080..., 234..., +234...) into the
  // +234XXXXXXXXXX shape the backend requires, as the person types.
  // Used by both the employee's phone and the next of kin's phone.
  const handlePhoneChange = (e) => {
    const { name } = e.target;
    let value = e.target.value.replace(/[^\d+]/g, ""); // strip spaces/dashes
    if (value.startsWith("0")) {
      value = "+234" + value.slice(1);
    } else if (value.startsWith("234") && !value.startsWith("+234")) {
      value = "+" + value;
    } else if (value && !value.startsWith("+")) {
      value = "+234" + value;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Selecting a bank from the dropdown fills in the matching code automatically —
  // the code is what the payment gateway routes on, so it should never be hand-typed.
  const handleBankSelect = (e) => {
    const selectedName = e.target.value;
    const match = banks.find((b) => b.name === selectedName);
    setFormData((prev) => ({
      ...prev,
      bankName: selectedName,
      bankCode: match ? match.code : "",
    }));
    if (errors.bankName) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.bankName;
        return next;
      });
    }
  };

  // Required fields per step, matching the "*" labels shown in the form
  const REQUIRED_FIELDS = {
    1: [
      "fullName",
      "email",
      "phone",
      "nextOfKinName",
      "nextOfKinPhone",
      "homeAddress",
    ],
    2: [
      "department",
      "jobTitle",
      "employmentType",
      "startDate",
      "reportingManager",
      "salaryAmount",
      "bankName",
      "bankCode",
      "accountNumber",
      "accountName",
    ],
  };

  const FIELD_LABELS = {
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    nextOfKinName: "Next of Kin Name",
    nextOfKinPhone: "Next of Kin Phone",
    homeAddress: "Home Address",
    department: "Department",
    jobTitle: "Job Title",
    employmentType: "Employment Type",
    startDate: "Start Date",
    reportingManager: "Reporting Manager",
    salaryAmount: "Salary Amount",
    bankName: "Bank Name",
    bankCode: "Bank Code",
    accountNumber: "Account Number",
    accountName: "Account Name",
  };

  const validateStep = (currentStep) => {
    const fields = REQUIRED_FIELDS[currentStep];
    if (!fields) return true; // Steps 3 (Documents, optional) and 4 (Review) have no required fields

    const newErrors = {};
    fields.forEach((field) => {
      const value = formData[field];
      if (!value || (typeof value === "string" && !value.trim())) {
        newErrors[field] = `${FIELD_LABELS[field]} is required`;
      }
    });

    // Extra format checks matching the backend's validation, so a bad
    // submission gets caught here instead of surfacing as a raw 400 mid-demo
    if (
      currentStep === 1 &&
      formData.phone &&
      !/^\+234\d{10}$/.test(formData.phone)
    ) {
      newErrors.phone = "Phone must be in +234XXXXXXXXXX format";
    }
    if (
      currentStep === 1 &&
      formData.nextOfKinPhone &&
      !/^\+234\d{10}$/.test(formData.nextOfKinPhone)
    ) {
      newErrors.nextOfKinPhone = "Phone must be in +234XXXXXXXXXX format";
    }
    if (formData.accountNumber && !/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be exactly 10 digits";
    }
    if (formData.bankCode && !/^\d{3}$/.test(formData.bankCode)) {
      newErrors.bankCode = "Bank code must be exactly 3 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const steps = [
    { id: 1, name: "Personal Information", icon: <User size={20} /> },
    { id: 2, name: "Employment Details", icon: <Briefcase size={20} /> },
    { id: 3, name: "Documents", icon: <FileText size={20} /> },
    { id: 4, name: "Review", icon: <CheckCircle size={20} /> },
  ];

  const handleNext = () => {
    if (!validateStep(step)) return; // Block advancing until required fields are filled
    setStep((prev) => Math.min(prev + 1, 4));
  };
  const handleBack = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConfirm = async () => {
    // Re-validate everything before actually submitting, in case the person
    // went back and cleared a field after passing an earlier step.
    if (!validateStep(1) || !validateStep(2)) {
      alert(
        "Please go back and fill in all required fields before submitting.",
      );
      return;
    }
    setLoading(true);
    try {
      const payload = {
        firstName: formData.fullName.split(" ")[0] || "",
        lastName: formData.fullName.split(" ").slice(1).join(" ") || "",
        email: formData.email,
        phone: formData.phone,
        nextOfKin: {
          name: formData.nextOfKinName.trim(),
          phone: formData.nextOfKinPhone,
        },
        position: formData.jobTitle,
        department: formData.department,
        salary: {
          amount: Number(formData.salaryAmount) || 0,
          currency: formData.salaryCurrency || "NGN",
          payFrequency: formData.payFrequency || "monthly",
        },
        bankDetails: {
          bankName: formData.bankName,
          bankCode: formData.bankCode,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
        },
        employmentType: formData.employmentType,
        startDate: formData.startDate,
      };

      const res = await addEmployee(payload);
      if (res.success) {
        // Documents are optional: upload only what was actually chosen.
        // A failed upload must not undo the employee that was just created.
        let docsOk = true;
        const hasDocs = formData.governmentId || formData.taxForm;
        if (hasDocs) {
          try {
            const newId =
              res.data?._id || res.data?.employee?._id || res.data?.id;
            const fd = new FormData();
            if (formData.governmentId)
              fd.append("governmentId", formData.governmentId);
            if (formData.taxForm) fd.append("taxForm", formData.taxForm);
            await uploadEmployeeDocuments(newId, fd);
          } catch (err) {
            docsOk = false;
            console.error("Document upload failed:", err);
          }
        }

        alert(
          docsOk
            ? "Employee added successfully!"
            : "Employee was added, but the documents failed to upload. Please upload them from the employee's profile.",
        );

        if (onNext) {
          onNext();
        } else if (setActivePage) {
          setActivePage("view-employees");
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Failed to add employee:", error);
      alert(
        error.response?.data?.message ||
          "Failed to add employee. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepper = () => (
    <div className="flex items-center justify-center mb-12">
      {steps.map((s, i) => (
        <Fragment key={s.id}>
          <div className="flex flex-col items-center relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step >= s.id
                  ? "bg-[#1D4EFF] border-[#1D4EFF] text-white shadow-lg shadow-blue-500/20"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              <span className="text-sm font-bold">{s.id}</span>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-24 h-0.5 mx-2 ${step > s.id ? "bg-[#1D4EFF]" : "bg-gray-200"}`}
            ></div>
          )}
        </Fragment>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-50 text-[#1D4EFF] rounded-xl">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Personal Information
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  Let's start with your basic details
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={inputClass(!!errors.fullName)}
                />
                <FieldError message={errors.fullName} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Email Address*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={inputClass(!!errors.email)}
                />
                <FieldError message={errors.email} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="+2348012345678"
                  className={inputClass(!!errors.phone)}
                />
                <FieldError message={errors.phone} />
              </div>
              <div className="hidden md:block" />

              {/* Next of kin */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Next of Kin Name*
                </label>
                <input
                  type="text"
                  name="nextOfKinName"
                  value={formData.nextOfKinName}
                  onChange={handleChange}
                  placeholder="Enter next of kin's full name"
                  className={inputClass(!!errors.nextOfKinName)}
                />
                <FieldError message={errors.nextOfKinName} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Next of Kin Phone*
                </label>
                <input
                  type="tel"
                  name="nextOfKinPhone"
                  value={formData.nextOfKinPhone}
                  onChange={handlePhoneChange}
                  placeholder="+2348012345678"
                  className={inputClass(!!errors.nextOfKinPhone)}
                />
                <FieldError message={errors.nextOfKinPhone} />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Home Address*
                </label>
                <textarea
                  name="homeAddress"
                  value={formData.homeAddress}
                  onChange={handleChange}
                  placeholder="Enter home address"
                  className={`${inputClass(!!errors.homeAddress)} h-32 resize-none`}
                ></textarea>
                <FieldError message={errors.homeAddress} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <Briefcase size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Employment Details
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  Tell us about your role
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Department*
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`${inputClass(!!errors.department)} appearance-none cursor-pointer`}
                >
                  <option value="">Select department</option>
                  <option value="finance">Finance</option>
                  <option value="engineering">Engineering</option>
                  <option value="Management">Management</option>
                  <option value="sales">Sales</option>
                  <option value="human-resources">Human Resources</option>
                  <option value="operation">Operation</option>
                  <option value="admin">Admin</option>
                  <option value="quality-assurance">Quality Assurance</option>
                  <option value="it">IT</option>
                  <option value="legal">Legal</option>
                  <option value="operations">Operations</option>
                </select>
                <FieldError message={errors.department} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Job Title*
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Enter job title"
                  className={inputClass(!!errors.jobTitle)}
                />
                <FieldError message={errors.jobTitle} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Employment Type*
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className={`${inputClass(!!errors.employmentType)} appearance-none cursor-pointer`}
                >
                  <option value="">Select type</option>
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                </select>
                <FieldError message={errors.employmentType} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Salary Amount*
                </label>
                <input
                  type="number"
                  min="0"
                  name="salaryAmount"
                  value={formData.salaryAmount}
                  onChange={handleChange}
                  placeholder="e.g. 350000"
                  className={inputClass(!!errors.salaryAmount)}
                />
                <FieldError message={errors.salaryAmount} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Currency
                </label>
                <select
                  name="salaryCurrency"
                  value={formData.salaryCurrency}
                  onChange={handleChange}
                  className={`${inputClass(false)} appearance-none cursor-pointer`}
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Pay Frequency
                </label>
                <select
                  name="payFrequency"
                  value={formData.payFrequency}
                  onChange={handleChange}
                  className={`${inputClass(false)} appearance-none cursor-pointer`}
                >
                  <option value="monthly">Monthly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Start Date*
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={inputClass(!!errors.startDate)}
                />
                <FieldError message={errors.startDate} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Reporting Manager*
                </label>
                <input
                  type="text"
                  name="reportingManager"
                  value={formData.reportingManager}
                  onChange={handleChange}
                  placeholder="Enter reporting manager name"
                  className={inputClass(!!errors.reportingManager)}
                />
                <FieldError message={errors.reportingManager} />
              </div>
            </div>

            {/* Bank details — required for payroll disbursement via Flutterwave/Monnify */}
            <div className="pt-6 mt-2 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                Bank Details (for salary payment)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Bank Name*
                  </label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleBankSelect}
                    disabled={banksLoading}
                    className={`${inputClass(!!errors.bankName)} appearance-none cursor-pointer`}
                  >
                    <option value="">
                      {banksLoading ? "Loading banks..." : "Select bank"}
                    </option>
                    {banks.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.bankName} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Bank Code*
                  </label>
                  <input
                    type="text"
                    name="bankCode"
                    value={formData.bankCode}
                    readOnly
                    placeholder="Auto-filled from bank selection"
                    maxLength={3}
                    className={`${inputClass(!!errors.bankCode)} bg-gray-100 cursor-not-allowed`}
                  />
                  <FieldError message={errors.bankCode} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Account Number*
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="10-digit account number"
                    maxLength={10}
                    inputMode="numeric"
                    className={inputClass(!!errors.accountNumber)}
                  />
                  <FieldError message={errors.accountNumber} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Account Name*
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    placeholder="Name on the bank account"
                    className={inputClass(!!errors.accountName)}
                  />
                  <FieldError message={errors.accountName} />
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Documents</h2>
                <p className="text-sm text-gray-500 font-medium">
                  Upload documents (optional)
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {DOC_TYPES.map((doc) => {
                const file = formData[doc.key];
                return (
                  <div key={doc.key}>
                    <div
                      className={`flex items-center justify-between p-6 bg-gray-50 rounded-2xl border transition-all ${
                        errors[doc.key]
                          ? "border-red-300"
                          : "border-gray-100 hover:border-[#1D4EFF]/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900">
                          {doc.title}{" "}
                          <span className="text-xs font-medium text-gray-400">
                            (optional)
                          </span>
                        </h4>
                        <p className="text-sm text-gray-500">{doc.desc}</p>
                        {file && (
                          <p className="text-sm font-medium text-green-600 mt-1 truncate">
                            {file.name} ({(file.size / 1024).toFixed(0)} KB)
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {file && (
                          <button
                            type="button"
                            onClick={() => removeFile(doc.key)}
                            className="p-2 text-gray-400 hover:text-red-500"
                            aria-label={`Remove ${doc.title}`}
                          >
                            <X size={18} />
                          </button>
                        )}
                        <label className="flex items-center gap-2 px-6 py-2 bg-white text-[#1D4EFF] font-bold text-sm rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                          <Upload size={18} />
                          {file ? "Replace" : "Upload"}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              handleFileSelect(doc.key, e.target.files?.[0]);
                              e.target.value = ""; // allow re-picking the same file
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <FieldError message={errors[doc.key]} />
                  </div>
                );
              })}
              <p className="text-xs text-gray-400">
                Optional. PDF, JPG or PNG, up to 5 MB each. You can also add
                them later.
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#1A1A1A] p-8 rounded-3xl text-white">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400">
                  Personal Details
                </h3>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-[#1D4EFF] font-bold text-sm hover:underline"
                >
                  <Edit2 size={16} /> Edits
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Full Name
                  </p>
                  <p className="text-sm font-medium">
                    {formData.fullName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Email
                  </p>
                  <p className="text-sm font-medium">
                    {formData.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Phone No
                  </p>
                  <p className="text-sm font-medium">
                    {formData.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Next of Kin
                  </p>
                  <p className="text-sm font-medium">
                    {formData.nextOfKinName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Next of Kin Phone
                  </p>
                  <p className="text-sm font-medium">
                    {formData.nextOfKinPhone || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Address
                  </p>
                  <p className="text-sm font-medium">
                    {formData.homeAddress || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400">
                  Job Details
                </h3>
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-[#1D4EFF] font-bold text-sm hover:underline"
                >
                  <Edit2 size={16} /> Edits
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Department
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.department || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Role
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.jobTitle || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Manager
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.reportingManager || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Employment Type
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.employmentType || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Salary
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.salaryAmount
                      ? `${formData.salaryCurrency} ${Number(formData.salaryAmount).toLocaleString()} / ${formData.payFrequency}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Start Date
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.startDate || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400">
                  Bank Details
                </h3>
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-[#1D4EFF] font-bold text-sm hover:underline"
                >
                  <Edit2 size={16} /> Edits
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Bank Name
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.bankName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Bank Code
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.bankCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Account Number
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.accountNumber || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Account Name
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.accountName || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400">
                  Documents
                </h3>
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 text-[#1D4EFF] font-bold text-sm hover:underline"
                >
                  <Edit2 size={16} /> Edits
                </button>
              </div>
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                {DOC_TYPES.map((doc) => (
                  <div key={doc.key}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                      {doc.title}
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {formData[doc.key]?.name || "Not provided"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
        <span>Employees</span>
        <ChevronRight size={14} />
        <span className="text-gray-900 dark:text-white font-bold">
          Add Employees
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[40px] shadow-2xl shadow-[#1D4EFF]/5 border border-gray-50 dark:border-gray-700 relative overflow-hidden">
        {renderStepper()}
        {renderStep()}

        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all ${step === 1 ? "opacity-0 pointer-events-none" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <button
            onClick={step === 4 ? handleConfirm : handleNext}
            disabled={loading}
            className="flex items-center gap-2 bg-[#1D4EFF] text-white font-bold px-10 py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : step === 4 ? (
              "Confirm"
            ) : (
              "Next Step"
            )}
            {!loading && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
