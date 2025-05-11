import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart } from "lucide-react";

const Header2 = () => {
  const navigate = useNavigate();
  return (
    <header className="flex flex-row justify-between px-10 items-center w-full text-white bg-white border-b-2 border-gray-200 h-16 sticky top-0 z-50">
      {/* Logo */}
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
      {/* Buttons */}
      <div className="flex flex-row items-center gap-3 justify-center">
        <button
          className="flex flex-row bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl lg:text-lg justify-center items-center"
          onClick={() => navigate("/")}
        >
          <Home size={20} className="hover:cursor-pointer" />
          <p className="sm:hidden">Home</p>
        </button>
        <button className="flex flex-row bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl lg:text-lg justify-center items-center">
          <ShoppingCart size={20} className="hover:cursor-pointer" />
          <p className="sm:hidden">Cart</p>
        </button>
      </div>
    </header>
  );
};

export default Header2;
