import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "../redux/hooks";
import { selectIsOpen } from "../redux/reducers/sidebar/sidebarSelector";

const ProductOrders = () => {
  const navigate = useNavigate();
  const isSideBarOpened = useAppSelector(selectIsOpen);
  
  return (
    <div
      className={`${
        isSideBarOpened ? "ml-72" : "w-full"
      } bg-gray-200 flex flex-col items-center py-2`}
    >
      <div className="w-[95%] flex flex-row bg-teal-900 rounded-lg text-white items-center justify-between py-1 px-2">
        <p className="text-2xl">Orders List</p>
        <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
          DashBoard
        </button>
      </div>
      <div className="w-[95%]"></div>
    </div>
  );
};

export default ProductOrders;
