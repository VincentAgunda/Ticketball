// src/components/FootballHero.jsx
import React from "react"
import { motion } from "framer-motion"
import "./FootballHero.css" // add CSS file for smoother gradient animation

const FootballHero = () => {
  return (
    <section className="w-full bg-[#f5f5f7] py-12 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.h2
          className="text-4xl md:text-5xl font-semibold tracking-tight mb-8 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Take a closer look.
        </motion.h2>

        {/* Card Container */}
        <motion.div
          className="relative rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-10 md:p-16 shadow-xl bg-animated-gradient"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* CONTENT */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full">
            {/* LEFT SIDE */}
            <motion.div
              className="max-w-xl text-center md:text-left space-y-6"
              initial={{ x: -40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
                A Guided Tour of
                <br />
                Kenyan Premier League Matches,
                <br />
                National Team Fixtures,
                <br />
                and Stadium Experiences
              </h3>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition"
              >
                Watch the film
              </motion.button>
            </motion.div>

            {/* RIGHT SIDE IMAGE */}
            <motion.div
              className="mt-10 md:mt-0 md:ml-12 flex-shrink-0"
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <img
                src="/images/football.png"
                alt="Kenyan Football"
                className="w-[320px] md:w-[420px] object-contain will-change-transform transform-gpu"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FootballHero
