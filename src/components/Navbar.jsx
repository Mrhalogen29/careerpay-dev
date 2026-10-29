import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    closeMenu();
    navigate("/");
  };

  const goToPricing = () => {
    closeMenu();
    const section = document.getElementById("pricing");
    if (pathname === "/" && section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#pricing");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Shared styling for the desktop menu links
  const linkClass =
    "text-gray-300 hover:text-white transition-colors text-lg xl:text-xl font-medium";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/70 backdrop-blur-lg border-b border-white/10 py-4"
          : "bg-transparent py-7"
      }`}
    >
      {/* Wide container: same width and side margins as the hero */}
      <div className="w-full max-w-none px-6 lg:px-10 flex items-center justify-between">
        {/* Left group: logo + menu links, side by side (Deel style) */}
        <div className="flex items-center gap-10 xl:gap-14">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/careerpay-logo.png"
              alt="Careerpay"
              className="w-32 lg:w-40 xl:w-44 h-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            <Link to="/" className={linkClass}>
              Home
            </Link>
            <Link to="/about" className={linkClass}>
              About
            </Link>
            <Link to="/testimonials" className={linkClass}>
              Testimonials
            </Link>
            <Link to="/careers" className={linkClass}>
              Careers
            </Link>
            <Link to="/faq" className={linkClass}>
              FAQ
            </Link>
            <Link to="/contact" className={linkClass}>
              Contact
            </Link>
          </div>
        </div>

        {/* Desktop Auth (pill buttons) */}
        <div className="hidden lg:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white text-lg xl:text-xl font-medium px-4"
              >
                Logout
              </button>
              <Link
                to="/dashboard"
                className="bg-white text-black hover:bg-gray-200 px-7 py-3 rounded-full text-lg xl:text-xl font-semibold transition-all"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white border border-white/30 hover:border-white hover:bg-white/10 px-7 py-3 rounded-full text-lg xl:text-xl font-medium transition-all"
              >
                Log In
              </Link>
              <button
                type="button"
                onClick={goToPricing}
                className="bg-white text-black hover:bg-gray-200 px-7 py-3 rounded-full text-lg xl:text-xl font-semibold transition-all"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={toggleMenu}
          className="lg:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <HiX size={32} /> : <HiMenu size={32} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 bg-black z-40 transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-8 pt-24 gap-8">
          <Link
            to="/"
            onClick={closeMenu}
            className="text-2xl font-bold text-white"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={closeMenu}
            className="text-2xl font-bold text-white"
          >
            About
          </Link>
          <Link
            to="/testimonials"
            onClick={closeMenu}
            className="text-2xl font-bold text-white"
          >
            Testimonials
          </Link>
          <Link
            to="/careers"
            onClick={closeMenu}
            className="text-2xl font-bold text-white"
          >
            Careers
          </Link>
          <Link
            to="/faq"
            onClick={closeMenu}
            className="text-2xl font-bold text-white"
          >
            FAQ
          </Link>
          <Link
            to="/contact"
            onClick={closeMenu}
            className="text-2xl font-bold text-white"
          >
            Contact
          </Link>

          <div className="mt-auto flex flex-col gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="bg-[#1D4EFF] text-white text-center py-4 rounded-xl font-bold"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 text-center py-4"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-white text-center py-4 border border-white/20 rounded-xl font-bold"
                >
                  Log In
                </Link>
                <button
                  type="button"
                  onClick={goToPricing}
                  className="bg-white text-black text-center py-4 rounded-xl font-bold"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
