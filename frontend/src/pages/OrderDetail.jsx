import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBox,
  faTruck,
  faCheck,
  faExclamationTriangle,
  faMapMarkerAlt,
  faCreditCard,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";
import Loading from "../components/Loading";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppSelector } from "../redux/hooks";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/slices/sidebar/sidebarSelector.js";

const OrderDetail = () => {
  const { orderId } = useParams();
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/orders/${orderId}`, {
          withCredentials: true,
        });
        if (response.data.data.order) {
          setOrder(response.data.data.order);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError(
          error?.response?.data?.message || "Failed to fetch order details"
        );
        toast.error("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "out_for_delivery":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
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
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => navigate(-1)}
              className="text-teal-600 hover:text-teal-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!order) return null;

  return (
    <div
      className={`min-h-screen bg-gray-50 py-8 ${
        isLargeScreen && isSideBarOpened ? "pl-80" : "w-full"
      } ${!isLargeScreen && isSideBarOpened ? "w-full" : ""}`}
    >
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-teal-600 hover:text-teal-700"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Order Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order Details
                </h1>
                <p className="text-sm text-gray-500">
                  Order ID: {order.orderDetails.orderId}
                </p>
              </div>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(
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
            </div>
          </div>

          {/* Order Content */}
          <div className="p-6 space-y-6">
            {/* Product Details */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                {order.product.images && order.product.images.length > 0 ? (
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
              <div className="flex-1">
                <h2 className="text-xl font-medium text-gray-900">
                  {order.product.name}
                </h2>
                <p className="text-gray-500 mt-1">
                  {order.product.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="font-medium">
                      ₹{order.productPrice.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Quantity</div>
                    <div className="font-medium">{order.quantity}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total Amount</div>
                    <div className="font-medium">
                      ₹{order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="mr-2 text-teal-600"
                />
                Shipping Address
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium">{order.address.name}</div>
                <div className="text-gray-600 mt-1">
                  {order.address.address}
                  {order.address.landmark && `, ${order.address.landmark}`}
                  <br />
                  {order.address.locality}, {order.address.city}
                  <br />
                  {order.address.state} - {order.address.pinCode}
                  <br />
                  Phone: {order.address.phoneNumber}
                  {order.address.alternatePhone &&
                    `, ${order.address.alternatePhone}`}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <FontAwesomeIcon
                  icon={faCreditCard}
                  className="mr-2 text-teal-600"
                />
                Payment Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="font-medium capitalize">
                    {order.paymentDetails.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">
                    {order.paymentDetails.paymentMethod?.upi ? "UPI" : "Other"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium">
                    ₹{order.platformFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-medium">
                    ₹{order.deliveryCharges.toFixed(2)}
                  </span>
                </div>
                {order.totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Total Savings</span>
                    <span>₹{Math.abs(order.totalDiscount).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <FontAwesomeIcon
                  icon={faShoppingBag}
                  className="mr-2 text-teal-600"
                />
                Order Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-center text-green-600">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                  <div>
                    <div className="font-medium">Order Placed</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
                {order.orderDetails.orderStatus === "out_for_delivery" && (
                  <div className="flex items-center text-blue-600">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faTruck} />
                    </div>
                    <div>
                      <div className="font-medium">Out for Delivery</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.updatedAt)}
                      </div>
                    </div>
                  </div>
                )}
                {order.orderDetails.orderStatus === "delivered" && (
                  <div className="flex items-center text-green-600">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <div>
                      <div className="font-medium">Delivered</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.delieveryTime)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {order.orderDetails.orderStatus === "delivered" && (
              <div className="border-t pt-6">
                <button
                  onClick={() =>
                    navigate(`/product/${order.product._id}/review`)
                  }
                  className="w-full sm:w-auto px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Write a Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default OrderDetail;
