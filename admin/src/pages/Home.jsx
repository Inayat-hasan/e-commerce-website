import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "../redux/hooks.js";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/reducers/sidebar/sidebarSelector.js";
import { selectIsLoggedIn } from "../redux/reducers/authentication/authSelector.js";
import ProductsList from "../components/ProductsList.jsx";
import { ToastContainer, toast } from "react-toastify";
import {
  ShoppingBag,
  Users,
  Package,
  IndianRupee,
  ArrowUpRight,
  Plus,
} from "lucide-react";

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenue: 0,
  });

  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const navigate = useNavigate();

  const handleProductDelete = (deletedProductId) => {
    setAllProducts((prev) =>
      prev.filter((product) => product._id !== deletedProductId)
    );
    toast.success("Product deleted successfully");
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const req = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/product/admin/get-all-products`,
          { withCredentials: true }
        );
        if (req.status === 200) {
          setAllProducts(req.data.data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    const getDashboardDetails = async () => {
      try {
        const req = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/admin/dashboard-details`,
          { withCredentials: true }
        );
        const { totalUsers, totalProducts, totalOrders, totalRevenueAmount } =
          req.data.data;
        if (req.status === 200) {
          setStats({
            totalOrders,
            totalUsers,
            totalProducts,
            revenue: totalRevenueAmount,
          });
        }
      } catch (error) {
        setStats({
          totalOrders: 0,
          totalUsers: 0,
          totalProducts: 0,
          revenue: 0,
        });
      }
    };

    if (isLoggedIn) {
      getProducts();
      getDashboardDetails();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (!isLoggedIn) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 ${
          isLargeScreen && isSideBarOpened ? "ml-72" : ""
        }`}
      >
        <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg max-w-md w-full mx-4">
          <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-4">
            Access Required
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Please sign in to access the admin dashboard
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="px-6 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-all flex items-center gap-2 shadow-md hover:shadow-teal-500/20"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 ${
        isLargeScreen && isSideBarOpened ? "ml-72" : ""
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header and Add Product Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back! Here's what's happening with your store.
            </p>
          </div>
          <button
            onClick={() => navigate("/add-product")}
            className="px-5 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-teal-500/30"
          >
            <Plus size={18} />
            Add New Product
          </button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Orders Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Orders
                </p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                  {stats.totalOrders || 0}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
              <ArrowUpRight size={16} className="mr-1" />
              <span>12% from last month</span>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Users
                </p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                  {stats.totalUsers || 0}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
              <ArrowUpRight size={16} className="mr-1" />
              <span>8% from last month</span>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Products
                </p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                  {stats.totalProducts || 0}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                <Package size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
              <ArrowUpRight size={16} className="mr-1" />
              <span>5 new this week</span>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                  ₹{stats.revenue?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                <IndianRupee size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
              <ArrowUpRight size={16} className="mr-1" />
              <span>24% from last month</span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading product inventory...
              </p>
            </div>
          ) : (
            <ProductsList
              products={allProducts}
              heading={"Product Inventory"}
              onProductDelete={handleProductDelete}
            />
          )}
        </div>
      </div>

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="rounded-lg shadow-md"
        progressClassName="bg-teal-500"
      />
    </div>
  );
};

export default Home;
