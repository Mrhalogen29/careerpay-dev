import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoCheckmarkCircle } from "react-icons/io5";
import API from "../services/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{7,15}$/;

const PRODUCTS = [
  { value: "payroll", label: "Payroll" },
  { value: "esop", label: "ESOP" },
  { value: "financing", label: "Talent Credit Financing" },
  { value: "all", label: "All of them" },
];

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white/5 px-4 py-4 text-lg text-white placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400/60 focus:ring-red-400/40"
      : "border-white/10 focus:ring-[#1D4EFF]"
  }`;

const labelClass = "mb-2 block text-base font-medium text-gray-200";

const BookDemo = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    product: "",
    website: "", // honeypot: stays empty for real people
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const clearError = (name) =>
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  // 080... or 234... becomes +234...; other international numbers stay as typed
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^\d+]/g, "");
    if (value.startsWith("0")) value = "+234" + value.slice(1);
    else if (value.startsWith("234")) value = "+" + value;
    setForm((prev) => ({ ...prev, phone: value }));
    clearError("phone");
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "Enter your first name";
    if (!form.lastName.trim()) next.lastName = "Enter your last name";
    if (!form.companyName.trim()) next.companyName = "Enter your company name";
    if (!EMAIL_RE.test(form.email.trim()))
      next.email = "Enter a valid work email";
    if (!PHONE_RE.test(form.phone)) {
      next.phone = "Enter a valid phone number, for example +2348012345678";
    }
    if (!form.product) next.product = "Choose a product";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await API.post("/demo-requests", {
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        companyName: form.companyName.trim(),
        email: form.email.trim(),
      });
      setDone(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Could not send your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const FieldError = ({ message }) =>
    message ? <p className="mt-1.5 text-sm text-red-400">{message}</p> : null;

  return (
    <section className="min-h-screen bg-black px-6 py-10 lg:px-10">
      <Link to="/" className="inline-block">
        <img
          src="/careerpay-logo.png"
          alt="CareerPay"
          className="h-auto w-40"
        />
      </Link>

      <div className="mx-auto mt-10 w-full max-w-xl pb-16 lg:mt-14">
        {done ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <IoCheckmarkCircle className="mx-auto mb-5 text-6xl text-[#3DDC97]" />
            <h1 className="mb-3 text-3xl font-bold text-white">
              Request received
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-gray-400">
              Thanks, {form.firstName.trim()}. A member of our team will contact
              you at {form.email.trim()} to arrange your demo.
            </p>
            <Link
              to="/"
              className="inline-block rounded-xl bg-[#1D4EFF] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-600"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
              Book a CareerPay demo
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-gray-400">
              Tell us about your company and we will show you how CareerPay fits
              it.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                    className={inputClass(!!errors.firstName)}
                  />
                  <FieldError message={errors.firstName} />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                    className={inputClass(!!errors.lastName)}
                  />
                  <FieldError message={errors.lastName} />
                </div>
              </div>

              <div>
                <label htmlFor="companyName" className={labelClass}>
                  Company name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  autoComplete="organization"
                  className={inputClass(!!errors.companyName)}
                />
                <FieldError message={errors.companyName} />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={inputClass(!!errors.email)}
                />
                <FieldError message={errors.email} />
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  placeholder="+2348012345678"
                  autoComplete="tel"
                  className={inputClass(!!errors.phone)}
                />
                <FieldError message={errors.phone} />
              </div>

              <div>
                <label htmlFor="product" className={labelClass}>
                  Which product are you interested in?
                </label>
                <select
                  id="product"
                  name="product"
                  value={form.product}
                  onChange={handleChange}
                  className={`${inputClass(!!errors.product)} cursor-pointer appearance-none`}
                >
                  <option value="" disabled className="text-black">
                    Choose one
                  </option>
                  {PRODUCTS.map((p) => (
                    <option
                      key={p.value}
                      value={p.value}
                      className="text-black"
                    >
                      {p.label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.product} />
              </div>

              {/* Honeypot: hidden from people and screen readers, bots fill it in */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {serverError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-base text-red-300"
                >
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#1D4EFF] py-4 text-lg font-bold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Book a demo"}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
};

export default BookDemo;
