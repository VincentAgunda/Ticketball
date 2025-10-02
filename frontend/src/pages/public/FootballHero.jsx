// src/components/FootballHero.jsx
import React from "react"

const FootballHero = () => {
  return (
    <section className="w-full bg-[#f5f5f7] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-8 text-center">
          Take a closer look.
        </h2>

        <div className="relative rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#e5e5e5] via-[#dcdcdc] to-[#ff7f11] p-10 md:p-16">
          {/* LEFT SIDE */}
          <div className="max-w-xl text-center md:text-left space-y-6">
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
              A Guided Tour of<br />
              Kenyan Premier League Matches,<br />
              National Team Fixtures,<br />
              and Stadium Experiences
            </h3>
            <button className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition">
              Watch the film
            </button>
          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="mt-10 md:mt-0 md:ml-12 flex-shrink-0">
            <img
              src="/images/football.png" // <-- your transparent PNG goes here
              alt="Kenyan Football"
              className="w-[320px] md:w-[420px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default FootballHero
