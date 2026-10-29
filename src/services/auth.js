import API from "./api";

// REGISTER
export const registerUser = async (finalData) => {
  const res = await API.post("/auth/register", finalData);
  return res.data;
};

// LOGIN
export const loginUser = async (data) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};

// CHANGE PASSWORD (logged-in user)
export const changePassword = async (data) => {
  const res = await API.post("/auth/change-password", data);
  return res.data;
};

// GET CURRENT USER
export const getCurrentUser = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};

// LOGOUT
export const logoutUser = async () => {
  const res = await API.post("/auth/logout");
  return res.data;
};
