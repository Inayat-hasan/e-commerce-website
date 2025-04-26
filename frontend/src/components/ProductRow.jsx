import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Product from "./Product";

const ProductRow = ({ title, products, viewAllLink, handleProductClick }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftShadow(scrollLeft > 0);
      setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 280 : 560; // Responsive scroll amount
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 280 : 560; // Responsive scroll amount
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6 px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex-1">
          {title}
        </h2>
        <Link
          to={viewAllLink}
          className="text-sm sm:text-base text-teal-600 hover:text-teal-700 font-medium transition-colors flex items-center gap-2"
        >
          View All
          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
        </Link>
      </div>

      {/* Product Row Container */}
      <div className="relative">
        {/* Shadow Indicators */}
        {showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
        )}
        {showRightShadow && (
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />
        )}

        {/* Navigation Buttons */}
        <button
          onClick={scrollLeft}
          className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 sm:p-3 z-20 shadow-lg border transition-all duration-300 ${
            showLeftShadow
              ? "opacity-90 translate-x-0"
              : "opacity-0 -translate-x-4 pointer-events-none"
          }`}
          aria-label="Scroll left"
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className="text-xs sm:text-sm"
          />
        </button>

        <button
          onClick={scrollRight}
          className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 sm:p-3 z-20 shadow-lg border transition-all duration-300 ${
            showRightShadow
              ? "opacity-90 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
          aria-label="Scroll right"
        >
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-xs sm:text-sm"
          />
        </button>

        {/* Products Container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory pb-4 px-4 sm:px-0"
          onScroll={handleScroll}
        >
          <div className="flex gap-4 sm:gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="flex-none w-[160px] xs:w-[200px] sm:w-[220px] md:w-[240px] lg:w-[280px] snap-start"
              >
                <Product
                  product={product}
                  handleProductClick={handleProductClick}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRow;
