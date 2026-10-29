import API from "./api";

export const getMyPayslips = async () => {
  const res = await API.get("/my-payslips");
  return res.data; // { success, data: [ ...latest first ] }
};
