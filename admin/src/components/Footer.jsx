import React, { useEffect, useState } from "react";
import { useAppSelector } from "../redux/hooks";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/reducers/sidebar/sidebarSelector";
import {
  ChevronUp,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLargeScreen = useAppSelector(selectIsLargeScreen);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer
      className={`bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 ${
        isSideBarOpened && isLargeScreen ? "ml-72" : "w-full"
      }`}
    >
      {/* Top Scroll Button */}
      <div className="w-full flex justify-center items-center border-t-2 border-gray-200">
        <button
          className="text-teal-600 py-1.5 md:py-2 w-full hover:bg-gray-200/80 bg-gray-100 font-semibold text-base md:text-lg dark:bg-teal-400/20 dark:hover:bg-gray-700/80 transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Back To Top
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="space-y-4 md:pr-4">
            <Link to="/" className="inline-block">
              <div className="relative group bg-teal-600 dark:bg-teal-900 px-3 py-1.5 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <span className="font-serif text-xl font-bold text-white">
                    Lushkart
                  </span>
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
              </div>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              Premium quality products with sustainable sourcing and exceptional
              customer service.
            </p>
            <div className="flex space-x-3">
              {["facebook", "twitter", "instagram", "linkedin"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    aria-label={`Follow us on ${social}`}
                  >
                    <i className={`fab fa-${social} text-lg md:text-xl`} />
                  </a>
                )
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-4 md:mt-0">
            <h4 className="text-lg font-semibold mb-3 md:mb-4 dark:text-white">
              Quick Links
            </h4>
            <nav className="grid grid-cols-2 gap-2 md:gap-3">
              {[
                "New Arrivals",
                "Best Sellers",
                "Sale",
                "About Us",
                "Blog",
                "Careers",
              ].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-600 hover:text-teal-600 dark:hover:text-teal-400 text-sm md:text-base transition-colors"
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="mt-6 md:mt-0">
            <h4 className="text-lg font-semibold mb-3 md:mb-4 dark:text-white">
              Contact Us
            </h4>
            <address className="not-italic space-y-2 md:space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="flex-shrink-0 mt-1 w-4 h-4 md:w-5 md:h-5" />
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  123 Green Avenue
                  <br />
                  New York, NY 10001
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
                <a
                  href="mailto:info@lushkart.com"
                  className="text-gray-600 hover:text-teal-600 dark:hover:text-teal-400 text-sm md:text-base transition-colors"
                >
                  info@lushkart.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 md:w-5 md:h-5" />
                <a
                  href="tel:+11234567890"
                  className="text-gray-600 hover:text-teal-600 dark:hover:text-teal-400 text-sm md:text-base transition-colors"
                >
                  (123) 456-7890
                </a>
              </div>
            </address>
          </div>

          {/* Newsletter */}
          <div className="mt-6 md:mt-0">
            <h4 className="text-lg font-semibold mb-3 md:mb-4 dark:text-white">
              Newsletter
            </h4>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm md:text-base rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
              >
                <Heart className="w-4 h-4 md:w-5 md:h-5" />
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 md:mt-12 pt-6 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Lushkart. All rights reserved.
          </p>
          <div className="flex space-x-3 md:space-x-4">
            <a
              href="#"
              className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 text-sm transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>

      {showScrollButton && (
        <button
          className="fixed bottom-4 right-4 z-50 p-2 bg-teal-600/90 hover:bg-teal-700 text-white rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-105"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}
    </footer>
  );
};

export default Footer;
