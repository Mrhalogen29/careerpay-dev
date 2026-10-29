import React from "react";
import { BsBuildingsFill } from "react-icons/bs";
import { FaPeopleGroup } from "react-icons/fa6";
import { RiUserCommunityFill } from "react-icons/ri";
import { motion, useReducedMotion } from "framer-motion";

const features = [
  {
    icon: <FaPeopleGroup className="text-3xl text-blue-500" />,
    title: "Early stage companies and startups",
    description:
      "They often face cash flow constraints but need to attract and retain skilled employees",
  },
  {
    icon: <BsBuildingsFill className="text-3xl text-blue-500" />,
    title: "Small & medium-scale enterprise (SME)",
    description:
      "This companies requires robust tools for managing payroll and equity as they scale.",
  },
  {
    icon: <RiUserCommunityFill className="text-3xl text-blue-500" />,
    title: "Large Scale Cooperations",
    description:
      "These companies require payroll management for their outsourced employees",
  },
];

// One box. The light inside it follows the mouse via two CSS variables.
const FeatureCard = ({ feature, index }) => {
  const reduceMotion = useReducedMotion();

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -10,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0,
              },
            }
      }
      onMouseMove={handleMouseMove}
      className="group relative cursor-default overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 transition-[background-color,border-color,box-shadow] duration-300 hover:border-blue-500/40 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/10"
    >
      {/* Light that follows the cursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(29,78,255,0.20), transparent 60%)",
        }}
      />

      <div className="relative">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-blue-500/15">
          {feature.icon}
        </div>
        <h3 className="mb-4 text-2xl font-bold leading-tight text-white">
          {feature.title}
        </h3>
        <p className="leading-relaxed text-gray-400">{feature.description}</p>
      </div>
    </motion.div>
  );
};

const Manage = () => {
  return (
    <section className="bg-black py-32 px-6 lg:px-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-blue-500 text-sm font-semibold tracking-[0.2em] uppercase mb-4 block"
          >
            Target Audience
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight"
          >
            Manage your future compensation in one space
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Manage;
