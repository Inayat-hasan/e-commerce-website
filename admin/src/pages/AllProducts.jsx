import { useEffect, useState } from "react";
import ProductsList from "../components/ProductsList"; // Assuming this path is correct
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "../redux/hooks"; // Assuming this path is correct
import { selectIsLoggedIn } from "../redux/reducers/authentication/authSelector"; // Assuming this path is correct
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/reducers/sidebar/sidebarSelector"; // Assuming this path is correct
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  PlusCircle,
  LogIn,
  AlertTriangle,
  LoaderCircle,
  Inbox, // For empty state
} from "lucide-react";
import StatCard from "../components/StatCard";

const AllProducts = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenue: 0,
  });
  const navigate = useNavigate();
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isLargeScreen = useAppSelector(selectIsLargeScreen);

  const handleProductDelete = (deletedProductId) => {
    setAllProducts((prev) =>
      prev.filter((product) => product._id !== deletedProductId)
    );
    setStats((prevStats) => ({
      ...prevStats,
      totalProducts: Math.max(0, prevStats.totalProducts - 1),
    }));
    toast.success("Product deleted successfully");
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const req = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/product/admin/get-all-products`,
          { withCredentials: true }
        );
        if (req.status === 200 && req.data.data.products) {
          setAllProducts(req.data.data.products);
        } else {
          setAllProducts([]); // Ensure it's an array in case of unexpected response
          toast.error("Could not fetch products data.");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load products."
        );
        setAllProducts([]);
      }
    };

    const getDashboardDetails = async () => {
      try {
        const req = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/admin/dashboard-details`,
          { withCredentials: true }
        );
        if (req.status === 200 && req.data.data) {
          const { totalUsers, totalProducts, totalOrders, totalRevenueAmount } =
            req.data.data;
          setStats({
            totalOrders: totalOrders || 0,
            totalUsers: totalUsers || 0,
            totalProducts: totalProducts || 0,
            revenue: totalRevenueAmount || 0,
          });
        } else {
          setStats({
            totalOrders: 0,
            totalUsers: 0,
            totalProducts: 0,
            revenue: 0,
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
      setLoading(true);
      Promise.all([getProducts(), getDashboardDetails()])
        .catch((error) => console.error("Error in combined fetches:", error)) // Catch any unhandled promise rejections from Promise.all itself
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false); // Not logged in, so not loading
      setAllProducts([]);
      setStats({ totalOrders: 0, totalUsers: 0, totalProducts: 0, revenue: 0 });
    }
  }, [isLoggedIn]);

  const mainContentClass = `min-h-screen bg-gray-100 dark:bg-slate-900 transition-all duration-300 ease-in-out ${
    isSideBarOpened && isLargeScreen ? "lg:ml-72" : "w-full"
  }`;

  if (!isLoggedIn) {
    return (
      <div
        className={`${mainContentClass} flex items-center justify-center p-4`}
      >
        <div className="text-center p-8 sm:p-12 bg-white dark:bg-slate-800 shadow-2xl rounded-xl max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-6" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm sm:text-base">
            Please log in to view product details and manage your inventory.
          </p>
          <button
            className="w-full flex items-center justify-center gap-2.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            onClick={() => navigate("/login")}
            aria-label="Go to Login Page"
          >
            <LogIn size={20} />
            Login
          </button>
        </div>
        <ToastContainer position="bottom-right" theme="colored" />
      </div>
    );
  }

  return (
    <div className={mainContentClass}>
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              All Products
            </h1>
          </div>
          <button
            onClick={() => navigate("/add-product")} // Updated route
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-300"
            aria-label="Add New Product"
          >
            <PlusCircle size={20} />
            <span>Add New Product</span>
          </button>
        </header>

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={<ShoppingCart size={24} />}
            />
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<Users size={24} />}
            />
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={<Package size={24} />}
            />
            <StatCard
              title="Total Revenue"
              value={stats.revenue}
              icon={<DollarSign size={24} />}
              unit="$"
            />
          </div>
        )}

        {/* Products List Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6">
            <LoaderCircle className="w-12 h-12 text-teal-600 dark:text-teal-400 animate-spin mb-5" />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Loading Products...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Hang tight, we're fetching your product data.
            </p>
          </div>
        ) : allProducts.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden">
            <ProductsList
              heading={"Product Inventory"}
              products={allProducts}
              onProductDelete={handleProductDelete}
            />
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 px-6 bg-white dark:bg-slate-800 shadow-xl rounded-xl">
            <Inbox className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-5" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Products Found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              It looks like there are no products in your inventory yet.
            </p>
            <button
              onClick={() => navigate("/add-product")} // Updated route
              className="flex items-center justify-center gap-2 mx-auto bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-colors duration-150 ease-in-out"
              aria-label="Add Your First Product"
            >
              <PlusCircle size={20} />
              Add Your First Product
            </button>
          </div>
        )}
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default AllProducts;
