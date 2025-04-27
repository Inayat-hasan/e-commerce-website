import {
  faCartShopping,
  faTrash,
  faMinus,
  faPlus,
  faArrowLeft,
  faShoppingBag,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import { useDispatch } from "react-redux";
import { setCartCount } from "../redux/slices/cartCount/cartCountSlice";
import fetchCartCount from "../redux/functions/fetchCartCount";

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
  const serverUrl = process.env.SERVER_URL;
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
  const dispatch = useDispatch();
  const serverUrl = process.env.SERVER_URL;

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setIsCartLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/cart/get-cart`, {
        withCredentials: true,
      });
      console.log("res : ", res);
      if (res.data.data.cart) {
        setCart(res.data.data.cart);
        setIsCartEmpty(
          !res.data.data.cart.products ||
            res.data.data.cart.products.length === 0
        );
      } else {
        setIsCartEmpty(true);
        toast.error("Failed to fetch cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setIsCartEmpty(true);
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

    try {
      const res = await axios.post(
        `${serverUrl}/api/cart/update-quantity`,
        { productId, quantity: newQuantity },
        { withCredentials: true }
      );

      if (res.data.success) {
        // Get the updated cart with new calculations from the server
        fetchCart();
        await updateCount();
      } else {
        toast.error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdatingQuantity(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    setIsRemovingItem(productId);

    try {
      const res = await axios.post(
        `${serverUrl}/api/cart/remove-product`,
        { productId },
        { withCredentials: true }
      );

      if (res.data.success) {
        // Get the updated cart with new calculations from the server
        fetchCart();
        toast.success("Item removed from cart");
        await updateCount();
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setIsRemovingItem(null);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (isCartLoading) {
    return <Loading />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cart Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
            <FontAwesomeIcon
              icon={faCartShopping}
              className="mr-3 text-teal-600"
            />
            Your Shopping Cart{" "}
            {cart.productsCount > 0 &&
              `(${cart.productsCount} ${
                cart.productsCount === 1 ? "item" : "items"
              })`}
          </h1>
          <Link
            to="/"
            className="text-teal-600 hover:text-teal-700 flex items-center text-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
            Continue Shopping
          </Link>
        </div>

        {isCartEmpty || !cart.products || cart.products.length === 0 ? (
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
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4 text-sm font-medium text-gray-600">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Total</div>
                </div>

                <div className="divide-y">
                  {cart.products.map((item) => (
                    <div
                      key={item.productId._id}
                      className="p-4 md:grid md:grid-cols-12 items-center"
                    >
                      {/* Mobile: Item with details stacked */}
                      <div className="md:hidden flex mb-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
                          {item.productId.images &&
                          item.productId.images.length > 0 ? (
                            <img
                              src={item.productId.images[0].url}
                              alt={item.productId.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FontAwesomeIcon icon={faExclamationCircle} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Link
                            to={`/product/${item.productId._id}`}
                            className="font-medium text-gray-800 hover:text-teal-600 block mb-1"
                          >
                            {item.productId.name}
                          </Link>
                          <div className="text-sm text-gray-500 mb-2">
                            {item.productId.brand}
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-teal-600">
                              ₹{item.productId.discountedPrice.toFixed(2)}
                            </div>
                            <button
                              onClick={() =>
                                handleRemoveItem(item.productId._id)
                              }
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              disabled={isRemovingItem === item.productId._id}
                            >
                              {isRemovingItem === item.productId._id ? (
                                <div className="w-4 h-4 border-2 border-t-2 border-t-transparent border-red-400 rounded-full animate-spin"></div>
                              ) : (
                                <FontAwesomeIcon icon={faTrash} />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center">
                            <div className="flex items-center border rounded-md overflow-hidden">
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
                              <div className="w-10 h-8 flex items-center justify-center text-sm">
                                {isUpdatingQuantity === item.productId._id ? (
                                  <div className="w-4 h-4 border-2 border-t-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                                ) : (
                                  item.quantity
                                )}
                              </div>
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
                            <div className="ml-auto font-medium">
                              ₹{item.totalPrice.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop: Grid layout */}
                      <div className="hidden md:col-span-6 md:flex md:items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4 flex-shrink-0">
                          {item.productId.images &&
                          item.productId.images.length > 0 ? (
                            <img
                              src={item.productId.images[0].url}
                              alt={item.productId.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FontAwesomeIcon icon={faExclamationCircle} />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/product/${item.productId._id}`}
                            className="font-medium text-gray-800 hover:text-teal-600 block mb-1"
                          >
                            {item.productId.name}
                          </Link>
                          <div className="text-sm text-gray-500">
                            {item.productId.brand}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.productId._id)}
                            className="text-sm text-gray-400 hover:text-red-500 mt-1 flex items-center transition-colors"
                            disabled={isRemovingItem === item.productId._id}
                          >
                            {isRemovingItem === item.productId._id ? (
                              <div className="w-3 h-3 border-2 border-t-2 border-t-transparent border-red-400 rounded-full animate-spin mr-1"></div>
                            ) : (
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="mr-1"
                              />
                            )}
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="hidden md:col-span-2 md:flex md:justify-center font-medium text-gray-800">
                        ₹{item.productId.discountedPrice.toFixed(2)}
                      </div>
                      <div className="hidden md:col-span-2 md:flex md:justify-center">
                        <div className="flex items-center border rounded-md overflow-hidden">
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
                          <div className="w-10 h-8 flex items-center justify-center text-sm">
                            {isUpdatingQuantity === item.productId._id ? (
                              <div className="w-4 h-4 border-2 border-t-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                            ) : (
                              item.quantity
                            )}
                          </div>
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
    </div>
  );
};

export default Cart;
