import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { getPublicPricing, initiatePurchase } from "../services/subscription";

const MODULES = [
  {
    key: "payroll",
    name: "Payroll",
    desc: "Run payroll with tax and pension, and pay your team on time.",
  },
  {
    key: "financing",
    name: "Talent Credit Financing",
    desc: "Access credit financing for your company.",
  },
  {
    key: "esop",
    name: "ESOP",
    desc: "Manage employee stock ownership plans and equity grants.",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Pricing = () => {
  const [pricing, setPricing] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [selected, setSelected] = useState(["payroll"]);
  const [email, setEmail] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicPricing()
      .then(setPricing)
      .catch(() => setLoadError("Could not load prices. Please refresh."));
  }, []);

  // Scroll here when arriving from /#pricing (the router doesn't do it for us)
  useEffect(() => {
    if (window.location.hash === "#pricing") {
      document
        .getElementById("pricing")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const money = (amount) =>
    currency === "NGN"
      ? `₦${Number(amount).toLocaleString()}`
      : `$${Number(amount).toLocaleString()}`;

  const priceOf = (key) =>
    pricing ? pricing.modules[key][currency === "NGN" ? "ngn" : "usd"] : 0;

  // Same arithmetic as the backend: sum of each module's price in the currency
  const total = useMemo(
    () => selected.reduce((sum, key) => sum + priceOf(key), 0),
    [selected, pricing, currency],
  );

  const toggle = (key) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const handlePay = async () => {
    setError("");
    if (selected.length === 0) return setError("Choose at least one module.");
    if (!EMAIL_RE.test(email.trim()))
      return setError("Enter a valid email address for your receipt.");

    setPaying(true);
    try {
      const { paymentUrl } = await initiatePurchase({
        modules: selected,
        currency,
        email: email.trim(),
      });
      window.location.assign(paymentUrl);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not start payment. Try again.",
      );
      setPaying(false);
    }
  };

  return (
    <section id="pricing" className="bg-gray-50 dark:bg-gray-900 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Simple, pay-as-you-go pricing
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Pick the modules you need. Pay once, then create your company
            account. Each module is billed per 30 days.
          </p>

          <div className="inline-flex mt-6 rounded-xl bg-gray-200 dark:bg-gray-800 p-1">
            {["NGN", "USD"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currency === c
                    ? "bg-white dark:bg-gray-700 text-[#1D4EFF] shadow"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {c === "NGN" ? "₦ Naira" : "$ Dollar"}
              </button>
            ))}
          </div>
        </div>

        {loadError && (
          <p className="text-center text-red-600 mb-6">{loadError}</p>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {MODULES.map((m) => {
            const on = selected.includes(m.key);
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => toggle(m.key)}
                disabled={!pricing}
                className={`text-left rounded-2xl p-6 border-2 transition-all bg-white dark:bg-gray-800 ${
                  on
                    ? "border-[#1D4EFF] shadow-lg"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {m.name}
                  </h3>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      on
                        ? "bg-[#1D4EFF] text-white"
                        : "border border-gray-300 text-transparent"
                    }`}
                  >
                    <Check size={14} />
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 min-h-[3rem]">
                  {m.desc}
                </p>
                <p className="mt-4 text-3xl font-bold text-[#1D4EFF]">
                  {pricing ? money(priceOf(m.key)) : "…"}
                  <span className="text-sm font-medium text-gray-500">
                    {" "}
                    / 30 days
                  </span>
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-8 max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Email for your receipt
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 focus:ring-2 focus:ring-[#1D4EFF] outline-none"
          />

          <div className="flex items-center justify-between mt-5">
            <span className="text-gray-600 dark:text-gray-400">Total</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {pricing ? money(total) : "…"}
            </span>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handlePay}
            disabled={!pricing || paying}
            className="w-full mt-5 bg-[#1D4EFF] text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paying ? "Redirecting to payment…" : "Pay and continue"}
          </button>
          <p className="mt-3 text-xs text-center text-gray-500">
            After payment you will create your company account. Your
            subscription starts when the account is created.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
