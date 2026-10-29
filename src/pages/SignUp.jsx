import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Phone, Lock } from "lucide-react";
import AccountDetailsForm from "../components/AccountDetailsForm";
import { Eye, EyeOff } from "lucide-react";
import API from "../services/api";
import { registerUser } from "../services/auth";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [claimCode, setClaimCode] = useState(() => {
    const fromUrl = searchParams.get("claim");
    try {
      if (fromUrl) {
        sessionStorage.setItem("claimCode", fromUrl);
        return fromUrl;
      }
      return sessionStorage.getItem("claimCode") || "";
    } catch {
      return fromUrl || "";
    }
  });
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    companyEmail: "",
    companyName: "",
    industry: "",

    baseCurrency: "NGN",
    companyPhoneNumber: "",
    role: "",
    address: "",
    salary: "",
  });

  console.log(formData.role);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    if (!claimCode.trim()) {
      alert("Choose a plan and pay first. Then you can create your account.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const finalData = {
      company: {
        name: formData.companyName,
        email: formData.companyEmail,
        phone: formData.companyPhoneNumber,
        industry: formData.industry,
        address: { street: formData.address },
        baseCurrency: formData.baseCurrency,
      },
      user: {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phoneNumber,
      },
      claimCode: claimCode.trim(),
    };

    try {
      const res = await registerUser(finalData);

      console.log("Signup success:", res);
      try {
        sessionStorage.removeItem("claimCode");
      } catch {}

      navigate("/verify-email", {
        state: {
          email: formData.email,
        },
      });
    } catch (error) {
      console.error("FULL ERROR:", error);
      console.error("ERROR RESPONSE:", error.response?.data);

      alert(error.response?.data?.message || error.message || "Signup failed");
    }
  };

  if (step === 2) {
    return (
      <AccountDetailsForm
        data={formData}
        updateData={updateFormData}
        onBack={handleBackStep}
        onFinish={handleFinish}
      />
    );
  }

  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-900 font-sfPro">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16 animate-fadeIn">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <Link
            to="/"
            className="inline-flex items-center mb-6 bg-black rounded-xl px-3 py-2"
          >
            <img
              src="/careerpay-logo.png"
              alt="CareerPay"
              style={{ width: "140px", height: "auto" }}
            />
          </Link>

          <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base mb-10 leading-relaxed max-w-sm mx-auto font-medium">
            Empowering organization with Talent credit financing, Employee stock
            ownership plan, Payroll management system
          </p>

          <h1 className="text-2xl lg:text-3xl font-bold text-[#1D4EFF] mb-10 uppercase tracking-wide">
            CREATE ACCOUNT
          </h1>

          <form onSubmit={handleNextStep} className="space-y-6 text-left">
            {/* Subscription code */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-gray-800 dark:border-gray-700 p-4">
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Payment code
              </label>
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder="PUR-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#1D4EFF] outline-none text-sm"
                required
              />
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {claimCode
                  ? "Your payment is linked to this account."
                  : "No code yet?"}{" "}
                {!claimCode && (
                  <Link
                    to="/#pricing"
                    className="text-[#1D4EFF] font-semibold hover:underline"
                  >
                    Choose a plan and pay first
                  </Link>
                )}
              </p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                First Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1D4EFF] transition-colors">
                  {}
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first Name"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Last Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1D4EFF] transition-colors">
                  {/* <Mail size={20} /> */}
                </div>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
            {/* Email */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1D4EFF] transition-colors">
                  {/* <Mail size={20} /> */}
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1D4EFF] transition-colors">
                  <Phone size={20} />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password */}
            {/* Password */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-4 pr-12 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1D4EFF]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full pl-4 pr-12 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1D4EFF]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-[#1D4EFF] focus:ring-[#1D4EFF] cursor-pointer"
                required
              />
              <label
                htmlFor="agreeToTerms"
                className="text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                I agree to the{" "}
                <Link to="/terms" className="text-[#1D4EFF] hover:underline">
                  terms and condition
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1D4EFF] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all transform active:scale-95 mt-4 uppercase tracking-wider text-lg"
            >
              Continue
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#1D4EFF] font-bold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/Desktop - 17.png"
          alt="Onboarding"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute bottom-16 left-16 right-16 text-white animate-slideUp">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Empowering organizations with smart solutions.
          </h2>
          <p className="text-xl opacity-90 font-medium">
            Join thousands of companies managing their talent credit and ESOPs
            with CareerPay.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
