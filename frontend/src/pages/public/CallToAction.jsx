import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeScale = {
  hidden: { opacity: 0, scale: 0.96, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const CallToAction = () => {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative max-w-7xl mx-auto my-20 rounded-3xl overflow-hidden shadow-xl">
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-orange-500"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 16,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{ backgroundSize: "200% 200%", willChange: "background-position" }}
      />

      {/* Main Content */}
      <motion.div
        className="relative grid grid-cols-1 lg:grid-cols-2 items-center gap-8 px-8 py-20"
        variants={fadeScale}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Left Section */}
        <div className="flex flex-col justify-center">
          <h2 className="text-5xl font-semibold text-gray-900 mb-6 leading-tight">
            Let’s build the future of football.
          </h2>

          <p className="text-lg text-gray-800 mb-8">
            Subscribe or partner with us to create unforgettable football experiences
          </p>

          <button
            onClick={() => setOpen(true)}
            className="bg-black text-white px-8 py-3 rounded-full font-medium shadow-lg hover:scale-105 transition-transform duration-200 will-change-transform"
          >
            Partner with us
          </button>
        </div>

        {/* Right Floating Image */}
        <div className="flex justify-center lg:justify-end">
          <motion.img
            src="/images/calltoaction.png"
            alt="Promo"
            className="w-80 h-80 object-contain"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ willChange: "transform" }}
          />
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.div
        className="absolute bottom-6 left-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <button
          onClick={() => setOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 will-change-transform"
        >
          Action
        </button>
      </motion.div>

      {/* Popup Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.35, type: "spring" }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg"
            >
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                Partner With Us
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Message (Optional)
                  </label>
                  <textarea
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-black text-white font-medium hover:opacity-90"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CallToAction;
