import React, { useState, useRef, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Banners = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState([]);

  const banners = [
    {
      url: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3",
      navigationUrl:
        "/category/products/electronics?page=1&limit=12&sort=latest",
      title: "Latest Electronics",
      subtitle: "Up to 40% off on premium gadgets",
    },
    {
      url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3",
      navigationUrl: "/category/products/fashion?page=1&limit=12&sort=latest",
      title: "Fashion Week",
      subtitle: "Explore trending styles",
    },
    {
      url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3",
      navigationUrl: "/category/products/gadgets?page=1&limit=12&sort=latest",
      title: "Smart Gadgets",
      subtitle: "Transform your lifestyle",
    },
    {
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3",
      navigationUrl: "/category/products/groceries?page=1&limit=12&sort=latest",
      title: "Fresh Groceries",
      subtitle: "Daily essentials at best prices",
    },
  ];

  const totalBanners = banners.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalBanners);
    setIsPaused(true);
  }, [totalBanners]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? totalBanners - 1 : prev - 1));
    setIsPaused(true);
  }, [totalBanners]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.touches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
      touchStartX.current = null;
      setIsPaused(true);
    }
  };

  const handleNavigate = () => {
    navigate(banners[currentIndex].navigationUrl);
  };

  useEffect(() => {
    if (!isPaused && !isHovered) {
      const interval = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % totalBanners);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [nextSlide, isPaused, isHovered, totalBanners]);

  useEffect(() => {
    if (isPaused) {
      const timeout = setTimeout(() => setIsPaused(false), 10000);
      return () => clearTimeout(timeout);
    }
  }, [isPaused]);

  useEffect(() => {
    banners.forEach((banner, index) => {
      const img = new Image();
      img.src = banner.url;
      img.onload = () => {
        setLoadedImages((prev) => [...prev, index]);
      };
    });
  }, []);

  return (
    <div className="relative w-full bg-gradient-to-b from-gray-100 to-white py-4">
      <div
        className="relative w-[94%] sm:w-[96%] md:w-[97%] lg:w-[98%] xl:w-[98%] mx-auto overflow-hidden rounded-2xl shadow-lg group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full" style={{ paddingBottom: "45%" }}>
          <AnimatePresence initial={false} mode="popLayout">
            {loadedImages.includes(currentIndex) && (
              <motion.div
                key={currentIndex}
                className="absolute inset-0"
                initial={{
                  x: direction === 1 ? "100%" : "-100%",
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                }}
                exit={{
                  x: direction === 1 ? "-100%" : "100%",
                  opacity: 0,
                }}
                transition={{
                  type: "tween",
                  duration: 0.5,
                  ease: "easeInOut",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
                <img
                  src={banners[currentIndex].url}
                  alt={`Banner ${currentIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  onClick={handleNavigate}
                  draggable={false}
                />
                <div className="absolute inset-0 z-20 flex items-center justify-start p-8 sm:p-12 md:p-16">
                  <div className="text-white max-w-xl">
                    <motion.h2
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {banners[currentIndex].title}
                    </motion.h2>
                    <motion.p
                      className="text-sm sm:text-base md:text-lg text-gray-200"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {banners[currentIndex].subtitle}
                    </motion.p>
                    <motion.button
                      className="mt-4 sm:mt-6 px-6 py-2 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center group"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      onClick={handleNavigate}
                    >
                      Shop Now
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="ml-2 group-hover:translate-x-1 transition-transform"
                      />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="hidden sm:block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/90 text-white hover:text-gray-900 p-3 rounded-full transition-all duration-300 transform hover:scale-110 z-30 backdrop-blur-sm"
              aria-label="Previous Slide"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/90 text-white hover:text-gray-900 p-3 rounded-full transition-all duration-300 transform hover:scale-110 z-30 backdrop-blur-sm"
              aria-label="Next Slide"
            >
              <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full z-30">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                  setIsPaused(true);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "w-6 bg-white"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banners;
