import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faSpinner,
  faStar,
  faBox,
  faTruck,
  faCheck,
  faExclamationTriangle,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  selectIsLoggedIn,
  selectUser,
} from "../redux/slices/authentication/authSelector.js";
import { useAppDispatch, useAppSelector } from "../redux/hooks/index.js";
import Loading from "../components/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/slices/sidebar/sidebarSelector.js";
import { setCartCount } from "../redux/slices/cartCount/cartCountSlice.js";
import fetchCartCount from "../redux/functions/fetchCartCount.js";
import { setUser } from "../redux/slices/authentication/authSlice.js";
import checkBuyer from "../redux/functions/checkBuyer.js";

const ordersArrayExample = [
  // this is just an example to help my self, i will remove this afterwards.
  {
    _id: "1",
    product: {
      _id: "1",
      name: "Product 1",
      description: "Description of product 1",
      actualPrice: 100,
      discountedPrice: 50,
      stock: 10,
      stockUnit: "kg",
      category: "Category 1",
      subCategory: "SubCategory 1",
      brand: "Brand 1",
      discountPercentage: 10,
      reviews: [{ rating: 4.5, comment: "Good product" }],
      images: [
        { url: "https://example.com/image1.jpg", publicId: "publicId" },
        { url: "https://example.com/image2.jpg", publicId: "publicId" },
      ],
    },
    quantity: 2,
    productPrice: 705.99,
    totalDiscount: -379, // it is negative right now, just ignore that i will handle that in future. it is just random number now.
    platformFee: 20,
    deliveryCharges: 40,
    totalAmount: 706,
    orderDetails: {
      orderId: "order_e2c7e772a754",
      orderStatus: "out_for_delivery",
      orderCurrency: "INR",
    },
    address: {
      name: "home2",
      phoneNumber: "+91 9999999999",
      pinCode: 888888,
      locality: "near clouds",
      address: "bhagya nagar , road no.2 .",
      city: "Nanded",
      state: "Maharashtra",
      landmark: "",
      alternatePhone: "",
      addressType: "Home",
    },
    paymentDetails: {
      paymentId:
        "session_E9U2DZGbCOKweCoJ1CeJwD1HzLO2IReXJ7nh1tjWWcj9GzD1PxaUQMVxON1AKtSPF6FAzvQ6j-QKixLxOc6i8vRuma6G5i5MfveaZTKIsVg6Vxn32cJhEPWhJsBQuQpaymentpayment",
      paymentStatus: "paid",
      paymentMethod: {
        upi: {
          channel: "collect",
          upi_id: "testsuccess@gocash",
          upi_instrument: "",
          upi_instrument_number: "",
          upi_payer_account_number: "",
          upi_payer_ifsc: "",
        },
      },
    },
    paymentGateway: {
      gatewayName: "cashfree",
    },
    delieveryTime: "2025-04-25T13:17:54.343Z", // this will considered when the product was delivered.
    createdAt: "2025-04-22T13:17:28.529Z", // this will be considered when it was ordered.
    updatedAt: "2025-04-22T13:17:54.506Z",
    __v: 0,
  },
  { similartothefirstOne: "similar" },
  { similartothefirstOne: "similar" },
  { etc: "e.t.c" },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTimeRange, setFilterTimeRange] = useState("all");
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const location = useLocation();

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || order.orderDetails.orderStatus === filterStatus;

    if (filterTimeRange === "all") return matchesSearch && matchesStatus;

    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);

    switch (filterTimeRange) {
      case "last30":
        return matchesSearch && matchesStatus && daysDiff <= 30;
      case "last6months":
        return matchesSearch && matchesStatus && daysDiff <= 180;
      case "last12months":
        return matchesSearch && matchesStatus && daysDiff <= 365;
      default:
        return matchesSearch && matchesStatus;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-600";
      case "out_for_delivery":
        return "text-blue-600";
      case "pending":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return faCheck;
      case "out_for_delivery":
        return faTruck;
      case "pending":
        return faBox;
      case "cancelled":
        return faExclamationTriangle;
      default:
        return faBox;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${serverUrl}/api/order/get-orders`, {
        withCredentials: true,
      });
      if (response.data.data.orders) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Handle auth error
      if (error.response?.status === 401) {
        return;
      }
      setError(error?.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    } else {
      fetchOrders();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Check for success message from location state
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (loading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-8 rounded-lg bg-white dark:bg-gray-800 shadow-xl">
          <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-4">
            Please Log In
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            You need to be logged in to view your orders
          </p>
          <button
            className="px-6 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-full hover:bg-teal-700 transition"
            onClick={() => navigate("/login", { state: { from: "/orders" } })}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 py-8 ${
        isLargeScreen && isSideBarOpened ? "pl-80" : "w-full"
      } ${!isLargeScreen && isSideBarOpened ? "w-full" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by product name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>

                <select
                  value={filterTimeRange}
                  onChange={(e) => setFilterTimeRange(e.target.value)}
                  className="border rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Time</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="last6months">Last 6 Months</option>
                  <option value="last12months">Last 12 Months</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-2">{error}</div>
              <button
                onClick={() => {
                  setError(null);
                  fetchOrders();
                }}
                className="text-teal-600 hover:text-teal-700"
              >
                Try again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center">
              {searchTerm || filterStatus !== "all" ? (
                <div className="text-gray-500">
                  <p>No orders match your filters</p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                      setFilterTimeRange("all");
                    }}
                    className="text-teal-600 hover:text-teal-700 mt-2"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p>You haven't placed any orders yet</p>
                  <Link
                    to="/shop"
                    className="text-teal-600 hover:text-teal-700 mt-2 inline-block"
                  >
                    Start shopping
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order._id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image */}
                    <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                      {order.product.images &&
                      order.product.images.length > 0 ? (
                        <img
                          src={order.product.images[0].url}
                          alt={order.product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {order.product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Order ID: {order.orderDetails.orderId}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ordered on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-medium text-gray-900">
                            ₹{order.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Qty: {order.quantity}
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div
                          className={`flex items-center ${getStatusColor(
                            order.orderDetails.orderStatus
                          )}`}
                        >
                          <FontAwesomeIcon
                            icon={getStatusIcon(order.orderDetails.orderStatus)}
                            className="mr-2"
                          />
                          <span className="capitalize">
                            {order.orderDetails.orderStatus.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="flex gap-4">
                          <Link
                            to={`/orders/${order._id}`}
                            className="text-teal-600 hover:text-teal-700 font-medium"
                          >
                            View Details
                          </Link>
                          {order.orderDetails.orderStatus === "delivered" && (
                            <button
                              onClick={() =>
                                navigate(`/product/${order.product._id}/review`)
                              }
                              className="text-teal-600 hover:text-teal-700 font-medium"
                            >
                              Rate & Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default Orders;
