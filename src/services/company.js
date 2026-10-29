import API from "./api";

// GET COMPANY DETAILS
export const getCompanyDetails = async () => {
  const res = await API.get("/companies/profile");
  return res.data;
};

// UPDATE COMPANY DETAILS
export const updateCompanyDetails = async (data) => {
  const res = await API.put("/companies", data);
  return res.data;
};

// UPDATE COMPANY SETTINGS (pay frequency, currency, payroll rules)
export const updateCompanySettings = async (data) => {
  const res = await API.put("/companies/settings", data);
  return res.data;
};

// GET COMPANY EMPLOYEES
export const getCompanyEmployees = async () => {
  const res = await API.get("/employees");
  return res.data;
};

// ADD EMPLOYEE
export const addEmployee = async (data) => {
  const res = await API.post("/employees", data);
  return res.data;
};

// get single employee

export const getEmployeeById = async (id) => {
  const res = await API.get(`/employees/${id}`);
  return res.data;
};

// update employee

export const updateEmployee = async (id, data) => {
  const res = await API.put(`/employees/${id}`, data);
  return res.data;
};

// DELETE EMPLOYEE
export const deleteEmployee = async (id) => {
  const res = await API.delete(`/employees/${id}`);
  return res.data;
};
// GET DEPARTMENTS
export const getDepartments = async () => {
  const res = await API.get("/departments");
  return res.data;
};

// GET COMPANY STATS
export const getCompanyStats = async () => {
  const res = await API.get("/companies/stats");
  return res.data;
};

export const getNigerianBanks = async () => {
  const res = await API.get("/employees/banks");
  return res.data;
};

export const uploadEmployeeDocuments = async (employeeId, formData) => {
  const res = await API.post(`/employees/${employeeId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getEmployeeDocument = async (employeeId, docType) => {
  const res = await API.get(`/employees/${employeeId}/documents/${docType}`, {
    responseType: "blob",
  });
  return res.data;
};
