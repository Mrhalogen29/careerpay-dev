import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

//Main pages

import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/SignIn";
import About from "./pages/About";
import Testimonials from "./pages/Testimonials";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import Careers from "./pages/Careers";
import Onboarding from "./pages/Onboarding";
import ForgotPassword from "./pages/ForgotPassword";
import CreateNewPassword from "./pages/CreateNewPassword";
import EmailVerification from "./pages/EmailVerification";
import VerifyEmail from "./pages/VerifyEmail";
import TaxCalculator from "./pages/TaxCalculator";
import Pricing from "./components/Pricing";
import PurchaseReturn from "./pages/PurchaseReturn";
import SubscriptionVerify from "./pages/SubscriptionVerify";
import SubscriptionGate from "./components/SubscriptionGate";
import Subscription from "./pages/dashboard/Subscription";
import BookDemo from "./pages/BookDemo";

//Dashboard pages
import DashboardApp from "./pages/dashboard/DashboardApp";
import EmployeesList from "./pages/dashboard/EmployeesList";

// Flutterwave returns here for two flows: payments made before sign-up (PUR-)
// and in-app renewals. The reference prefix tells them apart.
const VerifyRouter = () => {
  const [params] = useSearchParams();
  const ref = params.get("reference") || params.get("tx_ref") || "";
  return ref.startsWith("PUR-") ? <PurchaseReturn /> : <SubscriptionVerify />;
};
const App = () => {
  return (
    <main className="font-sfPro font-normal scroll-smooth">
      <Router>
        <Routes>
          {/* Main App Routes */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
                <Pricing />
                <Footer />
              </>
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/book-demo" element={<BookDemo />} />
          <Route path="/subscription/verify" element={<VerifyRouter />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/about"
            element={
              <>
                <Navbar />
                <About />
                <Footer />
              </>
            }
          />
          <Route
            path="/testimonials"
            element={
              <>
                <Navbar />
                <Testimonials />
                <Footer />
              </>
            }
          />
          <Route
            path="/faq"
            element={
              <>
                <Navbar />
                <FAQ />
                <Footer />
              </>
            }
          />
          <Route
            path="/privacy"
            element={
              <>
                <Navbar />
                <PrivacyPolicy />
                <Footer />
              </>
            }
          />
          <Route
            path="/terms"
            element={
              <>
                <Navbar />
                <TermsOfService />
                <Footer />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Navbar />
                <Contact />
                <Footer />
              </>
            }
          />
          <Route
            path="/help"
            element={
              <>
                <Navbar />
                <HelpCenter />
                <Footer />
              </>
            }
          />
          <Route
            path="/careers"
            element={
              <>
                <Navbar />
                <Careers />
                <Footer />
              </>
            }
          />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<CreateNewPassword />} />
          <Route path="/tax" element={<TaxCalculator />} />

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <DashboardApp />
                </SubscriptionGate>
              </ProtectedRoute>
            }
          />
          {/* Subscription renewal. Not behind the gate, or it would loop */}
          <Route
            path="/renew"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          {/* Employees */}
          <Route
            path="/employeeList"
            element={
              <ProtectedRoute>
                <EmployeesList />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </main>
  );
};

export default App;
