import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { load } from "@cashfreepayments/cashfree-js";

// Import checkout components
import LoginSection from "../components/checkout/LoginSection";
import AddressSection from "../components/checkout/AddressSection";
import OrderSummary from "../components/checkout/OrderSummary";
import PriceDetails from "../components/checkout/PriceDetails";
import CheckoutButton from "../components/checkout/CheckoutButton";
import Loading from "../components/Loading";
import DeliveryTimingDialog from "../components/checkout/DeliveryTimingDialog";
import axios from "axios";
import { useAppSelector } from "../redux/hooks/index.js";
import {
  selectIsLoggedIn,
  selectUser,
} from "../redux/slices/authentication/authSelector.js";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/slices/sidebar/sidebarSelector.js";

const Checkout = () => {
  const navigate = useNavigate();
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const [addressFormVisible, setAddressFormVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const location = useLocation();
  const user = useAppSelector(selectUser); // ex: user = { _id: "123", fullName: "John Doe",phoneNumber: "+91 123456789",email: "FtHsQ@example.com" }
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [activeSection, setActiveSection] = useState(null);
  const [isDirectBuy, setIsDirectBuy] = useState(false);
  const [cart, setCart] = useState({
    products: [],
    totalActualPrice: 0,
    totalDiscount: 0,
    finalAmount: 0,
    productsCount: 0,
    deliveryCharges: 0,
    platformFee: 20, // Fixed platform fee
  });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({});
  const [editingAddress, setEditingAddress] = useState(null);

  // Enhanced loading states
  const [loadingStates, setLoadingStates] = useState({
    pageLoading: true,
    paymentProcessing: false,
    addressSaving: false,
    quantityUpdating: null, // productId when updating
    productRemoving: null, // productId when removing
  });

  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      setLoadingStates((prev) => ({ ...prev, pageLoading: true }));
      try {
        const directBuyInfo = location.state?.directBuyProduct;

        const cartInfo = location.state?.cartBuyInfo;

        setIsDirectBuy(!!directBuyInfo);

        if (directBuyInfo) {
          await fetchAndFormatDirectBuyProduct(directBuyInfo);
        } else {
          await fetchCart(cartInfo);
        }

        // Fetch addresses if user is logged in
        if (isLoggedIn) {
          await fetchAddresses();
        }
      } catch (error) {
        console.error("Error initializing checkout:", error);
        toast.error("Failed to load checkout data");
      } finally {
        setLoadingStates((prev) => ({ ...prev, pageLoading: false }));
      }
    };

    initPage();
  }, [location.state, isLoggedIn]);

  const fetchCart = async (cartBuyInfo) => {
    if (!cartBuyInfo) return;
    setCart(cartBuyInfo.cart);
  };

  const fetchAndFormatDirectBuyProduct = async (directBuyInfo) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/product/buyer/get-product/${directBuyInfo.productId}`,
        { withCredentials: true }
      );

      if (result.data.data.product) {
        const product = result.data.data.product;
        const quantity = directBuyInfo.quantity;

        // Format in cart structure
        setCart({
          products: [
            {
              productId: product,
              quantity: quantity,
              totalPrice: Math.round(product.discountedPrice * quantity),
              priceOfDiscount: Math.round(
                (product.actualPrice - product.discountedPrice) * quantity
              ),
              actualPrice: Math.round(product.actualPrice * quantity),
            },
          ],
          totalActualPrice: Math.round(product.actualPrice * quantity),
          totalDiscount: Math.round(
            (product.actualPrice - product.discountedPrice) * quantity
          ),
          finalAmount: Math.round(product.discountedPrice * quantity),
          productsCount: 1,
          deliveryCharges:
            Math.round(product.discountedPrice * quantity) > 999 ? 0 : 40,
          platformFee: 20,
        });
      } else {
        toast.error("Failed to fetch product details");
      }
    } catch (error) {
      console.error("Error fetching product : ", error);
      toast.error("Failed to fetch product details");
    }
  };

  // Price calculation with memoization
  const calculatedPrices = useMemo(() => {
    const prices = {
      actualPrice: Math.round(cart.totalActualPrice),
      discount: Math.round(cart.totalDiscount),
      shipping: Math.round(cart.deliveryCharges),
      platformFee: Math.round(cart.platformFee),
      totalPrice: Math.round(
        cart.finalAmount + cart.deliveryCharges + cart.platformFee
      ),
      productsCount: cart.productsCount,
    };

    return prices;
  }, [cart]);

  const initializePaymentSDK = async () => {
    try {
      const cf = await load({ mode: "sandbox" });

      if (!cf) throw new Error("Failed to initialize payment SDK");

      return { cf };
    } catch (error) {
      console.error("Payment SDK initialization failed:", error);
      toast.error("Payment system initialization failed. Please try again.");
      return null;
    }
  };

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      setActiveSection("login");
      toast.error("Please login to continue");
      return;
    }

    if (!selectedAddress) {
      setActiveSection("address");
      toast.error("Please select a delivery address");
      return;
    }

    // Show delivery timing dialog instead of proceeding directly
    setShowDeliveryDialog(true);
  };

  // New function to handle the actual order placement
  const handleConfirmOrder = async (deliveryTiming) => {
    try {
      setLoadingStates((prev) => ({ ...prev, paymentProcessing: true }));
      setShowDeliveryDialog(false);

      const { cf } = await initializePaymentSDK();
      const cashfree = cf;

      const orderResponse = await axios.post(
        `${serverUrl}/api/order/create-order`,
        { cart, selectedAddress },
        { withCredentials: true }
      );

      const { paymentSessionId, orderId, orders } = orderResponse.data.data;

      if (!paymentSessionId || !orderId) {
        toast.error("Failed to create order. Please try again.");
        return;
      }

      const paymentResponse = await cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: "_modal",
      });

      if (paymentResponse.error) {
        toast.error("Payment failed. Please try again.");
      } else if (paymentResponse.paymentDetails) {
        const result2 = await axios.post(
          `${serverUrl}/api/order/verify-order`,
          {
            orderId,
            orders,
            cart,
            orderDays: deliveryTiming,
            buy: isDirectBuy === true ? "directBuy" : "cartBuy",
          },
          { withCredentials: true }
        );

        const { response } = result2.data.data;
        if (!response) {
          toast.error("Payment failed. Please try again.");
          return;
        }

        setCart([]);

        window.history.replaceState({}, document.title);
        navigate("/orders", {
          state: { successMessage: "Order placed successfully!" },
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, paymentProcessing: false }));
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (!isLoggedIn || newQuantity < 1) return;

    try {
      setLoadingStates((prev) => ({ ...prev, quantityUpdating: productId }));

      // Get product details from current cart state
      const product = cart.products.find(
        (item) => item.productId._id === productId
      );
      if (!product) return;

      // Calculate new prices
      const newTotalPrice = product.productId.discountedPrice * newQuantity;
      const newPriceOfDiscount =
        (product.productId.actualPrice - product.productId.discountedPrice) *
        newQuantity;
      const newActualPrice = product.productId.actualPrice * newQuantity;

      // Update only frontend cart state
      setCart((prev) => {
        // Update the specific product
        const updatedProducts = prev.products.map((item) =>
          item.productId._id === productId
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: newTotalPrice,
                priceOfDiscount: newPriceOfDiscount,
                actualPrice: newActualPrice,
              }
            : item
        );

        // Recalculate cart totals
        const totals = updatedProducts.reduce(
          (acc, item) => ({
            totalActualPrice: acc.totalActualPrice + item.actualPrice,
            totalDiscount: acc.totalDiscount + item.priceOfDiscount,
            finalAmount: acc.finalAmount + item.totalPrice,
          }),
          {
            totalActualPrice: 0,
            totalDiscount: 0,
            finalAmount: 0,
          }
        );

        // Return updated cart
        return {
          ...prev,
          products: updatedProducts,
          ...totals,
          productsCount: updatedProducts.length,
          deliveryCharges: totals.finalAmount > 999 ? 0 : 40,
          platformFee: 20,
        };
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setLoadingStates((prev) => ({ ...prev, quantityUpdating: null }));
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!isLoggedIn || isDirectBuy || cart.products.length <= 1) return;

    try {
      setLoadingStates((prev) => ({ ...prev, productRemoving: productId }));

      // Update only frontend cart state
      setCart((prev) => {
        const updatedProducts = prev.products.filter(
          (item) => item.productId._id !== productId
        );

        // Recalculate cart totals
        const totals = updatedProducts.reduce(
          (acc, item) => ({
            totalActualPrice: acc.totalActualPrice + item.actualPrice,
            totalDiscount: acc.totalDiscount + item.priceOfDiscount,
            finalAmount: acc.finalAmount + item.totalPrice,
          }),
          {
            totalActualPrice: 0,
            totalDiscount: 0,
            finalAmount: 0,
          }
        );

        return {
          ...prev,
          products: updatedProducts,
          ...totals,
          productsCount: updatedProducts.length,
          deliveryCharges: totals.finalAmount > 999 ? 0 : 100,
        };
      });

      toast.success("Item removed");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setLoadingStates((prev) => ({ ...prev, productRemoving: null }));
    }
  };

  const fetchAddresses = async () => {
    const result = await axios.get(`${serverUrl}/api/buyer/get-addresses`, {
      withCredentials: true,
    });
    if (result.data.data.addresses) {
      setAddresses(result.data.data.addresses.addresses);
      // Set selected address from backend, fallback to first address if none selected
      setSelectedAddress(
        result.data.data.addresses.selectedAddress ||
          (result.data.data.addresses.addresses.length > 0
            ? result.data.data.addresses.addresses[0]
            : null)
      );
    } else {
      setAddresses([]);
      setSelectedAddress(null);
    }
  };

  const addAddress = async (newAddress) => {
    const { _id, ...addressWithoutId } = newAddress;

    const result = await axios.post(
      `${serverUrl}/api/buyer/address/add-address`,
      { address: addressWithoutId },
      {
        withCredentials: true,
      }
    );

    if (result.data.data.addedAddress) {
      setAddresses((prev) => [...prev, result.data.data.addedAddress]);
      // Set the newly added address as selected
      setSelectedAddress(result.data.data.selectedAddress);
      setActiveSection(null);
      toast.success("Address added successfully!");
    } else {
      toast.error("Failed to add address!");
    }
  };

  const editAddress = async ({ address }) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/buyer/address/edit-address`,
        { address },
        { withCredentials: true }
      );

      if (result.data.data.updatedAddress) {
        const updatedAddresses = addresses.map((addr) =>
          addr._id === result.data.data.updatedAddress._id
            ? result.data.data.updatedAddress
            : addr
        );
        setAddresses(updatedAddresses);
        // Set the edited address as selected
        setSelectedAddress(result.data.data.updatedAddress);
        setActiveSection(null);
        setEditingAddress(null);
        toast.success("Address updated successfully!");
      } else {
        toast.error("Failed to update address!");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address. Please try again.");
    }
  };

  const deleteAddress = async (address) => {
    const result = await axios.delete(
      `${serverUrl}/api/buyer/address/delete-address`,
      {
        data: { addressId: address._id },
        withCredentials: true,
      }
    );
    if (result.data.data.isAddressDeleted === true) {
      const updatedAddresses = addresses.filter(
        (addr) => addr._id !== address._id
      );
      setAddresses(updatedAddresses);
      // if the selected address was the address that gone to backend for deletion then we need to check the addresses arr and set the first address as selected address if there.
      if (selectedAddress._id === address._id) {
        setSelectedAddress(
          updatedAddresses.length > 0 ? updatedAddresses[0] : null
        );
      }
      toast.success("Address deleted successfully!");
    } else {
      toast.error("Failed to delete address!");
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.address}${
      address.landmark ? `, ${address.landmark}` : ""
    }, ${address.locality}, ${address.city}, ${address.state} - ${
      address.pinCode
    }`;
  };

  if (loadingStates.pageLoading) {
    return <Loading />;
  }

  return (
    <div
      className={`bg-gray-50 min-h-screen ${
        isLargeScreen && isSideBarOpened ? "pl-80" : "w-full"
      } ${!isLargeScreen && isSideBarOpened ? "w-full" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() =>
            navigate(
              isDirectBuy ? `/product/${location.state?.productId}` : "/cart"
            )
          }
          className="flex items-center text-teal-600 mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          {isDirectBuy ? "Back to Product" : "Back to Cart"}
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <LoginSection
              user={user}
              isLoggedIn={isLoggedIn}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />

            <AddressSection
              isLoggedIn={isLoggedIn}
              addresses={addresses}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              newAddress={newAddress}
              setNewAddress={setNewAddress}
              editingAddress={editingAddress}
              setEditingAddress={setEditingAddress}
              onAddAddress={addAddress}
              onEditAddress={editAddress}
              onDeleteAddress={deleteAddress}
              formatAddress={formatAddress}
            />

            <OrderSummary
              cart={cart}
              isLoggedIn={isLoggedIn}
              selectedAddress={selectedAddress}
              addresses={addresses}
              isDirectBuy={isDirectBuy}
              handleUpdateQuantity={handleUpdateQuantity}
              handleRemoveItem={handleRemoveItem}
              activeSection={activeSection}
              loadingStates={loadingStates}
            />

            <CheckoutButton
              user={user}
              isLoggedIn={isLoggedIn}
              selectedAddress={selectedAddress}
              cart={cart}
              isLoading={loadingStates.paymentProcessing}
              handlePlaceOrder={handlePlaceOrder}
              addresses={addresses}
              activeSection={activeSection}
            />
          </div>

          <div className="md:w-1/3">
            <PriceDetails prices={calculatedPrices} />
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-center" />

      {loadingStates.paymentProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">
              Processing your order...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please don't close this window
            </p>
          </div>
        </div>
      )}

      <DeliveryTimingDialog
        isOpen={showDeliveryDialog}
        onClose={() => setShowDeliveryDialog(false)}
        onConfirm={handleConfirmOrder}
      />
    </div>
  );
};

export default Checkout;
