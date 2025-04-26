import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

const OrderSummary = ({
  cart,
  isLoggedIn = false,
  selectedAddress = null,
  addresses = [],
  isDirectBuy = false,
  handleUpdateQuantity,
  handleRemoveItem,
  activeSection = null,
  loadingStates = {},
}) => {
  const isDisabled = !isLoggedIn || !selectedAddress || activeSection !== null;

  // Determine if an item can be removed (not direct buy, not last item)
  const canRemoveItem = (products) => {
    return !isDirectBuy && products && products.length > 1;
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 mb-4 ${
        isDisabled ? "opacity-50" : ""
      } relative`}
    >
      {isDisabled && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-30 flex items-center justify-center z-10">
          <div className="bg-white p-3 rounded-lg shadow-md text-center">
            <p className="text-amber-600 font-medium">
              {!isLoggedIn
                ? "Please login to proceed"
                : !selectedAddress
                ? "Please select a delivery address"
                : "Please complete the current step first"}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center border-b pb-4">
        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-3">
          <span className="text-lg font-medium">
            {!isLoggedIn ? "2" : addresses.length === 0 ? "2" : "3"}
          </span>
        </div>
        <h2 className="font-medium">Order Summary</h2>
      </div>

      <div className="pt-4">
        {cart?.products?.length > 0 ? (
          <div className="divide-y">
            {cart.products.map((item) => (
              <div key={item.productId?._id} className="py-4 flex items-start">
                <div className="w-16 h-16 border rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.productId?.images?.[0]?.url ? (
                    <img
                      src={item.productId.images[0].url}
                      alt={item.productId.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="ml-4 flex-grow">
                  <h3 className="font-medium text-gray-800">
                    {item.productId?.name}
                  </h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Seller: {item.productId?.brand}
                  </div>

                  <div className="flex items-center mt-2">
                    <span className="text-teal-600 font-medium">
                      ₹{item.productId?.discountedPrice?.toFixed(2)}
                    </span>

                    <>
                      <span className="text-gray-500 text-sm line-through ml-2">
                        ₹{item.productId?.actualPrice?.toFixed(2)}
                      </span>
                      <span className="text-green-600 text-xs ml-2">
                        {Math.round(
                          ((item.productId.actualPrice -
                            item.productId.discountedPrice) /
                            item.productId.actualPrice) *
                            100
                        )}
                        % off
                      </span>
                    </>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center">
                      <button
                        className={`w-8 h-8 flex items-center justify-center bg-gray-100 
                          ${
                            item.quantity <= 1 || isDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId._id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1 || isDisabled}
                      >
                        <FontAwesomeIcon icon={faMinus} className="text-xs" />
                      </button>

                      <span className="w-10 text-center">
                        {loadingStates.quantityUpdating ===
                        item.productId._id ? (
                          <div className="w-4 h-4 m-auto border-2 border-t-transparent border-teal-600 rounded-full animate-spin" />
                        ) : (
                          item.quantity
                        )}
                      </span>

                      <button
                        className={`w-8 h-8 flex items-center justify-center bg-gray-100 
                          ${
                            isDisabled ||
                            item.quantity >= item.productId?.stock
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId._id,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          isDisabled ||
                          // isDirectBuy ||
                          item.quantity >= item.productId?.stock
                        }
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                      </button>
                    </div>

                    {canRemoveItem(cart.products) && (
                      <button
                        className={`text-red-500 hover:text-red-600 p-2 
                          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => handleRemoveItem(item.productId._id)}
                        disabled={isDisabled}
                      >
                        {loadingStates.productRemoving ===
                        item.productId._id ? (
                          <div className="w-4 h-4 border-2 border-t-transparent border-red-500 rounded-full animate-spin" />
                        ) : (
                          <FontAwesomeIcon icon={faTrash} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {isDirectBuy
              ? "Loading product details..."
              : "No items in your cart."}
          </div>
        )}
      </div>
    </div>
  );
};

OrderSummary.propTypes = {
  cart: PropTypes.shape({
    products: PropTypes.arrayOf(
      PropTypes.shape({
        productId: PropTypes.shape({
          _id: PropTypes.string,
          name: PropTypes.string,
          brand: PropTypes.string,
          discountedPrice: PropTypes.number,
          actualPrice: PropTypes.number,
          stock: PropTypes.number,
          images: PropTypes.arrayOf(
            PropTypes.shape({
              url: PropTypes.string,
            })
          ),
        }),
        quantity: PropTypes.number,
      })
    ),
  }),
  isLoggedIn: PropTypes.bool.isRequired,
  selectedAddress: PropTypes.object,
  addresses: PropTypes.array.isRequired,
  isDirectBuy: PropTypes.bool.isRequired,
  handleUpdateQuantity: PropTypes.func.isRequired,
  handleRemoveItem: PropTypes.func.isRequired,
  activeSection: PropTypes.string,
  loadingStates: PropTypes.shape({
    quantityUpdating: PropTypes.string,
    productRemoving: PropTypes.string,
  }),
};

export default OrderSummary;
