import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Check } from "lucide-react";
import {
  getSubscriptions,
  getSubscriptionPricing,
  initiateSubscriptionBundle,
} from "../../services/subscription";

const MODULES = [
  {
    key: "payroll",
    name: "Payroll",
    desc: "Payroll runs, tax, pension and payslips.",
  },
  {
    key: "financing",
    name: "Talent Credit Financing",
    desc: "Credit financing for your company.",
  },
  {
    key: "esop",
    name: "ESOP",
    desc: "Employee stock ownership plans and equity.",
  },
];

const Subscription = () => {
  const [summary, setSummary] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [currency, setCurrency] = useState("NGN");
  const [selected, setSelected] = useState(["payroll"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let stop = false;

    Promise.all([getSubscriptions(), getSubscriptionPricing()])
      .then(([subs, price]) => {
        if (stop) return;
        setSummary(subs.data.summary);
        setPricing(price.data);
      })
      .catch((err) => {
        if (stop) return;
        if (err.response?.status === 403) setForbidden(true);
        else
          setError(
            err.response?.data?.message || "Could not load your subscriptions.",
          );
      })
      .finally(() => !stop && setLoading(false));

    return () => {
      stop = true;
    };
  }, []);

  const money = (amount) =>
    currency === "NGN"
      ? `₦${Number(amount).toLocaleString()}`
      : `$${Number(amount).toLocaleString()}`;

  const priceOf = (key) =>
    pricing ? pricing.modules[key][currency === "NGN" ? "ngn" : "usd"] : 0;

  // Same arithmetic as the backend: sum of each module's price
  const total = useMemo(
    () => selected.reduce((sum, key) => sum + priceOf(key), 0),
    [selected, pricing, currency],
  );

  const toggle = (key) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const allSelected = selected.length === MODULES.length;
  const toggleAll = () =>
    setSelected(allSelected ? [] : MODULES.map((m) => m.key));

  const handlePay = async () => {
    setError("");
    if (selected.length === 0) return setError("Choose at least one module.");
    setPaying(true);
    try {
      const res = await initiateSubscriptionBundle(selected, currency);
      window.location.assign(res.data.paymentUrl);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not start payment. Try again.",
      );
      setPaying(false);
    }
  };

  const anyActive =
    summary && Object.values(summary).some((s) => s.status === "active");

  // Already subscribed: this page only comes back after the subscription expires
  if (!loading && anyActive) return <Navigate to="/dashboard" replace />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">
            Subscription needs your founder
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Only a founder or admin can manage subscriptions. Ask your founder
            to renew. If you are the founder, check that your company email is
            verified.
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 text-[#1D4EFF] font-semibold hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Choose your modules
            </h1>
            <p className="mt-2 text-gray-600">
              Pick one, two or all three and pay once. Each module is billed per
              30 days.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-gray-200 p-1">
            {["NGN", "USD"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currency === c
                    ? "bg-white text-[#1D4EFF] shadow"
                    : "text-gray-600"
                }`}
              >
                {c === "NGN" ? "₦ Naira" : "$ Dollar"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            You have no active subscription.
          </p>
          <button
            type="button"
            onClick={toggleAll}
            className="text-sm font-semibold text-[#1D4EFF] hover:underline"
          >
            {allSelected ? "Clear all" : "Select all"}
          </button>
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-6">
          {MODULES.map((m) => {
            const on = selected.includes(m.key);
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => toggle(m.key)}
                disabled={!pricing}
                className={`text-left rounded-2xl bg-white p-6 border-2 transition-all ${
                  on
                    ? "border-[#1D4EFF] shadow-lg"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">{m.name}</h2>
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
                <p className="mt-2 text-sm text-gray-600 min-h-[2.5rem]">
                  {m.desc}
                </p>
                <p className="mt-4 text-2xl font-bold text-[#1D4EFF]">
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

        <div className="mt-8 max-w-xl mx-auto bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              Total ({selected.length} module{selected.length === 1 ? "" : "s"})
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {pricing ? money(total) : "…"}
            </span>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handlePay}
            disabled={!pricing || paying || selected.length === 0}
            className="w-full mt-5 bg-[#1D4EFF] text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paying ? "Redirecting to payment…" : "Pay and continue"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Subscription;
