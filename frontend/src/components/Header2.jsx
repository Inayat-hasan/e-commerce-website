import {
  faCartArrowDown,
  faCartShopping,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useNavigate, Link } from "react-router-dom";

const Header2 = () => {
  const navigate = useNavigate();
  return (
    <header className="flex flex-row justify-between px-10 items-center w-full text-white bg-white border-b-2 border-gray-200 h-16 sticky top-0 z-50">
      {/* Logo */}
      <Link to="/">
        <div
          className={`flex flex-row font-serif text-2xl justify-center items-center bg-gradient-to-r from-lime-950 to-gray-800 p-1 rounded text-[#D0CEBA] hover:cursor-pointer`}
          onClick={() => navigate("/")}
        >
          <p>Lushkart</p>
          <FontAwesomeIcon
            aria-hidden="true"
            icon={faCartShopping}
            className=""
          ></FontAwesomeIcon>
        </div>
      </Link>
      {/* Buttons */}
      <div className="flex flex-row items-center gap-3 justify-center">
        <button
          className="flex flex-row bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl lg:text-lg justify-center items-center"
          onClick={() => navigate("/")}
        >
          <FontAwesomeIcon
            aria-hidden="true"
            icon={faHome}
            className="hover:cursor-pointer"
          ></FontAwesomeIcon>
          <p className="sm:hidden">Home</p>
        </button>
        <button className="flex flex-row bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl lg:text-lg justify-center items-center">
          <FontAwesomeIcon
            aria-hidden="true"
            icon={faCartArrowDown}
            className="hover:cursor-pointer"
          ></FontAwesomeIcon>
          <p className="sm:hidden">Cart</p>
        </button>
      </div>
    </header>
  );
};

export default Header2;
