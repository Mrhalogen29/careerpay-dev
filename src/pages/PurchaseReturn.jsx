import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyPurchase } from "../services/subscription";

const PurchaseReturn = () => {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("tx_ref") || "";
  const cancelled = params.get("status") === "cancelled";

  const [state, setState] = useState(cancelled ? "cancelled" : "checking");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cancelled || !reference) return;
    let stop = false;
    setState("checking");

    verifyPurchase(reference)
      .then((data) => {
        if (stop) return;
        setResult(data);
        setState("paid");
        try {
          sessionStorage.setItem("claimCode", data.reference);
        } catch {}
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

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

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

        {state === "paid" && result && (
          <>
            <h1 className="text-2xl font-bold text-green-600">
              Payment received
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Modules: {result.modules.join(", ")}
            </p>

            <p className="mt-6 text-sm font-semibold text-gray-800 dark:text-gray-200">
              Your payment code
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 break-all rounded-lg bg-gray-100 dark:bg-gray-900 px-3 py-2 text-xs">
                {result.reference}
              </code>
              <button
                type="button"
                onClick={copy}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-semibold"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Keep this code private. It is used once, to create your account.
            </p>

            <Link
              to={`/signup?claim=${encodeURIComponent(result.reference)}`}
              className="block mt-6 bg-[#1D4EFF] text-white font-bold py-3 rounded-xl hover:bg-blue-700"
            >
              Create your account
            </Link>
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
              to="/#pricing"
              className="block mt-6 text-[#1D4EFF] font-semibold hover:underline"
            >
              Back to pricing
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
              to="/#pricing"
              className="block mt-4 text-sm text-gray-500 hover:underline"
            >
              Back to pricing
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default PurchaseReturn;
