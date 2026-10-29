import { useState, useEffect, useCallback } from "react";

import NewSidebar from "../../components/dashboard/NewSidebar";
import NewHeader from "../../components/dashboard/NewHeader";

import CompanyDashboard from "./CompanyDashboard";
import NewViewEmployees from "./NewViewEmployees";
import TemporaryPasswordBanner from "./TemporaryPasswordBanner.jsx";
import AddEmployee from "./AddEmployee";
import EditEmployee from "./EditEmployee.jsx";
import Payroll from "./Payroll.jsx";
import PaymentGateway from "./PaymentGateway.jsx";
import AuditLog from "./AuditLog.jsx";
import Payslip from "./payslips.jsx";
import MyPayslip from "./myPayslip.jsx";
import Notification from "./Notification.jsx";
import CompanySettings from "./CompanySettings";
import PayrollApproval from "./payrollApproval.jsx";
import ESOP from "./ESOP";
import Financing from "./Financing";
import EmployeeLoans from "./EmployeeLoans.jsx";
import LoanApprovals from "./LoanApprovals.jsx";
import EmployeeDashboard from "./EmployeeDashboard";
import ModuleGuard from "../../components/ModuleGuard";

import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/auth";
import { getMyNotifications } from "../../services/notification.js";

// A page listed here needs that module's subscription

const PAGE_MODULE = {
  payroll: "payroll",
  "payroll-approval": "payroll",
  "payment-gateway": "payroll",
  payslip: "payroll",
  financing: "financing",
  "my-loans": ["financing", "payroll"],
  "loan-approvals": ["financing", "payroll"],
  esop: "esop",
};

const ComingSoon = ({ title }) => (
  <div className="p-6">
    <h1 className="text-xl font-semibold text-gray-900 mb-4">{title}</h1>

    <div className="bg-white rounded-xl border border-gray-100 p-12 flex items-center justify-center text-gray-400 text-sm">
      This section is coming soon
    </div>
  </div>
);

export default function DashboardApp() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Stores the payroll currently being reviewed/approved
  const [selectedPayrollId, setSelectedPayrollId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Number shown on the bell in the header
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  // Unread notifications: load now, then refresh every 30 seconds
  const refreshUnread = useCallback(async () => {
    try {
      const res = await getMyNotifications(true); // unread only
      setUnreadCount(res.unreadCount || 0);
    } catch {
      /* the bell keeps its last value */
    }
  }, []);

  useEffect(() => {
    refreshUnread();
    const timer = setInterval(refreshUnread, 30000);
    return () => clearInterval(timer);
  }, [refreshUnread]);

  const renderPage = () => {
    const isEmployee = user?.role === "employee";
    const canManageStaff = ["founder", "admin", "hr"].includes(user?.role);

    switch (activePage) {
      // DASHBOARD

      case "dashboard":
        return isEmployee ? (
          <EmployeeDashboard user={user} setActivePage={setActivePage} />
        ) : (
          <CompanyDashboard user={user} setActivePage={setActivePage} />
        );

      // EMPLOYEES

      case "view-employees":
        return isEmployee ? (
          <ComingSoon title="My Profile" />
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
        return !canManageStaff ? (
          <ComingSoon title="Add Employee" />
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
          <ComingSoon title="Payroll" />
        ) : (
          <Payroll
            user={user}
            setActivePage={setActivePage}
            onBack={() => setActivePage("dashboard")}
            // Payroll sends the real payroll ID here
            onNext={(payrollId) => {
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
            onBack={() => setActivePage("payroll")}
            onApproved={() => setActivePage("payment-gateway")}
          />
        );

      // ESOP

      case "esop":
        return <ESOP user={user} />;

      // FINANCING

      case "financing":
        return isEmployee ? (
          <ComingSoon title="Financing" />
        ) : (
          <Financing user={user} />
        );

      case "my-loans":
        return <ComingSoon title="My Loans" />;

      case "loan-approvals":
        return <ComingSoon title="Loan Requests" />;

      // NOTIFICATION

      case "notification":
        return (
          <Notification
            setActivePage={setActivePage}
            onChange={refreshUnread}
          />
        );

      // SETTINGS

      case "settings":
        return isEmployee ? (
          <ComingSoon title="Settings" />
        ) : (
          <CompanySettings user={user} />
        );

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

      // PAY SLIP
      // Employees see their own payslips; company users see the HR payslip screen

      case "payslip":
        return isEmployee ? <MyPayslip /> : <Payslip />;

      // DEFAULT

      default:
        return isEmployee ? (
          <EmployeeDashboard user={user} setActivePage={setActivePage} />
        ) : (
          <CompanyDashboard user={user} setActivePage={setActivePage} />
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <NewSidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <NewHeader
          toggleSidebar={() => setSidebarOpen((o) => !o)}
          user={user}
          setActivePage={setActivePage}
          unreadCount={unreadCount}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <TemporaryPasswordBanner user={user} onDone={handleLogout} />
          {PAGE_MODULE[activePage] ? (
            <ModuleGuard module={PAGE_MODULE[activePage]}>
              {renderPage()}
            </ModuleGuard>
          ) : (
            renderPage()
          )}
        </main>
      </div>
    </div>
  );
}
