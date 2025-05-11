import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "../redux/hooks";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/reducers/sidebar/sidebarSelector";
import OrderList from "../components/OrderList";
import { selectIsLoggedIn } from "../redux/reducers/authentication/authSelector";
import { AlertCircle, Home, Loader2, LogIn, X } from "lucide-react";

const ProductOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const getAllOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/order/admin/get-orders`,
        { withCredentials: true }
      );
      if (response.data.data.orders) {
        setAllOrders(response.data.data.orders);
      }
    } catch (error) {
      setError(
        "Failed to fetch orders. Please check your connection or try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      getAllOrders();
    }
  }, [isLoggedIn]);

  const mainContentMargin =
    isSideBarOpened && isLargeScreen ? "lg:ml-72" : "w-full";

  if (!isLoggedIn) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center gap-6 p-4 bg-gray-100 dark:bg-slate-900 text-center ${mainContentMargin}`}
      >
        <LogIn className="w-16 h-16 text-teal-600 dark:text-teal-400" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Access Denied
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          You need to be logged in to view this page.
        </p>
        <button
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          onClick={() => navigate("/login")}
        >
          <LogIn size={20} />
          Login
        </button>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white flex flex-col items-center py-4 sm:py-6 lg:py-8 px-2 sm:px-4 transition-all duration-300 ease-in-out ${mainContentMargin}`}
    >
      <div className="w-full max-w-7xl">
        {" "}
        {/* Max width container */}
        {/* Header Section */}
        <header className="mb-6 sm:mb-8 w-full bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-400">
              Product Orders
            </h1>
            <button
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold py-2 px-5 rounded-lg shadow hover:shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
              onClick={() => navigate("/")}
            >
              <Home size={20} />
              Dashboard
            </button>
          </div>
        </header>
        {/* Main Content Area */}
        <main className="w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
              <Loader2 className="w-12 h-12 text-teal-600 dark:text-teal-400 animate-spin mb-4" />
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                Loading Orders...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please wait a moment.
              </p>
            </div>
          ) : error ? (
            <div
              className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 p-6 rounded-lg shadow-md relative"
              role="alert"
            >
              <div className="flex">
                <div className="py-1">
                  <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400 mr-3" />
                </div>
                <div>
                  <p className="font-bold">Error Fetching Data</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
              <button
                className="absolute top-3 right-3 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200 transition-colors"
                onClick={() => {
                  setError(null);
                  getAllOrders();
                }} // Added retry functionality
                aria-label="Close error message and retry"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden">
              {/* The OrderList component will handle its own internal padding and table structure */}
              <OrderList orders={allOrders} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductOrders;
