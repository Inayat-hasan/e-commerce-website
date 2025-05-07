import { useEffect, useState } from "react";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/slices/sidebar/sidebarSelector.js";
import { useAppSelector } from "../redux/hooks/index.js";
import {
  selectIsLoggedIn,
  selectUser,
} from "../redux/slices/authentication/authSelector.js";
import { Heart, Trash2, ShoppingCart, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Loading from "../components/Loading";

const Wishlist = () => {
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user = useAppSelector(selectUser);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    itemMoving: null, // stores productId that's being moved to cart
    itemRemoving: null, // stores productId that's being removed
    selectedMoving: false, // true when moving multiple selected items
  });
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  // Handle selecting/deselecting items
  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setLoadingStates((prev) => ({ ...prev, itemRemoving: itemId }));

    // Save original state for rollback
    const originalWishlistItems = [...wishlistItems];
    const originalSelectedItems = [...selectedItems];

    // Optimistic UI update
    setWishlistItems(
      wishlistItems.filter((item) => item.productId._id !== itemId)
    );
    setSelectedItems(selectedItems.filter((id) => id !== itemId));

    try {
      const response = await axios.post(
        `${serverUrl}/api/wishlist/remove-product`,
        { productId: itemId },
        {
          withCredentials: true,
        }
      );

      if (response.data.data.done) {
        toast.success("Item removed from wishlist successfully");
      } else {
        // Revert on other status
        setWishlistItems(originalWishlistItems);
        setSelectedItems(originalSelectedItems);
        toast.error("Failed to remove item from wishlist");
      }
    } catch (error) {
      // Revert on error
      setWishlistItems(originalWishlistItems);
      setSelectedItems(originalSelectedItems);

      // Handle specific error cases
      if (error.response?.status === 404) {
        if (error.response.data.message.includes("Buyer not found")) {
          toast.error("Please login again to continue");
        } else if (error.response.data.message.includes("Product not found")) {
          toast.error("Product not found in wishlist");
        } else if (error.response.data.message.includes("WishList not found")) {
          toast.error("Wishlist not found, please try again");
        }
      } else {
        toast.error("Failed to remove item from wishlist. Please try again.");
      }
      console.error("Error removing item:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, itemRemoving: null }));
    }
  };

  // Handle moving all selected items to cart
  const handleMoveSelectedToCart = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to move items to cart");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please select items to move to cart");
      return;
    }

    setLoadingStates((prev) => ({ ...prev, selectedMoving: true }));

    // Save original wishlist state for rollback
    const originalWishlist = [...wishlistItems];

    // Optimistic UI update
    setWishlistItems(
      wishlistItems.filter(
        (item) => !selectedItems.includes(item.productId._id)
      )
    );

    try {
      const response = await axios.post(
        `${serverUrl}/api/wishlist/selected-to-cart`,
        { productIds: selectedItems },
        {
          withCredentials: true,
        }
      );

      const { addedCount, alreadyExistCount, notFoundCount } =
        response.data.data;

      // Create appropriate success message
      let message = "Selected products moved to cart successfully";
      if (alreadyExistCount > 0 || notFoundCount > 0) {
        message = `${addedCount} products moved to cart. `;
        if (alreadyExistCount > 0) {
          message += `${alreadyExistCount} products were already in your cart. `;
        }
        if (notFoundCount > 0) {
          message += `${notFoundCount} products were not found.`;
        }
      }

      toast.success(message);
      setSelectedItems([]); // Clear selection after successful move
    } catch (error) {
      // Revert wishlist to original state
      setWishlistItems(originalWishlist);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to move items to cart. Please try again.");
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, selectedMoving: false }));
    }
  };

  const handleMoveToCart = async (productId) => {
    setLoadingStates((prev) => ({ ...prev, itemMoving: productId }));

    // Optimistic UI update
    const originalWishlist = [...wishlistItems];
    setWishlistItems(
      wishlistItems.filter((item) => item.productId._id !== productId)
    );

    try {
      const response = await axios.post(
        `${serverUrl}/api/wishlist/add-to-cart`,
        { productId },
        {
          withCredentials: true,
        }
      );

      if (response.data.data.credentialsAreMissing) {
        setWishlistItems(originalWishlist);
        toast.error("Something went wrong while moving the item to cart");
      } else if (response.data.data.productIsMissing) {
        setWishlistItems(originalWishlist);
        toast.error("Something went wrong while moving the item to cart");
      } else if (response.data.data.productNotInWishlist) {
        setWishlistItems(originalWishlist);
        toast.info("Please refresh, product is not in wishlist");
      } else if (response.data.data.productAlreadyExists) {
        setWishlistItems(originalWishlist);
        toast.error("Product already exists in cart");
      } else if (response.data.data.done) {
        toast.success("Item moved to cart successfully");
      }
    } catch (error) {
      setWishlistItems(originalWishlist);
      toast.error("Something went wrong while moving the item to cart");
    } finally {
      setLoadingStates((prev) => ({ ...prev, itemMoving: null }));
    }
  };

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${serverUrl}/api/wishlist/get-wishlist`,
        {
          withCredentials: true,
        }
      );
      if (response.data.data.buyer) {
        toast.error("Theres a problem with ur login , pls login again");
        setLoading(false);
        setWishlistItems([]);
      } else if (response.data.data.isWishlistFound === false) {
        toast.error(
          "Theres a problem with ur registration, pls register again"
        );
        setLoading(false);
        setWishlistItems([]);
      } else if (response.data.data.wishList) {
        setWishlistItems(response.data.data.wishList.products);
        setLoading(false);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching the wishlist");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setWishlistItems([]);
      return;
    } else {
      fetchWishlist();
    }
  }, [isLoggedIn]);

  if (loading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 ${
          isLargeScreen && isSideBarOpened ? "ml-80" : ""
        }`}
      >
        <div className="text-center p-8 rounded-lg bg-white dark:bg-gray-800 shadow-xl">
          <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-4">
            Please Log In
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            You need to be logged in to view your wishlist
          </p>
          <Link
            to="/login"
            className="px-6 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-full hover:bg-teal-700 transition"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-all duration-200 ${
        isLargeScreen && isSideBarOpened ? "pl-80" : "w-full"
      } ${!isLargeScreen && isSideBarOpened ? "w-full" : ""}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-teal-800 dark:text-teal-500 flex items-center">
              <Heart className="mr-2" size={24} />
              My Wishlist
              <span className="ml-2 text-base font-normal text-gray-600 dark:text-gray-400">
                ({wishlistItems.length} items)
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Save items you love to buy them later
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleMoveSelectedToCart}
                disabled={
                  selectedItems.length === 0 || loadingStates.selectedMoving
                }
                className={`flex items-center px-4 py-2 rounded-md text-sm ${
                  selectedItems.length > 0
                    ? "bg-teal-800 dark:bg-teal-700 text-white hover:bg-teal-900 dark:hover:bg-teal-600"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                } transition`}
              >
                {loadingStates.selectedMoving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Moving...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} className="mr-2" />
                    Move Selected to Cart ({selectedItems.length})
                  </>
                )}
              </button>

              <Link
                to="/"
                className="flex items-center px-4 py-2 border border-teal-800 dark:border-teal-600 text-teal-800 dark:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-md text-sm transition"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>

        {wishlistItems.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
            {/* Table header - visible on medium screens and up */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedItems.length === wishlistItems.length}
                  onChange={() => {
                    if (selectedItems.length === wishlistItems.length) {
                      setSelectedItems([]);
                    } else {
                      setSelectedItems(
                        wishlistItems.map((item) => item.productId._id)
                      );
                    }
                  }}
                  className="w-4 h-4 accent-teal-800 dark:accent-teal-600"
                />
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Product
              </div>
              <div className="col-span-4"></div>
              <div className="col-span-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Price
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Stock Status
              </div>
              <div className="col-span-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                Actions
              </div>
            </div>

            {/* Wishlist items */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {wishlistItems.map((item) => (
                <div key={item.productId._id} className="p-4">
                  {/* Mobile view - card layout */}
                  <div className="md:hidden">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.productId._id)}
                        onChange={() => handleSelectItem(item.productId._id)}
                        className="mt-1 mr-3 w-4 h-4 accent-teal-800 dark:accent-teal-600"
                      />
                      <div className="flex-1">
                        <div className="flex mb-3">
                          <img
                            src={item.productId.images[0].url}
                            alt={item.productId.name}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <div className="ml-3">
                            <h3 className="font-medium text-gray-800 dark:text-gray-200">
                              {item.productId.name}
                            </h3>
                            <div className="flex items-center mt-1">
                              <div className="flex items-center text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs ${
                                      i <
                                      Math.floor(item.productId.averageRating)
                                        ? "text-amber-500"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                ({item.productId.reviewsCount})
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className="font-bold text-gray-900 dark:text-white">
                                ${item.productId.discountedPrice}
                              </span>
                              <>
                                <span className="ml-2 text-sm line-through text-gray-500 dark:text-gray-400">
                                  ${item.productId.actualPrice}
                                </span>
                                <span className="ml-2 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-1.5 py-0.5 rounded">
                                  {item.productId.discountPercentage}% OFF
                                </span>
                              </>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div>
                            {item.productId.status === "active" ? (
                              <span className="text-xs font-medium text-green-600 dark:text-green-500 flex items-center">
                                <span className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full mr-1"></span>
                                In Stock
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-red-600 dark:text-red-500 flex items-center">
                                <span className="w-2 h-2 bg-red-600 dark:bg-red-500 rounded-full mr-1"></span>
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleMoveToCart(item.id)}
                              disabled={
                                loadingStates.itemMoving === item.productId._id
                              }
                              className={`p-2 rounded-full ${
                                loadingStates.itemMoving === item.productId._id
                                  ? "bg-gray-100 dark:bg-gray-800 cursor-wait"
                                  : "bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900"
                              }`}
                            >
                              {loadingStates.itemMoving ===
                              item.productId._id ? (
                                <div className="w-4 h-4 border-2 border-t-transparent border-teal-600 rounded-full animate-spin"></div>
                              ) : (
                                <ShoppingCart size={18} />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleRemoveItem(item.productId._id)
                              }
                              disabled={
                                loadingStates.itemRemoving ===
                                item.productId._id
                              }
                              className={`p-2 rounded-full ${
                                loadingStates.itemRemoving ===
                                item.productId._id
                                  ? "bg-gray-100 dark:bg-gray-800 cursor-wait"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                              }`}
                            >
                              {loadingStates.itemRemoving ===
                              item.productId._id ? (
                                <div className="w-4 h-4 border-2 border-t-transparent border-red-600 rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop view - table layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.productId._id)}
                        onChange={() => handleSelectItem(item.productId._id)}
                        className="w-4 h-4 accent-teal-800 dark:accent-teal-600"
                      />
                    </div>
                    <div className="col-span-2">
                      <img
                        src={item.productId.images[0].url}
                        alt={item.productId.name}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    </div>
                    <div className="col-span-4">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                        {item.productId.name}
                      </h3>
                      <div className="flex items-center">
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${
                                i < Math.floor(item.productId.averageRating)
                                  ? "text-amber-500"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({item.productId.reviewsCount})
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="font-bold text-gray-900 dark:text-white">
                        ${item.productId.discountedPrice}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-sm line-through text-gray-500 dark:text-gray-400">
                          ${item.productId.actualPrice}
                        </span>
                        <span className="ml-2 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-1.5 py-0.5 rounded">
                          {item.productId.discountPercentage}% OFF
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      {item.productId.status === "active" ? (
                        <span className="text-sm font-medium text-green-600 dark:text-green-500 flex items-center">
                          <span className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full mr-1"></span>
                          In Stock
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-red-600 dark:text-red-500 flex items-center">
                          <span className="w-2 h-2 bg-red-600 dark:bg-red-500 rounded-full mr-1"></span>
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 flex space-x-1">
                      <button
                        onClick={() => handleMoveToCart(item.productId._id)}
                        disabled={
                          loadingStates.itemMoving === item.productId._id
                        }
                        title="Move to Cart"
                        className={`p-2 rounded-md ${
                          loadingStates.itemMoving === item.productId._id
                            ? "bg-gray-100 dark:bg-gray-800 cursor-wait"
                            : "bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900"
                        }`}
                      >
                        {loadingStates.itemMoving === item.productId._id ? (
                          <div className="w-4 h-4 border-2 border-t-transparent border-teal-600 rounded-full animate-spin"></div>
                        ) : (
                          <ShoppingCart size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.productId._id)}
                        disabled={
                          loadingStates.itemRemoving === item.productId._id
                        }
                        title="Remove"
                        className={`p-2 rounded-md ${
                          loadingStates.itemRemoving === item.productId._id
                            ? "bg-gray-100 dark:bg-gray-800 cursor-wait"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                        }`}
                      >
                        {loadingStates.itemRemoving === item.productId._id ? (
                          <div className="w-4 h-4 border-2 border-t-transparent border-red-600 rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <Heart size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Items added to your wishlist will be saved here. Start exploring
                and add products you love!
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-teal-800 dark:bg-teal-700 text-white rounded-md hover:bg-teal-900 dark:hover:bg-teal-600 transition"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-center" autoClose={3000} />
    </div>
  );
};

export default Wishlist;
