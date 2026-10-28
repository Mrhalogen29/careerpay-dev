import React, { useState, useEffect, useLayoutEffect, useRef } from "react";

import NewSidebar from "../../components/dashboard/NewSidebar";
import NewHeader from "../../components/dashboard/NewHeader";
import EquityLoading from "../../components/dashboard/EquityLoading";
import EmployeeEquity, { EmployeeEquityHeader, EmployeeProfile, EmployeeMessages } from "../../components/dashboard/EmployeeEquity";

import CompanyDashboard from "./CompanyDashboard";
import NewViewEmployees from "./NewViewEmployees";
import AddEmployee from "./AddEmployee";
import EditEmployee from "./EditEmployee.jsx";
import Payroll from "./Payroll.jsx";
import PaymentGateway from "./PaymentGateway.jsx";
import AuditLog from "./AuditLog.jsx";
import Payslip from "./payslips.jsx";
import Notification from "./Notification.jsx";
import GrantAcceptance from "./GrantAcceptance";
import CompanySettings from "./CompanySettings";
import PayrollApproval from "./payrollApproval.jsx";
import ESOP from "./ESOP";
import Financing from "./Financing";
import EmployeeDashboard from "./EmployeeDashboard";
import Jobs from "./Jobs";
import Applicants from "./Applicants";

import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/auth";

const ComingSoon = ({ title }) => (
  <div className="p-6">
    <h1 className="text-xl font-semibold text-gray-900 mb-4">{title}</h1>

    <div className="bg-white rounded-xl border border-gray-100 p-12 flex items-center justify-center text-gray-400 text-sm">
      This section is coming soon
    </div>
  </div>
);

