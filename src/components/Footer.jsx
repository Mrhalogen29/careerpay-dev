import React from "react";
import { AiFillInstagram } from "react-icons/ai";
import { FaLinkedin, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

const COMPANY_LINKS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Careers", to: "/careers" },
  { label: "Contact", to: "/contact" },
];

const SUPPORT_LINKS = [
  { label: "Help Center", to: "/help" },
  { label: "FAQ", to: "/faq" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
];

// Replace "#" with your real profile links
const SOCIALS = [
  { label: "Twitter", href: "#", Icon: FaTwitter },
  { label: "LinkedIn", href: "#", Icon: FaLinkedin },
  { label: "Instagram", href: "#", Icon: AiFillInstagram },
];

const linkClass =
  "text-xl text-gray-400 transition-colors hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-black px-6 pb-10 pt-20 lg:px-10 lg:pt-28">
      <div className="grid w-full grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:gap-16">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-block">
            <img
              src="/careerpay-logo.png"
              alt="CareerPay"
              className="h-auto w-44"
            />
          </Link>
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-gray-400">
            Simplifying compensation management for organizations through
            innovation and commitment.
          </p>
          <div className="mt-8 flex items-center gap-3">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-gray-300 transition-all hover:bg-blue-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <nav aria-label="Company">
          <h4 className="mb-6 text-lg font-semibold text-white">Company</h4>
          <ul className="space-y-4">
            {COMPANY_LINKS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Support */}
        <nav aria-label="Support">
          <h4 className="mb-6 text-lg font-semibold text-white">Support</h4>
          <ul className="space-y-4">
            {SUPPORT_LINKS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Newsletter (same behaviour as before) */}
        <div className="sm:col-span-2 lg:col-span-1">
          <h4 className="mb-6 text-lg font-semibold text-white">
            Stay updated
          </h4>
          <p className="mb-5 max-w-sm text-lg leading-relaxed text-gray-400">
            Subscribe to our newsletter for the latest updates.
          </p>
          <form className="relative max-w-md">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="Email address"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 pr-28 text-lg text-white placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="absolute bottom-2 right-2 top-2 rounded-lg bg-blue-600 px-5 text-base font-semibold text-white transition-all hover:bg-blue-700">
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-16 flex flex-col items-start gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
        <p className="text-base text-gray-500">
          © 2026 CareerPay. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <Link
            to="/privacy"
            className="text-base text-gray-500 transition-colors hover:text-white"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="text-base text-gray-500 transition-colors hover:text-white"
          >
            Terms of Service
          </Link>
          <Link
            to="/cookies"
            className="text-base text-gray-500 transition-colors hover:text-white"
          >
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
