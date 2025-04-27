import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleRight,
  faBars,
  faBell,
  faCartShopping,
  faMoon,
  faSortDown,
  faUserCircle,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectIsOpen } from "../redux/reducers/sidebar/sidebarSelector";
import { toggleSidebar } from "../redux/reducers/sidebar/sidebarReducer";

const Header = () => {
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isSideBarOpened = useAppSelector(selectIsOpen);
  const userRef = useRef(null);
  const notificationRef = useRef(null);
  const [expandedItems, setExpandedItems] = useState({
    homeBannerSlides: false,
    products: false,
    homeBanners: false,
    homeSideBanners: false,
    homeBottomBanners: false,
    category: false,
  });

  const getAdminDetails = async () => {
    try {
      const req = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/admin/profile`,
        {
          withCredentials: true,
        }
      );
      if (req.status === 200) {
        console.log(req.data);
      } else {
        navigate("/admin/login");
      }
    } catch (error) {
      console.log(error);
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    if (isUserOpen || isNotificationOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isUserOpen, isNotificationOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (userRef.current && !userRef.current.contains(event.target)) ||
        (notificationRef.current &&
          !notificationRef.current.contains(event.target))
      ) {
        setIsUserOpen(false);
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleExpand = (item) => {
    setExpandedItems((prevState) => ({
      homeBannerSlides:
        item === "homeBannerSlides" ? !prevState.homeBannerSlides : false,
      products: item === "products" ? !prevState.products : false,
      homeBanners: item === "homeBanners" ? !prevState.homeBanners : false,
      homeSideBanners:
        item === "homeSideBanners" ? !prevState.homeSideBanners : false,
      homeBottomBanners:
        item === "homeBottomBanners" ? !prevState.homeBottomBanners : false,
      category: item === "category" ? !prevState.category : false,
    }));
  };

  return (
    <header className="flex flex-col items-center sm:h-28 md:h-32 justify-evenly text-white max-w-full lg:h-16 lg:border-b-4 lg:sticky lg:top-0 lg:w-full lg:bg-white xl:sticky xl:h-16 xl:w-full xl:top-0 z-50">
      <div className="flex flex-row w-full sm:h-11 h-12 items-center justify-around sm:border-b-2 md:border-b-2">
        {/* Logo */}
        <Link
          to="/admin/dashboard"
          className={`${
            isNotificationOpen || isUserOpen ? "pointer-events-none" : ""
          }`}
        >
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

        {/* Bars */}
        <button
          className={`text-teal-900 font-semibold text-4xl justify-self-center self-center text-center pb-2 ${
            isNotificationOpen || isUserOpen ? "pointer-events-none" : ""
          }`}
          onClick={() => {
            dispatch(toggleSidebar());
          }}
        >
          {!isSideBarOpened ? (
            <FontAwesomeIcon icon={faBars} aria-hidden="true"></FontAwesomeIcon>
          ) : (
            <FontAwesomeIcon
              icon={faXmark}
              aria-hidden="true"
            ></FontAwesomeIcon>
          )}
        </button>

        {/* buttons */}
        <div
          className={`flex flex-row items-center gap-2 justify-center ${
            isNotificationOpen || isUserOpen ? "pointer-events-none" : ""
          }`}
        >
          <button
            className={`flex flex-row bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl text-center justify-center items-center lg:text-2xl`}
            onClick={() => setIsUserOpen((prev) => !prev)}
          >
            <FontAwesomeIcon icon={faMoon} aria-hidden="true"></FontAwesomeIcon>
          </button>

          <button
            className={`flex flex-row bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl text-center justify-center items-center lg:text-2xl`}
            onClick={() => setIsNotificationOpen((prev) => !prev)}
          >
            <FontAwesomeIcon icon={faBell} aria-hidden="true"></FontAwesomeIcon>
          </button>
          <button
            className={`flex flex-row bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl text-center justify-center items-center lg:text-2xl`}
            onClick={() => setIsUserOpen((prev) => !prev)}
          >
            <FontAwesomeIcon
              icon={faUserCircle}
              aria-hidden="true"
            ></FontAwesomeIcon>
          </button>
        </div>
      </div>

      {/* if side bar is open */}
      {isSideBarOpened && (
        <div className="fixed lg:top-16 md:top-0 sm:top-0 left-0 max-h-screen h-screen lg:w-72 shadow-lg sm:z-50 md:z-50 overflow-y-scroll bg-teal-900 text-white px-2">
          {/* Dashboard */}
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="cursor-pointer w-[100%] lg:h-10 flex justify-start gap-1 hover:bg-teal-800 items-center rounded-xl px-3 text-lg mt-1"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path>
            </svg>
            <span>Dashboard</span>
          </button>
          {/* products */}
          <button
            onClick={() => toggleExpand("products")}
            className="cursor-pointer w-[100%] lg:h-10 flex justify-between gap-1 hover:bg-teal-800 items-center rounded-xl px-3 text-lg mt-1"
          >
            <div className="flex items-center justify-start">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                  expandedItems.products ? "text-teal-600" : "text-white"
                }`}
              >
                <path d="M326.3 218.8c0 20.5-16.7 37.2-37.2 37.2h-70.3v-74.4h70.3c20.5 0 37.2 16.7 37.2 37.2zM504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zm-128.1-37.2c0-47.9-38.9-86.8-86.8-86.8H169.2v248h49.6v-74.4h70.3c47.9 0 86.8-38.9 86.8-86.8z"></path>
              </svg>
              <span>Products</span>
            </div>
            <FontAwesomeIcon
              aria-hidden="true"
              icon={expandedItems.products ? faAngleDown : faAngleRight}
            ></FontAwesomeIcon>
          </button>
          {expandedItems.products && (
            <div className="flex flex-col pl-1 border-l-2 border-teal-700 space-y-2 w-[90%] self-end items-start justify-center">
              <button
                onClick={() => navigate("/admin/product-list")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Product List
              </button>
              <button
                onClick={() => navigate("/admin/add-product")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Product Upload
              </button>
              <button
                onClick={() => navigate("/admin/product-ram")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Add Product RAMS
              </button>
              <button
                onClick={() => navigate("/admin/product-weight")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Add Product WEIGHT
              </button>
              <button
                onClick={() => navigate("/admin/product-size")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Add Product SIZE
              </button>
            </div>
          )}
          {/* orders */}
          <button
            onClick={() => navigate("/admin/orders")}
            className="cursor-pointer w-[100%] lg:h-10 flex justify-start gap-1 hover:bg-teal-800 items-center rounded-xl px-3 text-lg mt-1"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 384 512"
              fontSize="small"
              height="2em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm121.2 231.8l-143 141.8c-4.7 4.7-12.3 4.6-17-.1l-82.6-83.3c-4.7-4.7-4.6-12.3.1-17L99.1 285c4.7-4.7 12.3-4.6 17 .1l46 46.4 106-105.2c4.7-4.7 12.3-4.6 17 .1l28.2 28.4c4.7 4.8 4.6 12.3-.1 17z"></path>
            </svg>
            <span>Orders</span>
          </button>
          {/* category */}
          <button
            onClick={() => toggleExpand("category")}
            className="cursor-pointer w-[100%] lg:h-10 flex justify-between gap-1 hover:bg-teal-800 items-center rounded-xl px-3 text-lg mt-1"
          >
            <div className="flex items-center justify-start">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                  expandedItems.category ? "text-teal-600" : "text-white"
                }`}
              >
                <path d="M4 11h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm10 0h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zM4 21h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm13 0c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4z"></path>
              </svg>
              <span>Category</span>
            </div>
            <FontAwesomeIcon
              aria-hidden="true"
              icon={expandedItems.category ? faAngleDown : faAngleRight}
            ></FontAwesomeIcon>
          </button>
          {expandedItems.category && (
            <div className="flex flex-col pl-1 border-l-2 border-teal-700 space-y-2 w-[90%] self-end items-start justify-center">
              <button
                onClick={() => navigate("/admin/products")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Category List
              </button>
              <button
                onClick={() => navigate("/admin/products/upload")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Add a Category
              </button>
              <button
                onClick={() => navigate("/admin/products/upload")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Sub Category List
              </button>
              <button
                onClick={() => navigate("/admin/products/upload")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Add a sub category
              </button>
            </div>
          )}
          {/* home banner slides */}
          <button
            onClick={() => toggleExpand("homeBannerSlides")}
            className="cursor-pointer w-[100%] lg:h-10 flex justify-between gap-1 hover:bg-teal-800 items-center rounded-xl px-3 text-lg mt-1"
          >
            <div className="flex items-center justify-start">
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                  expandedItems.homeBannerSlides
                    ? "text-teal-600"
                    : "text-white"
                }`}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M15 6l.01 0"></path>
                <path d="M3 3m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z"></path>
                <path d="M3 13l4 -4a3 5 0 0 1 3 0l4 4"></path>
                <path d="M13 12l2 -2a3 5 0 0 1 3 0l3 3"></path>
                <path d="M8 21l.01 0"></path>
                <path d="M12 21l.01 0"></path>
                <path d="M16 21l.01 0"></path>
              </svg>
              <span className="truncate">Home Banner Slides</span>
            </div>
            <FontAwesomeIcon
              aria-hidden="true"
              icon={expandedItems.homeBannerSlides ? faAngleDown : faAngleRight}
            ></FontAwesomeIcon>
          </button>
          {expandedItems.homeBannerSlides && (
            <div className="flex flex-col pl-1 border-l-2 border-teal-700 space-y-2 w-[90%] self-end items-start justify-center">
              <button
                onClick={() => navigate("/admin/products")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Add Home Banner Slide
              </button>
              <button
                onClick={() => navigate("/admin/products/upload")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Home Slides List
              </button>
            </div>
          )}
          {/* home banners */}
          <button
            onClick={() => toggleExpand("homeBanners")}
            className="cursor-pointer w-[100%] lg:h-10 flex justify-between gap-1 hover:bg-teal-800 items-center rounded-xl px-3 text-lg mt-1"
          >
            <div className="flex items-center justify-start">
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                  expandedItems.homeBanners ? "text-teal-600" : "text-white"
                }`}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M15 6l.01 0"></path>
                <path d="M3 3m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z"></path>
                <path d="M3 13l4 -4a3 5 0 0 1 3 0l4 4"></path>
                <path d="M13 12l2 -2a3 5 0 0 1 3 0l3 3"></path>
                <path d="M8 21l.01 0"></path>
                <path d="M12 21l.01 0"></path>
                <path d="M16 21l.01 0"></path>
              </svg>
              <span>Home Banners</span>
            </div>
            <FontAwesomeIcon
              aria-hidden="true"
              icon={expandedItems.homeBanners ? faAngleDown : faAngleRight}
            ></FontAwesomeIcon>
          </button>
          {expandedItems.homeBanners && (
            <div className="flex flex-col pl-1 border-l-2 border-teal-700 space-y-2 w-[90%] self-end items-start justify-center">
              <button
                onClick={() => navigate("/admin/products")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Banners List
              </button>
              <button
                onClick={() => navigate("/admin/products/upload")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Banners Upload
              </button>
            </div>
          )}
          {/* home side banners */}
          <button
            onClick={() => toggleExpand("homeSideBanners")}
            className="cursor-pointer w-[100%] lg:h-10 flex justify-between gap-1 hover:bg-teal-800 items-center rounded-xl px-3 text-lg mt-1"
          >
            <div className="flex items-center justify-start">
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                  expandedItems.homeSideBanners ? "text-teal-600" : "text-white"
                }`}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M15 6l.01 0"></path>
                <path d="M3 3m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z"></path>
                <path d="M3 13l4 -4a3 5 0 0 1 3 0l4 4"></path>
                <path d="M13 12l2 -2a3 5 0 0 1 3 0l3 3"></path>
                <path d="M8 21l.01 0"></path>
                <path d="M12 21l.01 0"></path>
                <path d="M16 21l.01 0"></path>
              </svg>
              <span>Home Side Banners</span>
            </div>
            <FontAwesomeIcon
              aria-hidden="true"
              icon={expandedItems.homeSideBanners ? faAngleDown : faAngleRight}
            ></FontAwesomeIcon>
          </button>
          {expandedItems.homeSideBanners && (
            <div className="flex flex-col pl-1 border-l-2 border-teal-700 space-y-2 w-[90%] self-end items-start justify-center">
              <button
                onClick={() => navigate("/admin/products")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Banners List
              </button>
              <button
                onClick={() => navigate("/admin/products/upload")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Banners Upload
              </button>
            </div>
          )}
          {/* home bottom banners */}
          <button
            onClick={() => toggleExpand("homeBottomBanners")}
            className="cursor-pointer w-[100%] lg:h-10 flex justify-between gap-1 hover:bg-teal-800 items-center rounded-xl px-3 text-lg mt-1"
          >
            <div className="flex items-center justify-start">
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                  expandedItems.homeBottomBanners
                    ? "text-teal-600"
                    : "text-white"
                }`}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M15 6l.01 0"></path>
                <path d="M3 3m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z"></path>
                <path d="M3 13l4 -4a3 5 0 0 1 3 0l4 4"></path>
                <path d="M13 12l2 -2a3 5 0 0 1 3 0l3 3"></path>
                <path d="M8 21l.01 0"></path>
                <path d="M12 21l.01 0"></path>
                <path d="M16 21l.01 0"></path>
              </svg>
              <span>Home Bottom Banners</span>
            </div>
            <FontAwesomeIcon
              aria-hidden="true"
              icon={
                expandedItems.homeBottomBanners ? faAngleDown : faAngleRight
              }
            ></FontAwesomeIcon>
          </button>
          {expandedItems.homeBottomBanners && (
            <div className="flex flex-col pl-1 border-l-2 border-teal-700 space-y-2 w-[90%] self-end items-start justify-center">
              <button
                onClick={() => navigate("/admin/products")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Banners List
              </button>
              <button
                onClick={() => navigate("/admin/products/upload")}
                className="hover:bg-teal-800 px-3 py-1 rounded-lg text-white"
              >
                Banners Upload
              </button>
            </div>
          )}
          <div className="mt-14 h-40 w-[100%] rounded-xl relative">
            <img
              src="https://i.postimg.cc/J43bXgxb/logout.jpg"
              alt="https://i.postimg.cc/J43bXgxb/logout.jpg"
              className="absolute top-0 left-0 h-[100%] w-[100%] object-cover rounded-xl"
            />
            <button className="absolute top-[46%] left-[49.5%] translate-x-[-50%] translate-y-[-50%] bg-gray-600 text-white hover:bg-gray-800 px-1.5 py-1.5 rounded-full sm:text-xl text-center justify-center items-center lg:text-2xl font-serif w-[7.5rem] border-separate border-2 border-lime-500 shadow-2xl">
              Logout
            </button>
          </div>
        </div>
      )}

      {isUserOpen && (
        <div
          ref={userRef}
          className="fixed top-16 right-10 w-80 h-40 bg-white text-teal-900 shadow-lg p-4 z-50 flex flex-col gap-2 overflow-hidden overflow-y-auto"
        >
          <p className="text-lg font-bold">Welcome, Inayat Hasan</p>
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Voluptatibus, quae?
          </p>
          <Link to="/admin/profile">
            <button className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl text-center justify-center items-center lg:text-2xl">
              Profile
            </button>
          </Link>
          <Link to="/admin/orders">
            <button className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl text-center justify-center items-center lg:text-2xl">
              Orders
            </button>
          </Link>
          <Link to="/admin/wishlist">
            <button className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl text-center justify-center items-center lg:text-2xl">
              Wishlist
            </button>
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              navigate("/admin/login");
            }}
            className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl text-center justify-center items-center lg:text-2xl"
          >
            Logout
          </button>
        </div>
      )}

      {isNotificationOpen && (
        <div
          ref={notificationRef}
          className="fixed top-16 right-10 w-80 h-40 bg-white text-teal-900 shadow-lg p-4 z-50 flex flex-col gap-2 overflow-hidden overflow-y-auto"
        >
          <Link to="/admin/dashboard">
            <button className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl text-center justify-center items-center lg:text-2xl">
              Dashboard
            </button>
          </Link>
          <Link to="/admin/products">
            <button className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl text-center justify-center items-center lg:text-2xl">
              Products
            </button>
          </Link>
          <Link to="/admin/orders">
            <button className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl text-center justify-center items-center lg:text-2xl">
              Orders
            </button>
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              navigate("/admin/login");
            }}
            className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl text-center justify-center items-center lg:text-2xl"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
