import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  User,
  ChevronDown,
} from "lucide-react";

const OrderList = ({ orders = exampleAllOrders }) => {
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Enhanced status options with dark mode support
  const statusOptions = {
    All: {
      label: "All Orders",
      color:
        "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200",
    },
    pending: {
      label: "Pending",
      color:
        "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200",
    },
    confirmed: {
      label: "Confirmed",
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200",
    },
    out_for_delivery: {
      label: "Out For Delivery",
      color:
        "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200",
    },
    delivered: {
      label: "Delivered",
      color:
        "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200",
    },
  };

  // Filter orders based on search and category
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // order.buyer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderDetails.orderId
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      order.orderDetails.orderStatus === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get payment method display
  const getPaymentMethod = (paymentDetails) => {
    if (!paymentDetails || !paymentDetails.paymentMethod) return "N/A";

    if (paymentDetails.paymentMethod.upi) {
      return "UPI";
    } else if (paymentDetails.paymentMethod.card) {
      const card = paymentDetails.paymentMethod.card;
      return `${card.card_network} ****${card.card_number.slice(-4)}`;
    }

    return "Other";
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "N/A";
    return `${address.city}, ${address.state}`;
  };

  const handleViewProduct = (order) => {
    setSelectedOrder(order);
    setShowProductDetails(true);
  };

  // Effect to reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const { color } = statusOptions[status] || statusOptions["pending"];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white rounded-xl shadow-lg overflow-hidden flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-6 md:p-8 pb-0">
        <div className="flex items-center mb-2">
          <ShoppingBag
            className="mr-3 text-teal-500 dark:text-teal-400"
            size={28}
          />
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-400 dark:to-emerald-400">
            Order Management
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Track, manage and process customer orders
        </p>

        {/* Mobile Filters Button */}
        <button
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="md:hidden flex items-center justify-between w-full mb-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <span className="flex items-center">
            <Filter
              className="mr-2 text-slate-500 dark:text-slate-400"
              size={18}
            />
            Filters
          </span>
          <ChevronDown
            size={18}
            className={`transition-transform ${
              isMobileFiltersOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Search and Filters */}
        <div
          className={`${
            isMobileFiltersOpen ? "block" : "hidden"
          } md:flex flex-col lg:flex-row justify-between gap-4 mb-6`}
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by product or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white p-3 pl-10 rounded-lg w-full border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
            />
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 p-1 w-full sm:w-auto">
              <Filter
                className="mx-2 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white py-2 pr-8 pl-2 rounded cursor-pointer focus:outline-none appearance-none w-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "1.5em 1.5em",
                }}
              >
                <option value="All">All Orders</option>
                {Object.keys(statusOptions)
                  .filter((k) => k !== "All")
                  .map((status) => (
                    <option key={status} value={status}>
                      {statusOptions[status].label}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 p-1 w-full sm:w-auto">
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="bg-transparent text-slate-900 dark:text-white py-2 pr-8 pl-3 rounded cursor-pointer focus:outline-none appearance-none w-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "1.5em 1.5em",
                }}
              >
                {[5, 10, 25, 50].map((value) => (
                  <option key={value} value={value}>
                    {value} rows
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="px-6 md:px-8 overflow-hidden flex-1">
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
              <table className="w-full table-auto min-w-max">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 dark:bg-slate-800/90 backdrop-blur text-slate-600 dark:text-slate-300 text-sm">
                    <th className="p-4 text-left font-medium">Order ID</th>
                    <th className="p-4 text-left font-medium">Product</th>
                    <th className="p-4 text-left font-medium">Customer</th>
                    <th className="p-4 text-left font-medium hidden md:table-cell">
                      Location
                    </th>
                    <th className="p-4 text-left font-medium hidden sm:table-cell">
                      Total
                    </th>
                    <th className="p-4 text-left font-medium hidden lg:table-cell">
                      Payment
                    </th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium hidden xl:table-cell">
                      Order Date
                    </th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium text-teal-600 dark:text-teal-400">
                            {order.orderDetails.orderId.substring(0, 8)}...
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                            Qty: {order.quantity}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">
                            {order.product.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {order.product.brand}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {order.buyer?.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <div className="font-medium">
                                {order.buyer?.fullName?.split(" ")[0] ||
                                  "Unknown"}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
                                Customer
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center">
                            <MapPin
                              size={14}
                              className="text-slate-400 dark:text-slate-500 mr-1"
                            />
                            {formatAddress(order.address)}
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                            ₹{order.totalAmount.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="flex items-center">
                            <CreditCard
                              size={14}
                              className="text-slate-400 dark:text-slate-500 mr-1"
                            />
                            {getPaymentMethod(order.paymentDetails)}
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge
                            status={order.orderDetails.orderStatus}
                          />
                        </td>
                        <td className="p-4 hidden xl:table-cell">
                          <div className="flex items-center text-sm">
                            <Calendar
                              size={14}
                              className="text-slate-400 dark:text-slate-500 mr-1"
                            />
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewProduct(order)}
                              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-teal-600 dark:text-teal-400 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors"
                              title="Contact Customer"
                            >
                              <MessageSquare size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="p-6 text-center text-slate-500 dark:text-slate-400"
                      >
                        <Package className="mx-auto mb-2" size={24} />
                        No orders found matching your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="p-6 md:p-8 pt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400 gap-4">
        <div>
          {totalItems === 0
            ? "0-0 of 0"
            : `${startIndex + 1}-${Math.min(
                endIndex,
                totalItems
              )} of ${totalItems} orders`}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
              currentPage === 1
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white"
            } transition-colors`}
          >
            <ChevronLeft size={18} />
          </button>

          <span className="px-2">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`p-2 rounded-lg ${
              currentPage === totalPages || totalPages === 0
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white"
            } transition-colors`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Product Details Modal */}
      {showProductDetails && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-400 dark:to-emerald-400">
                Order #{selectedOrder.orderDetails.orderId.substring(0, 8)}
              </h2>
              <button
                onClick={() => setShowProductDetails(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Information */}
              <div>
                <div className="flex items-center text-slate-700 dark:text-slate-300 mb-3">
                  <Package className="mr-2" size={18} />
                  <h3 className="font-semibold">Product Information</h3>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <p className="text-lg font-bold mb-1">
                    {selectedOrder.product.name}
                  </p>
                  <p className="text-sm text-teal-500 dark:text-teal-400 mb-3">
                    Brand: {selectedOrder.product.brand}
                  </p>
                  <p className="text-sm mb-4 text-slate-600 dark:text-slate-300">
                    {selectedOrder.product.description}
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Original Price
                      </p>
                      <p className="line-through text-slate-500 dark:text-slate-400">
                        ₹{selectedOrder.product.actualPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Sale Price
                      </p>
                      <p className="text-emerald-500 dark:text-emerald-400 font-medium">
                        ₹
                        {selectedOrder.product.discountedPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Quantity
                      </p>
                      <p className="font-medium">{selectedOrder.quantity}</p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="flex items-center text-slate-700 dark:text-slate-300 mt-6 mb-3">
                  <ShoppingBag className="mr-2" size={18} />
                  <h3 className="font-semibold">Order Summary</h3>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-3">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">
                        Subtotal
                      </span>
                      <span>
                        ₹
                        {(
                          selectedOrder.productPrice * selectedOrder.quantity
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">
                        Delivery Fee
                      </span>
                      <span>₹{selectedOrder.deliveryCharges}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">
                        Platform Fee
                      </span>
                      <span>₹{selectedOrder.platformFee}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">
                        Discount
                      </span>
                      <span className="text-emerald-500 dark:text-emerald-400">
                        -₹{selectedOrder.totalDiscount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-700 mt-2 font-bold text-lg">
                      <span>Total</span>
                      <span className="text-emerald-500 dark:text-emerald-400">
                        ₹{selectedOrder.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery & Payment Info */}
              <div>
                {/* Delivery Information */}
                <div className="flex items-center text-slate-700 dark:text-slate-300 mb-3">
                  <MapPin className="mr-2" size={18} />
                  <h3 className="font-semibold">Delivery Information</h3>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-teal-500 dark:text-teal-400 mr-3">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedOrder.address.name}
                      </p>
                      <p className="text-xs text-teal-500 dark:text-teal-400">
                        {selectedOrder.address.addressType}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-3 mb-4">
                    <p className="text-sm">
                      {selectedOrder.address.locality}
                      {selectedOrder.address.landmark &&
                        `, ${selectedOrder.address.landmark}`}
                    </p>
                    <p className="text-sm">
                      {selectedOrder.address.city},{" "}
                      {selectedOrder.address.state} -{" "}
                      {selectedOrder.address.pinCode}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Order Date
                      </p>
                      <div className="flex items-center">
                        <Calendar
                          size={14}
                          className="mr-1 text-teal-500 dark:text-teal-400"
                        />
                        <p className="text-sm">
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Delivery Date
                      </p>
                      <div className="flex items-center">
                        <Calendar
                          size={14}
                          className="mr-1 text-emerald-500 dark:text-emerald-400"
                        />
                        <p className="text-sm">
                          {formatDate(selectedOrder.deliveryTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="flex items-center text-slate-700 dark:text-slate-300 mb-3">
                  <CreditCard className="mr-2" size={18} />
                  <h3 className="font-semibold">Payment Details</h3>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Status
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs inline-block ${
                          selectedOrder.paymentDetails.paymentStatus === "paid"
                            ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200"
                            : "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200"
                        }`}
                      >
                        {selectedOrder.paymentDetails.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Method
                      </p>
                      <p>{getPaymentMethod(selectedOrder.paymentDetails)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Gateway
                      </p>
                      <p>{selectedOrder.paymentGateway.gatewayName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Currency
                      </p>
                      <p>{selectedOrder.orderDetails.orderCurrency}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Payment ID
                    </p>
                    <p className="font-mono text-sm bg-slate-100 dark:bg-slate-700/30 p-2 rounded">
                      {selectedOrder.paymentDetails.paymentId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowProductDetails(false)}
                className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 py-2 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
              <button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-2 px-6 rounded-lg transition-colors">
                Update Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const exampleAllOrders = [
  {
    address: {
      address: "somewhere on earth",
      addressType: "Office",
      alternatePhone: "",
      city: "malegaon",
      landmark: "",
      locality: "near clouds",
      name: "office",
      phoneNumber: "+91 1958558587",
      pinCode: 999999,
      state: "Maharashtra",
    },
    buyer: {
      email: "inayathasan11@gmail.com",
      fullName: "Inayat Hasan",
      phoneNumber: "7249798359",
      _id: "681210514e56b82cdb7ac998",
    },
    createdAt: "2025-05-07T10:26:33.216Z",
    deliveryCharges: 40,
    deliveryTime: "2025-05-09T10:27:05.105Z",
    orderDetails: {
      orderId: "order_73d47f6c5776",
      orderStatus: "delivered",
      orderCurrency: "INR",
    },
    paymentDetails: {
      paymentId:
        "session_1nqelR0X7DqW_oGhV5UNGV6OH4Ij4wTzWS4y5QUO_CTZj8hHkQriOyKUkCiTLS7NXXJqqsSAbkeu0wiB2_-Z83nbp9KVTUxc2AU3GY6IEv_JUrZKpPLXvAJY7HdLtgpaymentpayment",
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
      paymentStatus: "paid",
    },
    paymentGateway: {
      gatewayName: "cashfree",
    },
    platformFee: 20,
    product: {
      actualPrice: 492.19,
      admin: "67c05520634a0170758de266",
      brand: "Terry Inc",
      category: "Tools",
      createdAt: "2025-03-12T14:27:47.905Z",
      description:
        "The Mohammad Mouse is the latest in a seriesofaggravatingproductsfromSanford, Mohr and Bahringer",
      discountedPrice: 290.05,
      images: [
        {
          url: "",
          publicId: "",
        },
        {
          url: "",
          publicId: "",
        },
      ],
      isFeatured: false,
      locations: ["india", "pakistan", "bangladesh", "nepal"],
      name: "Ergonomic Cotton Salad",
      reviews: [],
      reviewsCount: 0,
      status: "active",
      stock: 17,
      stockUnit: "pieces",
      updatedAt: "2025-03-12T14:27:47.905Z",
      __v: 0,
      _id: "67d199e3eb697e6ad6929cff",
    },
    productPrice: 290.05,
    quantity: 2,
    totalAmount: 580.1,
    totalDiscount: 404.28,
    updatedAt: "2025-05-10T13:35:31.509Z",
    __v: 0,
    _id: "681b35597d792458067a1c8a",
  },
  {
    address: {
      address: "somewhere on earth",
      addressType: "Office",
      alternatePhone: "",
      city: "malegaon",
      landmark: "",
      locality: "near clouds",
      name: "office",
      phoneNumber: "+91 1958558587",
      pinCode: 999999,
      state: "Maharashtra",
    },
    buyer: {
      email: "inayathasan11@gmail.com",
      fullName: "Inayat Hasan",
      phoneNumber: "7249798359",
      _id: "681210514e56b82cdb7ac998",
    },
    createdAt: "2025-05-07T10:26:33.216Z",
    deliveryCharges: 40,
    deliveryTime: "2025-05-09T10:27:05.105Z",
    orderDetails: {
      orderId: "order_73d47f6c5776",
      orderStatus: "delivered",
      orderCurrency: "INR",
    },
    paymentDetails: {
      paymentId:
        "session_7CQG-lpJbeiTWDCr6OPAfh_AjnuM8PG4tziV9dfnJR2dfrfi7cdOlAWL4zdgxoyVYcZMM0DusMsVZfo5nZRG8eEzrG0zGcPnkEkoISeTWyIMnwMCoWO136hJvFjskgpaymentpayment",
      paymentMethod: {
        card: {
          card_bank_name: "WORLD DEBIT MASTERCARD REWARDS",
          card_country: "IN",
          card_network: "mastercard",
          card_network_reference_id: null,
          card_number: "XXXXXXXXXXXX1034",
          card_sub_type: "R",
          card_type: "debit_card",
          channel: "link",
          instrument_id: "c20db573-61fe-4fc2-be96-91f3bf8aea8d",
        },
      },
      paymentStatus: "paid",
    },
    paymentGateway: {
      gatewayName: "cashfree",
    },
    platformFee: 20,
    product: {
      actualPrice: 492.19,
      admin: "67c05520634a0170758de266",
      brand: "Terry Inc",
      category: "Tools",
      createdAt: "2025-03-12T14:27:47.905Z",
      description:
        "The Mohammad Mouse is the latest in a seriesofaggravatingproductsfromSanford, Mohr and Bahringer",
      discountedPrice: 290.05,
      images: [
        {
          url: "",
          publicId: "",
        },
        {
          url: "",
          publicId: "",
        },
      ],
      isFeatured: false,
      locations: ["india", "pakistan", "bangladesh", "nepal"],
      name: "Ergonomic Cotton Salad",
      reviews: [],
      reviewsCount: 0,
      status: "active",
      stock: 17,
      stockUnit: "pieces",
      updatedAt: "2025-03-12T14:27:47.905Z",
      __v: 0,
      _id: "67d199e3eb697e6ad6929cff",
    },
    productPrice: 290.05,
    quantity: 2,
    totalAmount: 580.1,
    totalDiscount: 404.28,
    updatedAt: "2025-05-10T13:35:31.509Z",
    __v: 0,
    _id: "681b35597d792458067a1c8a",
  },
];

export default OrderList;
