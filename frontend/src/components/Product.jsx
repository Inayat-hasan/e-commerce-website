import { faHeart, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "../redux/hooks";
import { selectIsLoggedIn } from "../redux/slices/authentication/authSelector";
import { toast } from "react-toastify";
import axios from "axios";

const Product = ({ product, handleProductClick }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const productId = product._id;
  const serverUrl = import.meta.env.SERVER_URL;

  // Calculate discount percentage
  const discountPercentage = Math.round(
    ((product.actualPrice - product.discountedPrice) / product.actualPrice) *
      100
  );

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowLoginHint(true);
      toast.info("Please login to add items to your wishlist", {
        position: "bottom-center",
        autoClose: 2000,
      });
      setTimeout(() => setShowLoginHint(false), 2000);
      return;
    }

    setIsWishlistLoading(true);
    try {
      const endpoint = isWishlisted ? "remove-product" : "add-product";
      const res = await axios.post(
        `${serverUrl}/api/wishlist/${endpoint}`,
        { productId },
        { withCredentials: true }
      );

      if (res.data.data.wishList) {
        setIsWishlisted(!isWishlisted);
        toast.success(
          isWishlisted ? "Removed from wishlist" : "Added to wishlist"
        );
      } else {
        throw new Error("Wishlist operation failed");
      }
    } catch (error) {
      console.error("Wishlist operation error:", error);
      toast.error(
        `Failed to ${isWishlisted ? "remove from" : "add to"} wishlist`
      );
    } finally {
      setIsWishlistLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const checkWishlistStatus = async () => {
        try {
          const res = await axios.post(
            `${serverUrl}/api/wishlist/is-product-in-wishlist`,
            { productId },
            { withCredentials: true }
          );
          setIsWishlisted(res.data.data.isProductInWishlist);
        } catch (error) {
          console.error("Error checking wishlist status:", error);
          setIsWishlisted(false);
        }
      };
      checkWishlistStatus();
    } else {
      setIsWishlisted(false);
    }
  }, [isLoggedIn, productId]);

  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full"
      onClick={() => handleProductClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-2 left-2 z-20">
          <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
            {discountPercentage}% OFF
          </div>
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        disabled={isWishlistLoading}
        className="absolute top-2 right-2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all duration-300 group-hover:opacity-100 sm:opacity-0"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <FontAwesomeIcon
          icon={faHeart}
          className={`text-sm transition-colors ${
            isWishlisted ? "text-red-500" : "text-gray-400 hover:text-gray-600"
          }`}
        />
      </button>

      {/* Image Container */}
      <div className="aspect-square relative overflow-hidden rounded-t-xl bg-gray-50">
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse ${
            imageLoaded ? "hidden" : ""
          }`}
        />
        <img
          src={product.images[0].url}
          alt={product.name}
          className={`w-full h-full object-contain transition-transform duration-300 ${
            isHovered ? "scale-110" : "scale-100"
          } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        <div className="mb-2">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 min-h-[2.5rem] mb-1">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">{product.brand}</p>
        </div>

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
              <span className="text-xs font-medium text-green-700">
                {product.averageRating.toFixed(1)}
              </span>
              <FontAwesomeIcon
                icon={faStar}
                className="text-green-700 text-xs"
              />
            </div>
            {product.reviewsCount > 0 && (
              <span className="text-xs text-gray-500">
                ({product.reviewsCount})
              </span>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            ₹{product.discountedPrice.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 line-through">
            ₹{product.actualPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Quick View Overlay */}
      <div
        className={`absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 
          transition-opacity duration-300 rounded-xl flex items-center justify-center 
          ${isHovered ? "visible" : "invisible"}`}
      >
        <button
          className="bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg 
          transform translate-y-2 group-hover:translate-y-0 transition-all duration-300
          text-sm sm:text-base hover:bg-gray-50"
        >
          Quick View
        </button>
      </div>
    </div>
  );
};

export default Product;
