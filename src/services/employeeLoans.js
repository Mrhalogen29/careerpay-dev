import API from "./api";

// Employee: request a loan
export const requestLoan = async (data) => {
  const res = await API.post("/employee-loans", data);
  return res.data;
};

// Employee: my own loans
export const getMyLoans = async () => {
  const res = await API.get("/employee-loans/mine");
  return res.data;
};

// Employee: cancel my pending request
export const cancelLoan = async (id) => {
  const res = await API.patch(`/employee-loans/${id}/cancel`);
  return res.data;
};

// HR and above: all company loan requests (optionally ?status=pending)
export const getCompanyLoans = async (params = {}) => {
  const res = await API.get("/employee-loans", { params });
  return res.data;
};

// HR and above: approve (optionally with approvedAmount / monthlyInstallment)
export const approveLoan = async (id, data = {}) => {
  const res = await API.patch(`/employee-loans/${id}/approve`, data);
  return res.data;
};

// HR and above: reject with a reason
export const rejectLoan = async (id, reason) => {
  const res = await API.patch(`/employee-loans/${id}/reject`, { reason });
  return res.data;
};

// HR and above: activate once the employee has been paid
export const activateLoan = async (id) => {
  const res = await API.patch(`/employee-loans/${id}/activate`);
  return res.data;
};
