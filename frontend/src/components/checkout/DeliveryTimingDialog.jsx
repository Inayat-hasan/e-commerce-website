import React, { useState } from "react";
import PropTypes from "prop-types";

const DeliveryTimingDialog = ({ isOpen, onClose, onConfirm }) => {
  const [selectedTiming, setSelectedTiming] = useState(0);

  if (!isOpen) return null;

  const deliveryOptions = [
    { id: 0, label: "Show delivered right after payment", days: 0 },
    { id: 1, label: "Show delivered after 1 day", days: 1 },
    { id: 2, label: "Show delivered after 2 days", days: 2 },
    { id: 3, label: "Show delivered after 3 days", days: 3 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 animate-slideUp">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Choose Delivery Timing
        </h2>
        <p className="text-gray-600 mb-4">
          When would you like to see your order marked as delivered?
        </p>

        <div className="space-y-3 mb-6">
          {deliveryOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="deliveryTiming"
                value={option.id}
                checked={selectedTiming === option.id}
                onChange={() => setSelectedTiming(option.id)}
                className="form-radio text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-2 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel Order
          </button>
          <button
            onClick={() => onConfirm(selectedTiming)}
            className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Confirm Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

DeliveryTimingDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default DeliveryTimingDialog;
