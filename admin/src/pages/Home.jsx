import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../redux/hooks/index.js";
import { selectIsOpen } from "../redux/reducers/sidebar/sidebarSelector.js";
import { setUser } from "../redux/reducers/authentication/authReducer.js";
import {
  selectIsLoggedIn,
  selectUser,
} from "../redux/reducers/authentication/authSelector.js";
import checkUser from "../redux/functions/checkUser.js";
import ProductsList from "../components/ProductsList.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const isSideBarOpened = useAppSelector(selectIsOpen);
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const handleProductDelete = (deletedProductId) => {
    setAllProducts((prev) =>
      prev.filter((product) => product._id !== deletedProductId)
    );
  };

  useEffect(() => {
    const checkUser = async () => {
      const user = await checkUser();
      return user;
    };

    checkUser().then((user) => {
      dispatch(setUser(user));
    });
  });

  useEffect(() => {
    const getProducts = async () => {
      try {
        const req = await axios.get(
          `${import.meta.env.SERVER_URL}/api/product/admin/get-all-products`
        );
        if (req.status === 200) {
          setAllProducts(req.data.data.products);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getProducts();
  }, []); // Remove allProducts from dependency array

  return (
    <div
      className={`min-h-screen bg-gray-100 md:w-full sm:w-full ${
        isSideBarOpened ? "lg:ml-72" : "lg:w-full"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Total Orders
            </h2>
            <p className="text-3xl font-bold text-blue-600">150</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Total Users
            </h2>
            <p className="text-3xl font-bold text-green-600">1,234</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Total Products
            </h2>
            <p className="text-3xl font-bold text-purple-600">89</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Revenue
            </h2>
            <p className="text-3xl font-bold text-yellow-600">$15,890</p>
          </div>
        </div>
      </div>

      <ProductsList
        products={allProducts}
        heading={"Product inventory"}
        onProductDelete={handleProductDelete}
      />
      <ToastContainer position="bottom-center" theme="colored" />
    </div>
  );
};

export default Home;
