import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Layout preview only. Shown in local development, never in production.
const SAMPLE_REVIEWS = [
  {
    _id: "s1",
    name: "John Smith",
    role: "HR Director",
    company: "TechCorp",
    rating: 5,
    review:
      "CareerPay has completely transformed our payroll and ESOP management. The talent credit financing has also been a game-changer for our employees.",
  },
  {
    _id: "s2",
    name: "Sarah Johnson",
    role: "CEO",
    company: "Innovate Solutions",
    rating: 5,
    review:
      "The ease of use and the transparency of the CareerPay platform is unparalleled. Our team is more motivated than ever.",
  },
  {
    _id: "s3",
    name: "Michael Brown",
    role: "CFO",
    company: "Global Ventures",
    rating: 5,
    review:
      "Managing complex compensation structures is now a breeze with CareerPay. Their support team is also top-notch.",
  },
];

const initialsOf = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-gray-50 dark:bg-gray-900 px-5 py-3.5 text-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:ring-red-300"
      : "border-gray-200 dark:border-gray-700 focus:ring-blue-500"
  }`;

const labelClass =
  "mb-2 block text-base font-medium text-gray-700 dark:text-gray-300";

const FieldError = ({ message }) =>
  message ? <p className="mt-1 text-sm text-red-500">{message}</p> : null;

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    email: "",
    rating: 0,
    review: "",
    consent: false,
    website: "", // honeypot: stays empty for real people
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    API.get("/reviews")
      .then((res) => setReviews(res.data?.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, []);

  // Samples appear only in local development and only when there are no real reviews
  const isSample =
    !loadingReviews && reviews.length === 0 && import.meta.env.DEV;
  const shownReviews = isSample ? SAMPLE_REVIEWS : reviews;

  const clearError = (name) =>
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearError(name);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name";
    if (!form.role.trim()) next.role = "Enter your job title";
    if (!form.company.trim()) next.company = "Enter your company";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email";
    if (form.rating < 1) next.rating = "Choose a rating";
    const len = form.review.trim().length;
    if (len < 20) next.review = "Write at least 20 characters";
    else if (len > 600) next.review = "Keep it under 600 characters";
    if (!form.consent) next.consent = "Please tick this box to continue";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await API.post("/reviews", {
        ...form,
        name: form.name.trim(),
        role: form.role.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        review: form.review.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Could not send your review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 pt-32 pb-16 px-6 lg:px-16 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Clients Say
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            See how CareerPay is making a difference for organizations and their
            employees.
          </p>
        </div>

        {/* Reviews */}
        {loadingReviews ? (
          <p className="text-center text-gray-500">Loading reviews...</p>
        ) : shownReviews.length > 0 ? (
          <>
            {isSample && (
              <p className="mb-6 text-center text-sm text-amber-600">
                Sample cards for layout only. They are hidden on the live site.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {shownReviews.map((r) => (
                <div
                  key={r._id}
                  className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center mb-6">
                    <div
                      aria-hidden="true"
                      className="w-14 h-14 rounded-full mr-4 bg-blue-100 text-blue-700 font-bold flex items-center justify-center"
                    >
                      {initialsOf(r.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {r.name}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium">
                        {r.role}, {r.company}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                    "{r.review}"
                  </p>
                  <div
                    className="mt-6 flex text-yellow-400"
                    aria-label={`${r.rating} out of 5 stars`}
                  >
                    {[...Array(r.rating)].map((_, i) => (
                      <span key={i} className="text-xl">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No reviews yet
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Be the first to share your experience with CareerPay below.
            </p>
          </div>
        )}

        {/* Review form (wide) */}
        <div className="mt-20 mx-auto max-w-5xl bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg p-8 lg:p-14">
          {submitted ? (
            <div className="text-center py-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Thank you for your review
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                We check every review before it appears on this page.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Share your experience
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
                Already using CareerPay? Tell others what it was like. We review
                each submission before publishing it.
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="rv-name" className={labelClass}>
                      Your name
                    </label>
                    <input
                      id="rv-name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={inputClass(!!errors.name)}
                    />
                    <FieldError message={errors.name} />
                  </div>
                  <div>
                    <label htmlFor="rv-role" className={labelClass}>
                      Job title
                    </label>
                    <input
                      id="rv-role"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className={inputClass(!!errors.role)}
                    />
                    <FieldError message={errors.role} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="rv-company" className={labelClass}>
                      Company
                    </label>
                    <input
                      id="rv-company"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      className={inputClass(!!errors.company)}
                    />
                    <FieldError message={errors.company} />
                  </div>
                  <div>
                    <label htmlFor="rv-email" className={labelClass}>
                      Work email (not shown publicly)
                    </label>
                    <input
                      id="rv-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass(!!errors.email)}
                    />
                    <FieldError message={errors.email} />
                  </div>
                </div>

                <div>
                  <span className={labelClass}>Rating</span>
                  <div className="flex gap-1" role="group" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        aria-pressed={form.rating === n}
                        onClick={() => {
                          setForm((prev) => ({ ...prev, rating: n }));
                          clearError("rating");
                        }}
                        className={`text-4xl leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${
                          n <= form.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <FieldError message={errors.rating} />
                </div>

                <div>
                  <label htmlFor="rv-review" className={labelClass}>
                    Your review
                  </label>
                  <textarea
                    id="rv-review"
                    name="review"
                    rows={6}
                    value={form.review}
                    onChange={handleChange}
                    className={`${inputClass(!!errors.review)} resize-none`}
                  />
                  <div className="flex justify-between">
                    <FieldError message={errors.review} />
                    <span className="ml-auto mt-1 text-xs text-gray-400">
                      {form.review.trim().length}/600
                    </span>
                  </div>
                </div>

                {/* Honeypot: hidden from people and screen readers */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="rv-website">Website</label>
                  <input
                    id="rv-website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="flex items-start gap-3 text-base text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={form.consent}
                      onChange={handleChange}
                      className="mt-1 h-5 w-5"
                    />
                    <span>
                      I agree that CareerPay may show my name, job title,
                      company and this review on its website.
                    </span>
                  </label>
                  <FieldError message={errors.consent} />
                </div>

                {serverError && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Submit review"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Call to action: both buttons work */}
        <div className="mt-20 bg-blue-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Join Them?</h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the power of modern compensation management today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/#pricing"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Get Started Now
            </Link>
            <Link
              to="/book-demo"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
