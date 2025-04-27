import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faHome } from "@fortawesome/free-solid-svg-icons";

const ProductDetail = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { productId } = useParams();
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 });

  const handleImageClick = () => {
    setIsZoomed((prev) => !prev);
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPosition({ x, y });
  };

  const handleImageChange = (index) => {
    setMainImageIndex(index);
  };

  useEffect(() => {
    const getDetails = async () => {
      try {
        setLoading(true);
        const req = await axios.get(
          `${process.env.SERVER_URL}/api/product/admin/get-product/${productId}`,
          { withCredentials: true }
        );

        if (req.status === 200) {
          setProduct(req.data.data.product);
        }
      } catch (error) {
        console.log("Error fetching product details: ", error);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-950 text-white">
        <div className="text-xl">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-950 text-white">
        <div className="text-xl text-red-400">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center bg-gray-300 py-3 flex-col gap-3">
      <div className="bg-teal-900 text-white w-[95%] rounded-lg flex items-center justify-between px-6 py-4">
        <p className="text-3xl font-serif cursor-default">Product View</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-teal-600 p-1 rounded-xl hover:bg-teal-700 flex items-center gap-1"
          >
            <FontAwesomeIcon aria-hidden="true" icon={faHome}></FontAwesomeIcon>
            <span>Dashboard</span>
          </button>
          <span className="text-2xl">/</span>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-teal-600 p-1 rounded-xl hover:bg-teal-700"
          >
            Products
          </button>
          <span className="text-2xl">/</span>
          <button className="bg-teal-600 p-1 rounded-xl hover:bg-teal-700">
            Product View
          </button>
        </div>
      </div>
      <div className="flex flex-col p-4 bg-teal-900 text-white max-h-screen w-[95%] rounded-lg">
        <div className="flex flex-row gap-8">
          {/* Product Gallery */}
          <div className="flex-1">
            <h2 className="text-xl mb-4">Product Gallery</h2>
            {product.images && product.images.length > 0 ? (
              <>
                <div className="relative mb-4">
                  <div className="bg-teal-600 text-white text-sm font-bold py-1 px-2 rounded absolute top-2 left-2 z-10 cursor-default">
                    {product.name}
                  </div>
                  <div className="relative h-96 w-full overflow-hidden rounded border border-gray-600">
                    <img
                      src={product.images[mainImageIndex].url}
                      alt={product.name}
                      className={`h-96 w-full self-center justify-self-center rounded border border-gray-600 object-cover transition-transform duration-300 ease-in-out cursor-zoom-in ${
                        isZoomed
                          ? "scale-150 cursor-zoom-out"
                          : "scale-100 cursor-zoom-in"
                      }`}
                      onClick={handleImageClick}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => {
                        setIsZoomed(false);
                      }}
                      onMouseEnter={() => {
                        setIsZoomed(true);
                      }}
                      style={
                        isZoomed
                          ? {
                              transformOrigin: `${cursorPosition.x}% ${cursorPosition.y}%`,
                            }
                          : {}
                      }
                    />
                  </div>
                </div>

                {/* Thumbnail gallery */}
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 border border-gray-600 rounded overflow-hidden cursor-pointer"
                      onClick={() => handleImageChange(index)}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-20 h-20 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-gray-800 rounded w-full h-64 flex items-center justify-center">
                <p>No images available</p>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1">
            <h2 className="text-xl mb-4">Product Details</h2>
            <h1 className="text-2xl font-bold mb-6">{product.name}</h1>

            <div className="space-y-4">
              {/* Price information */}
              <div className="flex items-center">
                <div className="w-32">
                  <span className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Price
                  </span>
                </div>
                <span className="text-gray-300">:</span>
                <div className="ml-4 flex items-center gap-2">
                  <span
                    className={
                      product.discountPercentage
                        ? "line-through text-gray-400"
                        : ""
                    }
                  >
                    ${product.actualPrice}
                  </span>
                  {product.discountPercentage > 0 && (
                    <>
                      <span className="text-green-400 font-bold">
                        ${product.discountedPrice}
                      </span>
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                        {product.discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Brand (show only if exists) */}
              {product.brand && (
                <div className="flex items-center">
                  <div className="w-32">
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Brand
                    </span>
                  </div>
                  <span className="text-gray-300">:</span>
                  <span className="ml-4">{product.brand}</span>
                </div>
              )}

              {/* Category (show only if exists) */}
              {product.category && (
                <div className="flex items-center">
                  <div className="w-32">
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Category
                    </span>
                  </div>
                  <span className="text-gray-300">:</span>
                  <span className="ml-4">{product.category}</span>
                </div>
              )}

              {/* RAM (show only if exists) */}
              {product.ram && (
                <div className="flex items-center">
                  <div className="w-32">
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      RAM
                    </span>
                  </div>
                  <span className="text-gray-300">:</span>
                  <span className="ml-4">{product.ram}</span>
                </div>
              )}

              {/* SIZE (show only if exists) */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="flex items-center">
                  <div className="w-32">
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      SIZE
                    </span>
                  </div>
                  <span className="text-gray-300">:</span>
                  <div className="ml-4 flex gap-4">
                    {product.sizes.map((size, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 rounded"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight (show only if exists) */}
              {product.weights && product.weights.length > 0 && (
                <div className="flex items-center">
                  <div className="w-32">
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Weight
                    </span>
                  </div>
                  <span className="text-gray-300">:</span>
                  <div className="ml-4 flex gap-4">
                    {product.weights.map((weight, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 rounded"
                      >
                        {weight}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock (show only if exists) */}
              {product.stock !== undefined && (
                <div className="flex items-center">
                  <div className="w-32">
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Stock
                    </span>
                  </div>
                  <span className="text-gray-300">:</span>
                  <span className="ml-4">
                    {product.stock} {product.stockUnit || "units"}
                  </span>
                </div>
              )}

              {/* Reviews (show only if exists) */}
              {product.reviews && (
                <div className="flex items-center">
                  <div className="w-32">
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Review
                    </span>
                  </div>
                  <span className="text-gray-300">:</span>
                  <span className="ml-4">
                    {Array.isArray(product.reviews)
                      ? `${product.reviews.length} reviews`
                      : product.reviews}
                  </span>
                </div>
              )}

              {/* Published Date (show only if exists) */}
              {product.publishedDate && (
                <div className="flex items-center">
                  <div className="w-32">
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Published
                    </span>
                  </div>
                  <span className="text-gray-300">:</span>
                  <span className="ml-4">{product.publishedDate}</span>
                </div>
              )}

              {/* Created Date (if published date not available) */}
              {!product.publishedDate && product.createdAt && (
                <div className="flex items-center">
                  <div className="w-32">
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Created
                    </span>
                  </div>
                  <span className="text-gray-300">:</span>
                  <span className="ml-4">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-8">
          <h2 className="text-xl mb-4">Product Description</h2>
          <p className="text-gray-300">{product.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

// {actualPrice: 1000 , admin: "67c05520634a0170758de266",category: "fashion",createdAt: "2025-03-05T19:37:30.601Z",description: "description of test 1 product",discountPercentage: 5,discountedPrice: 950 ,images: Array(3)0: {publicId: 'products/frbzzfqunnpeubzpc1ce', url: 'http://res.cloudinary.com/dnfkw1s7m/image/upload/v1741203434/products/frbzzfqunnpeubzpc1ce.png', _id: '67c8a7faa100eb1fea65a22f'},1: {publicId: 'products/toxzkqzjxnxmeqbi9nrj', url: 'http://res.cloudinary.com/dnfkw1s7m/image/upload/v1741203435/products/toxzkqzjxnxmeqbi9nrj.jpg', _id: '67c8a7faa100eb1fea65a230'},2: {publicId: 'products/aah9s0kpuy9nljfqixgf', url: 'http://res.cloudinary.com/dnfkw1s7m/image/upload/v1741203433/products/aah9s0kpuy9nljfqixgf.jpg', _id: '67c8a7faa100eb1fea65a231'}length: 3,[[Prototype]]: Array(0),name: "test1",reviews: [],stock: 10,stockUnit: "kg",updatedAt: "2025-03-05T19:37:30.601Z",__v: 0,_id: "67c8a7faa100eb1fea65a22e"}
