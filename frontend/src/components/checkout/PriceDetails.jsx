import React from "react";
import PropTypes from "prop-types";

const PriceDetails = ({ cart }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
      <h2 className="font-medium text-gray-800 pb-4 border-b">Price Details</h2>
      <div className="py-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">
            Price ({cart.productsCount || 0}{" "}
            {cart.productsCount === 1 ? "item" : "items"})
          </span>
          <span>₹{cart.actualPrice?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Discount</span>
          <span className="text-green-600">
            -₹{cart.discount?.toFixed(2) || "0.00"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Charges</span>
          <span className={cart.shipping === 0 ? "text-green-600" : ""}>
            {cart.shipping === 0 ? "FREE" : `₹${cart.shipping?.toFixed(2)}`}
          </span>
        </div>
        {cart.totalPrice < 999 && (
          <div className="text-sm text-gray-500 italic">
            Get free delivery on orders above ₹999
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Platform Fee</span>
          <span>₹{cart.platformFee?.toFixed(2) || "0.00"}</span>
        </div>
      </div>
      <div className="border-t pt-4 mt-2">
        <div className="flex justify-between font-medium text-lg">
          <span>Total Amount</span>
          <span>₹{cart.totalPrice?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="text-green-600 text-sm mt-2">
          You will save ₹{cart.discount?.toFixed(2) || "0.00"} on this order
        </div>
      </div>
    </div>
  );
};

PriceDetails.propTypes = {
  cart: PropTypes.shape({
    actualPrice: PropTypes.number.isRequired,
    discount: PropTypes.number.isRequired,
    shipping: PropTypes.number.isRequired,
    platformFee: PropTypes.number.isRequired,
    totalPrice: PropTypes.number.isRequired,
    productsCount: PropTypes.number,
  }).isRequired,
};

export default PriceDetails;
