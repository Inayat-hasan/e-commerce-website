import {
  faCartShopping,
  faTrash,
  faMinus,
  faPlus,
  faArrowLeft,
  faShoppingBag,
  faExclamationCircle,
  faHeart,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { setCartCount } from "../redux/slices/cartCount/cartCountSlice";
import fetchCartCount from "../redux/functions/fetchCartCount";
import { useAppSelector } from "../redux/hooks";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/slices/sidebar/sidebarSelector";
import {
  selectIsLoggedIn,
  selectUser,
} from "../redux/slices/authentication/authSelector";

// example of cart :
const exampleCart = {
  buyer: "67efe4876a33c95865c4e761",
  createdAt: "2025-04-04T13:54:16.101Z",
  totalActualPrice: Number,
  totalDiscount: Number,
  finalAmount: Number,
  productsCount: Number,
  deliveryCharges: Number,
  platformFee: Number,
  products: [
    {
      productId: {
        _id: String,
        name: String,
        discountedPrice: Number,
        actualPrice: Number,
        stock: Number,
        images: [
          {
            url: String,
            publicId: String,
          },
          {
            url: String,
            publicId: String,
          },
          {
            url: String,
            publicId: String,
          },
        ],
        brand: String,
        category: String,
        description: String,
        isFeatured: Boolean,
        // for more fields, refer to product model
      },
      quantity: Number,
      totalPrice: Number,
      priceOfDiscount: Number,
      actualPrice: Number,
    },
    {
      productId: {},
      quantity: Number,
      totalPrice: Number,
      priceOfDiscount: Number,
      actualPrice: Number,
    },
    {
      productId: {},
      quantity: Number,
      totalPrice: Number,
      priceOfDiscount: Number,
      actualPrice: Number,
    },
  ],
  updatedAt: "2025-04-10T13:53:50.758Z",
  __v: 15,
  _id: "67efe4886a33c95865c4e763",
};

const Cart = () => {
  const navigate = useNavigate();
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLoggedIn = useAppSelector(selectIsLoggedIn); // send any backend request if user is logged in if not then show some msg for login and a login btn which will navigate to /login
  const user = useAppSelector(selectUser);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [cart, setCart] = useState({
    products: [],
    totalActualPrice: 0,
    totalDiscount: 0,
    finalAmount: 0,
    productsCount: 0,
    deliveryCharges: 0,
    platformFee: 0,
  });
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartEmpty, setIsCartEmpty] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(null);
  const [isRemovingItem, setIsRemovingItem] = useState(null);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isAddingAllToWishlist, setIsAddingAllToWishlist] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setIsCartLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/cart/get-cart`, {
        withCredentials: true,
      });

      if (res.data.data.cart) {
        setCart(res.data.data.cart);
        setIsCartEmpty(
          !res.data.data.cart.products ||
            res.data.data.cart.products.length === 0
        );
      } else {
        setIsCartEmpty(true);
        setIsCartLoading(false);
        toast.error("Failed to fetch cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setIsCartEmpty(true);
      setIsCartLoading(false);
      toast.error("Failed to fetch cart");
    } finally {
      setIsCartLoading(false);
    }
  };

  const updateCount = async () => {
    const { cartCount } = await fetchCartCount();
    dispatch(setCartCount(cartCount));
  };

  const handleQuantityChange = async (
    productId,
    newQuantity,
    currentQuantity,
    stock
  ) => {
    if (newQuantity < 1 || newQuantity > stock) return;

    // If quantity is the same, don't make the API call
    if (newQuantity === currentQuantity) return;

    setIsUpdatingQuantity(productId);

    // Optimistic UI update
    const originalCart = { ...cart };
    setCart((prevCart) => {
      const updatedProducts = prevCart.products.map((item) => {
        if (item.productId._id === productId) {
          const priceDiff =
            item.productId.discountedPrice * (newQuantity - item.quantity);
          const actualPriceDiff =
            item.productId.actualPrice * (newQuantity - item.quantity);
          const discountDiff =
            (item.productId.actualPrice - item.productId.discountedPrice) *
            (newQuantity - item.quantity);

          return {
            ...item,
            quantity: newQuantity,
            totalPrice: Math.round(item.totalPrice + priceDiff),
            actualPrice: Math.round(item.actualPrice + actualPriceDiff),
            priceOfDiscount: Math.round(item.priceOfDiscount + discountDiff),
          };
        }
        return item;
      });

      // Recalculate cart totals
      const totals = updatedProducts.reduce(
        (acc, item) => ({
          totalActualPrice: acc.totalActualPrice + item.actualPrice,
          totalDiscount: acc.totalDiscount + item.priceOfDiscount,
          finalAmount: acc.finalAmount + item.totalPrice,
        }),
        { totalActualPrice: 0, totalDiscount: 0, finalAmount: 0 }
      );

      return {
        ...prevCart,
        products: updatedProducts,
        totalActualPrice: Math.round(totals.totalActualPrice),
        totalDiscount: Math.round(totals.totalDiscount),
        finalAmount: Math.round(totals.finalAmount),
        deliveryCharges: Math.round(totals.finalAmount) > 999 ? 0 : 40,
      };
    });

    try {
      const res = await axios.post(
        `${serverUrl}/api/cart/update-quantity/${productId}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );

      if (res.data.success) {
        // Update cart count in header
        await updateCount();
      } else {
        // Revert to original state if there's an error
        setCart(originalCart);
        toast.error(res.data.message || "Failed to update quantity");
      }
    } catch (error) {
      // Revert to original state if there's an error
      setCart(originalCart);
      console.error("Error updating quantity:", error);
      toast.error(error.response?.data?.message || "Failed to update quantity");
    } finally {
      setIsUpdatingQuantity(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    setIsRemovingItem(productId);

    // Optimistic UI update
    const originalCart = { ...cart };
    const removedItem = cart.products.find(
      (item) => item.productId._id === productId
    );

    setCart((prevCart) => {
      const updatedProducts = prevCart.products.filter(
        (item) => item.productId._id !== productId
      );

      // Recalculate cart totals
      const totals = updatedProducts.reduce(
        (acc, item) => ({
          totalActualPrice: acc.totalActualPrice + item.actualPrice,
          totalDiscount: acc.totalDiscount + item.priceOfDiscount,
          finalAmount: acc.finalAmount + item.totalPrice,
        }),
        { totalActualPrice: 0, totalDiscount: 0, finalAmount: 0 }
      );

      return {
        ...prevCart,
        products: updatedProducts,
        totalActualPrice: Math.round(totals.totalActualPrice),
        totalDiscount: Math.round(totals.totalDiscount),
        finalAmount: Math.round(totals.finalAmount),
        deliveryCharges: Math.round(totals.finalAmount) > 999 ? 0 : 40,
        productsCount: updatedProducts.length,
      };
    });

    // Update selected products
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));

    try {
      const res = await axios.post(
        `${serverUrl}/api/cart/remove-product`,
        { productId },
        { withCredentials: true }
      );

      if (res.data.success) {
        await updateCount();
      } else {
        // Revert to original state if there's an error
        setCart(originalCart);
        toast.error(res.data.message || "Failed to remove item");
      }
    } catch (error) {
      // Revert to original state if there's an error
      setCart(originalCart);
      console.error("Error removing item:", error);
      toast.error(error.response?.data?.message || "Failed to remove item");
    } finally {
      setIsRemovingItem(null);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        cartBuyInfo: {
          cart,
        },
      },
    });
  };

  const handleAddToWishlist = async (productId) => {
    setIsAddingToWishlist(productId);

    // Optimistic UI update
    const originalCart = { ...cart };
    const removedItem = cart.products.find(
      (item) => item.productId._id === productId
    );

    setCart((prevCart) => {
      const updatedProducts = prevCart.products.filter(
        (item) => item.productId._id !== productId
      );

      // Recalculate cart totals
      const totals = updatedProducts.reduce(
        (acc, item) => ({
          totalActualPrice: acc.totalActualPrice + item.actualPrice,
          totalDiscount: acc.totalDiscount + item.priceOfDiscount,
          finalAmount: acc.finalAmount + item.totalPrice,
        }),
        { totalActualPrice: 0, totalDiscount: 0, finalAmount: 0 }
      );

      return {
        ...prevCart,
        products: updatedProducts,
        totalActualPrice: Math.round(totals.totalActualPrice),
        totalDiscount: Math.round(totals.totalDiscount),
        finalAmount: Math.round(totals.finalAmount),
        deliveryCharges: Math.round(totals.finalAmount) > 999 ? 0 : 40,
        productsCount: updatedProducts.length,
      };
    });

    // Update selected products
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));

    try {
      const res = await axios.post(
        `${serverUrl}/api/cart/move-to-wishlist`,
        { productId },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Product added to wishlist");
        await updateCount();
      } else {
        // Revert to original state if there's an error
        setCart(originalCart);
        toast.error(res.data.message || "Failed to add to wishlist");
      }
    } catch (error) {
      // Revert to original state if there's an error
      setCart(originalCart);
      console.error("Error adding to wishlist:", error);
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
    } finally {
      setIsAddingToWishlist(null);
    }
  };

  const handleAddAllToWishlist = async () => {
    if (cart.products.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsAddingAllToWishlist(true);

    // Optimistic UI update - save original cart and clear it
    const originalCart = { ...cart };

    setCart((prevCart) => ({
      ...prevCart,
      products: [],
      totalActualPrice: 0,
      totalDiscount: 0,
      finalAmount: 0,
      productsCount: 0,
      deliveryCharges: 0,
      platformFee: 0,
    }));

    // Clear selected products
    setSelectedProducts([]);

    try {
      const res = await axios.post(
        `${serverUrl}/api/cart/move-all-to-wishlist`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message || "All products added to wishlist");
        await updateCount();
      } else {
        // Revert to original state if there's an error
        setCart(originalCart);
        toast.error(res.data.message || "Failed to add all to wishlist");
      }
    } catch (error) {
      // Revert to original state if there's an error
      setCart(originalCart);
      console.error("Error adding all to wishlist:", error);
      toast.error(
        error.response?.data?.message || "Failed to add all to wishlist"
      );
    } finally {
      setIsAddingAllToWishlist(false);
    }
  };

  const handleAddSelectedToWishlist = async () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }

    setIsAddingAllToWishlist(true);

    // Optimistic UI update
    const originalCart = { ...cart };

    setCart((prevCart) => {
      const updatedProducts = prevCart.products.filter(
        (item) => !selectedProducts.includes(item.productId._id)
      );

      // Recalculate cart totals
      const totals = updatedProducts.reduce(
        (acc, item) => ({
          totalActualPrice: acc.totalActualPrice + item.actualPrice,
          totalDiscount: acc.totalDiscount + item.priceOfDiscount,
          finalAmount: acc.finalAmount + item.totalPrice,
        }),
        { totalActualPrice: 0, totalDiscount: 0, finalAmount: 0 }
      );

      return {
        ...prevCart,
        products: updatedProducts,
        totalActualPrice: Math.round(totals.totalActualPrice),
        totalDiscount: Math.round(totals.totalDiscount),
        finalAmount: Math.round(totals.finalAmount),
        deliveryCharges: Math.round(totals.finalAmount) > 999 ? 0 : 40,
        productsCount: updatedProducts.length,
      };
    });

    // Clear selected products
    setSelectedProducts([]);

    try {
      const res = await axios.post(
        `${serverUrl}/api/cart/move-selected-to-wishlist`,
        { productIds: selectedProducts },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(
          res.data.message || "Selected products added to wishlist"
        );
        await updateCount();
      } else {
        // Revert to original state if there's an error
        setCart(originalCart);
        setSelectedProducts(selectedProducts);
        toast.error(res.data.message || "Failed to add selected to wishlist");
      }
    } catch (error) {
      // Revert to original state if there's an error
      setCart(originalCart);
      setSelectedProducts(selectedProducts);
      console.error("Error adding selected to wishlist:", error);
      toast.error(
        error.response?.data?.message || "Failed to add selected to wishlist"
      );
    } finally {
      setIsAddingAllToWishlist(false);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAllProducts = () => {
    if (selectedProducts.length === cart.products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(cart.products.map((item) => item.productId._id));
    }
  };

  if (isCartLoading) {
    return <div>make loader here</div>;
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
            You need to be logged in to view your profile
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
      className={`min-h-screen bg-gray-50 ${
        isLargeScreen && isSideBarOpened ? "lg:ml-64" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex-1">My Cart</h1>
          {cart.products.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={handleAddAllToWishlist}
                className="flex items-center text-sm text-teal-600 hover:text-teal-800 border border-teal-600 px-3 py-1 rounded transition-colors"
                disabled={isAddingAllToWishlist}
              >
                {isAddingAllToWishlist ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-teal-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faHeart} className="mr-2" />
                    Add All to Wishlist
                  </>
                )}
              </button>
              {selectedProducts.length > 0 && (
                <button
                  onClick={handleAddSelectedToWishlist}
                  className="flex items-center text-sm text-teal-600 hover:text-teal-800 border border-teal-600 px-3 py-1 rounded transition-colors"
                  disabled={isAddingAllToWishlist}
                >
                  {isAddingAllToWishlist ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-teal-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faHeart} className="mr-2" />
                      Add Selected ({selectedProducts.length})
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {isCartEmpty ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <FontAwesomeIcon
                icon={faCartShopping}
                className="text-gray-300 text-7xl mb-6"
              />
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-500 mb-8 max-w-md">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Link
                to="/"
                className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="hidden md:grid md:grid-cols-12 text-sm font-medium text-gray-500 mb-4">
                    <div className="md:col-span-1"></div>
                    <div className="md:col-span-5">Product</div>
                    <div className="md:col-span-2 text-center">Price</div>
                    <div className="md:col-span-2 text-center">Quantity</div>
                    <div className="md:col-span-2 text-center">Total</div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    <div className="py-2 flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        checked={
                          selectedProducts.length === cart.products.length &&
                          cart.products.length > 0
                        }
                        onChange={handleSelectAllProducts}
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {selectedProducts.length === cart.products.length &&
                        cart.products.length > 0
                          ? "Deselect All"
                          : "Select All"}
                      </span>
                    </div>
                    {cart.products.map((item) => (
                      <div
                        key={item.productId._id}
                        className="py-6 grid grid-cols-3 md:grid-cols-12 gap-2 items-center"
                      >
                        <div className="col-span-1 md:col-span-1 flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                            checked={selectedProducts.includes(
                              item.productId._id
                            )}
                            onChange={() =>
                              handleSelectProduct(item.productId._id)
                            }
                          />
                        </div>
                        <div className="col-span-2 md:col-span-5 flex items-center">
                          <Link
                            to={`/product/${item.productId._id}`}
                            className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded-md overflow-hidden mr-4"
                          >
                            <img
                              src={item.productId.images[0].url}
                              alt={item.productId.name}
                              className="h-full w-full object-contain"
                            />
                          </Link>
                          <div>
                            <Link
                              to={`/product/${item.productId._id}`}
                              className="text-sm md:text-base font-medium text-gray-800 hover:text-teal-600"
                            >
                              {item.productId.name}
                            </Link>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span className="mr-2">
                                Brand: {item.productId.brand}
                              </span>
                              {item.productId.stock < 10 && (
                                <span className="text-orange-500 flex items-center">
                                  <FontAwesomeIcon
                                    icon={faExclamationCircle}
                                    className="mr-1"
                                  />
                                  Only {item.productId.stock} left
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  handleRemoveItem(item.productId._id)
                                }
                                className="text-xs text-red-500 hover:text-red-700 flex items-center"
                                disabled={isRemovingItem === item.productId._id}
                              >
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="mr-1"
                                />
                                Remove
                              </button>
                              <button
                                onClick={() =>
                                  handleAddToWishlist(item.productId._id)
                                }
                                className="text-xs text-teal-600 hover:text-teal-800 flex items-center"
                                disabled={
                                  isAddingToWishlist === item.productId._id
                                }
                              >
                                {isAddingToWishlist === item.productId._id ? (
                                  <span className="flex items-center">
                                    <svg
                                      className="animate-spin -ml-1 mr-1 h-3 w-3 text-teal-600"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Adding...
                                  </span>
                                ) : (
                                  <>
                                    <FontAwesomeIcon
                                      icon={faHeart}
                                      className="mr-1"
                                    />
                                    Save for Later
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:col-span-2 md:flex md:justify-center">
                          <div className="flex flex-col items-center">
                            <span className="text-gray-800 font-medium">
                              ₹{item.productId.discountedPrice.toFixed(0)}
                            </span>

                            <span className="text-xs text-gray-500 line-through">
                              ₹{item.productId.actualPrice.toFixed(0)}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 flex justify-center">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId._id,
                                  item.quantity - 1,
                                  item.quantity,
                                  item.productId.stock
                                )
                              }
                              disabled={
                                isUpdatingQuantity === item.productId._id ||
                                item.quantity <= 1
                              }
                            >
                              <FontAwesomeIcon
                                icon={faMinus}
                                className="text-xs"
                              />
                            </button>
                            <span className="w-10 text-center text-gray-800">
                              {isUpdatingQuantity === item.productId._id ? (
                                <svg
                                  className="animate-spin h-5 w-5 mx-auto text-teal-600"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId._id,
                                  item.quantity + 1,
                                  item.quantity,
                                  item.productId.stock
                                )
                              }
                              disabled={
                                isUpdatingQuantity === item.productId._id ||
                                item.quantity >= item.productId.stock
                              }
                            >
                              <FontAwesomeIcon
                                icon={faPlus}
                                className="text-xs"
                              />
                            </button>
                          </div>
                        </div>
                        <div className="hidden md:col-span-2 md:flex md:justify-center font-semibold text-teal-600">
                          ₹{item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Subtotal ({cart.productsCount}{" "}
                      {cart.productsCount === 1 ? "item" : "items"})
                    </span>
                    <span>₹{cart.totalActualPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span
                      className={
                        cart.deliveryCharges > 0 ? "" : "text-green-600"
                      }
                    >
                      {cart.deliveryCharges > 0
                        ? `₹${cart.deliveryCharges.toFixed(2)}`
                        : "FREE"}
                    </span>
                  </div>

                  {cart.totalDiscount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Savings</span>
                      <span className="text-green-600">
                        -₹{cart.totalDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {cart.platformFee > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Platform Fee</span>
                      <span>₹{cart.platformFee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{cart.finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faShoppingBag} />
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default Cart;
