import React, { useRef, useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"

// Color palette
const cardColors = [
  { bg: "#000000", text: "text-white", button: "light" }, // Black
  { bg: "#F5F5F7", text: "text-black", button: "dark" }, // Off-white
  { bg: "#979797", text: "text-white", button: "light" }, // Medium Grey
  { bg: "#fafafa", text: "text-black", button: "dark" }, // Light Grey
]

// Players data
const players = [
  {
    id: 1,
    name: "John Mark",
    role: "Forward",
    image: "/images/player3.png",
    description:
      "John is a prolific goal-scorer known for his exceptional speed, agility, and precise finishing in front of the goal.",
    ...cardColors[0],
  },
  {
    id: 2,
    name: "David Odhiambo",
    role: "Goalkeeper",
    image: "/images/vin3.png",
    description:
      "David is a rock-solid goalkeeper with incredible reflexes, a commanding presence in the box, and excellent distribution skills.",
    ...cardColors[1],
  },
  {
    id: 3,
    name: "Chris Johnson",
    role: "Midfielder",
    image: "/images/player3.png",
    description:
      "Chris is a creative midfielder who dictates the tempo of the game. He possesses fantastic vision and a wide passing range.",
    ...cardColors[2],
  },
  {
    id: 4,
    name: "Michael Riss",
    role: "Defender",
    image: "/images/hero2.png",
    description:
      "Michael is a versatile defender, strong in the tackle and intelligent in his positioning. A true leader at the back.",
    ...cardColors[3],
  },
  {
    id: 5,
    name: "Samuel King",
    role: "Winger",
    image: "/images/player3.png",
    description:
      "Samuel's lightning pace and dazzling dribbling skills make him a constant threat on the flanks, delivering pin-point crosses.",
    ...cardColors[0],
  },
  {
    id: 6,
    name: "Alex Carter",
    role: "Striker",
    image: "/images/how-it-works2-bg.png",
    description:
      "Alex is a classic number nine, strong, and a natural finisher. He excels at holding up play and bringing teammates into the game.",
    ...cardColors[1],
  },
  {
    id: 7,
    name: "Ryan Brooks",
    role: "Midfielder",
    image: "/images/player3.png",
    description:
      "Ryan is a tireless box-to-box midfielder, known for his high work rate, tough tackling, and late runs into the penalty area.",
    ...cardColors[2],
  },
  {
    id: 8,
    name: "Ethan Hunt",
    role: "Defender",
    image: "/images/how-it-works2-bg.png",
    description:
      "Ethan is a modern-day full-back, balancing solid defensive duties with adventurous attacking overlaps to support the winger.",
    ...cardColors[3],
  },
  {
    id: 9,
    name: "Leo Garcia",
    role: "Forward",
    image: "/images/player3.png",
    description:
      "Leo is a technically gifted forward who loves to cut inside. His low center of gravity and quick feet make him a nightmare for defenders.",
    ...cardColors[0],
  },
]

// Modal Component
const PlayerModal = ({ player, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose} // Click on backdrop closes the modal
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent content click from closing modal
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100/80 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors z-20"
          aria-label="Close player details"
        >
          <X size={20} />
        </button>

        {/* Player Image Area */}
        <div
          className="relative h-64 w-full"
          style={{ backgroundColor: player.bg }} // Use player's card bg
        >
          <img
            src={player.image}
            alt={player.name}
            className="w-full h-full object-contain object-bottom"
          />
        </div>

        {/* Player Info */}
        <div className="p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">{player.role}</p>
          <h3 className="text-3xl font-semibold text-black mb-3">
            {player.name}
          </h3>
          <p className="text-base text-gray-700 leading-relaxed">
            {player.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Component
const TalentsSection = React.memo(() => {
  const carouselRef = useRef(null)
  const [active, setActive] = useState(0)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

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

  const handlePrev = useCallback(
    () => scrollToIndex(Math.max(0, active - 1)),
    [active, scrollToIndex]
  )
  const handleNext = useCallback(
    () => scrollToIndex(Math.min(players.length - 1, active + 1)),
    [active, scrollToIndex]
  )

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
                className="snap-center relative rounded-2xl overflow-hidden h-[420px] group cursor-pointer" // <-- ADDED cursor-pointer
                style={{
                  backgroundColor: player.bg,
                }}
                role="button" // <-- ADDED for accessibility
                tabIndex={0} // <-- ADDED for accessibility
                onClick={() => setSelectedPlayer(player)} // <-- ADDED (card is clickable)
                onKeyDown={(e) => {
                  // <-- ADDED for accessibility
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setSelectedPlayer(player)
                  }
                }}
                aria-label={`View details for ${player.name || player.caption} - ${
                  player.role || ""
                }`}
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
                  onClick={(e) => {
                    e.stopPropagation() // <-- Stop click from bubbling to card
                    setSelectedPlayer(player)
                  }}
                  className={`absolute bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg ${
                    player.button === "dark"
                      ? "bg-black text-white" // <-- MODIFIED: Deeper color
                      : "bg-white text-black" // <-- MODIFIED: Deeper color
                  } hover:scale-110 focus:opacity-100`}
                >
                  <Plus size={18} strokeWidth={3} />
                  {/* <-- MODIFIED: Bold icon */}
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
                  className={`w-2.5 h-2.5 rounded-full ${
                    idx === active ? "bg-[#0B1B32]" : "bg-gray-300"
                  }`}
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

      {/* Modal Rendering */}
      <AnimatePresence>
        {selectedPlayer && (
          <PlayerModal
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
})

export default TalentsSection