// src/components/FootballHero.jsx
import React from "react"
import { motion } from "framer-motion"

const FootballHero = () => {
  return (
    <section className="w-full bg-[#f5f5f7] py-12 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.h2
          className="text-4xl md:text-5xl font-semibold tracking-tight mb-8 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Take a closer look.
        </motion.h2>

        {/* Animated Gradient Card */}
        <motion.div
          className="relative rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-10 md:p-16 shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Animated background layer */}
          <motion.div
            className="absolute inset-0"
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
              background: "linear-gradient(270deg, #e5e5e5, #dcdcdc, #ff7f11)",
              backgroundSize: "300% 300%",
              zIndex: 0,
            }}
          />

          {/* Content Layer */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full">
            {/* LEFT SIDE */}
            <motion.div
              className="max-w-xl text-center md:text-left space-y-6"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: "easeOut" }}
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
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <img
                src="/images/football.png"
                alt="Kenyan Football"
                className="w-[320px] md:w-[420px] object-contain"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FootballHero
