import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faHeart,
  faStar,
  faStarHalf,
  faXmark,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const ProductPopup = ({ product, onClose, isWishlisted, onWishlistToggle }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Prevent background scrolling when popup is open
  useEffect(() => {
    // Save the current overflow value
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Prevent scrolling on the background
    document.body.style.overflow = "hidden";

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Function to handle mouse movement for zoom effect
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  // Function to navigate to product detail page
  const handleViewDetails = () => {
    onClose(); // Close the popup
    // Use the original ID if available, fallback to the compound ID
    navigate(`/product/${product.originalId || product._id}`); // Navigate to product detail page
  };

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={`star-${i}`}
          icon={faStar}
          className="text-yellow-400"
        />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <FontAwesomeIcon
          key="half-star"
          icon={faStarHalf}
          className="text-yellow-400"
        />
      );
    }
    return stars;
  };

  // Close on background click
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={handleBackgroundClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg max-w-4xl w-full relative mx-auto my-2 animate-slideUp">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm z-10 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Close popup"
        >
          <FontAwesomeIcon icon={faXmark} className="text-gray-600" />
        </button>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            {/* Image section */}
            <div className="md:w-1/2">
              <div className="relative overflow-hidden rounded-lg aspect-square bg-gray-50">
                <img
                  src={product.images[selectedImage].url}
                  alt={product.name}
                  className="w-full h-full object-contain cursor-zoom-in"
                  style={{
                    transform: "scale(1.5)",
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setZoomPosition({ x: 0, y: 0 })}
                />
              </div>
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {product.images.map((image, index) => (
                  <img
                    key={image.publicId}
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className={`w-16 h-16 object-cover rounded cursor-pointer flex-shrink-0
                      ${
                        selectedImage === index
                          ? "border-2 border-teal-600"
                          : "border border-gray-200"
                      }`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            </div>

            {/* Product details section */}
            <div className="md:w-1/2 mt-4 md:mt-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 text-gray-800">
                {product.name}
              </h2>
              <p className="text-gray-600 mb-2">
                Brand: <span className="font-medium">{product.brand}</span>
              </p>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {renderStars(product.averageRating || 4.5)}
                </div>
                <span className="text-sm text-gray-500">
                  {product.reviewsCount || 0} reviews
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-teal-600">
                  ₹{product.discountedPrice.toFixed(2)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.actualPrice.toFixed(2)}
                </span>
                {product.actualPrice > product.discountedPrice && (
                  <span className="bg-red-100 text-red-600 text-sm px-2 py-0.5 rounded-full">
                    {Math.round(
                      ((product.actualPrice - product.discountedPrice) /
                        product.actualPrice) *
                        100
                    )}
                    % Off
                  </span>
                )}
              </div>

              <p
                className={`text-sm font-medium mb-3 ${
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stock > 0
                  ? `In Stock (${product.stock} ${
                      product.stockUnit || "units"
                    } available)`
                  : "Out of Stock"}
              </p>

              <div className="bg-gray-50 p-3 rounded-lg mb-4 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                <p className="text-gray-700 text-sm">{product.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(
                          Math.max(1, parseInt(e.target.value) || 1),
                          product.stock
                        )
                      )
                    }
                    className="w-16 p-2 border rounded text-center focus:outline-none focus:ring-1 focus:ring-teal-500"
                    disabled={product.stock <= 0}
                  />
                </div>
                <button
                  className={`flex-grow sm:flex-grow-0 bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    product.stock <= 0 ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={product.stock <= 0}
                >
                  <FontAwesomeIcon icon={faCartPlus} />
                  Add to Cart
                </button>
                <button
                  onClick={onWishlistToggle}
                  className={`flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                    isWishlisted
                      ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 focus:ring-red-500"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 focus:ring-gray-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} />
                  {isWishlisted ? "Wishlisted" : "Wishlist"}
                </button>
              </div>

              <button
                onClick={handleViewDetails}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-teal-600 text-teal-600 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <FontAwesomeIcon icon={faEye} />
                View Full Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPopup;
