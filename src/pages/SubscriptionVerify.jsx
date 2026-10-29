import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../services/api";

const SubscriptionVerify = () => {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("tx_ref") || "";
  const cancelled = params.get("status") === "cancelled";

  const [state, setState] = useState(cancelled ? "cancelled" : "checking");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cancelled) return;
    if (!reference) {
      setMessage("No payment reference was found.");
      setState("error");
      return;
    }

    let stop = false;
    setState("checking");

    API.post("/subscriptions/verify", { reference })
      .then(() => {
        if (stop) return;
        setState("done");
        // Full reload so the app re-reads which modules are unlocked
        setTimeout(() => {
          window.location.assign("/dashboard");
        }, 1500);
      })
      .catch((err) => {
        if (stop) return;
        setMessage(
          err.response?.data?.message || "We could not confirm your payment.",
        );
        setState("error");
      });

    return () => {
      stop = true;
    };
  }, [reference, cancelled, attempt]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center">
        {state === "checking" && (
          <>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Confirming your payment…
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Please don't close this page.
            </p>
          </>
        )}

        {state === "done" && (
          <>
            <h1 className="text-2xl font-bold text-green-600">
              Subscription activated
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Taking you to your dashboard…
            </p>
          </>
        )}

        {state === "cancelled" && (
          <>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Payment cancelled
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              You have not been charged.
            </p>
            <Link
              to="/dashboard"
              className="block mt-6 text-[#1D4EFF] font-semibold hover:underline"
            >
              Back to dashboard
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-600">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="mt-6 bg-[#1D4EFF] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700"
            >
              Try again
            </button>
            <Link
              to="/dashboard"
              className="block mt-4 text-sm text-gray-500 hover:underline"
            >
              Back to dashboard
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default SubscriptionVerify;
