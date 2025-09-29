import React from "react";
import { Link } from "react-router-dom";
import {
  SportsSoccer,
  Facebook,
  Twitter,
  Instagram,
  Phone,
  Email,
  LocationOn,
} from "@mui/icons-material";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy text-brand-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <SportsSoccer className="h-8 w-8 text-brand-light" />
              <span className="text-xl font-bold">FootballTickets</span>
            </Link>
            <p className="text-brand-gray mb-4 max-w-md">
              Your premier destination for football match tickets in Kenya.
              Experience seamless booking, secure M-Pesa payments, and digital
              ticket delivery.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-brand-gray hover:text-brand-white transition-colors"
              >
                <Facebook />
              </a>
              <a
                href="#"
                className="text-brand-gray hover:text-brand-white transition-colors"
              >
                <Twitter />
              </a>
              <a
                href="#"
                className="text-brand-gray hover:text-brand-white transition-colors"
              >
                <Instagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/matches"
                  className="text-brand-gray hover:text-brand-white transition-colors"
                >
                  Upcoming Matches
                </Link>
              </li>
              <li>
                <Link
                  to="/my-tickets"
                  className="text-brand-gray hover:text-brand-white transition-colors"
                >
                  My Tickets
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-brand-gray hover:text-brand-white transition-colors"
                >
                  How to Book
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-brand-gray hover:text-brand-white transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-brand-gray">
                <Phone className="h-4 w-4" />
                <span>+254 700 123 456</span>
              </div>
              <div className="flex items-center space-x-2 text-brand-gray">
                <Email className="h-4 w-4" />
                <span>support@footballtickets.com</span>
              </div>
              <div className="flex items-center space-x-2 text-brand-gray">
                <LocationOn className="h-4 w-4" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-gray mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-brand-gray text-sm">
            © {currentYear} FootballTickets. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-brand-gray hover:text-brand-white text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-brand-gray hover:text-brand-white text-sm transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-brand-gray hover:text-brand-white text-sm transition-colors"
            >
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
