import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCaretDown,
  faCartArrowDown,
  faCartShopping,
  faHome,
  faL,
  faMagnifyingGlass,
  faMoon,
  faSun,
  faTimes,
  faUser,
  faUserAlt,
  faUserCircle,
  faUserLarge,
  faUserPlus,
  faX,
  faStore,
  faChevronDown,
  faSignOutAlt,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  selectIsLoggedIn,
  selectUser,
} from "../redux/slices/authentication/authSelector";
import { setCartCount } from "../redux/slices/cartCount/cartCountSlice";
import fetchCartCount from "../redux/functions/fetchCartCount";
import { selectCartCount } from "../redux/slices/cartCount/cartCountSelector";
import { logoutAndResetCart } from "../redux/slices/authentication/authSlice";

const Header = () => {
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showClear, setShowClear] = useState(false);
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const cartCount = useAppSelector(selectCartCount);
  const dispatch = useAppDispatch();

  const handleInputChange = (e) => {
    const value = e.target.value; // Get value from the event
    setShowClear(value !== ""); // Show clear button if the value is not empty
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowProfileDropdown(false);
      setShowLoginDropdown(false);
    }
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setIsMenuOpen(false);
    }
  };

  const clearInput = (e) => {
    e.preventDefault();
    inputRef.current.value = "";
    setShowClear(false);
    inputRef.current.focus();
  };

  // Handle scroll for sticky search bar
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const headerHeight = 60; // Adjust this value as needed
    setShowStickySearch(scrollTop > headerHeight);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Prevent scrolling when the menu is open
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"; // Disable scroll
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "auto"; // Enable scroll
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.body.style.overflow = "auto"; // Clean up scroll restriction
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const updateCartCount = async () => {
      if (isLoggedIn) {
        const { cartCount } = await fetchCartCount();
        dispatch(setCartCount(cartCount));
      }
    };
    updateCartCount();
  }, [isLoggedIn, dispatch]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logoutAndResetCart());
    setShowProfileDropdown(false);
    navigate("/");
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowLoginDropdown(false);
  };

  const toggleLoginDropdown = () => {
    setShowLoginDropdown(!showLoginDropdown);
    setShowProfileDropdown(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // You can add more dark mode implementation logic here
  };

  return (
    <header className="flex flex-col items-center xs:h-28 sm:h-28 md:h-32 justify-evenly text-white max-w-full lg:h-16 lg:border-b-4 lg:sticky lg:top-0 lg:w-full lg:bg-white xl:sticky xl:h-16 xl:w-full xl:top-0 z-50">
      <div className="flex flex-row w-full xs:h-11 sm:h-11 h-12 items-center justify-around xs:border-b-2 sm:border-b-2 md:border-b-2">
        <div className="flex flex-row justify-center items-center gap-3">
          {/* Bars */}
          <button
            className="text-teal-900 font-semibold text-5xl justify-self-center self-center text-center pb-2"
            onClick={() => {
              setIsMenuOpen((prev) => !prev);
            }}
          >
            ≡
          </button>
          {/* Logo */}
          <Link to="/">
            <div
              className={`flex flex-row font-serif text-2xl justify-center items-center bg-gradient-to-r from-lime-950 to-gray-800 p-1 rounded text-[#D0CEBA] hover:cursor-pointer`}
            >
              <p>Lushkart</p>
              <FontAwesomeIcon
                aria-hidden="true"
                icon={faCartShopping}
                className=""
              ></FontAwesomeIcon>
            </div>
          </Link>
        </div>

        {/* search section for laptops and desktop */}
        <div className="hidden lg:flex xl:flex w-80 h-10 justify-center items-center self-center justify-self-center">
          <form
            action=""
            className="border-teal-900 self-center justify-self-center flex h-[100%] flex-row items-center border-2 w-[100%] rounded-3xl"
          >
            <input
              className={`text-black pr-1 pl-2 h-[100%] outline-teal-900 ${
                showClear ? "w-[80%]" : "w-[85%]"
              } rounded-l-3xl`}
              placeholder="Search product"
              type="text"
              ref={inputRef}
              onChange={handleInputChange}
            />
            {showClear && (
              <button
                type="button"
                onClick={clearInput}
                aria-label="Clear search input"
                className="text-teal-900 h-[100%] w-[8%] hover:bg-gray-400 rounded-full"
              >
                ✕
              </button>
            )}
            <button
              className={`bg-teal-900 h-[100%] ${
                showClear ? "w-[12%]" : "w-[15%]"
              } rounded-r-3xl justify-self-end`}
            >
              <FontAwesomeIcon
                aria-hidden="true"
                icon={faMagnifyingGlass}
              ></FontAwesomeIcon>
            </button>
          </form>
        </div>

        {/* buttons */}
        <div className={`flex flex-row items-center gap-2 justify-center`}>
          <Link to="/">
            <button className="flex flex-row bg-teal-900 px-1.5 py-2 rounded-lg xs:text-xl sm:text-xl lg:text-lg justify-center items-center gap-1">
              <FontAwesomeIcon icon={faHome} aria-hidden="true" />
              <span className="xs:hidden sm:hidden md:text-base">Home</span>
            </button>
          </Link>

          <div className="relative" ref={dropdownRef}>
            {isLoggedIn ? (
              <button
                onClick={toggleProfileDropdown}
                className="flex flex-row bg-teal-900 px-3 py-2 rounded-lg items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-teal-900">
                  {user?.fullName?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase()}
                </div>
              </button>
            ) : (
              <button
                onClick={toggleLoginDropdown}
                className="flex flex-row bg-teal-900 px-3 py-2 rounded-lg items-center gap-2"
              >
                <FontAwesomeIcon icon={faUserCircle} />
                <span className="xs:hidden sm:hidden">Login</span>
              </button>
            )}

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="font-medium text-gray-800">
                    {user?.fullName}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <Link to="/profile">
                  <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
                    Profile
                  </button>
                </Link>
                <Link to="/orders">
                  <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                    Orders
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Logout
                </button>
              </div>
            )}

            {showLoginDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <Link to="/login">
                  <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>

          <Link to="/cart" className="relative">
            <button className="flex flex-row bg-teal-900 px-1.5 py-2 rounded-lg xs:text-xl sm:text-xl justify-center items-center lg:text-lg">
              <FontAwesomeIcon icon={faCartShopping} aria-hidden="true" />
              {isLoggedIn && cartCount !== null && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
          <button
            onClick={toggleDarkMode}
            className="flex flex-row bg-teal-900 px-1.5 py-2 rounded-lg xs:text-xl sm:text-xl lg:text-lg justify-center items-center"
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <FontAwesomeIcon
              icon={isDarkMode ? faSun : faMoon}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* search section for mobile and tablets */}
      <div
        className={`w-full flex justify-center items-center sticky top-[45px] ${
          isMenuOpen ? "z-30" : "z-50"
        } bg-white shadow-md ${
          isMenuOpen ? "pointer-events-none" : ""
        } lg:hidden xl:hidden`}
      >
        <form
          className={`border-2 border-teal-900 flex flex-row h-11 justify-around items-center w-[90%] rounded-lg ${
            isMenuOpen ? "bg-gray-700" : "bg-white"
          }`}
        >
          <input
            type="text"
            placeholder="Search Products"
            ref={inputRef}
            onChange={handleInputChange}
            className="text-black h-[100%] rounded-l-md pl-2 w-[75%]"
          />
          {showClear && (
            <button
              type="button"
              onClick={clearInput}
              aria-label="Clear search input"
              className="w-[10%] text-teal-900 hover:bg-gray-400 hover:rounded-full h-[100%]"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            aria-label="Search"
            className={`bg-teal-900 rounded-md ${
              showClear ? "w-[15%]" : "w-[25%]"
            } h-[100%]`}
          >
            <FontAwesomeIcon
              aria-hidden="true"
              icon={faMagnifyingGlass}
            ></FontAwesomeIcon>
          </button>
        </form>
      </div>

      {/* Sticky Search Bar (hidden initially, appears on scroll) */}
      {showStickySearch && (
        <div
          className={`w-full fixed top-0 ${
            isMenuOpen ? "z-30" : "z-50"
          } bg-white shadow-md flex flex-row pt-2 ${
            isMenuOpen ? "pointer-events-none" : ""
          } h-14 pl-3 lg:hidden xl:hidden`}
        >
          {/* Bars */}
          <button
            className="text-teal-900 font-semibold text-5xl justify-self-center self-center text-center w-[10%] flex justify-center items-center h-[100%] pb-3"
            onClick={() => {
              setIsMenuOpen((prev) => !prev);
            }}
          >
            ≡
          </button>
          <form
            className={`border-2 border-teal-900 flex flex-row h-11 justify-around items-center w-[80%] mx-auto rounded-lg ${
              isMenuOpen ? "bg-gray-700" : "bg-white"
            }`}
          >
            <input
              type="text"
              placeholder="Search Products"
              ref={inputRef}
              onChange={handleInputChange}
              className="text-black h-[100%] rounded-l-md pl-2 w-[75%]"
            />
            {showClear && (
              <button
                type="button"
                onClick={clearInput}
                aria-label="Clear search input"
                className="w-[10%] text-teal-900 hover:bg-gray-400 hover:rounded-full h-[100%]"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              aria-label="Search"
              className={`bg-teal-900 rounded-md ${
                showClear ? "w-[15%]" : "w-[25%]"
              } h-[100%]`}
            >
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                aria-hidden="true"
              ></FontAwesomeIcon>
            </button>
          </form>
        </div>
      )}

      {/* if menu option is open */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="fixed top-0 left-0 w-96 h-full bg-gray-800 text-white shadow-lg p-4 z-50 overflow-y-auto"
        >
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-gray-700">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 text-xl">
                  {user?.fullName?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{user?.fullName}</div>
                  <div className="text-sm text-gray-400">{user?.email}</div>
                </div>
              </div>
              <Link to="/profile">
                <div className="py-3 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                  <FontAwesomeIcon icon={faUserCircle} />
                  <span>Profile</span>
                </div>
              </Link>
              <Link to="/orders">
                <div className="py-3 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                  <FontAwesomeIcon icon={faClipboardList} />
                  <span>Orders</span>
                </div>
              </Link>
              <Link to="/cart">
                <div className="py-3 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                  <FontAwesomeIcon icon={faCartShopping} />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left py-3 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-3"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <div className="py-3 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                  <FontAwesomeIcon icon={faUserCircle} />
                  <span>Login</span>
                </div>
              </Link>
              <Link to="/register">
                <div className="py-3 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                  <FontAwesomeIcon icon={faUserPlus} />
                  <span>Register</span>
                </div>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Dark overlay when menu is open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Close Button (outside the sidebar) */}
      {isMenuOpen && (
        <button
          className="fixed top-2 right-2 cursor-pointer z-50 text-3xl text-white"
          onClick={() => setIsMenuOpen(false)}
        >
          ✕
        </button>
      )}
    </header>
  );
};

export default Header;
