import API from "./api";

export const getAccess = async () => {
  const res = await API.get("/subscriptions/access");
  return res.data; // { success, data: { payroll, financing, esop } }
};
