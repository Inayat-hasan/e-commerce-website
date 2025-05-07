import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
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
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/slices/sidebar/sidebarSelector.js";
import {
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Heart,
  Search,
  Zap,
  Clock,
  Award,
} from "lucide-react";

const exmapleProductsArray = [
  {
    name: "something",
    description: "something",
    actualPrice: 1000,
    brand: "something",
    stock: 87,
    stockUnit: "kg",
    admin: "19i9hoidiauf89w", // sellers id
    images: [
      {
        publicId: "something",
        url: "something",
      },
      {
        publicId: "something",
        url: "something",
      },
    ],
    category: "something",
    subCategory: "something",
    reviews: [],
    discountedPrice: 700,
    discountPercentage: 30,
    averageRating: 5, // 1 to 5
    ratingsSum: 53,
    locations: ["", "", ""],
    status: "active", // active = available & in stock, inactive = not available, empty = out of stock
    isFeatured: true, // boolean
    reviewsCount: 78,
  },
  {
    name: "something",
    description: "something",
    actualPrice: 1000,
    brand: "something",
    stock: 87,
    stockUnit: "kg",
    admin: "19i9hoidiauf89w", // sellers id
    images: [
      {
        publicId: "something",
        url: "something",
      },
      {
        publicId: "something",
        url: "something",
      },
    ],
    category: "something",
    subCategory: "something",
    reviews: [],
    discountedPrice: 700,
    discountPercentage: 30,
    averageRating: 5, // 1 to 5
    ratingsSum: 53,
    locations: ["", "", ""],
    status: "active", // active = available & in stock, inactive = not available, empty = out of stock
    isFeatured: true, // boolean
    reviewsCount: 78,
  },
  {
    name: "something",
    description: "something",
    actualPrice: 1000,
    brand: "something",
    stock: 87,
    stockUnit: "kg",
    admin: "19i9hoidiauf89w", // sellers id
    images: [
      {
        publicId: "something",
        url: "something",
      },
      {
        publicId: "something",
        url: "something",
      },
    ],
    category: "something",
    subCategory: "something",
    reviews: [],
    discountedPrice: 700,
    discountPercentage: 30,
    averageRating: 5, // 1 to 5
    ratingsSum: 53,
    locations: ["", "", ""],
    status: "active", // active = available & in stock, inactive = not available, empty = out of stock
    isFeatured: true, // boolean
    reviewsCount: 78,
  },
];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [showPopup, setShowPopup] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [popupShownCount, setPopupShownCount] = useState(0);
  const popupTimerRef = useRef(null);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState({
    newArrivals: false,
    featuredProducts: false,
    topSellingProducts: false,
    collections: false,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({});

  // Filter products based on active category
  useEffect(() => {
    switch (activeCategory) {
      case "Featured":
        setDisplayedProducts(featuredProducts);
        break;
      case "Best Selling":
        setDisplayedProducts(topSellingProducts);
        break;
      case "New Arrivals":
        setDisplayedProducts(newArrivals);
        break;
      default:
        setDisplayedProducts(featuredProducts);
    }
  }, [activeCategory, featuredProducts, topSellingProducts, newArrivals]);

  // Collection data
  const collections = [
    {
      title: "Summer Essentials",
      description: "Beat the heat with our curated collection",
      image:
        "https://www.alldressedupwithnothingtodrink.com/wp-content/uploads/2021/06/SUMMER-ESSENTIALS.png",
    },
    {
      title: "Sustainable Living",
      description: "Eco-friendly products for conscious consumers",
      image:
        "https://img.freepik.com/premium-photo/sustainable-living-concepts-images-eco_985067-1127.jpg",
    },
    {
      title: "Tech Innovations",
      description: "The latest gadgets to upgrade your life",
      image:
        "https://process.innovation.ox.ac.uk/media/images/home_software_2019.jpg",
    },
  ];

  // Hero slider controls
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === collections.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? collections.length - 1 : prev - 1));
  };

  // Automatic slide change
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide]);

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

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleProductClick = (clickedProduct) => {
    if (isLargeScreen) {
      setSelectedProduct(clickedProduct);
      setShowPopup(true);
    } else {
      navigate(`/product/${clickedProduct._id}`);
    }
  };

  useEffect(() => {
    // Check for success message from location state
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  useEffect(() => {
    loadData();
  }, [serverUrl]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleViewAllClick = useCallback(() => {
    if (displayedProducts === featuredProducts) {
      navigate("/products/featured");
    } else if (displayedProducts === topSellingProducts) {
      navigate("/products/best-selling");
    } else if (displayedProducts === newArrivals) {
      navigate("/products/new-arrivals");
    }
  }, [displayedProducts]);

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${
        isSideBarOpened && isLargeScreen ? "pl-80" : ""
      }`}
    >
      {!isLoggedIn && (
        <LoginPopup
          isMobile={isMobile}
          isOpen={showLoginPopup}
          onClose={handleCloseLoginPopup}
          key={Math.random()}
        />
      )}
      {/* Hero Section with Asymmetrical Layout */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-teal-600 dark:bg-teal-800 opacity-10 z-0"></div>

        {/* Main Hero Content */}
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-12 lg:py-20">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-6">
                Discover{" "}
                <span className="text-teal-600 dark:text-teal-400">
                  Extraordinary
                </span>{" "}
                Products
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Curated collections that inspire and elevate your everyday
                experiences.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-3 bg-teal-600 text-white font-medium rounded-full hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300">
                  Shop Now
                </button>
                <button className="px-8 py-3 border-2 border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 font-medium rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors">
                  Explore Collections
                </button>
              </div>
            </div>

            {/* Right Side - Asymmetrical Image Slider */}
            <div className="relative h-96 lg:h-auto overflow-hidden rounded-2xl shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-teal-600/30 dark:from-teal-800/30 to-transparent z-10"></div>

              {collections.map((collection, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-8 left-8 right-8 z-20">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {collection.title}
                    </h3>
                    <p className="text-white/90">{collection.description}</p>
                  </div>
                </div>
              ))}

              {/* Slider Controls */}
              <div className="absolute bottom-8 right-8 flex space-x-2 z-20">
                <button
                  onClick={prevSlide}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors"
                >
                  <ChevronLeft size={20} className="text-white" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Value Propositions - Horizontal Scrolling */}
      <section className="py-10 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20">
        <div className="container mx-auto px-4">
          <div className="overflow-x-auto pb-6">
            <div className="flex space-x-6 min-w-max">
              <div className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md min-w-64">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg mr-4">
                  <Zap size={24} className="text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    Fast Delivery
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get your order in 2-3 business days
                  </p>
                </div>
              </div>

              <div className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md min-w-64">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg mr-4">
                  <ShoppingBag
                    size={24}
                    className="text-teal-600 dark:text-teal-400"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    Free Shipping
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    On all orders over $50
                  </p>
                </div>
              </div>

              <div className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md min-w-64">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg mr-4">
                  <Clock
                    size={24}
                    className="text-teal-600 dark:text-teal-400"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    24/7 Support
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get help anytime you need
                  </p>
                </div>
              </div>

              <div className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md min-w-64">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg mr-4">
                  <Award
                    size={24}
                    className="text-teal-600 dark:text-teal-400"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    Quality Guarantee
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    100% satisfaction or money back
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showPopup && (
        <ProductPopup
          isWishlisted={isWishlisted}
          onClose={handleClosePopup}
          onWishlistToggle={handleWishlistToggle}
          product={selectedProduct}
          key={selectedProduct._id}
        />
      )}

      {/* Featured Products with Interactive Category Tabs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Explore Products
            </h2>
            <div className="h-1 w-24 bg-teal-600 dark:bg-teal-400 rounded mb-8"></div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {["Featured", "Best Selling", "New Arrivals"].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-full transition-all ${
                    activeCategory === category
                      ? "bg-teal-600 dark:bg-teal-500 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid with Staggered Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {isLoading ? (
              // Loading skeleton
              [...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md animate-pulse"
                >
                  <div className="h-64 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))
            ) : displayedProducts.length > 0 ? (
              displayedProducts.map((product, index) => (
                <div
                  key={product._id}
                  className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                    index % 3 === 1 ? "transform lg:-translate-y-8" : ""
                  }`}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images[0]?.url || "/placeholder-image.jpg"}
                      alt={product.name}
                      className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                      onClick={() => handleProductClick(product)}
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

                    {/* Quick Action Buttons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <button
                        className={`p-2 rounded-full bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 shadow-md transform translate-x-12 group-hover:translate-x-0 transition-transform duration-300`}
                        onClick={handleWishlistToggle}
                      >
                        <Heart
                          size={20}
                          className={`${
                            isWishlisted
                              ? "text-red-500"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleProductClick(product)}
                        className="p-2 rounded-full bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 shadow-md transform translate-x-12 group-hover:translate-x-0 transition-transform duration-300 delay-75"
                      >
                        <Search
                          size={20}
                          className="text-gray-700 dark:text-gray-300"
                        />
                      </button>
                    </div>
                  </div>

                  <div
                    className="p-6"
                    onClick={() => handleProductClick(product)}
                  >
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                      {product.name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-teal-600 dark:text-teal-400 font-bold">
                          ${product.discountedPrice || product.actualPrice}
                        </p>
                        {product.discountedPrice && (
                          <span className="text-sm text-red-500 dark:text-red-400 font-medium">
                            {product.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                      {product.discountedPrice && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ${product.actualPrice}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleProductClick(product)}
                      className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-teal-600 dark:hover:bg-teal-600 hover:text-white dark:text-gray-200 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 group"
                    >
                      <span>View Product</span>
                      <ShoppingBag
                        size={18}
                        className="transform group-hover:scale-110 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No products found in this category.
                </p>
              </div>
            )}
          </div>

          {/* "View All" Button */}
          <div className="mt-12 text-center" onClick={handleViewAllClick}>
            <button className="px-8 py-3 border-2 border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 font-medium rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors inline-flex items-center gap-2">
              <span>View All Products</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Diagonal Featured Collection */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-teal-600 dark:bg-teal-800 transform -skew-y-6 origin-top-left z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Discover Our Exclusive Collection
              </h2>
              <p className="text-teal-50 mb-8 text-lg">
                Handpicked items that represent the pinnacle of quality and
                design. Limited editions that stand out from the crowd.
              </p>
              <button className="px-8 py-3 bg-white text-teal-600 font-medium rounded-full hover:bg-teal-50 transition-colors shadow-lg">
                Explore Collection
              </button>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/api/placeholder/600/800"
                  alt="Featured collection"
                  className="w-full"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-teal-300 dark:bg-teal-900 rounded-full opacity-30 blur-3xl"></div>
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-teal-800 dark:bg-teal-900 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription with Split Design */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              <div className="col-span-3 p-8 lg:p-12">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Join Our Newsletter
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Subscribe to get special offers, free giveaways, and
                  once-in-a-lifetime deals.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500 focus:border-transparent"
                  />
                  <button className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors shadow-md">
                    Subscribe
                  </button>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
                  By subscribing, you agree to our Privacy Policy and consent to
                  receive updates.
                </p>
              </div>

              <div className="col-span-2 relative hidden lg:block">
                <div className="absolute inset-0 bg-teal-600 dark:bg-teal-800"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800 dark:from-teal-800 dark:to-teal-900 opacity-90"></div>
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Stay in the Loop
                    </h3>
                    <p className="text-teal-100">
                      Get early access to our exclusive deals and new arrivals.
                    </p>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                  <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full border-8 border-white"></div>
                  <div className="absolute bottom-12 right-12 w-20 h-20 rounded-full border-4 border-white"></div>
                  <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <div className="h-1 w-24 bg-teal-600 dark:bg-teal-400 rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                    <span className="text-teal-600 dark:text-teal-400 font-bold">
                      {index}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Customer Name
                    </h3>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 italic">
                  "The quality and design of the products exceeded my
                  expectations. Fast shipping and excellent customer service!"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
};

export default Home;
