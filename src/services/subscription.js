import API from "./api";

export const getSubscriptionPricing = async () => {
  const res = await API.get("/subscriptions/pricing");
  return res.data;
};

export const getSubscriptions = async () => {
  const res = await API.get("/subscriptions");
  return res.data;
};

// module: "payroll" | "financing" | "esop"   currency: "USD" | "NGN"
export const initiateSubscription = async (module, currency) => {
  const res = await API.post(`/subscriptions/${module}/initiate`, { currency });
  return res.data;
};

export const verifySubscription = async (reference) => {
  const res = await API.post("/subscriptions/verify", { reference });
  return res.data;
};

// ── Public (no login): used by the landing page before sign-up ──────────────
export const getPublicPricing = async () => {
  const res = await API.get("/subscriptions/pricing");
  return res.data.data;
};

export const initiatePurchase = async ({ modules, currency, email }) => {
  const res = await API.post("/subscriptions/purchase/initiate", {
    modules,
    currency,
    email,
  });
  return res.data.data;
};

export const verifyPurchase = async (reference) => {
  const res = await API.post("/subscriptions/purchase/verify", { reference });
  return res.data.data;
};

// Pay for several modules at once. modules: ["payroll", "esop"]
export const initiateSubscriptionBundle = async (modules, currency) => {
  const res = await API.post("/subscriptions/initiate", { modules, currency });
  return res.data;
};
