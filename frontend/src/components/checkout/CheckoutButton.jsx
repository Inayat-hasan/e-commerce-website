import React from "react";
import { useNavigate } from "react-router-dom";

const CheckoutButton = ({
  user,
  isLoggedIn,
  selectedAddress,
  cart,
  isLoading,
  handlePlaceOrder,
  addresses,
  activeSection,
}) => {
  const navigate = useNavigate();

  const getButtonText = () => {
    if (isLoading) return "Processing...";
    if (activeSection === "login") return "Complete Login Step First";
    if (activeSection === "address") return "Select Delivery Address First";
    if (activeSection === "new-address") return "Save Address First";
    if (activeSection === "edit-address") return "Update Address First";
    if (activeSection !== null) return "Complete Current Step First";
    if (!isLoggedIn) return "Login to Continue";
    return "Place Order";
  };

  const getErrorMessage = () => {
    if (!isLoggedIn) {
      return "Please login to continue with checkout.";
    }
    if (isLoggedIn && !selectedAddress && addresses.length === 0) {
      return "Please add a delivery address above.";
    }
    if (
      isLoggedIn &&
      !selectedAddress &&
      addresses.length > 0 &&
      activeSection !== "address"
    ) {
      return "Please select a delivery address above.";
    }
    return null;
  };

  const isDisabled =
    !isLoggedIn ||
    (!selectedAddress && isLoggedIn) ||
    !(cart.products && cart.products.length > 0) ||
    isLoading ||
    activeSection !== null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 relative">
      {activeSection !== null && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-10 z-0"></div>
      )}
      {isLoggedIn && (
        <div className="text-sm text-gray-600 mb-4">
          Order confirmation will be sent to{" "}
          <span className="font-medium">{user.email}</span>
        </div>
      )}

      <button
        onClick={isLoggedIn ? handlePlaceOrder : () => navigate("/login")}
        className="w-full flex items-center justify-center py-3 bg-teal-600 text-white font-medium rounded hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed relative"
        disabled={isDisabled}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
            {getButtonText()}
          </div>
        ) : (
          getButtonText()
        )}
      </button>

      {getErrorMessage() && (
        <p className="text-xs text-red-500 mt-2 text-center">
          {getErrorMessage()}
        </p>
      )}

      {activeSection !== null && (
        <p className="text-xs text-amber-600 mt-2 text-center font-medium">
          {activeSection === "login" &&
            "Please complete the login step before proceeding."}
          {activeSection === "address" &&
            "Please select a delivery address before proceeding."}
          {activeSection === "new-address" &&
            "Please save your new address before proceeding."}
          {activeSection === "edit-address" &&
            "Please update your address before proceeding."}
        </p>
      )}
    </div>
  );
};

export default CheckoutButton;
