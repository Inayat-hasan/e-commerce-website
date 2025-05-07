import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  selectIsLoggedIn,
  selectUser,
} from "../redux/slices/authentication/authSelector";
import { setCartCount } from "../redux/slices/cartCount/cartCountSlice";
import fetchCartCount from "../redux/functions/fetchCartCount";
import { selectCartCount } from "../redux/slices/cartCount/cartCountSelector";
import { setUser } from "../redux/slices/authentication/authSlice";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/slices/sidebar/sidebarSelector.js";
import {
  toggleSidebar,
  setIsLargeScreen,
  openSidebar,
  closeSidebar,
} from "../redux/slices/sidebar/sidebarSlice.js";
import checkBuyer from "../redux/functions/checkBuyer.js";
import handleLogoutUtil from "../utils/handleLogout";
import { toast } from "react-toastify";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  LogOut,
  Clipboard,
  UserPlus,
  Heart,
} from "lucide-react";

const Header = () => {
  const inputRef = useRef(null);
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showClear, setShowClear] = useState(false);
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const cartCount = useAppSelector(selectCartCount);
  const dispatch = useAppDispatch();
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  let isDarkMode;

  // Handle window resize
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      const isLarge = window.innerWidth >= 1024;

      // Update screen size state
      if (isLarge !== isLargeScreen) {
        dispatch(setIsLargeScreen(isLarge));

        // Only close sidebar when transitioning from large to small screen
        // and don't close it if we're already on a small screen
        if (!isLarge && isLargeScreen && isSideBarOpened) {
          dispatch(closeSidebar());
        }
      }
    };

    // Use a debounced version of resize handler to prevent multiple rapid calls
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    handleResize();
    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [isSideBarOpened, isLargeScreen, dispatch]);

  // Handle scroll for sticky search bar and header shadow
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Only show sticky search if not large screen and scrolled down enough
      setShowStickySearch(scrollTop > 60 && !isLargeScreen);
      setIsScrolled(scrollTop > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLargeScreen]);

  // Handle clicks outside dropdowns and sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Skip if event was prevented by a child component
      if (event.defaultPrevented) {
        return;
      }

      // For profile/login dropdown
      const isDropdownButton = event.target.closest(
        'button[aria-label="More options"]'
      );
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isDropdownButton &&
        (showProfileDropdown || showLoginDropdown)
      ) {
        setShowProfileDropdown(false);
        setShowLoginDropdown(false);
      }

      // Make sure we're not clicking a menu toggle button
      const isMenuButton = event.target.closest('button[aria-label="Menu"]');

      // Close sidebar when clicking outside on small screens
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !isMenuButton &&
        !isLargeScreen && // Only close on small screens
        isSideBarOpened
      ) {
        dispatch(closeSidebar());
      }
    };

    // Only add event listener if needed
    if (isSideBarOpened || showProfileDropdown || showLoginDropdown) {
      // Add with a slight delay to prevent immediate triggering
      const timer = setTimeout(() => {
        // Use mousedown instead of click to catch events earlier in the cycle
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isSideBarOpened,
    showProfileDropdown,
    showLoginDropdown,
    isLargeScreen,
    dispatch,
  ]);

  // Control body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSideBarOpened && !isLargeScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSideBarOpened, isLargeScreen]);

  // Apply dark mode
  useEffect(() => {
    isDarkMode = localStorage.getItem("theme") === "dark"; // i hope it gives boolean value
    if (isDarkMode) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Initialize user data and cart
  useEffect(() => {
    const initializeData = async () => {
      try {
        const { buyer, isLoggedIn } = await checkBuyer();
        if (isLoggedIn && buyer) {
          dispatch(setUser(buyer));
          const { cartCount } = await fetchCartCount();
          dispatch(setCartCount(cartCount));
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, [dispatch]);

  const handleInputChange = (e) => {
    setShowClear(e.target.value.length > 0);
  };

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setShowClear(false);
    }
  };

  const toggleProfileDropdown = () => {
    // Close login dropdown if open
    if (showLoginDropdown) {
      setShowLoginDropdown(false);
    }
    // Toggle profile dropdown
    setShowProfileDropdown((prevState) => !prevState);
  };

  const toggleLoginDropdown = () => {
    setShowLoginDropdown(!showLoginDropdown);
    setShowProfileDropdown(false);
  };

  const toggleDarkMode = () => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  // Show logout confirmation modal
  const showLogoutConfirmation = () => {
    // Close dropdown menus
    setShowProfileDropdown(false);
    setShowLoginDropdown(false);
    setShowLogoutModal(true);
  };

  // Handle the actual logout process
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Close sidebar if open
      if (isSideBarOpened) {
        dispatch(closeSidebar());
      }

      // Use the handleLogout utility
      await handleLogoutUtil(dispatch, navigate);
    } catch (error) {
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchQuery = inputRef.current?.value?.trim();
    if (searchQuery) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle small screen menu toggle specifically
  const handleMenuToggle = () => {
    // Use explicit actions instead of toggle for more reliable control
    if (isSideBarOpened) {
      setTimeout(() => dispatch(closeSidebar()), 10);
    } else {
      setTimeout(() => dispatch(openSidebar()), 10);
    }
  };

  return (
    <>
      <header
        className={`w-full transition-all duration-300 
          ${isLargeScreen ? "lg:fixed top-0 left-0 right-0" : ""}
          ${isScrolled ? "shadow-lg" : ""}
          z-50 bg-white dark:bg-gray-900`}
      >
        <div className="max-w-8xl mx-auto">
          {/* Main Header Row */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 lg:py-4 relative">
            {/* Left Section: Menu & Logo */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                className={`p-1.5 sm:p-2 rounded-full  transition-colors hover:bg-gray-100 dark:hover:bg-gray-800`}
                onClick={handleMenuToggle}
                aria-label="Menu"
              >
                {isSideBarOpened ? (
                  <X size={20} className={`text-gray-800 dark:text-white`} />
                ) : (
                  <Menu size={20} className={`text-gray-800 dark:text-white`} />
                )}
              </button>

              <Link to="/" className="flex items-center">
                <div
                  className={`relative flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg overflow-hidden group bg-teal-600 dark:bg-teal-900`}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-white">
                      Lushkart
                    </span>
                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Center: Search Bar - Only visible on large screens */}
            <div className="hidden lg:block max-w-md w-full mx-4">
              <form
                onSubmit={handleSearchSubmit}
                className={`relative group rounded-full overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-teal-500 focus-within:bg-white bg-gray-100 dark:bg-gray-800`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  ref={inputRef}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-2 border-none dark:bg-gray-800 dark:focus:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none text-sm rounded-full bg-gray-100 focus:bg-white text-gray-900 placeholder-gray-500`}
                  placeholder="Search products..."
                />
                {showClear && (
                  <button
                    onClick={clearInput}
                    className="absolute inset-y-0 right-10 flex items-center pr-2"
                    aria-label="Clear search"
                  >
                    <X
                      size={16}
                      className="text-gray-400 hover:text-gray-600"
                    />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={handleSearchSubmit}
                >
                  <div className="h-8 w-8 rounded-full bg-teal-600 hover:bg-teal-700 flex items-center justify-center transition-colors">
                    <Search size={16} className="text-white" />
                  </div>
                </button>
              </form>
            </div>

            {/* Right: Navigation Icons */}
            <div className="flex items-center">
              {/* Small screen more compact layout */}
              <div className="sm:hidden relative ml-1" ref={dropdownRef}>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleProfileDropdown();
                  }}
                  className={`p-1.5 rounded-full transition-colors dark:hover:bg-gray-800 hover:bg-gray-100`}
                  aria-label="More options"
                >
                  <User size={18} className={`dark:text-white text-gray-700`} />
                </button>

                {/* Mobile menu dropdown */}
                {showProfileDropdown && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 z-50 dark:bg-gray-800 dark:border-gray-700 bg-white border border-gray-100`}
                  >
                    <div
                      className={`cursor-pointer block px-4 py-2 text-sm dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                      onMouseDown={(e) => {
                        // Use onMouseDown instead of onClick to ensure it runs before any blur events
                        e.preventDefault();
                        navigate("/");
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Home
                          size={16}
                          className={`dark:text-teal-400 text-teal-600`}
                        />
                        <span>Home</span>
                      </div>
                    </div>
                    <div
                      className={`cursor-pointer block px-4 py-2 text-sm dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        navigate("/wishlist");
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Heart
                          size={16}
                          className={`dark:text-teal-400 text-teal-600`}
                        />
                        <span>Wishlist</span>
                      </div>
                    </div>
                    {isLoggedIn ? (
                      <>
                        <div
                          className={`cursor-pointer block px-4 py-2 text-sm dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            navigate("/profile");
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <User
                              size={16}
                              className={`dark:text-teal-400 text-teal-600`}
                            />
                            <span>Profile</span>
                          </div>
                        </div>
                        <div
                          className={`cursor-pointer block px-4 py-2 text-sm dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            navigate("/orders");
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Clipboard
                              size={16}
                              className={`dark:text-teal-400 text-teal-600`}
                            />
                            <span>Orders</span>
                          </div>
                        </div>
                        <div
                          className={`cursor-pointer block px-4 py-2 text-sm dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            showLogoutConfirmation();
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <LogOut size={16} className="text-red-500" />
                            <span>Logout</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className={`cursor-pointer block px-4 py-2 text-sm dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            navigate("/login");
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <User
                              size={16}
                              className={`dark:text-teal-400 text-teal-600`}
                            />
                            <span>Login</span>
                          </div>
                        </div>
                        <div
                          className={`cursor-pointer block px-4 py-2 text-sm dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            navigate("/register");
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <UserPlus
                              size={16}
                              className={`dark:text-teal-400 text-teal-600`}
                            />
                            <span>Register</span>
                          </div>
                        </div>
                      </>
                    )}
                    <div
                      className={`cursor-pointer block px-4 py-2 text-sm dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        toggleDarkMode();
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        {isDarkMode ? (
                          <>
                            <Sun size={16} className="text-yellow-300" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon size={16} className="text-gray-600" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Regular buttons for larger screens */}
              <Link to="/" className="hidden sm:block">
                <button
                  className={`p-2 rounded-full dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors`}
                  aria-label="Home"
                >
                  <Home size={22} className="dark:text-white text-gray-700" />
                </button>
              </Link>

              <Link to="/wishlist" className="hidden sm:block">
                <button
                  className={`p-2 rounded-full dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors`}
                  aria-label="Wishlist"
                >
                  <Heart size={22} className="dark:text-white text-gray-700" />
                </button>
              </Link>

              <div className="relative hidden sm:block" ref={dropdownRef}>
                {isLoggedIn ? (
                  <button
                    onClick={toggleProfileDropdown}
                    className={`p-2 rounded-full dark:hover:bg-gray-800 hover:bg-gray-100  transition-colors flex items-center`}
                    aria-label="User profile"
                  >
                    <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-medium">
                      {user?.fullName?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={toggleLoginDropdown}
                    className={`p-2 rounded-full dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors`}
                    aria-label="Login"
                  >
                    <User size={22} className="dark:text-white text-gray-700" />
                  </button>
                )}

                {/* Profile Dropdown for larger screens */}
                {showProfileDropdown && isLoggedIn && (
                  <div
                    className={`absolute right-0 mt-2 w-60 rounded-xl shadow-lg py-2 z-50  dark:bg-gray-800 dark:border-gray-700 bg-white border border-gray-100`}
                  >
                    <div
                      className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700`}
                    >
                      <div
                        className={`font-medium text-gray-800 dark:text-white`}
                      >
                        {user?.fullName || "User"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user?.email || "user@example.com"}
                      </div>
                    </div>
                    <Link to="/profile">
                      <button
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event from bubbling up
                          const destination = "/profile";
                          navigate(destination);
                          setTimeout(() => {
                            setShowProfileDropdown(false);
                          }, 50);
                        }}
                      >
                        <User
                          size={16}
                          className={`dark:text-teal-400 text-teal-600`}
                        />
                        <span>Profile</span>
                      </button>
                    </Link>
                    <Link to="/orders">
                      <button
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event from bubbling up
                          const destination = "/orders";
                          navigate(destination);
                          setTimeout(() => {
                            setShowProfileDropdown(false);
                          }, 50);
                        }}
                      >
                        <Clipboard
                          size={16}
                          className={`dark:text-teal-400 text-teal-600`}
                        />
                        <span>Orders</span>
                      </button>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event from bubbling up
                        // Logout first, then close dropdown
                        handleLogout();
                        setTimeout(() => {
                          setShowProfileDropdown(false);
                        }, 50);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                    >
                      <LogOut size={16} className="text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}

                {/* Login Dropdown for larger screens */}
                {showLoginDropdown && !isLoggedIn && (
                  <div
                    className={`absolute right-0 mt-2 w-52 rounded-xl shadow-lg py-2 z-50  dark:bg-gray-800 dark:border-gray-700 bg-white border border-gray-100`}
                  >
                    <Link to="/login">
                      <button
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                      >
                        <User
                          size={16}
                          className={`dark:text-teal-400 text-teal-600`}
                        />
                        <span>Login</span>
                      </button>
                    </Link>
                    <Link to="/register">
                      <button
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-100`}
                      >
                        <UserPlus
                          size={16}
                          className={`dark:text-teal-400 text-teal-600`}
                        />
                        <span>Register</span>
                      </button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Ensure proper spacing on all devices */}
              <div className="flex items-center ml-1 sm:ml-2">
                {/* Cart button (shown on all screen sizes) */}
                <Link to="/cart" className="relative">
                  <button
                    className={`p-1.5 sm:p-2 rounded-full dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors`}
                    aria-label="Shopping cart"
                  >
                    <ShoppingBag
                      size={20}
                      className={`dark:text-white text-gray-700`}
                    />
                    {isLoggedIn && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </button>
                </Link>

                {/* Dark/Light Mode Toggle (shown on medium+ screens) */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-1.5 sm:p-2 rounded-full hidden sm:block dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors ml-1`}
                  aria-label={
                    isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {isDarkMode ? (
                    <Sun size={20} className="text-yellow-300" />
                  ) : (
                    <Moon size={20} className="text-gray-700" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar and Navigation */}
          <div className="lg:hidden px-4 pb-3 flex flex-col space-y-3">
            <form
              onSubmit={handleSearchSubmit}
              className={`relative dark:bg-gray-800 bg-gray-100 rounded-lg overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-teal-500`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                ref={inputRef}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-12 py-2 border-none dark:bg-gray-800 dark:focus:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none text-sm bg-gray-100 focus:bg-white text-gray-900 placeholder-gray-500`}
                placeholder="Search products..."
              />
              {showClear && (
                <button
                  onClick={clearInput}
                  className="absolute inset-y-0 right-12 flex items-center"
                  aria-label="Clear search"
                >
                  <X size={16} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-2"
                onClick={handleSearchSubmit}
              >
                <div className="h-8 w-8 rounded-lg bg-teal-600 hover:bg-teal-700 flex items-center justify-center transition-colors">
                  <Search size={16} className="text-white" />
                </div>
              </button>
            </form>

            {/* Mobile Navigation Links */}
            <nav className="flex space-x-4 overflow-x-auto scrollbar-hide">
              <Link
                to="/collections"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-teal-50 hover:text-teal-700 transition-colors whitespace-nowrap"
              >
                Collections
              </Link>
              <Link
                to="/new"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-teal-50 hover:text-teal-700 transition-colors whitespace-nowrap"
              >
                New Arrivals
              </Link>
              <Link
                to="/deals"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-teal-50 hover:text-teal-700 transition-colors whitespace-nowrap"
              >
                Deals
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Sticky Search Bar for Mobile */}
      {showStickySearch && (
        <div
          className={`fixed top-0 left-0 right-0 z-[60] bg-white dark:bg-gray-900 shadow-md lg:hidden transition-all duration-300`}
          style={{
            transform:
              isSideBarOpened && !isLargeScreen
                ? "translateY(-100%)"
                : "translateY(0)",
          }}
        >
          <div className="flex items-center p-3 gap-2">
            <button
              className={`p-1.5 rounded-full dark:hover:bg-gray-800 hover:bg-gray-100`}
              onClick={handleMenuToggle}
              aria-label="Menu"
            >
              {isSideBarOpened ? (
                <X size={22} className="dark:text-white text-gray-800" />
              ) : (
                <Menu size={22} className="dark:text-white text-gray-800" />
              )}
            </button>

            <div className="flex-1">
              <form
                onSubmit={handleSearchSubmit}
                className={`relative dark:bg-gray-800 bg-gray-100 rounded-lg overflow-hidden`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  ref={inputRef}
                  onChange={handleInputChange}
                  className={`block w-full pl-9 pr-8 py-2 border-none dark:bg-gray-800 dark:text-white dark:placeholder-gray-400  bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none text-sm`}
                  placeholder="Search products..."
                />
                {showClear && (
                  <button
                    onClick={clearInput}
                    className="absolute inset-y-0 right-8 flex items-center"
                    aria-label="Clear search"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-2"
                  onClick={handleSearchSubmit}
                >
                  <Search size={16} className="text-gray-500" />
                </button>
              </form>
            </div>

            <Link to="/cart" className="relative">
              <button
                className={`p-1.5 rounded-full dark:hover:bg-gray-800 hover:bg-gray-100`}
              >
                <ShoppingBag
                  size={20}
                  className="dark:text-white text-gray-800"
                />
                {isLoggedIn && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Layout with Sidebar */}
      <div className="flex relative">
        {/* Backdrop overlay - only visible when sidebar is open on small screens */}
        {isSideBarOpened && !isLargeScreen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-40"
            onClick={() => dispatch(closeSidebar())}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 overflow-hidden
            bg-white dark:bg-gray-900
            transform transition-transform duration-300 ease-in-out
            ${isSideBarOpened ? "translate-x-0" : "-translate-x-full"}
            ${
              isLargeScreen
                ? "lg:top-[4rem] lg:h-[calc(100vh-4rem)] w-80"
                : "top-0 h-full w-[80vw] max-w-[300px] shadow-xl"
            }`}
        >
          {/* Sidebar Content */}
          <div
            ref={sidebarRef}
            className="h-full overflow-y-auto flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="font-medium text-lg">Menu</div>
              <button
                onClick={() => dispatch(closeSidebar())}
                className={`p-2 rounded-full dark:hover:bg-gray-800 hover:bg-gray-100`}
              >
                <X size={20} className="dark:text-white text-gray-500" />
              </button>
            </div>

            {isLoggedIn ? (
              <div className="p-4 mb-2 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-teal-600 flex items-center justify-center text-white text-lg font-medium">
                    {user?.fullName?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() ||
                      "U"}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user?.fullName || "User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user?.email || "user@example.com"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => !isLargeScreen && dispatch(toggleSidebar())}
                >
                  <button className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <User size={18} />
                    <span>Sign In</span>
                  </button>
                </Link>
                <Link
                  to="/register"
                  onClick={() => !isLargeScreen && dispatch(toggleSidebar())}
                >
                  <button className="w-full py-2 border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <UserPlus size={18} />
                    <span>Create Account</span>
                  </button>
                </Link>
              </div>
            )}

            <div className="py-2 flex-grow">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main Navigation
              </div>

              <Link
                to="/"
                onClick={() => !isLargeScreen && dispatch(toggleSidebar())}
              >
                <div
                  className={`px-4 py-3 flex items-center space-x-3 dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors`}
                >
                  <Home
                    size={20}
                    className={`dark:text-teal-400 text-teal-600`}
                  />
                  <span className="dark:text-white text-gray-800">Home</span>
                </div>
              </Link>

              <Link
                to="/collections"
                onClick={() => !isLargeScreen && dispatch(toggleSidebar())}
              >
                <div
                  className={`px-4 py-3 flex items-center space-x-3 dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors`}
                >
                  <ShoppingBag
                    size={20}
                    className={`dark:text-teal-400 text-teal-600`}
                  />
                  <span className="dark:text-white text-gray-800">
                    Collections
                  </span>
                </div>
              </Link>

              <Link
                to="/wishlist"
                onClick={() => !isLargeScreen && dispatch(toggleSidebar())}
              >
                <div
                  className={`px-4 py-3 flex items-center space-x-3 dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors`}
                >
                  <Heart
                    size={20}
                    className={`dark:text-teal-400 text-teal-600`}
                  />
                  <span className="dark:text-white text-gray-800">
                    Wishlist
                  </span>
                </div>
              </Link>

              <Link
                to="/cart"
                onClick={() => !isLargeScreen && dispatch(toggleSidebar())}
              >
                <div
                  className={`px-4 py-3 flex items-center space-x-3 dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors`}
                >
                  <ShoppingBag
                    size={20}
                    className={`dark:text-teal-400 text-teal-600`}
                  />
                  <span className="dark:text-white text-gray-800">Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>

              {isLoggedIn && (
                <>
                  <div className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User Account
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => !isLargeScreen && dispatch(toggleSidebar())}
                  >
                    <div
                      className={`px-4 py-3 flex items-center space-x-3 dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors`}
                    >
                      <User
                        size={20}
                        className={`dark:text-teal-400 text-teal-600`}
                      />
                      <span className="dark:text-white text-gray-800">
                        Profile
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => !isLargeScreen && dispatch(toggleSidebar())}
                  >
                    <div
                      className={`px-4 py-3 flex items-center space-x-3 dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors`}
                    >
                      <Clipboard
                        size={20}
                        className={`dark:text-teal-400 text-teal-600`}
                      />
                      <span className="dark:text-white text-gray-800">
                        Orders
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={showLogoutConfirmation}
                    className={`w-full px-4 py-3 flex items-center space-x-3 dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors text-left`}
                  >
                    <LogOut size={20} className="text-red-500" />
                    <span className="dark:text-white text-gray-800">
                      Logout
                    </span>
                  </button>
                </>
              )}
            </div>

            <div className="p-4 border-t mt-auto">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">© 2025 Lushkart</span>
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full dark:hover:bg-gray-800 dark:text-white hover:bg-gray-100 text-gray-800  transition-colors`}
                >
                  {isDarkMode ? (
                    <Sun size={20} className="text-yellow-300" />
                  ) : (
                    <Moon size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Spacer for Large Screens */}
        {isLargeScreen && (
          <>
            {/* Spacer for fixed header */}
            <div className="w-full h-[4rem] lg:block hidden"></div>

            {/* Spacer for sidebar */}
            {isSideBarOpened && (
              <div className="w-80 flex-shrink-0 transition-all duration-300"></div>
            )}
          </>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition flex items-center justify-center"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging out...
                  </>
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
