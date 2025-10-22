import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import "./FootballHero.css"

const FootballHero = () => {
  const ref = useRef(null)

  // Track scroll progress for the section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.1 0"], // smooth scroll trigger
  })

  // Smooth zoom and parallax transforms
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1.02])
  const y = useTransform(scrollYProgress, [0, 1], [60, 0])
  const imageY = useTransform(scrollYProgress, [0, 1], [40, -20])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 1])

  return (
    <section
      ref={ref}
      className="w-full bg-[#f5f5f7] py-20 px-4 relative overflow-hidden perspective"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-12 text-center">
          Take a closer look.
        </h2>

        {/* Main Card with Smooth Zoom */}
        <motion.div
          style={{ scale, y }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
          className="relative rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-10 md:p-16 shadow-2xl bg-animated-gradient transform-gpu will-change-transform"
        >
          {/* CONTENT */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full">
            {/* LEFT SIDE */}
            <div className="max-w-xl text-center md:text-left space-y-6">
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
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition"
              >
                Watch the film
              </motion.button>
            </div>

            {/* RIGHT SIDE IMAGE with Parallax */}
            <motion.div
              style={{ y: imageY, scale: imageScale }}
              transition={{ type: "spring", stiffness: 50, damping: 18 }}
              className="mt-10 md:mt-0 md:ml-12 flex-shrink-0 transform-gpu will-change-transform"
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
