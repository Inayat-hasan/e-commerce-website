import React from "react";
import PropTypes from "prop-types";

const PriceDetails = ({ prices }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
      <h2 className="font-medium text-gray-800 pb-4 border-b">Price Details</h2>
      <div className="py-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">
            Price ({prices.productsCount || 0}{" "}
            {prices.productsCount === 1 ? "item" : "items"})
          </span>
          <span>₹{prices.actualPrice?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Discount</span>
          <span className="text-green-600">
            -₹{prices.discount?.toFixed(2) || "0.00"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Charges</span>
          <span className={prices.shipping === 0 ? "text-green-600" : ""}>
            {prices.shipping === 0 ? "FREE" : `₹${prices.shipping?.toFixed(2)}`}
          </span>
        </div>
        {prices.totalPrice < 999 && (
          <div className="text-sm text-gray-500 italic">
            Get free delivery on orders above ₹999
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Platform Fee</span>
          <span>₹{prices.platformFee?.toFixed(2) || "0.00"}</span>
        </div>
      </div>
      <div className="border-t pt-4 mt-2">
        <div className="flex justify-between font-medium text-lg">
          <span>Total Amount</span>
          <span>₹{prices.totalPrice?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="text-green-600 text-sm mt-2">
          You will save ₹{prices.discount?.toFixed(2) || "0.00"} on this order
        </div>
      </div>
    </div>
  );
};

PriceDetails.propTypes = {
  prices: PropTypes.shape({
    actualPrice: PropTypes.number.isRequired,
    discount: PropTypes.number.isRequired,
    shipping: PropTypes.number.isRequired,
    platformFee: PropTypes.number.isRequired,
    totalPrice: PropTypes.number.isRequired,
    productsCount: PropTypes.number,
  }).isRequired,
};

export default PriceDetails;
