import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Responsive, masonry-like Events / Memories gallery
// Uses CSS columns technique for a dynamic reflow similar to Apple's gallery
// Shapes: varied rectangular/square aspect ratios and subtle rotated blocks (NO triangles, NO circles)

const portfolioMemories = [
  { id: 1, image: "/images/how-it-works1-bg.png", caption: "Championship Glory" },
  { id: 2, image: "/images/home1.png", caption: "Fans in Action" },
  { id: 3, image: "/images/hero.png", caption: "Team Spirit" },
  { id: 4, image: "/images/how-it-works1-bg.png", caption: "Historic Goal" },
  { id: 5, image: "/images/home.png", caption: "Celebrations" },
  { id: 6, image: "/images/how-it-works-bg.jpg", caption: "Iconic Moments" },
  { id: 7, image: "/images/how-it-works1-bg.png", caption: "Historic Goal" },
  { id: 8, image: "/images/player3.png", caption: "Celebrations" },
  { id: 9, image: "/images/how-it-works-bg.jpg", caption: "Iconic Moments" },
  { id: 10, image: "/images/how-it-works1-bg.png", caption: "Historic Goal" },
  { id: 11, image: "/images/player3.png", caption: "Celebrations" },
  { id: 12, image: "/images/how-it-works1-bg.png", caption: "Iconic Moments" },
  
];

// SmoothImage supports blur-up placeholder and reports natural dimensions
const SmoothImage = ({ src, alt, onLoad }) => {
  const [loaded, setLoaded] = useState(false);
  const [natural, setNatural] = useState({ w: 1, h: 1 });

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setLoaded(true);
      onLoad && onLoad({ w: img.naturalWidth, h: img.naturalHeight });
    };
  }, [src, onLoad]);

  return (
    <div className="w-full h-full relative bg-gray-100 overflow-hidden">
      {/* background shimmer while loading */}
      <div
        aria-hidden
        className={`absolute inset-0 transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`}
      >
        <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      </div>

      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${loaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-80 blur-sm"}`}
      />
    </div>
  );
};

const shapeVariants = [
  // className additions controlling aspect ratios, rotation and border treatment
  "aspect-square rounded-2xl", // perfect square
  "aspect-[4/3] rounded-xl", // classic rectangle
  "aspect-[3/4] rounded-2xl", // tall card
  "aspect-[16/9] rounded-xl",
  "aspect-[5/4] rounded-3xl",
  "aspect-[7/5] rounded-xl",
];

const rotateVariants = ["", "rotate-1", "-rotate-1", "rotate-2", "-rotate-2"];

const EventsMemoriesSection = React.forwardRef((props, ref) => {
  // preload images to eliminate pop-in
  useEffect(() => {
    portfolioMemories.forEach(({ image }) => {
      const i = new Image();
      i.src = image;
    });
  }, []);

  // assign a size/shape to each item deterministically so layout is stable across renders
  const styledItems = portfolioMemories.map((item, i) => ({
    ...item,
    shapeClass: shapeVariants[i % shapeVariants.length],
    rotateClass: rotateVariants[i % rotateVariants.length],
    // give some items a larger visual weight (span simulated by taller aspect ratios)
    weight: i % 7 === 0 ? "heavy" : i % 5 === 0 ? "medium" : "regular",
  }));

  return (
    <section ref={ref} className="py-20 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-semibold text-[#0B1B32]"
          >
            Events Memories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-[#0B1B32]/70 text-base md:text-lg max-w-2xl mx-auto"
          >
            Relive the unforgettable moments from our matches and events.
          </motion.p>
        </div>

        {/* Masonry using CSS columns for true reflow */}
        <div className="masonry -mx-3">
          <div className="masonry-inner px-3">
            {styledItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, transform: "translateY(10px) scale(.99)" }}
                whileInView={{ opacity: 1, transform: "translateY(0) scale(1)" }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: "easeOut" }}
                viewport={{ once: true }}
                className={`masonry-item mb-6 break-inside-avoid ${item.rotateClass}`}
              >
                {/* we wrap each item to control its visual size using utility classes */}
                <div
                  className={`overflow-hidden bg-white shadow-sm group relative ${item.shapeClass} ${
                    item.weight === "heavy" ? "md:aspect-[4/3]" : ""
                  }`}
                >
                  <SmoothImage src={item.image} alt={item.caption} />

                  {/* Caption overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                    <p className="text-white text-sm md:text-base font-medium">{item.caption}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Local styles necessary for the masonry effect — add to global CSS if preferred */}
      <style>{`
        /* Masonry via CSS columns */
        .masonry { column-gap: 1.25rem; }
        .masonry-inner { column-count: 2; }

        @media (min-width: 768px) {
          .masonry-inner { column-count: 3; }
        }
        @media (min-width: 1024px) {
          .masonry-inner { column-count: 4; }
        }

        /* Each item should avoid breaking across columns */
        .masonry-item { display: inline-block; width: 100%; }
        .break-inside-avoid { break-inside: avoid; -webkit-column-break-inside: avoid; }

        /* Aspect ratio utilities for browsers that don't support Tailwind's aspect-* at build time
           These are fallbacks. If you're using Tailwind with aspect-ratio plugin, keep those classes instead. */
        .aspect-square { aspect-ratio: 1 / 1; }
        .aspect-\\[4/3\\] { aspect-ratio: 4 / 3; }
        .aspect-\\[3/4\\] { aspect-ratio: 3 / 4; }
        .aspect-\\[16/9\\] { aspect-ratio: 16 / 9; }
        .aspect-\\[5/4\\] { aspect-ratio: 5 / 4; }
        .aspect-\\[7/5\\] { aspect-ratio: 7 / 5; }

        /* Small rotation helpers (only subtle) */
        .rotate-1 { transform: rotate(1deg); }
        .-rotate-1 { transform: rotate(-1deg); }
        .rotate-2 { transform: rotate(2deg); }
        .-rotate-2 { transform: rotate(-2deg); }

        /* Make sure images inside rotated containers still look good */
        .masonry-item img { transform-origin: center center; }

        /* Tweak spacing for the gallery so rotated items don't overflow too much */
        .masonry-item { padding: 6px; }

      `}</style>
    </section>
  );
});

export default EventsMemoriesSection;
