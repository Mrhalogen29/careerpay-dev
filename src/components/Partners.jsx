import React from "react";
import Marquee from "react-fast-marquee";

const Partners = () => {
  const partners = [
    { src: "/image8.png", alt: "Spectranet" },
    { src: "/image9.png", alt: "Partner 2" },
    { src: "/image10.png", alt: "CreditPRO" },
    { src: "/image11.png", alt: "Dega" },
    { src: "/image13.png", alt: "Uridium Technologies" },
    { src: "/image14.png", alt: "Partner 6" },
  ];

  return (
    <section className="bg-black py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-14 text-center">
        <p className="text-gray-400 uppercase tracking-[0.2em] text-base lg:text-lg font-semibold">
          Trusted by Industry Leaders
        </p>
      </div>

      <div className="relative">
        {/* Gradient overlays for smooth fading */}
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        {/* Moving row: pauses when the mouse is on it */}
        <Marquee speed={40} gradient={false} pauseOnHover={true}>
          {partners.map((partner, index) => (
            <div
              key={index}
              className="mx-5 lg:mx-8 flex h-28 w-52 lg:h-36 lg:w-72 items-center justify-center rounded-2xl bg-white px-8 py-6 shadow-lg shadow-black/40 transition-transform duration-300 hover:scale-110"
            >
              <img
                src={partner.src}
                alt={partner.alt}
                className="max-h-full max-w-full w-auto object-contain"
              />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default Partners;
