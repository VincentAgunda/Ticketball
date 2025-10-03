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

// ++ Added two new articles
const newsArticles = [
  {
    id: 1,
    title: "Champions League Final",
    subtitle: "What to Expect.",
    image: "/images/vin3.png",
    content:
      "The UEFA Champions League Final is the pinnacle of European club football, where two of the continent's best teams battle for glory. This year's final promises to be an electrifying encounter, with tactical masterclasses and individual brilliance expected from both sides. Fans can anticipate a high-octane match, filled with dramatic moments and potential upsets. Key players will be under immense pressure to perform, and the atmosphere in the stadium will be nothing short of breathtaking. Don't miss this clash of titans!",
  },
  {
    id: 2,
    title: "Rising Stars.",
    subtitle: "Young Players to Watch.",
    image: "/images/calltoaction.png",
    content:
      "Football is constantly evolving, and a new generation of talent is emerging, ready to take the world by storm. From electrifying wingers to composed defenders, these young players are making a significant impact in their respective leagues. Keep an eye on the likes of wonderkid 'Phenom Jr.' known for his dazzling dribbling, and the midfield maestro 'Architect' who dictates play with his incredible vision. Their potential is limitless, and they are set to redefine the future of the beautiful game.",
  },
  {
    id: 3,
    title: "Behind the Scenes.",
    subtitle: "Match Day Moments.",
    image: "/images/calltoaction.png",
    content:
      "Ever wondered what goes on before, during, and after a major football match? Our exclusive 'Behind the Scenes' look reveals the meticulous preparations, the intense locker room speeches, and the raw emotions that unfold on match day. From the ground staff ensuring a perfect pitch to the coaches fine-tuning their strategies, every detail contributes to the spectacle. Experience the adrenaline of the tunnel walk, the roar of the crowd, and the celebrations (or commiserations) after the final whistle.",
  },
  {
    id: 4,
    title: "Legends of the Game.",
    subtitle: "Stories That Inspire.",
    image: "/images/vin3.png",
    content:
      "Football is rich with history and filled with unforgettable legends whose stories continue to inspire millions. From Pelé's magical touch to Maradona's 'Hand of God' and Messi's record-breaking feats, these icons have shaped the sport. This series delves into their personal journeys, their struggles, triumphs, and the moments that cemented their place in football folklore. Discover how their dedication, passion, and sheer talent transcended the game itself, leaving an indelible mark on generations.",
  },
  {
    id: 5,
    title: "Transfers 2025.",
    subtitle: "Big Moves Ahead.",
    image: "/images/vin3.png",
    content:
      "The transfer window for 2025 is already generating buzz, with rumors swirling about potential blockbuster moves that could reshape top teams. Clubs are strategizing to strengthen their squads, and players are looking for new challenges or lucrative contracts. Will a superstar forward switch allegiances? Will a promising midfielder make a surprise move? We analyze the financial implications, the tactical fits, and the ripple effects these transfers could have across the footballing landscape. Stay tuned for all the breaking news!",
  },
  {
    id: 6,
    title: "Next Gen Coaches.",
    subtitle: "Changing Football.",
    image: "/images/vin3.png",
    content:
      "A new breed of tacticians is emerging, bringing fresh ideas and innovative approaches to football management. These 'Next Gen Coaches' are challenging traditional methodologies, focusing on data analytics, psychological conditioning, and fluid systems. Discover how their forward-thinking philosophies are revolutionizing training sessions, match strategies, and player development. They are not just winning games; they are changing the very fabric of how football is played and perceived.",
  },
  {
    id: 7,
    title: "Training Insights.",
    subtitle: "Secrets from Pros.",
    image: "/images/football.png",
    content:
      "Ever wondered how professional footballers maintain peak performance? Our 'Training Insights' segment uncovers the rigorous routines, specialized drills, and dietary secrets that keep elite athletes at the top of their game. From high-intensity interval training to recovery protocols and mental conditioning, every aspect is meticulously planned. Learn directly from top pros and their coaches about the dedication required to excel, and gain tips you can apply to your own fitness journey.",
  },
  {
    id: 8,
    title: "Fan Culture.",
    subtitle: "The Heart of the Game.",
    image: "/images/calltoaction.png",
    content:
      "Football is nothing without its fans. From the passionate chants echoing in stadiums to the vibrant displays of tifo and unwavering support through thick and thin, 'Fan Culture' is the lifeblood of the sport. This article explores the unique traditions, rivalries, and camaraderie that define supporter groups around the world. We celebrate the incredible energy and dedication of fans who travel miles, brave all weather, and create an atmosphere that truly makes football 'the beautiful game'.",
  },
  {
    id: 9,
    title: "Tactical Evolutions.",
    subtitle: "The Modern Game.",
    image: "/images/news/tactics.png",
    content:
      "From the high press to inverted full-backs, modern football tactics are more complex than ever. This analysis breaks down the key strategic trends shaping today's game. Learn how managers adapt their formations and philosophies to counter opponents, exploit weaknesses, and control the flow of the match. We explore the data-driven decisions and innovative coaching that lead to victory on the pitch.",
  },
  {
    id: 10,
    title: "VAR Controversy.",
    subtitle: "Tech in Football.",
    image: "/images/news/var.png",
    content:
      "Video Assistant Referee (VAR) was introduced to eliminate clear and obvious errors, but it remains one of the most debated topics in football. This feature examines the pros and cons of VAR, analyzing its impact on the pace of the game, the accuracy of decisions, and the emotional experience for players and fans alike. Is it a necessary tool for fairness or a disruptive force that undermines the referee's authority?",
  },
]

