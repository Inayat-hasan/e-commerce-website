import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../redux/hooks/index.js";
import { selectIsOpen } from "../redux/reducers/sidebar/sidebarSelector.js";
import { setUser } from "../redux/reducers/authentication/authReducer.js";
import {
  selectIsLoggedIn,
  selectUser,
} from "../redux/reducers/authentication/authSelector.js";
import checkUserAuth from "../redux/functions/checkUser.js";
import ProductsList from "../components/ProductsList.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenue: 0
  });
  
  const isSideBarOpened = useAppSelector(selectIsOpen);
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const navigate = useNavigate();

  const handleProductDelete = (deletedProductId) => {
    setAllProducts((prev) =>
      prev.filter((product) => product._id !== deletedProductId)
    );
    toast.success("Product deleted successfully");
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const userData = await checkUserAuth();
        if (userData && userData.user) {
          dispatch(setUser(userData));
        } else {
          navigate("/login");
        }
        return userData;
      } catch (error) {
        console.error("Authentication error:", error);
        navigate("/login");
        return null;
      }
    };

    checkUserStatus();
  }, [dispatch, navigate]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const req = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/product/admin/get-all-products`,
          { withCredentials: true }
        );
        if (req.status === 200) {
          setAllProducts(req.data.data.products);
          // Update stats with product count
          setStats(prev => ({
            ...prev,
            totalProducts: req.data.data.products.length
          }));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch products if user is logged in
    if (isLoggedIn) {
      getProducts();
    }
  }, [isLoggedIn]);

  return (
    <div
      className={`min-h-screen bg-gray-100 w-full ${isSideBarOpened ? "lg:ml-72" : ""}`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Total Orders
            </h2>
            <p className="text-3xl font-bold text-blue-600">{stats.totalOrders || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Total Users
            </h2>
            <p className="text-3xl font-bold text-green-600">{stats.totalUsers || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Total Products
            </h2>
            <p className="text-3xl font-bold text-purple-600">{stats.totalProducts || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Revenue
            </h2>
            <p className="text-3xl font-bold text-yellow-600">${stats.revenue || 0}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-lg font-semibold">Loading products...</p>
        </div>
      ) : (
        <ProductsList
          products={allProducts}
          heading={"Product inventory"}
          onProductDelete={handleProductDelete}
        />
      )}
      <ToastContainer position="bottom-center" theme="colored" />
    </div>
  );
};

export default Home;
