import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HeroHome = () => {
  return (
    <section className="bg-[#000000] min-h-screen flex flex-col items-center pt-[150px] lg:pt-[180px] px-6 lg:px-20 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-[200px] right-[-100px] w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full -z-10" />

      <div className="max-w-5xl mx-auto w-full text-center flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8"
        >
          <span className="text-blue-400 text-sm font-medium tracking-wide uppercase">
            Transforming Compensation Management
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-bold text-4xl lg:text-[64px] leading-[1.1] text-white max-w-4xl mb-8 tracking-tight"
        >
          Simplifying Compensation Management for Organizations
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-lg lg:text-xl max-w-2xl mb-12 leading-relaxed"
        >
          Empowering organizations with Talent Credit Financing, Employee Stock
          Ownership Plan, and Payroll Management System.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20"
        >
          <Link
            to="/signup"
            className="bg-[#1D4EFF] hover:bg-[#1D4EFF]/90 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20 active:scale-95"
          >
            Get Started
          </Link>

          <Link
            to="/book-demo"
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Book a Demo
          </Link>
        </motion.div>

        {/* Hero Image / Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full max-w-6xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/10">
            <img
              src="/Desktop - 28.png"
              alt="Dashboard Preview"
              className="w-full h-auto object-cover"
            />
            {/* Glass Overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Decorative Elements around image */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500/20 blur-2xl rounded-full" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroHome;