const News = () => {
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  // Effect to detect if the screen is mobile-sized
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const handleResize = () => setIsMobile(mq.matches)
    handleResize() // Set initial value
    mq.addEventListener("change", handleResize)
    return () => mq.removeEventListener("change", handleResize)
  }, [])

  // ✅ OPTIMIZATION: Use IntersectionObserver instead of onScroll event
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When a card is more than 70% visible, set it as active
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index, 10)
            setActiveIndex(index)
          }
        })
      },
      {
        root: container, // The scroll container is the viewport
        threshold: 0.7, // Trigger when 70% of the card is visible
      }
    )

    // Observe all the cards
    const cards = container.querySelectorAll(".news-card")
    cards.forEach((card) => observer.observe(card))

    // Cleanup observer on component unmount
    return () => cards.forEach((card) => observer.unobserve(card))
  }, []) // Empty dependency array ensures this runs only once

  const scrollToIndex = (index) => {
    const container = containerRef.current
    if (container) {
      const card = container.children[index]
      if (card) {
        card.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
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
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {newsArticles.map((article, index) => {
          const MotionWrapper = isMobile ? "div" : motion.div
          const motionProps = isMobile
            ? {}
            : {
                initial: { opacity: 0.5, scale: 0.9 },
                whileInView: { opacity: 1, scale: 1 },
                transition: { duration: 0.6, ease: "easeOut" },
                viewport: { amount: 0.6, once: false },
              }

          return (
            <MotionWrapper
              key={article.id}
              data-index={index} // Add data-index for the observer
              {...motionProps}
              style={{
                width: "90%",
                maxWidth: "380px",
                minHeight: "500px",
                marginLeft: index === 0 ? "5%" : "0",
                marginRight: "2.5%",
              }}
              // ✅ OPTIMIZATION: Added 'news-card' class for the observer to target
              className={`news-card relative rounded-3xl overflow-hidden flex-shrink-0 snap-center flex flex-col justify-between p-6 shadow-md ${
                bgShades[index % bgShades.length]
              }`}
            >
              <div>
                <h3 className="text-3xl font-semibold leading-snug">
                  {article.title}
                </h3>
                <p className="text-lg sm:text-xl font-medium mt-2 opacity-90">
                  {article.subtitle}
                </p>
              </div>

              <div className="flex items-center justify-center flex-1 relative">
                <img
                  src={article.image}
                  alt={article.title}
                  // ✅ OPTIMIZATION: Lazy load images for better scroll performance
                  loading="lazy"
                  decoding="async"
                  className="h-full object-contain drop-shadow-xl"
                />
              </div>

              <button
                onClick={() => setSelected(article)}
                className="absolute bottom-5 right-5 w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold text-lg border-current hover:bg-current hover:text-white transition transform hover:scale-110"
              >
                <Plus size={22} strokeWidth={3} />
              </button>
            </MotionWrapper>
          )
        })}
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
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Expanded Modal Card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: "100vh" }}
              animate={{ y: 0 }}
              exit={{ y: "100vh" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="relative bg-white rounded-none w-full h-full overflow-y-auto shadow-2xl"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition z-10"
              >
                <X size={20} strokeWidth={3} />
              </button>
              <div className="p-8 max-w-4xl mx-auto">
                <h3 className="text-4xl font-semibold mb-4">
                  {selected.title}
                </h3>
                <p className="text-xl font-medium mb-6 opacity-90">
                  {selected.subtitle}
                </p>
                <img
                  src={selected.image}
                  alt={selected.title}
                  // ✅ OPTIMIZATION: Also lazy load the modal image
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover mb-8 rounded-lg shadow-md"
                />
                <p className="text-lg leading-relaxed text-gray-700">
                  {selected.content}
                </p>
                <div className="mt-10 pt-6 border-t border-gray-200 text-sm text-gray-500">
                  Published: October 03, 2025
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default News