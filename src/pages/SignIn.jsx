import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/auth";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      console.log("SignIn success:", response);

      const token = response?.token || response?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      // Remember whether this user is still on the temporary password
      const mustChange =
        response?.data?.user?.mustChangePassword ??
        response?.user?.mustChangePassword ??
        false;
      try {
        if (mustChange) {
          localStorage.setItem("mustChangePassword", "true");
        } else {
          localStorage.removeItem("mustChangePassword");
        }
        sessionStorage.removeItem("tempPwBannerDismissed");
      } catch {
        // storage can be unavailable; the banner just won't show
      }

      alert("Login successful");

      navigate(from, { replace: true });
    } catch (error) {
      console.error("FULL ERROR:", error);
      console.error("ERROR RESPONSE:", error.response?.data);

      alert(error.response?.data?.message || error.message || "SignIn failed");
    }
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-900">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16 animate-fadeIn">
        <div className="max-w-md w-full">
          {/* Logo */}
          <Link
            to="/"
            className="inline-flex items-center mb-12 bg-black rounded-xl px-3 py-2"
          >
            <img
              src="/careerpay-logo.png"
              alt="CareerPay"
              style={{ width: "140px", height: "auto" }}
            />
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
            SIGN IN
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Empowering organizations with Talent and Financing.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password*
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* ✅ Password input with show/hide toggle */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all transform active:scale-95 mt-4 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={20} />
              Secure Sign In
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 font-bold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-blue-600">
        <img
          src="/Rectangle 2.png"
          alt="SignIn Workspace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
        <div className="absolute bottom-16 left-16 right-16 text-white animate-slideUp">
          <h2 className="text-4xl font-bold mb-4">
            Welcome back to CareerPay.
          </h2>
          <p className="text-xl opacity-90 font-medium">
            Your hub for compensation, ESOPs, and talent credit financing.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
