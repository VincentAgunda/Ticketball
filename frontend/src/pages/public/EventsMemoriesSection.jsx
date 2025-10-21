import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const portfolioMemories = [
  { id: 1, image: "/images/how-it-works1-bg.png", caption: "Championship Glory" },
  { id: 2, image: "/images/home1.png", caption: "Fans in Action" },
  { id: 3, image: "/images/hero.png", caption: "Team Spirit" },
  { id: 4, image: "/images/how-it-works1-bg.png", caption: "Historic Goal" },
  { id: 5, image: "/images/home.png", caption: "Celebrations" },
  { id: 6, image: "/images/how-it-works-bg.jpg", caption: "Iconic Moments" },
  { id: 7, image: "/images/how-it-works1-bg.png", caption: "Match Highlights" },
  { id: 8, image: "/images/player3.png", caption: "Unstoppable Energy" },
  { id: 9, image: "/images/how-it-works-bg.jpg", caption: "Legendary Night" },
  { id: 10, image: "/images/how-it-works1-bg.png", caption: "Final Victory" },
  { id: 11, image: "/images/player3.png", caption: "Pure Passion" },
  { id: 12, image: "/images/how-it-works1-bg.png", caption: "Iconic Moments" },
];

const EventsMemoriesSection = React.memo(() => {
  const carouselRef = useRef(null);
  const [active, setActive] = useState(0);

  // Smooth scroll to specific index
  const scrollToIndex = useCallback((index) => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector("[data-snap]");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width;
    const gap = parseFloat(getComputedStyle(el).columnGap || 24) || 24;
    const scrollLeft = index * (cardWidth + gap);
    el.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, []);

  const handlePrev = useCallback(() => scrollToIndex(Math.max(0, active - 1)), [active, scrollToIndex]);
  const handleNext = useCallback(
    () => scrollToIndex(Math.min(portfolioMemories.length - 1, active + 1)),
    [active, scrollToIndex]
  );

  // Lightweight scroll listener (optimized with rAF)
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const card = el.querySelector("[data-snap]");
        if (!card) return (ticking = false);
        const cardWidth = card.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(el).columnGap || 24) || 24;
        const index = Math.round(el.scrollLeft / (cardWidth + gap));
        setActive(index);
        ticking = false;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="py-20 bg-[#f5f5f7] font-sans relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-[#0B1B32]">
            Events & Memories
          </h2>
          <p className="text-[#0B1B32]/70 text-base md:text-lg max-w-2xl mx-auto">
            Relive the unforgettable moments from our matches and events.
          </p>
        </div>

        {/* Horizontal Carousel */}
        <div className="relative">
          <div
            ref={carouselRef}
            className="overflow-x-auto scrollbar-none snap-x snap-mandatory grid auto-cols-[minmax(280px,1fr)] md:auto-cols-[minmax(340px,1fr)] grid-flow-col gap-6 py-6"
            style={{ WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}
          >
            {portfolioMemories.map((memory) => (
              <div
                key={memory.id}
                data-snap
                className="snap-center relative rounded-2xl overflow-hidden h-[420px] group bg-white shadow-sm transition-transform duration-300 hover:scale-[1.02]"
                role="article"
                aria-label={memory.caption}
              >
                <img
                  src={memory.image}
                  alt={memory.caption}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable="false"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-5">
                  <p className="text-white text-lg font-medium">{memory.caption}</p>
                </div>

                {/* Plus Button */}
                <button
                  aria-label={`View ${memory.caption}`}
                  className="absolute bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg bg-white/80 text-black backdrop-blur-sm"
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Dots + Arrows */}
          <div className="absolute left-0 right-0 bottom-0 translate-y-12 flex items-center justify-center px-6">
            {/* Dots */}
            <div className="flex items-center space-x-2 bg-white/95 rounded-full px-4 py-2 shadow-md">
              {portfolioMemories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                    idx === active ? "bg-[#0B1B32]" : "bg-gray-300"
                  }`}
                  aria-label={`Go to memory ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="ml-auto flex space-x-2">
              <button
                onClick={handlePrev}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#f8f8f8] flex items-center justify-center shadow-md hover:scale-110 transition"
                aria-label="Previous memory"
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 transition"
                aria-label="Next memory"
              >
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default EventsMemoriesSection;
