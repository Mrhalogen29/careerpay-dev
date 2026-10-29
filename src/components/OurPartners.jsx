import React from "react";
import Partners from "./Partners";
import { motion } from "framer-motion";

const OurPartners = () => {
  return (
    <section className="bg-black px-6 lg:px-20 py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto text-center mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-8"
        >
          Our Partners
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed"
        >
          We’ve preferred solutions to market leading providers in the variety
          of clients providing efficient solutions specifically for the digital
          economy.
        </motion.p>
      </div>
      <div className="relative">
        <Partners />
      </div>
    </section>
  );
};

export default OurPartners;
