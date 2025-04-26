import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { selectIsOpen } from "../redux/reducers/sidebar/sidebarSelector";

const ProductWeight = () => {
  const navigate = useNavigate();
  const isSideBarOpened = useAppSelector(selectIsOpen);
  return (
    <div
      className={`min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 ${
        isSideBarOpened ? "ml-72" : "w-full"
      }`}
    >
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        🚧 This Page is Under Construction 🚧
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        We're working hard to bring you amazing features!
      </p>
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default ProductWeight;
