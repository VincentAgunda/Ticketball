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
    <footer className="bg-[#15291c] text-[#f5f5f7] mt-16 font-['SF Pro Display','SF Pro Text',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <SportsSoccer className="h-8 w-8 text-[#d1d5db]" />
              <span className="text-2xl font-semibold">FootballTickets</span>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Your premier destination for football match tickets in Kenya.  
              Experience seamless booking, secure M-Pesa payments, and digital ticket delivery.
            </p>
            <div className="flex space-x-5">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <Facebook />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <Twitter />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <Instagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/matches"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Upcoming Matches
                </Link>
              </li>
              <li>
                <Link
                  to="/my-tickets"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  My Tickets
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  How to Book
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Contact Us
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-5 w-5" />
                <span>+254 700 123 456</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Email className="h-5 w-5" />
                <span>support@footballtickets.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <LocationOn className="h-5 w-5" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} FootballTickets. All rights reserved.
          </p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
            >
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
