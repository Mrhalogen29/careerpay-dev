import API from "./api";

export const getMyGrant = async (id, signal) => {
  const res = await API.get(`/equity/my-grants/${encodeURIComponent(id)}`, { signal, timeout: 15000 });
  return res.data;
};

export const respondToGrant = async (id, decision, termsAcknowledged) => {
  const res = await API.post(`/equity/my-grants/${encodeURIComponent(id)}/respond`, { decision, termsAcknowledged });
  return res.data;
};

export const getMyEquity = async (signal) => {
  const res = await API.get("/equity/my-equity", { signal, timeout: 15000 });
  return res.data;
};

// Get company-wide equity overview (totals, breakdowns)
export const getEquityOverview = async () => {
  const res = await API.get("/equity/overview");
  return res.data;
};

// Get all equity grants (with vesting progress calculated)
export const getAllEquityGrants = async () => {
  const grants = [];
  let page = 1;
  let pages = 1;
  do {
    const res = await API.get("/equity/grants", { params: { page, limit: 100 } });
    if (!res.data.success) return res.data;
    grants.push(...res.data.data);
    pages = res.data.pagination?.pages || 1;
    page += 1;
  } while (page <= pages);
  return { success: true, data: grants };
};

// Issue a new equity grant to an employee
export const createEquityGrant = async (data) => {
  const res = await API.post("/equity/grants", data);
  return res.data;
};

export const updateEquityGrant = async (grantId, data) => {
  const res = await API.put(`/equity/grants/${encodeURIComponent(grantId)}`, data);
  return res.data;
};

export const deleteEquityGrant = async (grantId, reason) => {
  const res = await API.delete(`/equity/grants/${encodeURIComponent(grantId)}`, {
    data: { reason, permanent: true },
  });
  return res.data;
};

// Process vesting for all eligible grants (moves vested shares forward)
export const processVesting = async () => {
  const res = await API.post("/equity/process-vesting");
  return res.data;
};
