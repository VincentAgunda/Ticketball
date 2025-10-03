// src/pages/public/EventsMemoriesSection.jsx
import React from "react"
import { motion } from "framer-motion"

// Portfolio / memories data
const portfolioMemories = [
  { id: 1, image: "/images/how-it-works-bg.jpg", caption: "Championship Glory" },
  { id: 2, image: "/images/home1.png", caption: "Fans in Action" },
  { id: 3, image: "/images/home1.png", caption: "Team Spirit" },
  { id: 4, image: "/images/how-it-works1-bg.png", caption: "Historic Goal" },
  { id: 5, image: "/images/how-it-works1-bg.png", caption: "Celebrations" },
  { id: 6, image: "/images/how-it-works-bg.jpg", caption: "Iconic Moments" },
  { id: 7, image: "/images/player2.png", caption: "Historic Goal" },
  { id: 8, image: "/images/player3.png", caption: "Celebrations" },
  { id: 9, image: "/images/how-it-works-bg.jpg", caption: "Iconic Moments" },
  { id: 10, image: "/images/player2.png", caption: "Historic Goal" },
  { id: 11, image: "/images/player3.png", caption: "Celebrations" },
  { id: 12, image: "/images/how-it-works-bg.jpg", caption: "Iconic Moments" },
]

const EventsMemoriesSection = React.forwardRef((props, ref) => (
  <section ref={ref} className="py-20 bg-[#f5f5f7]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="text-center mb-10">
        <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-semibold text-[#0B1B32]">
          Events Memories
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-[#0B1B32]/70 text-base md:text-lg max-w-2xl mx-auto">
          Relive the unforgettable moments from our matches and events.
        </motion.p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {portfolioMemories.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="relative group rounded-md overflow-hidden shadow-sm bg-white"
          >
            <img src={item.image} alt={item.caption} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
              <p className="text-white text-lg font-medium">{item.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
))

export default EventsMemoriesSection
