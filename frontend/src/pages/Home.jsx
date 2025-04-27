import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import {
  faChevronRight,
  faChevronLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Banners from "../components/Banners";
import CategoriesBar from "../components/CategoriesBar";
import Product from "../components/Product";
import ProductPopup from "../components/ProductPopup";
import { ToastContainer, toast } from "react-toastify";
import checkBuyer from "../redux/functions/checkBuyer.js";
import { useAppDispatch, useAppSelector } from "../redux/hooks/index.js";
import { setUser } from "../redux/slices/authentication/authSlice.js";
import { selectIsLoggedIn } from "../redux/slices/authentication/authSelector.js";
import LoginPopup from "../components/LoginPopup";
import { setCartCount } from "../redux/slices/cartCount/cartCountSlice";
import fetchCartCount from "../redux/functions/fetchCartCount";
import ProductRow from "../components/ProductRow.jsx";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const serverUrl = import.meta.env.SERVER_URL;
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [showPopup, setShowPopup] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const dispatch = useAppDispatch();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [popupShownCount, setPopupShownCount] = useState(0);
  const popupTimerRef = useRef(null);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  // New state for hero section
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Hero section data
  const heroSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Summer Collection 2025",
      subtitle: "Discover the latest trends in fashion",
      link: "/category/products/fashion",
    },
    {
      image:
        "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80",
      title: "Tech Gadgets",
      subtitle: "Explore innovative technology",
      link: "/category/products/electronics",
    },
    // Add more slides as needed
  ];

  // Check screen size
  useLayoutEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // 1024px is the lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Sample product data
  const product = {
    _id: "67d199e1eb697e6ad6929aa3",
    name: "Oriental Steel Salad",
    description:
      "The Horizontal mobile moratorium Hat offers reliable performance and shy design",
    actualPrice: 464.39,
    brand: "Hilpert - Franecki",
    stock: 75,
    stockUnit: "pieces",
    admin: "67c05520634a0170758de266",
    images: [
      {
        publicId: "bdab1ebb-c744-4b3f-a5e2-6dab0bb10a97",
        url: "https://images.unsplash.com/photo-1493612276216-ee3925520721",
      },
      {
        publicId: "d77e3f66-927a-4eff-9e2f-2de677538c31",
        url: "https://loremflickr.com/1955/1936?lock=6604803886033999",
      },
      {
        publicId: "d55f297b-2c08-4aad-ab2b-03d8b44c56ac",
        url: "https://loremflickr.com/1854/1064?lock=5002704257188413",
      },
      {
        publicId: "6ea86361-593b-40ec-bb67-7d079053932d",
        url: "https://loremflickr.com/3234/2514?lock=7884969944064260",
      },
      {
        publicId: "c20d3306-cedf-49b0-ae97-0f2593ddf392",
        url: "https://picsum.photos/seed/oAqm2j/2270/252",
      },
    ],
    category: "Music",
    reviews: [],
    averageRating: 4.5,
    reviewsCount: 12,
    discountedPrice: 399.99,
    locations: ["india", "nepal", "australia", "america"],
    status: "active",
    isFeatured: false,
    __v: 0,
    createdAt: "2025-03-10T22:19:55.915Z",
    updatedAt: "2025-03-10T22:19:55.915Z",
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // Here you would typically make an API call to update the wishlist status
  };

  const handleProductClick = (clickedProduct) => {
    setSelectedProduct(clickedProduct);

    if (isLargeScreen) {
      setShowPopup(true);
    } else {
      navigate(`/product/${clickedProduct.originalId || product._id}`);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const getRandomInterval = () => {
    return Math.floor(Math.random() * (15 - 5 + 1) + 5) * 60 * 1000;
  };

  useEffect(() => {
    if (!isLoggedIn && popupShownCount < 3) {
      const scheduleNextPopup = () => {
        const interval = getRandomInterval();
        popupTimerRef.current = setTimeout(() => {
          setShowLoginPopup(true);
          setPopupShownCount((prev) => prev + 1);
          if (popupShownCount < 2) {
            // Schedule next only if under limit
            scheduleNextPopup();
          }
        }, interval);
      };

      scheduleNextPopup();

      return () => {
        if (popupTimerRef.current) {
          clearTimeout(popupTimerRef.current);
        }
      };
    }
  }, [isLoggedIn, popupShownCount]);

  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };

  useEffect(() => {
    if (showLoginPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [showLoginPopup]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch user data
        const { buyer } = await checkBuyer();
        if (buyer) {
          dispatch(setUser(buyer));
          // Fetch cart count after confirming user is logged in
          const { cartCount } = await fetchCartCount();
          dispatch(setCartCount(cartCount));
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, [dispatch]);

  const fetchNewArrivals = async () => {
    const req = await axios.get(
      `${serverUrl}/api/product/buyer/get-latest-products`,
      {
        params: { limit: 12, page: 1, sort: "latest" },
      }
    );
    setNewArrivals(req.data.data.products);
  };

  const fetchFeaturedProducts = async () => {
    const req = await axios.get(
      `${serverUrl}/api/product/buyer/get-featured-products`,
      {
        params: { limit: 12, page: 1, sort: "latest" },
      }
    );
    setFeaturedProducts(req.data.data.products);
  };

  const fetchBestSellingProducts = async () => {
    const req = await axios.get(
      `${serverUrl}/api/product/buyer/get-best-selling-products`,
      {
        params: { limit: 12, page: 1, sort: "latest" },
      }
    );
    setTopSellingProducts(req.data.data.products);
  };

  // Loading state handler
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchNewArrivals(),
          fetchFeaturedProducts(),
          fetchBestSellingProducts(),
        ]);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const nextHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevHeroSlide = () => {
    setCurrentHeroSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  useEffect(() => {
    const timer = setInterval(nextHeroSlide, 5000); // Auto-advance slides
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <CategoriesBar />

      {/* Hero Section with Banners */}
      <Banners />

      {/* Product Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Promotional Banners - Shop by Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="relative overflow-hidden rounded-2xl group cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600"
            onClick={() =>
              navigate(
                "/category/products/electronics?page=1&limit=12&sort=latest"
              )
            }
          >
            <div className="absolute inset-0 bg-black/10 z-10" />
            <img
              src="https://images.unsplash.com/photo-1593344484569-6fddb31245fd?ixlib=rb-4.0.3"
              alt="Electronics Sale"
              className="w-full h-80 object-cover mix-blend-overlay opacity-75"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 text-white">
              <span className="text-sm font-medium tracking-wider uppercase mb-2">
                New Arrivals
              </span>
              <h3 className="text-3xl font-bold mb-2">Tech Essentials</h3>
              <p className="text-lg mb-4 text-gray-100">
                Up to 40% off on premium gadgets
              </p>
              <button className="bg-white/90 hover:bg-white text-gray-900 w-max px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center group">
                Explore Now
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl group cursor-pointer bg-gradient-to-r from-teal-600 to-emerald-600"
            onClick={() =>
              navigate("/category/products/fashion?page=1&limit=12&sort=latest")
            }
          >
            <div className="absolute inset-0 bg-black/10 z-10" />
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3"
              alt="Fashion Sale"
              className="w-full h-80 object-cover mix-blend-overlay opacity-75"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 text-white">
              <span className="text-sm font-medium tracking-wider uppercase mb-2">
                Trending Now
              </span>
              <h3 className="text-3xl font-bold mb-2">Fashion Week</h3>
              <p className="text-lg mb-4 text-gray-100">
                New styles added daily
              </p>
              <button className="bg-white/90 hover:bg-white text-gray-900 w-max px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center group">
                Shop Collection
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Why Shop With Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🚚",
                title: "Free Delivery",
                description: "On orders above ₹500",
                bgColor: "bg-blue-50",
              },
              {
                icon: "🔒",
                title: "Secure Payment",
                description: "100% secure transactions",
                bgColor: "bg-green-50",
              },
              {
                icon: "↩️",
                title: "Easy Returns",
                description: "30-day return policy",
                bgColor: "bg-yellow-50",
              },
              {
                icon: "💬",
                title: "24/7 Support",
                description: "Dedicated support team",
                bgColor: "bg-purple-50",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`${feature.bgColor} rounded-xl p-6 transition-transform hover:-translate-y-1 duration-300`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          // Skeleton loading state with improved animation
          <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-4">
                      <div className="aspect-square bg-gray-200 rounded-xl" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Product Rows with Improved Styling */}
            {featuredProducts.length > 0 && (
              <ProductRow
                title="Featured Products"
                products={featuredProducts}
                viewAllLink="/products/featured?page=1&limit=12&sort=latest"
                handleProductClick={handleProductClick}
              />
            )}

            {topSellingProducts.length > 0 && (
              <ProductRow
                title="Top Selling Products"
                products={topSellingProducts}
                viewAllLink="/products/best-selling?page=1&limit=12&sort=latest"
                handleProductClick={handleProductClick}
              />
            )}

            {newArrivals.length > 0 && (
              <ProductRow
                title="New Arrivals"
                products={newArrivals}
                viewAllLink="/products/new-arrivals?page=1&limit=12&sort=latest"
                handleProductClick={handleProductClick}
              />
            )}
          </>
        )}
      </div>

      {/* Popup components */}
      {showPopup && selectedProduct && isLargeScreen && (
        <ProductPopup
          product={selectedProduct}
          onClose={handleClosePopup}
          isWishlisted={isWishlisted}
          onWishlistToggle={handleWishlistToggle}
        />
      )}

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={handleCloseLoginPopup}
        isMobile={!isLargeScreen}
      />

      <ToastContainer position="bottom-center" theme="colored" />
    </div>
  );
};

export default Home;