export default function DashboardApp() {
  const location = useLocation();
  const contentRef = useRef(null);
  const [activePage, setActivePage] = useState(location.state?.editingJob ? "edit-job" : "dashboard");
  useLayoutEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [activePage]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");
  const [userAttempt, setUserAttempt] = useState(0);
  const employeeEquityView = user?.role === "employee" && (["esop", "employee-profile", "employee-messages", "notification"].includes(activePage) || activePage.startsWith("grant-acceptance:"));

  // Stores the payroll currently being reviewed/approved
  const [selectedPayrollId, setSelectedPayrollId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(location.state?.editingJob ?? null);
  const [updatedJobId, setUpdatedJobId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.editingJob) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      setUserLoading(true);
      setUserError("");
      try {
        const res = await getCurrentUser();
        if (!res.data) throw new Error("Profile unavailable");
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUserError("Unable to load your profile. Please try again.");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [userAttempt]);

  const renderPage = () => {
    console.log("Current activePage:", activePage);
    console.log("Selected payroll:", selectedPayrollId);

    const isEmployee = user?.role === "employee";

    if (activePage.startsWith("grant-acceptance:")) {
      const grantId = activePage.slice("grant-acceptance:".length);
      return <GrantAcceptance key={grantId} grantId={grantId} onBack={() => setActivePage("notification")} />;
    }

    switch (activePage) {
      // DASHBOARD

      case "dashboard":
        return isEmployee ? (
          <EmployeeDashboard user={user} />
        ) : (
          <CompanyDashboard user={user} setActivePage={setActivePage} />
        );

      case "add-job":
      case "view-jobs":
      case "edit-job":
        if (!user) return <p role="status" className="p-10 text-center text-gray-500">Loading job...</p>;
        return user?.role === "admin" ? (
          <Jobs key={activePage} mode={activePage} setActivePage={setActivePage} user={user}
            editingJob={selectedJob} updatedJobId={updatedJobId}
            onEdit={(job) => {
              setSelectedJob(job);
              setActivePage("edit-job");
            }}
            onSaved={(job) => {
              setUpdatedJobId(job._id);
              setSelectedJob(null);
              setActivePage("view-jobs");
            }}
          />
        ) : <ComingSoon title="Access restricted" />;

      case "view-applicants":
        return user?.role === "admin" ? <Applicants /> : <ComingSoon title="Access restricted" />;

      // EMPLOYEES

      case "view-employees":
        return isEmployee ? (
          <EmployeeProfile user={user} onBack={() => setActivePage("dashboard")} backLabel="Back to dashboard" />
        ) : (
          <NewViewEmployees
            setActivePage={setActivePage}
            onEditEmployee={(id) => {
              setSelectedEmployeeId(id);
              setActivePage("edit-employee");
            }}
          />
        );

      case "add-employees":
        return isEmployee ? (
          <ComingSoon title="Attendance" />
        ) : (
          <AddEmployee
            setActivePage={setActivePage}
            onBack={() => setActivePage("view-employees")}
            onNext={() => setActivePage("view-employees")}
          />
        );
      case "edit-employee":
        return isEmployee ? (
          <ComingSoon title="Edit Employee" />
        ) : (
          <EditEmployee
            employeeId={selectedEmployeeId}
            onBack={() => setActivePage("view-employees")}
            onSaved={() => setActivePage("view-employees")}
          />
        );

      // PAYROLL

      case "payroll":
        return isEmployee ? (
          <ComingSoon title="My Payslips" />
        ) : (
          <Payroll
            user={user}
            setActivePage={setActivePage}
            onBack={() => setActivePage("dashboard")}
            // IMPORTANT:
            // Payroll sends the real payroll ID here
            onNext={(payrollId) => {
              console.log("Opening payroll approval:", payrollId);

              setSelectedPayrollId(payrollId);
              setActivePage("payroll-approval");
            }}
            onPaymentStarted={(payrollId) => {
              setSelectedPayrollId(payrollId);
              setActivePage("payment-gateway");
            }}
          />
        );

      // PAYROLL APPROVAL

      case "payroll-approval":
        return isEmployee ? (
          <ComingSoon title="Payroll Approval" />
        ) : (
          <PayrollApproval
            payrollId={selectedPayrollId}
            onBack={() => {
              setActivePage("payroll");
            }}
            onApproved={() => {
              // After approval return to payroll
              setActivePage("payment-gateway");
            }}
          />
        );

      // ESOP

      case "esop":
        return isEmployee ? <EmployeeEquity onBack={() => setActivePage("dashboard")} /> : <ESOP user={user} />;

      case "my-equity":
        return <EmployeeEquity key="my-equity" onBack={() => setActivePage("dashboard")} />;

      case "employee-profile":
        return isEmployee ? <EmployeeProfile user={user} onBack={() => setActivePage("esop")} /> : <ComingSoon title="Access restricted" />;

      case "employee-messages":
        return isEmployee ? <EmployeeMessages onBack={() => setActivePage("esop")} /> : <ComingSoon title="Access restricted" />;

      // FINANCING

      case "financing":
        return <Financing user={user} />;

      // NOTIFICATION

      case "notification":
        return <Notification setActivePage={setActivePage} />;

      // SETTINGS

      case "settings":
        return <CompanySettings user={user} />;

      // PAYMENT GATEWAY

      case "payment-gateway":
        return isEmployee ? (
          <ComingSoon title="Payment Gateway" />
        ) : (
          <PaymentGateway
            payrollId={selectedPayrollId}
            onBack={() => setActivePage("payroll")}
            onNext={() => setActivePage("payroll")}
          />
        );

      // AUDIT LOG

      case "audit-log":
        return isEmployee ? <ComingSoon title="Audit Log" /> : <AuditLog />;

      //PAY SLIP
      case "payslip":
        return isEmployee ? <ComingSoon title="My Payslips" /> : <Payslip />;

      case "overtime":
        return isEmployee ? <ComingSoon title="Overtime" /> : <Overtime />;

      // DEFAULT

      default:
        return isEmployee ? (
          <ComingSoon title="Employee Dashboard" />
        ) : (
          <CompanyDashboard user={user} />
        );
    }
  };

  // LOGOUT

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  };

  if (userLoading) return <EquityLoading label="Loading your dashboard…" />;
  if (userError) return <div role="alert" className="p-10 text-center"><p>{userError}</p><button type="button" onClick={() => setUserAttempt((value) => value + 1)} className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white">Retry</button></div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {!employeeEquityView && <NewSidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
      />}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {employeeEquityView ? <EmployeeEquityHeader user={user} onNavigate={setActivePage} /> : <NewHeader
          onNavigate={setActivePage}
          toggleSidebar={() => setSidebarOpen((o) => !o)}
          user={user}
        />}

        <main ref={contentRef} className="flex-1 overflow-y-auto bg-gray-50">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
