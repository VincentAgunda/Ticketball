import React, { useRef, useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

// Color palette provided by user
const cardColors = [
  { bg: "#000000", text: "text-white", button: "light" }, 
  { bg: "#F5F5F7", text: "text-black", button: "dark" },
  { bg: "#979797", text: "text-white", button: "light" },  // Light Grey
  { bg: "#fafafa", text: "text-black", button: "dark" }, // Dark Grey
  // Black
  
  // Medium Grey
]

// Players data, now with colors assigned
const players = [
  { id: 1, name: "John Mark", role: "Forward", image: "/images/player3.png", ...cardColors[0] },
  { id: 2, name: "David Odhiambo", role: "Goalkeeper", image: "/images/hero2.png", ...cardColors[1] },
  { id: 3, name: "Chris Johnson", role: "Midfielder", image: "/images/player3.png", ...cardColors[2] },
  { id: 4, name: "Michael Riss", role: "Defender", image: "/images/hero2.png", ...cardColors[3] },
  { id: 5, name: "Samuel King", role: "Winger", image: "/images/player3.png", ...cardColors[0] },
  { id: 6, name: "Alex Carter", role: "Striker", image: "/images/how-it-works2-bg.png", ...cardColors[1] },
  { id: 7, name: "Ryan Brooks", role: "Midfielder", image: "/images/player3.png", ...cardColors[2] },
  { id: 8, name: "Alex Carter", role: "Striker", image: "/images/how-it-works2-bg.png", ...cardColors[1] },
  { id: 9, name: "Ryan Brooks", role: "Midfielder", image: "/images/player3.png", ...cardColors[2] },
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
         {/* Section Header */}
      <h2 className="text-5xl font-semibold tracking-tight text-center mb-16 text-black">
        Meet Our Talents.
      </h2>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={carouselRef}
            className="overflow-x-auto scrollbar-none snap-x snap-mandatory grid auto-cols-[minmax(280px,1fr)] md:auto-cols-[minmax(320px,1fr)] grid-flow-col gap-6 py-6"
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
                className="snap-center relative rounded-2xl overflow-hidden h-[420px] group"
                style={{
                  backgroundColor: player.bg, // <-- Use solid background color
                }}
                role="article"
                aria-label={`${player.name || player.caption} - ${player.role || ""}`}
              >
                {/* Text content at the top */}
                <div className={`p-6 relative z-10 ${player.text}`}>
                  {player.role && (
                    <p className={`text-sm font-medium ${player.text}/80 mb-1`}>
                      {player.role}
                    </p>
                  )}
                  {player.name && (
                    <h3 className="text-2xl md:text-3xl font-semibold">
                      {player.name}
                    </h3>
                  )}
                  {/* Handle items with only a caption */}
                  {player.caption && !player.name && (
                     <h3 className="text-2xl md:text-3xl font-semibold">
                      {player.caption}
                    </h3>
                  )}
                </div>
                
                {/* Image container (assumes transparent PNG) */}
                <div className="absolute inset-x-0 bottom-0 h-4/5 pointer-events-none">
                   <img
                    src={player.image}
                    alt={player.name || player.caption || "Player"}
                    className="w-full h-full object-contain object-bottom"
                  />
                </div>

                {/* Plus Button with dynamic colors */}
                <button
                  aria-label={`View ${player.name || "player"}`}
                  className={`absolute bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg ${
                    player.button === 'dark'
                      ? "bg-black/80 text-white backdrop-blur-sm"
                      : "bg-white/80 text-black backdrop-blur-sm"
                  }`}
                >
                  <Plus size={18} />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Dots + Arrows in one line (unchanged) */}
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