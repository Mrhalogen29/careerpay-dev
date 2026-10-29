import React from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";

const AccountDetailsForm = ({ onBack, onFinish, data, updateData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-900 font-sfPro animate-fadeIn">
      {/* Left Side: Blue Background */}
      <div className="w-full lg:w-[45%] bg-[#1D4EFF] flex flex-col items-center justify-center p-8 lg:p-16 text-white">
        <div className="max-w-md w-full text-left">
          <div className="mb-16">
            <img
              src="/Desktop-28.png"
              alt="CareerPay"
              className="h-12 brightness-0 invert"
            />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Manage your future compensation in one space
          </h1>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-8 lg:p-16 relative bg-white dark:bg-gray-900">
        <button
          onClick={onBack}
          className="absolute top-10 left-10 p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-all shadow-sm"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="max-w-md w-full text-center">
          <div className="mb-10 flex justify-center">
            <img
              src="/careerpay-logo.png"
              alt="CareerPay Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10">
            Account <span className="text-gray-500 font-medium">Details</span>
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onFinish();
            }}
            className="space-y-6 text-left"
          >
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company <span className="font-bold">Name</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={data.companyName || ""}
                onChange={handleChange}
                placeholder="Enter your company name"
                className="w-full px-4 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>

            {/* Company Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company <span className="font-bold">Email</span>
              </label>
              <input
                type="email"
                name="companyEmail"
                value={data.companyEmail || ""}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>

            {/* Company PhoneNumber */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company <span className="font-bold">Phone Number</span>
              </label>
              <input
                type="tel"
                name="companyPhoneNumber"
                value={data.companyPhoneNumber || ""}
                onChange={handleChange}
                placeholder="Enter company phone number"
                className="w-full px-4 py-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>

            {/* Company Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company <span className="font-bold">Address</span>
              </label>
              <input
                type="text"
                name="address"
                value={data.address || ""}
                onChange={handleChange}
                placeholder="Enter company address"
                className="w-full px-4 py-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry
              </label>
              <div className="relative group">
                <select
                  name="industry"
                  value={data.industry || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all appearance-none cursor-pointer text-gray-500"
                  required
                >
                  <option value="" disabled>
                    Enter industry
                  </option>
                  <option value="software">Tech</option>
                  <option value="banking">Banking</option>
                  <option value="construction">Construction</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="fashion">Fashion</option>
                  <option value="engineering">Engineering</option>
                  <option value="real-estate">Real-estate</option>
                  <option value="fintech">Fintech</option>
                  <option value="marketing">Marketing</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>
            {/* Base Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base <span className="font-bold">Currency</span>
              </label>
              <div className="relative group">
                <select
                  name="baseCurrency"
                  value={data.baseCurrency || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#1D4EFF] outline-none transition-all appearance-none cursor-pointer text-gray-500"
                  required
                >
                  <option value="" disabled>
                    Enter Base Currency
                  </option>
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1D4EFF] text-white font-bold py-4 rounded-lg shadow-lg hover:bg-blue-700 transition-all transform active:scale-95 mt-8 uppercase tracking-wider"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsForm;
