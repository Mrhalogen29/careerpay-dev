import React from "react";
import { useNavigate } from "react-router-dom";
import { IoCheckmarkCircle } from "react-icons/io5";
import { HiArrowRight } from "react-icons/hi2";
import { motion } from "framer-motion";

const Results = () => {
  const navigate = useNavigate();

  const points = [
    {
      title: "Complete automation",
      desc: "Full payroll processing ensuring compliance and accuracy.",
    },
    {
      title: "Zero complexity",
      desc: "Simplified ESOP management to attract and retain top talent.",
    },
    {
      title: "Financial flexibility",
      desc: "Talent credit financing options to manage cash flow challenges.",
    },
    {
      title: "Smart efficiency",
      desc: "Streamlined processes that save time and resources.",
    },
  ];

  // Go to the pricing section. If it isn't on this page, navigate to it.
  const goToPricing = () => {
    const section = document.getElementById("pricing");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#pricing");
    }
  };

  return (
    <section className="bg-black py-28 px-6 lg:px-10 relative overflow-hidden">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
        {/* Image Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/10">
            <img
              src="/Desktop - 17.png"
              alt="A smiling professional relaxing at his desk"
              className="w-full h-[460px] lg:h-[680px] object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent pointer-events-none" />
          </div>
          {/* Decorative blur */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 blur-3xl rounded-full -z-10" />
        </motion.div>

        {/* Content Side */}
        <div className="flex flex-col items-start">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-blue-500 text-base font-semibold tracking-[0.2em] uppercase mb-5 block"
          >
            Our Promise
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white mb-8 leading-[1.05]"
          >
            Platform that solves everything
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-xl lg:text-2xl mb-12 leading-relaxed max-w-2xl"
          >
            Get the freedom to make quick and easy structural financial
            decisions, optimize processes, work smart, and transform your
            compensation management experience.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 mb-14">
            {points.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <IoCheckmarkCircle className="text-blue-500 text-3xl flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                    {point.title}
                  </h4>
                  <p className="text-gray-400 text-base lg:text-lg leading-snug">
                    {point.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            type="button"
            onClick={goToPricing}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="bg-[#1D4EFF] hover:bg-blue-600 text-white px-10 py-5 rounded-xl text-lg font-bold transition-all flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Become A Client
            <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default Results;
