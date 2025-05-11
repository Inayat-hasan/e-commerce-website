import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Home,
  DollarSign,
  Tag,
  Boxes,
  Ruler,
  Weight,
  Package,
  MessageSquare,
  Calendar,
  Pen,
} from "lucide-react";
import { useAppSelector } from "../redux/hooks";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/reducers/sidebar/sidebarSelector";
import { selectIsLoggedIn } from "../redux/reducers/authentication/authSelector";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductDetail = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null); // Initialize as null for better conditional rendering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { productId } = useParams();
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 }); // Default to center

  // Redux selectors
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  // Handle mouse move for image zoom
  const handleMouseMove = (e) => {
    // Ensure the event target is the image container for correct calculations
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPosition({ x, y });
  };

  // Handle changing the main image by clicking thumbnails
  const handleImageChange = (index) => {
    setMainImageIndex(index);
    setIsZoomed(false); // Reset zoom state when changing the image
  };

  // Fetch product details from the API
  useEffect(() => {
    const getDetails = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const req = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/product/admin/get-product/${productId}`,
          { withCredentials: true }
        );

        if (req.status === 200) {
          setProduct(req.data.data.product);
          // Reset main image index if product images change
          if (req.data.data.product.images?.length > 0) {
            setMainImageIndex(0);
          }
        } else {
          // Handle non-200 responses
          setError(`Failed to load product details: ${req.statusText}`);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        // Provide a more user-friendly error message
        if (error.response && error.response.status === 404) {
          setError("Product not found.");
        } else {
          setError("Failed to load product details. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn && productId) {
      getDetails();
    } else if (!isLoggedIn) {
      setLoading(false);
      setProduct(null);
      setError("Please login to view product details.");
    }
  }, [productId, isLoggedIn]);

  useEffect(() => {
    if (typeof location !== "undefined" && location.state?.successMessage) {
      toast.success(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [typeof location !== "undefined" ? location.state : undefined]);

  if (!isLoggedIn) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen p-4 ${
          isLargeScreen && isSideBarOpened ? "lg:ml-72" : "w-full"
        } bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <div className="text-xl font-semibold">
          Please login to view product details.
          <button
            className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl lg:text-lg justify-center items-center hover:cursor-pointer text-white hover:bg-teal-950"
            onClick={() => navigate("/login")}
            type="button"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen p-4 ${
          isLargeScreen && isSideBarOpened ? "lg:ml-72" : "w-full"
        } bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <div className="text-xl">Loading product details...</div>{" "}
        {/* Use a simple loading indicator */}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen p-4 ${
          isLargeScreen && isSideBarOpened ? "lg:ml-72" : "w-full"
        } bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-500`}
      >
        <div className="text-xl font-semibold">Error: {error}</div>{" "}
        {/* Display error message */}
      </div>
    );
  }

  // Handle case where product is null or undefined after loading without error
  if (!product) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen p-4 ${
          isLargeScreen && isSideBarOpened ? "lg:ml-72" : "w-full"
        } bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <div className="text-xl font-semibold">
          Product data is not available.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isLargeScreen && isSideBarOpened ? "lg:ml-72" : "w-full" // Conditional margin based on sidebar state
      } min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 transition-colors duration-200`} // Responsive padding and theme transition
    >
      {/* Max width container for content */}
      <div className="max-w-screen-xl mx-auto">
        {/* Header Section */}
        <header className="bg-teal-600 dark:bg-teal-700 text-white w-full rounded-lg flex flex-col sm:flex-row items-center justify-between px-4 py-3 sm:px-6 sm:py-4 shadow-md transition-colors duration-200">
          <h1 className="text-2xl sm:text-3xl font-serif cursor-default mb-2 sm:mb-0">
            Product View
          </h1>
          {/* Dashboard Button */}
          <button
            onClick={() => navigate("/")}
            className="bg-teal-800 dark:bg-teal-900 hover:bg-teal-700 dark:hover:bg-teal-800 text-white py-2 px-4 rounded-md flex items-center gap-2 transition duration-200 ease-in-out text-sm sm:text-base"
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate(`/edit-product/${product._id}`)}
            className="bg-teal-800 dark:bg-teal-900 hover:bg-teal-700 dark:hover:bg-teal-800 text-white py-2 px-4 rounded-md flex items-center gap-2 transition duration-200 ease-in-out text-sm sm:text-base"
          >
            <Pen size={20} />
            <span>Edit Product</span>
          </button>
        </header>

        {/* Main Product Content Area */}
        <article className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8 mt-6 transition-colors duration-200">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product Gallery Section */}
            <section className="flex-1 lg:w-1/2">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Product Gallery
              </h2>
              {product.images && product.images.length > 0 ? (
                <>
                  {/* Main Image Container */}
                  <div className="relative mb-4 rounded-md overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                    {/* Product Name Badge */}
                    <div className="bg-teal-600 dark:bg-teal-700 text-white text-sm font-bold py-1 px-3 rounded-br-md absolute top-0 left-0 z-10 cursor-default">
                      {product.name}
                    </div>
                    {/* Zoomable Image */}
                    <div
                      className="relative w-full aspect-video overflow-hidden cursor-zoom-in group" // Use aspect-video for responsive height, add group for hover effects
                      onMouseEnter={() => setIsZoomed(true)}
                      onMouseLeave={() => setIsZoomed(false)}
                      onMouseMove={handleMouseMove}
                      // onClick={handleImageClick} // Click zoom disabled for now, rely on hover
                    >
                      <img
                        src={
                          product.images[mainImageIndex]?.url ||
                          "https://via.placeholder.com/800x450?text=No+Image"
                        } // Add a better placeholder
                        alt={product.name}
                        className={`w-full h-full object-contain transition-transform duration-300 ease-in-out will-change-transform ${
                          // Use will-change for performance hint
                          isZoomed ? "scale-150" : "scale-100"
                        }`}
                        style={
                          isZoomed
                            ? {
                                transformOrigin: `${cursorPosition.x}% ${cursorPosition.y}%`,
                              }
                            : {}
                        }
                      />
                      {/* Optional: Add a magnifying glass icon on hover */}
                      {!isZoomed && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
                    {" "}
                    {/* Added scrollbar styling */}
                    {product.images.map(
                      (img, index) =>
                        // Only render if image URL exists
                        img.url && (
                          <div
                            key={index}
                            className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 border-2 rounded-sm overflow-hidden cursor-pointer transition duration-200 ease-in-out ${
                              index === mainImageIndex
                                ? "border-teal-500 dark:border-teal-400 ring-2 ring-teal-500 dark:ring-teal-400" // Highlight active thumbnail
                                : "border-gray-300 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400"
                            }`}
                            onClick={() => handleImageChange(index)}
                          >
                            <img
                              src={img.url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-gray-200 dark:bg-gray-700 rounded-md w-full aspect-video flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <p>No images available</p>
                </div>
              )}
            </section>

            {/* Product Details Section */}
            <section className="flex-1 lg:w-1/2">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Product Details
              </h2>
              <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                {product.name}
              </h1>

              {/* Details List */}
              <dl className="space-y-4 text-gray-700 dark:text-gray-300">
                {/* Price information */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                  <dt className="w-32 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">
                    <DollarSign
                      size={20}
                      className="text-teal-600 dark:text-teal-400"
                    />
                    Price
                  </dt>
                  <dd className="ml-0 sm:ml-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span
                      className={
                        product.discountPercentage > 0
                          ? "line-through text-gray-500 dark:text-gray-400 text-base"
                          : "font-bold text-teal-600 dark:text-teal-400 text-lg"
                      }
                    >
                      ${product.actualPrice?.toFixed(2) || "N/A"}{" "}
                      {/* Format price, add N/A for missing */}
                    </span>
                    {product.discountPercentage > 0 && (
                      <>
                        <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                          ${product.discountedPrice?.toFixed(2) || "N/A"}{" "}
                          {/* Format price */}
                        </span>
                        <span className="bg-green-500 dark:bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          {product.discountPercentage}% OFF
                        </span>
                      </>
                    )}
                  </dd>
                </div>

                {/* Brand */}
                {product.brand && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                    <dt className="w-32 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">
                      <Tag
                        size={20}
                        className="text-blue-600 dark:text-blue-400"
                      />
                      Brand
                    </dt>
                    <dd className="ml-0 sm:ml-4">{product.brand}</dd>
                  </div>
                )}

                {/* Category */}
                {product.category && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                    <dt className="w-32 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">
                      <Boxes
                        size={20}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                      Category
                    </dt>
                    <dd className="ml-0 sm:ml-4">{product.category}</dd>
                  </div>
                )}

                {/* RAM */}
                {product.ram && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                    <dt className="w-32 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">
                      <Package
                        size={20}
                        className="text-purple-600 dark:text-purple-400"
                      />
                      RAM
                    </dt>
                    <dd className="ml-0 sm:ml-4">{product.ram}</dd>
                  </div>
                )}

                {/* SIZE */}
                {product.sizes &&
                  Array.isArray(product.sizes) &&
                  product.sizes.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                      <dt className="w-32 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">
                        <Ruler
                          size={20}
                          className="text-pink-600 dark:text-pink-400"
                        />
                        SIZE
                      </dt>
                      <dd className="ml-0 sm:ml-4 flex flex-wrap gap-2">
                        {product.sizes.map((size, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm font-medium"
                          >
                            {size}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}

                {/* Weight */}
                {product.weights &&
                  Array.isArray(product.weights) &&
                  product.weights.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                      <dt className="w-32 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">
                        <Weight
                          size={20}
                          className="text-yellow-600 dark:text-yellow-400"
                        />
                        Weight
                      </dt>
                      <dd className="ml-0 sm:ml-4 flex flex-wrap gap-2">
                        {product.weights.map((weight, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm font-medium"
                          >
                            {weight}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}

                {/* Stock */}
                {product.stock !== undefined && ( // Check if stock property exists
                  <div className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                    <dt className="w-32 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">
                      <Package
                        size={20}
                        className="text-green-600 dark:text-green-400"
                      />
                      Stock
                    </dt>
                    <dd className="ml-0 sm:ml-4">
                      {product.stock}{" "}
                      {product.stockUnit ||
                        (product.stock > 1 ? "units" : "unit")}{" "}
                      {/* Pluralize unit */}
                    </dd>
                  </div>
                )}

                {/* Reviews */}
                {product.reviews !== undefined && ( // Check if reviews property exists
                  <div className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                    <dt className="w-32 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">
                      <MessageSquare
                        size={20}
                        className="text-red-600 dark:text-red-400"
                      />
                      Reviews
                    </dt>
                    <dd className="ml-0 sm:ml-4">
                      {Array.isArray(product.reviews)
                        ? `${product.reviews.length} review${
                            product.reviews.length === 1 ? "" : "s"
                          }`
                        : product.reviews}{" "}
                      {/* Handle case where reviews might not be an array or is a count */}
                    </dd>
                  </div>
                )}

                {/* Published Date */}
                {product.publishedDate && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                    <dt className="w-32 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">
                      <Calendar
                        size={20}
                        className="text-cyan-600 dark:text-cyan-400"
                      />
                      Published
                    </dt>
                    <dd className="ml-0 sm:ml-4">{product.publishedDate}</dd>
                  </div>
                )}

                {/* Created Date (if published date not available) */}
                {!product.publishedDate && product.createdAt && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                    <dt className="w-32 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">
                      <Calendar
                        size={20}
                        className="text-cyan-600 dark:text-cyan-400"
                      />
                      Created
                    </dt>
                    <dd className="ml-0 sm:ml-4">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </div>

          {/* Product Description Section */}
          {product.description && (
            <section className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Product Description
              </h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                {" "}
                <p className="leading-relaxed">{product.description}</p>
              </div>
            </section>
          )}
        </article>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
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

export default ProductDetail;
