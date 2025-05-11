import { useState } from "react";
import {
  Layout,
  Image,
  Package,
  CheckSquare,
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
  Settings,
  Moon,
  Sun,
  ShoppingCart,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/reducers/sidebar/sidebarSelector";
import {
  closeSidebar,
  toggleSidebar,
} from "../redux/reducers/sidebar/sidebarReducer.js";
import { Link } from "react-router-dom";
import {
  selectIsLoggedIn,
  selectUser,
} from "../redux/reducers/authentication/authSelector.js";

const Sidebar = ({
  sidebarRef,
  isDarkMode,
  toggleDarkMode,
  showLogoutConfirmation,
}) => {
  const [activeSection, setActiveSection] = useState(null);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  // Define sidebar items as an array for easier management
  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      link: "/",
      highlight: true,
    },
    {
      id: "homeBannerSlides",
      label: "Banner Slides",
      icon: Image,
      children: [
        {
          label: "Banner Slides List",
          link: "/product-weight",
        },
        {
          label: "Add Banner Slide",
          link: "/product-weight",
          highlight: true,
        },
      ],
    },
    {
      id: "category",
      label: "Categories",
      icon: Layout,
      highlight: true,
      children: [
        { label: "Category List", link: "/product-weight" },
        { label: "Add Category", link: "/product-weight", highlight: true },
        { label: "Sub Category List", link: "/product-weight" },
        {
          label: "Add Sub Category",
          link: "/product-weight",
          highlight: true,
        },
      ],
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      children: [
        { label: "Product List", link: "/product-list" },
        { label: "Product Upload", link: "/add-product", highlight: true },
        { label: "Add Product RAM", link: "/product-ram" },
        { label: "Add Product Weight", link: "/product-size" },
        { label: "Add Product Size", link: "/product-size" },
      ],
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      link: "/orders",
    },
    {
      id: "homeBanners",
      label: "Home Banners",
      icon: Image,
      children: [
        { label: "Banners List", link: "/product-size" },
        { label: "Add Banner", link: "/product-size", highlight: true },
      ],
    },
    {
      id: "homeSideBanners",
      label: "Side Banners",
      icon: Image,
      children: [
        { label: "Side Banners List", link: "/product-size" },
        {
          label: "Add Side Banner",
          link: "/product-size",
          highlight: true,
        },
      ],
    },
    {
      id: "homeBottomBanners",
      label: "Bottom Banners",
      icon: Image,
      children: [
        { label: "Bottom Banners List", link: "/product-size" },
        {
          label: "Add Bottom Banner",
          link: "/product-size",
          highlight: true,
        },
      ],
    },
  ];

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const isSectionOpen = (section) => activeSection === section;

  // Render a sidebar item (can be a link or dropdown)
  const renderSidebarItem = (item) => {
    const IconComponent = item.icon;
    const isOpen = isSectionOpen(item.id);

    // If it has children, render as dropdown
    if (item.children) {
      return (
        <div key={item.id} className="mb-1">
          <div
            className={`
              flex items-center px-4 py-3 rounded-lg mx-2
              ${isOpen ? "bg-teal-50 dark:bg-teal-900/30" : ""} 
              hover:bg-gray-100 dark:hover:bg-gray-800 
              cursor-pointer transition-all duration-200
            `}
            onClick={() => toggleSection(item.id)}
          >
            <IconComponent
              className={`w-5 h-5 mr-3 ${
                item.highlight
                  ? "text-teal-500 dark:text-teal-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            />
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {item.label}
            </span>
            {isOpen ? (
              <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400" />
            )}
          </div>

          {/* Dropdown items with animation */}
          <div
            className={`
              overflow-hidden transition-all duration-300 pl-4 ml-4 border-l border-gray-200 dark:border-gray-700
              ${isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}
            `}
          >
            {item.children.map((child, idx) => (
              <Link
                key={`${item.id}-child-${idx}`}
                to={child.link}
                onClick={() => !isLargeScreen && dispatch(toggleSidebar())}
              >
                <div
                  className={`
                    py-2 px-4 my-1 rounded-lg
                    hover:bg-gray-100 dark:hover:bg-gray-800 
                    cursor-pointer transition-colors duration-200
                    ${
                      child.highlight
                        ? "text-teal-500 dark:text-teal-400 font-medium"
                        : "text-gray-600 dark:text-gray-300"
                    }
                  `}
                >
                  {child.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      );
    }

    // Regular link item
    return (
      <Link
        key={item.id}
        to={item.link}
        onClick={() => !isLargeScreen && dispatch(toggleSidebar())}
      >
        <div
          className={`
            flex items-center px-4 py-3 mx-2 my-1 rounded-lg
            hover:bg-gray-100 dark:hover:bg-gray-800
            cursor-pointer transition-all duration-200
          `}
        >
          <IconComponent
            className={`w-5 h-5 mr-3 ${
              item.highlight
                ? "text-teal-500 dark:text-teal-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          />
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {item.label}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex relative">
      {/* Backdrop overlay - only visible when sidebar is open on small screens */}
      {isSideBarOpened && !isLargeScreen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => dispatch(closeSidebar())}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 overflow-hidden
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transform transition-all duration-300 ease-in-out
          ${isSideBarOpened ? "translate-x-0 shadow-xl" : "-translate-x-full"}
          ${
            isLargeScreen
              ? "lg:top-[4rem] lg:h-[calc(100vh-4rem)] w-72"
              : "top-0 h-full w-[85vw] max-w-[320px]"
          }
        `}
      >
        {/* Sidebar Content */}
        <div
          ref={sidebarRef}
          className="h-full flex flex-col transition-colors duration-300"
        >
          {/* User Profile Section - Only when logged in */}
          {isLoggedIn && user && (
            <div className="p-4 mb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center">
                  <span className="text-teal-600 dark:text-teal-300 font-medium text-lg">
                    {user.fullName ? user.fullName.charAt(0) : "U"}
                  </span>
                </div>
                <div className="ml-3 flex-1 truncate">
                  <p className="font-medium text-gray-800 dark:text-white truncate">
                    {user.fullName || "User"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.email || ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sidebarItems.map(renderSidebarItem)}
          </div>

          {/* Settings & Controls */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 
                hover:bg-gray-200 dark:hover:bg-gray-700 
                transition-colors duration-200 flex items-center justify-center"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-5 h-5 mr-3 text-amber-500" />
                  <span className="font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 mr-3 text-indigo-500" />
                  <span className="font-medium">Dark Mode</span>
                </>
              )}
            </button>

            {/* Logout Button */}
            {isLoggedIn && (
              <button
                onClick={showLogoutConfirmation}
                className="w-full flex items-center justify-center p-3 bg-teal-500 dark:bg-teal-600 
                  text-white rounded-lg hover:bg-teal-600 dark:hover:bg-teal-700 
                  transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Spacer for Large Screens */}
      {isLargeScreen && (
        <>
          {/* Spacer for fixed header */}
          <div className="w-full lg:block hidden"></div>

          {/* Spacer for sidebar */}
          {isSideBarOpened && (
            <div className="w-72 flex-shrink-0 transition-all duration-300"></div>
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;
