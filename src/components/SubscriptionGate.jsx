import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../services/api";

const SubscriptionGate = ({ children }) => {
  const [state, setState] = useState("checking"); // checking | ok | blocked

  useEffect(() => {
    let stop = false;

    API.get("/subscriptions/access")
      .then((res) => {
        if (stop) return;
        const access = res.data?.data || {};
        const hasAny = Object.values(access).some(Boolean);
        setState(hasAny ? "ok" : "blocked");
      })
      .catch(() => {
        // Never lock someone out because this check failed
        // (offline, unverified email, server hiccup)
        if (!stop) setState("ok");
      });

    return () => {
      stop = true;
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (state === "blocked") return <Navigate to="/renew" replace />;

  return children;
};

export default SubscriptionGate;
