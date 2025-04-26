import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import {
  faCartShopping,
  faAngleUp,
  faEnvelope,
  faPhone,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
        aria-label="Back to top"
      >
        <FontAwesomeIcon icon={faAngleUp} className="text-xl" />
      </button>

      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">
                Subscribe to our Newsletter
              </h3>
              <p className="text-gray-400">
                Stay updated with our latest offers and products
              </p>
            </div>
            <div className="w-full md:w-auto flex-1">
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo and About */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <div className="flex items-center gap-2 bg-gradient-to-r from-lime-950 to-gray-800 p-2 rounded">
                <span className="text-2xl font-serif text-[#D0CEBA]">
                  Lushkart
                </span>
                <FontAwesomeIcon
                  icon={faCartShopping}
                  className="text-[#D0CEBA]"
                />
              </div>
            </Link>
            <p className="text-gray-400">
              Your one-stop destination for all your shopping needs. Quality
              products, great prices, and excellent service.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-teal-500 transition-colors">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="#" className="hover:text-teal-500 transition-colors">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#" className="hover:text-teal-500 transition-colors">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#" className="hover:text-teal-500 transition-colors">
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="hover:text-teal-500 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-teal-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-teal-500 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-teal-500 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-teal-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/orders"
                  className="hover:text-teal-500 transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-teal-500 transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="hover:text-teal-500 transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="hover:text-teal-500 transition-colors"
                >
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="mt-1 text-teal-500"
                />
                <span>123 Shopping Street, Retail District, 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPhone} className="text-teal-500" />
                <span>+1 234 567 8900</span>
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon icon={faEnvelope} className="text-teal-500" />
                <span>support@lushkart.com</span>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-lg font-medium hover:from-teal-600 hover:to-teal-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Become an Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Lushkart. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <img src="/payment-visa.svg" alt="Visa" className="h-6" />
              <img
                src="/payment-mastercard.svg"
                alt="Mastercard"
                className="h-6"
              />
              <img src="/payment-paypal.svg" alt="PayPal" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
