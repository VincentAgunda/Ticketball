// src/pages/public/News.jsx
import React from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"

const appleFont = {
  fontFamily:
    '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const newsArticles = [
  {
    id: 1,
    title: "Champions League Final",
    subtitle: "What to Expect.",
    image: "/images/news/champions-league.png", // transparent PNG
    bg: "bg-black text-white",
  },
  {
    id: 2,
    title: "Rising Stars.",
    subtitle: "Young Players to Watch.",
    image: "/images/news/rising-stars.png",
    bg: "bg-white text-black",
  },
  {
    id: 3,
    title: "Behind the Scenes.",
    subtitle: "Match Day Moments.",
    image: "/images/news/behind-scenes.png",
    bg: "bg-black text-white",
  },
  {
    id: 4,
    title: "Rising Stars.",
    subtitle: "Young Players to Watch.",
    image: "/images/news/rising-stars.png",
    bg: "bg-white text-black",
  },
  {
    id: 5,
    title: "Rising Stars.",
    subtitle: "Young Players to Watch.",
    image: "/images/news/rising-stars.png",
    bg: "bg-white text-black",
  },
  {
    id: 6,
    title: "Rising Stars.",
    subtitle: "Young Players to Watch.",
    image: "/images/news/rising-stars.png",
    bg: "bg-white text-black",
  },
]

const News = () => {
  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      style={appleFont}
      id="news"
    >
      <h2 className="text-4xl font-bold tracking-tight text-center mb-14">
        Get to know Football.
      </h2>

      {/* Horizontal Apple-style scroll */}
      <div className="flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-hide">
        {newsArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            viewport={{ once: true }}
            className={`relative rounded-3xl overflow-hidden flex-shrink-0 snap-center flex flex-col justify-between p-6 ${article.bg}`}
            style={{ width: "320px", minHeight: "420px" }}
          >
            {/* Title */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold leading-snug">
                {article.title}
              </h3>
              <p className="text-lg sm:text-xl font-medium mt-1 opacity-90">
                {article.subtitle}
              </p>
            </div>

            {/* Floating image */}
            <div className="flex items-center justify-center flex-1 relative">
              <img
                src={article.image}
                alt={article.title}
                className="max-h-56 object-contain drop-shadow-xl"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>

            {/* Plus button */}
            <button className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-current hover:bg-current hover:text-white transition">
              <Plus size={18} />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default News
