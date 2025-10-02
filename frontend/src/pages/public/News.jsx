// src/pages/public/News.jsx
import React, { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X } from "lucide-react"

const appleFont = {
  fontFamily:
    '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

// ✅ Premium Apple-style backgrounds
const bgShades = [
  "bg-black text-white",
  "bg-white text-black",
  "bg-[#f5f5f7] text-black",
  "bg-[#fafafa] text-black",
  "bg-[#fefefe] text-black",
]

const newsArticles = [
  {
    id: 1,
    title: "Champions League Final",
    subtitle: "What to Expect.",
    image: "/images/vin3.png",
  },
  {
    id: 2,
    title: "Rising Stars.",
    subtitle: "Young Players to Watch.",
    image: "/images/vin3.png",
  },
  {
    id: 3,
    title: "Behind the Scenes.",
    subtitle: "Match Day Moments.",
    image: "/images/vin3.png",
  },
  {
    id: 4,
    title: "Legends of the Game.",
    subtitle: "Stories That Inspire.",
    image: "/images/vin3.png",
  },
  {
    id: 5,
    title: "Transfers 2025.",
    subtitle: "Big Moves Ahead.",
    image: "/images/vin3.png",
  },
  {
    id: 6,
    title: "Next Gen Coaches.",
    subtitle: "Changing Football.",
    image: "/images/vin3.png",
  },
  {
    id: 7,
    title: "Training Insights.",
    subtitle: "Secrets from Pros.",
    image: "/images/vin3.png",
  },
  {
    id: 8,
    title: "Fan Culture.",
    subtitle: "The Heart of the Game.",
    image: "/images/vin3.png",
  },
]

const News = () => {
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selected, setSelected] = useState(null) // For expanded card modal

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Note: This scroll logic assumes each card takes up the full container width.
    // For a more accurate implementation, you might need to calculate the width of each card + its margin.
    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const width = container.offsetWidth
      const index = Math.round(scrollLeft / width)
      setActiveIndex(index)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToIndex = (index) => {
    const container = containerRef.current
    if (!container) return
    const width = container.offsetWidth
    container.scrollTo({
      left: width * index,
      behavior: "smooth",
    })
  }

  return (
    <section
      className="w-full min-h-screen bg-[#f5f5f7] py-20"
      style={appleFont}
      id="news"
    >
      <h2 className="text-5xl font-semibold tracking-tight text-center mb-16">
        Get to know Football.
      </h2>

      {/* Scrollable Apple-style cards */}
      <div
        ref={containerRef}
        // MODIFICATION: Removed `px-6` to make the container full-bleed edge-to-edge.
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {newsArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            // MODIFICATION: Added conditional margins for a full-bleed layout.
            // - ml-6 on the first item for initial padding.
            // - mr-5 for the gap between items.
            // - mr-6 on the last item for end padding.
            className={`relative rounded-3xl overflow-hidden flex-shrink-0 snap-center flex flex-col justify-between p-6 shadow-md ${
              bgShades[index % bgShades.length]
            } ${index === 0 ? "ml-6" : ""} ${
              index === newsArticles.length - 1 ? "mr-6" : "mr-5"
            }`}
            style={{
              width: "90%",
              maxWidth: "380px",
              minHeight: "500px",
              // MODIFICATION: Removed marginRight from here to be handled by className.
            }}
          >
            {/* Title */}
            <div>
              <h3 className="text-3xl font-semibold leading-snug">
                {article.title}
              </h3>
              <p className="text-lg sm:text-xl font-medium mt-2 opacity-90">
                {article.subtitle}
              </p>
            </div>

            {/* Floating image */}
            <div className="flex items-center justify-center flex-1 relative">
              <img
                src={article.image}
                alt={article.title}
                className="max-h-[60%] object-contain drop-shadow-xl"
              />
            </div>

            {/* Bold Plus button */}
            <button
              onClick={() => setSelected(article)}
              className="absolute bottom-5 right-5 w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold text-lg border-current hover:bg-current hover:text-white transition transform hover:scale-110"
            >
              <Plus size={22} strokeWidth={3} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-10 gap-2">
        {newsArticles.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            className={`w-3 h-3 rounded-full transition ${
              activeIndex === idx ? "bg-black" : "bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Expanded Modal Card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition"
              >
                <X size={20} strokeWidth={3} />
              </button>
              <h3 className="text-3xl font-semibold mb-4">
                {selected.title}
              </h3>
              <p className="text-lg mb-6">{selected.subtitle}</p>
              <img
                src={selected.image}
                alt={selected.title}
                className="w-full max-h-[300px] object-contain drop-shadow-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default News