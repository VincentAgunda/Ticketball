// src/components/Footer.jsx
import React from "react"
import { Link } from "react-router-dom"
import {
  SportsSoccer,
  Facebook,
  Twitter,
  Instagram,
  Phone,
  Email,
  LocationOn,
} from "@mui/icons-material"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#000000] text-zinc-300 mt-20 font-['SF Pro Display','SF Pro Text',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
      
              <span className="text-2xl font-semibold text-white">
                Ticket Masters
              </span>
            </Link>
            <p className="text-zinc-400 text-sm mb-8 max-w-md leading-relaxed">
              Your premier destination for football match tickets in Kenya.
              Experience seamless booking, secure M-Pesa payments, and digital
              ticket delivery.
            </p>
            <div className="flex space-x-5">
              <a
                href="#"
                aria-label="Facebook"
                className="text-zinc-500 hover:text-white transition-colors duration-300"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-zinc-500 hover:text-white transition-colors duration-300"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-zinc-500 hover:text-white transition-colors duration-300"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/matches"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-300"
                >
                  Upcoming Matches
                </Link>
              </li>
              <li>
                <Link
                  to="/my-tickets"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-300"
                >
                  My Tickets
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-300"
                >
                  How to Book
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-300"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">
              Legal
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-300"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-300"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-300"
                >
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">
              Contact Us
            </h3>
            <div className="space-y-4">
              <a
                href="tel:+254700123456"
                className="flex items-center space-x-3 text-sm text-zinc-400 hover:text-white transition-colors duration-300 group"
              >
                <Phone className="h-5 w-5 text-zinc-500 group-hover:text-white" />
                <span>+254 792 823 182</span>
              </a>
              <a
                href="mailto:support@footballtickets.com"
                className="flex items-center space-x-3 text-sm text-zinc-400 hover:text-white transition-colors duration-300 group"
              >
                <Email className="h-5 w-5 text-zinc-500 group-hover:text-white" />
                <span>support@footballtickets.com</span>
              </a>
              <div className="flex items-center space-x-3 text-sm text-zinc-400">
                <LocationOn className="h-5 w-5 text-zinc-500" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 mt-16 pt-8 flex justify-between items-center">
          <p className="text-zinc-500 text-sm">
            © {currentYear} FootballTickets. All rights reserved.
          </p>
          {/* Note: Legal links moved to their own column, 
              but you could keep them here if you prefer */}
        </div>
      </div>
    </footer>
  )
}

export default Footer