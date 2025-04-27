import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faHeart,
  faStar,
  faStarHalf,
  faChevronLeft,
  faShippingFast,
  faShield,
  faExchangeAlt,
  faShoppingBag,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import Product from "../components/Product";
import Loading from "../components/Loading";
import { toast, ToastContainer } from "react-toastify";
import { setCartCount } from "../redux/slices/cartCount/cartCountSlice";
import fetchCartCount from "../redux/functions/fetchCartCount";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectIsLoggedIn } from "../redux/slices/authentication/authSelector";
import "react-toastify/dist/ReactToastify.css";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState({});
  const [isProductInCart, setIsProductInCart] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const serverUrl = import.meta.env.SERVER_URL;

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${serverUrl}/api/product/buyer/get-product/${productId}`
        );
        setProduct(res.data.data.product);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error?.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [productId]);

  useEffect(() => {
    const isProductInCart = async () => {
      try {
        const res = await axios.post(
          `${serverUrl}/api/cart/is-product-in-cart`,
          { productId },
          { withCredentials: true }
        );
        const check = res.data.data.isProductInCart;
        setIsProductInCart(!!check);
      } catch (error) {
        console.error("Error checking if product is in cart:", error);
      }
    };
    const isProductInWishlist = async () => {
      try {
        const res = await axios.post(
          `${serverUrl}/api/wishlist/is-product-in-wishlist`,
          { productId },
          { withCredentials: true }
        );
        const check = res.data.data.isProductInWishlist;
        setIsWishlisted(!!check);
      } catch (error) {
        console.error("Error checking if product is in wishlist:", error);
      }
    };
    if (isLoggedIn) {
      isProductInCart();
      isProductInWishlist();
    }
  }, [productId]);

  const handleCartClick = async () => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to add products to your cart.");
      return;
    } else {
      setIsCartLoading(true);
      if (isProductInCart) {
        try {
          const res = await axios.post(
            `${serverUrl}/api/cart/remove-product`,
            { productId },
            { withCredentials: true }
          );
          if (res.data.data.cart) {
            setIsProductInCart(false);
            toast.success("Product removed from cart");
          }
          if (res.error) {
            console.error("Error removing product from cart:", res.error);
            setIsProductInCart(true);
            toast.error("Failed to remove product from cart");
          }
        } catch (error) {
          setIsProductInCart(true);
          console.error("Error removing product from cart:", error);
          toast.error("Failed to remove product from cart");
        } finally {
          setIsCartLoading(false);
        }
      } else {
        try {
          const res = await axios.post(
            `${serverUrl}/api/cart/add-product`,
            { productId, quantity },
            { withCredentials: true }
          );
          if (res.data.data.cart) {
            setIsProductInCart(true);
            toast.success("Product added to cart");
            const { cartCount } = await fetchCartCount();
            dispatch(setCartCount(cartCount));
          }
          if (res.error) {
            console.error("Error adding product to cart:", res.error);
            setIsProductInCart(false);
            toast.error("Failed to add product to cart");
          }
        } catch (error) {
          setIsProductInCart(false);
          console.error("Error adding product to cart:", error);
          toast.error("Failed to add product to cart");
        } finally {
          setIsCartLoading(false);
        }
      }
    }
  };

  const handleWishlistClick = async () => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to add products to your wishlist.");
      return;
    } else {
      setIsWishlistLoading(true);
      if (isWishlisted) {
        try {
          const res = await axios.post(
            `${serverUrl}/api/wishlist/remove-product`,
            { productId },
            { withCredentials: true }
          );
          if (res.data.data.wishList) {
            setIsWishlisted(false);
            toast.success("Product removed from wishlist");
          }
          if (res.error) {
            console.error("Error removing product from wishlist:", res.error);
            setIsWishlisted(true);
            toast.error("Failed to remove product from wishlist");
          }
        } catch (error) {
          setIsWishlisted(true);
          console.error("Error removing product from wishlist:", error);
          toast.error("Failed to remove product from wishlist");
        } finally {
          setIsWishlistLoading(false);
        }
      } else {
        try {
          const res = await axios.post(
            `${serverUrl}/api/wishlist/add-product`,
            { productId },
            { withCredentials: true }
          );
          if (res.data.data.wishList) {
            setIsWishlisted(true);
            toast.success("Product added to wishlist");
          }
          if (res.error) {
            console.error("Error adding product to wishlist:", res.error);
            toast.error("Failed to add product to wishlist");
          }
        } catch (error) {
          console.error("Error adding product to wishlist:", error);
          toast.error("Failed to add product to wishlist");
        } finally {
          setIsWishlistLoading(false);
        }
      }
    }
  };

  // Dummy reviews data
  const reviews = [
    {
      id: "1",
      user: { name: "John Doe", avatar: "https://i.pravatar.cc/100?img=1" },
      rating: 5,
      comment: "Excellent product, very satisfied with the quality!",
      date: "2023-02-15",
    },
    {
      id: "2",
      user: { name: "Jane Smith", avatar: "https://i.pravatar.cc/100?img=5" },
      rating: 4,
      comment: "Good product, fast delivery. Would recommend.",
      date: "2023-01-28",
    },
    {
      id: "3",
      user: {
        name: "Robert Johnson",
        avatar: "https://i.pravatar.cc/100?img=3",
      },
      rating: 4.5,
      comment: "Very good quality for the price. Happy with my purchase.",
      date: "2023-01-10",
    },
  ];

  // Similar products (using the same product for now)
  const similarProducts = Array(4).fill(product);

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        directBuyProduct: {
          productId: productId,
          quantity: quantity,
        },
      },
    });
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
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

  // Calculate discount percentage
  const discountPercentage = product.actualPrice
    ? Math.round(
        ((product.actualPrice - product.discountedPrice) /
          product.actualPrice) *
          100
      )
    : 0;

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Breadcrumb navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-teal-600"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Product details */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column - Images */}
            <div className="lg:w-2/5">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]?.url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No image available
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {product.images &&
                  product.images.map((image, index) => (
                    <div
                      key={image.publicId || index}
                      className={`w-20 h-20 rounded-md cursor-pointer overflow-hidden border-2 ${
                        selectedImage === index
                          ? "border-teal-500"
                          : "border-transparent"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Right column - Info & Actions */}
            <div className="lg:w-3/5">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>{product.category || "Uncategorized"}</span>
                  <span>•</span>
                  <span>{product.brand || "Unknown Brand"}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {product.name || "Product Name"}
                </h1>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex">
                    {renderStars(product.averageRating || 0)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.reviewsCount || 0} reviews
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-teal-600">
                    ₹{(product.discountedPrice || 0).toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{(product.actualPrice || 0).toFixed(2)}
                  </span>
                  {discountPercentage > 0 && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-sm font-medium">
                      {discountPercentage}% Off
                    </span>
                  )}
                </div>

                <p className="text-gray-700 mb-6">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-700">
                    Availability:
                  </span>
                  <span
                    className={
                      (product.stock || 0) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {(product.stock || 0) > 0
                      ? `In Stock (${product.stock} ${
                          product.stockUnit || "units"
                        })`
                      : "Out of Stock"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Delivery:</span>
                  <span className="text-gray-600">
                    Ships to locations:{" "}
                    {product.locations
                      ? product.locations.join(", ")
                      : "Not specified"}
                  </span>
                </div>
              </div>

              {/* Add to cart section */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 flex-shrink-0">
                    <input
                      type="number"
                      min="1"
                      max={product.stock || 1}
                      value={quantity}
                      onChange={(e) => {
                        const newQuantity = Math.max(
                          1,
                          parseInt(e.target.value) || 1
                        );
                        setQuantity(Math.min(newQuantity, product.stock || 1));
                      }}
                      className="w-full p-2 border rounded-lg text-center"
                      disabled={(product.stock || 0) <= 0}
                    />
                  </div>
                  <button
                    onClick={handleCartClick}
                    className={`flex-grow transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 px-6 py-3 rounded-lg flex items-center justify-center gap-2 ${
                      (product.stock || 0) <= 0
                        ? "opacity-50 cursor-not-allowed bg-gray-400 text-white"
                        : isProductInCart
                        ? "bg-gray-100 text-teal-600 border border-teal-600 hover:bg-gray-200"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                    disabled={(product.stock || 0) <= 0 || isCartLoading}
                  >
                    {isCartLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-t-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        <span>
                          {isProductInCart ? "Updating..." : "Adding..."}
                        </span>
                      </div>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={isProductInCart ? faCartShopping : faCartPlus}
                        />
                        {isProductInCart ? "In Cart" : "Add to Cart"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleWishlistClick}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 flex-shrink-0 ${
                      isWishlisted
                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                    disabled={isWishlistLoading}
                  >
                    {isWishlistLoading ? (
                      <div className="w-4 h-4 border-2 border-t-2 border-t-transparent border-red-600 rounded-full animate-spin"></div>
                    ) : (
                      <FontAwesomeIcon icon={faHeart} size="lg" />
                    )}
                  </button>
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className={`w-full bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    (product.stock || 0) <= 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={(product.stock || 0) <= 0}
                >
                  <FontAwesomeIcon icon={faShoppingBag} />
                  Buy Now
                </button>
              </div>

              {/* Additional services */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon
                    icon={faShippingFast}
                    className="text-teal-600 text-xl"
                  />
                  <div>
                    <h4 className="font-medium">Free Shipping</h4>
                    <p className="text-xs text-gray-500">On orders over ₹999</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon
                    icon={faShield}
                    className="text-teal-600 text-xl"
                  />
                  <div>
                    <h4 className="font-medium">Secure Payment</h4>
                    <p className="text-xs text-gray-500">100% secure payment</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon
                    icon={faExchangeAlt}
                    className="text-teal-600 text-xl"
                  />
                  <div>
                    <h4 className="font-medium">Easy Returns</h4>
                    <p className="text-xs text-gray-500">
                      10 day return policy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product tabs - Description, Details, Reviews */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "description"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "details"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "reviews"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({product.reviewsCount || 0})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div>
                <p className="text-gray-700">
                  {product.description || "No description available."}
                </p>
              </div>
            )}

            {activeTab === "details" && (
              <div>
                {product.details && product.details.length > 0 ? (
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    {product.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">No details available.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex">
                      {renderStars(product.averageRating || 0)}
                    </div>
                    <span className="text-lg font-medium">
                      {product.averageRating || 0} out of 5
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Based on {product.reviewsCount || 0} reviews
                  </p>
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                    Write a Review
                  </button>
                </div>

                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={review.user.avatar}
                            alt={review.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h4 className="font-medium">{review.user.name}</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-xs text-gray-500">
                                {review.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No reviews yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Products */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Similar Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {similarProducts.map((similarProduct, index) => (
            <div
              key={`similar-${index}`}
              className="cursor-pointer"
              onClick={() =>
                navigate(
                  `/product/${similarProduct.originalId || similarProduct._id}`
                )
              }
            >
              {/* <Product product={similarProduct} /> */}
            </div>
          ))}
        </div>
      </div>
      <ToastContainer position="bottom-center" theme="colored" />
    </div>
  );
};

export default ProductDetail;
