// src/pages/public/TalentsSection.jsx
import React, { useRef, useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

// Players data
const players = [
  { id: 1, name: "John Doe", role: "Forward", image: "/images/player3.png" },
  { id: 2, name: "David Smith", role: "Goalkeeper", image: "/images/player2.png" },
  { id: 3, name: "Chris Johnson", role: "Midfielder", image: "/images/how-it-works1-bg.png" },
  { id: 4, name: "Michael Lee", role: "Defender", image: "/images/player2.png" },
  { id: 5, name: "Samuel King", role: "Winger", image: "/images/player3.png" },
  { id: 6, name: "Alex Carter", role: "Striker", image: "/images/how-it-works1-bg.png" },
  { id: 7, name: "Ryan Brooks", role: "Midfielder", image: "/images/player2.png" },
  { id: 8, image: "/images/player3.png", caption: "Celebrations" },
  { id: 9, image: "/images/how-it-works-bg.jpg", caption: "Iconic Moments" },
]

const TalentsSection = React.memo(() => {
  const carouselRef = useRef(null)
  const [active, setActive] = useState(0)

  const scrollToIndex = useCallback((index) => {
    const el = carouselRef.current
    if (!el) return
    const card = el.querySelector("[data-snap]")
    if (!card) return
    const rect = card.getBoundingClientRect()
    const cardWidth = rect.width
    const gap = parseFloat(getComputedStyle(el).columnGap || 24) || 24
    const scrollLeft = index * (cardWidth + gap)
    el.scrollTo({ left: scrollLeft, behavior: "smooth" })
  }, [])

  const handlePrev = useCallback(() => scrollToIndex(Math.max(0, active - 1)), [active, scrollToIndex])
  const handleNext = useCallback(() => scrollToIndex(Math.min(players.length - 1, active + 1)), [active, scrollToIndex])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const card = el.querySelector("[data-snap]")
        if (!card) return (ticking = false)
        const cardWidth = card.getBoundingClientRect().width
        const gap = parseFloat(getComputedStyle(el).columnGap || 24) || 24
        const index = Math.round(el.scrollLeft / (cardWidth + gap))
        setActive(index)
        ticking = false
      })
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section className="py-20 bg-[#fdfdfd] font-sans relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-6">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-semibold mb-2 text-[#0B1B32]"
          >
            Talents
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#0B1B32]/70 text-base md:text-lg max-w-2xl mx-auto"
          >
            Meet some of the stars who make every match unforgettable.
          </motion.p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={carouselRef}
            className="overflow-x-auto scrollbar-none snap-x snap-mandatory grid auto-cols-[minmax(260px,1fr)] grid-flow-col gap-6 py-6"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {players.map((player, i) => (
              <motion.div
                key={player.id + "-" + i}
                data-snap
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="snap-center relative rounded-2xl overflow-hidden h-[420px] flex flex-col justify-end group"
                style={{
                  backgroundImage: `url(${player.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                role="article"
                aria-label={`${player.name || "Player"} - ${player.role || ""}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                <div className="p-6 relative z-10">
                  {player.role && <p className="text-sm text-white/80">{player.role}</p>}
                  {player.name && <h3 className="text-2xl md:text-3xl font-semibold text-white">{player.name}</h3>}
                </div>
                <button
                  aria-label={`View ${player.name || "player"}`}
                  className="absolute bottom-6 right-6 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                >
                  <Plus size={18} />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Dots + Arrows in one line */}
          <div className="absolute left-0 right-0 bottom-0 translate-y-12 flex items-center justify-center px-6">
            {/* Dots center */}
            <div className="flex items-center space-x-2 bg-white/95 rounded-full px-4 py-2 shadow-md">
              {players.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full ${idx === active ? "bg-[#0B1B32]" : "bg-gray-300"}`}
                  aria-label={`Go to player ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows aligned right */}
            <div className="ml-auto flex space-x-2">
              <button
                onClick={handlePrev}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#f8f8f8] flex items-center justify-center shadow-md hover:scale-110 transition"
                aria-label="Previous players"
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 transition"
                aria-label="Next players"
              >
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

export default TalentsSection