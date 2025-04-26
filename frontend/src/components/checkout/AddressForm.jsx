import React, { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const AddressForm = ({ onSubmit, onCancel, initialAddress = {} }) => {
  const [address, setAddress] = useState({
    name: initialAddress.name || "",
    phoneNumber: initialAddress.phoneNumber || "",
    pinCode: initialAddress.pinCode || "",
    locality: initialAddress.locality || "",
    address: initialAddress.address || "",
    city: initialAddress.city || "",
    state: initialAddress.state || "",
    landmark: initialAddress.landmark || "",
    alternatePhone: initialAddress.alternatePhone || "",
    addressType: initialAddress.addressType || "Home",
    _id: initialAddress._id || "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!address.name?.trim()) newErrors.name = "Name is required";
    if (!address.phoneNumber?.trim())
      newErrors.phoneNumber = "Phone number is required";
    else if (!/^\+91\s[0-9]{10}$/.test(address.phoneNumber)) {
      newErrors.phoneNumber =
        "Phone number should be in format: +91 XXXXXXXXXX";
    }
    if (!address.pinCode) newErrors.pinCode = "PIN code is required";
    else if (!/^[0-9]{6}$/.test(address.pinCode)) {
      newErrors.pinCode = "Enter a valid 6-digit PIN code";
    }
    if (!address.locality?.trim()) newErrors.locality = "Locality is required";
    if (!address.address?.trim()) newErrors.address = "Address is required";
    if (!address.city?.trim()) newErrors.city = "City is required";
    if (!address.state?.trim()) newErrors.state = "State is required";

    // Optional field validations
    if (
      address.alternatePhone &&
      !/^\+91\s[0-9]{10}$/.test(address.alternatePhone)
    ) {
      newErrors.alternatePhone =
        "Alternate phone should be in format: +91 XXXXXXXXXX";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    onSubmit(address); // Pass just the address object, not the event
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: name === "pinCode" ? value.replace(/\D/g, "") : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={address.name}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.name ? "border-red-500" : "border-gray-300"
          } shadow-sm p-2`}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="phoneNumber"
          value={address.phoneNumber}
          onChange={handleInputChange}
          placeholder="+91 XXXXXXXXXX"
          className={`mt-1 block w-full rounded-md border ${
            errors.phoneNumber ? "border-red-500" : "border-gray-300"
          } shadow-sm p-2`}
        />
        {errors.phoneNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
        )}
      </div>

      {/* PIN Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          PIN Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="pinCode"
          value={address.pinCode}
          onChange={handleInputChange}
          maxLength="6"
          className={`mt-1 block w-full rounded-md border ${
            errors.pinCode ? "border-red-500" : "border-gray-300"
          } shadow-sm p-2`}
        />
        {errors.pinCode && (
          <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>
        )}
      </div>

      {/* Locality */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Locality <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="locality"
          value={address.locality}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.locality ? "border-red-500" : "border-gray-300"
          } shadow-sm p-2`}
        />
        {errors.locality && (
          <p className="text-red-500 text-xs mt-1">{errors.locality}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          name="address"
          value={address.address}
          onChange={handleInputChange}
          rows="3"
          className={`mt-1 block w-full rounded-md border ${
            errors.address ? "border-red-500" : "border-gray-300"
          } shadow-sm p-2`}
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address}</p>
        )}
      </div>

      {/* City and State in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={address.city}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.city ? "border-red-500" : "border-gray-300"
            } shadow-sm p-2`}
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            value={address.state}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.state ? "border-red-500" : "border-gray-300"
            } shadow-sm p-2`}
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Landmark (Optional)
          </label>
          <input
            type="text"
            name="landmark"
            value={address.landmark}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Alternate Phone (Optional)
          </label>
          <input
            type="text"
            name="alternatePhone"
            value={address.alternatePhone}
            onChange={handleInputChange}
            placeholder="+91 XXXXXXXXXX"
            className={`mt-1 block w-full rounded-md border ${
              errors.alternatePhone ? "border-red-500" : "border-gray-300"
            } shadow-sm p-2`}
          />
          {errors.alternatePhone && (
            <p className="text-red-500 text-xs mt-1">{errors.alternatePhone}</p>
          )}
        </div>
      </div>

      {/* Address Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Address Type <span className="text-red-500">*</span>
        </label>
        <div className="mt-2 space-x-4">
          {["Home", "Office"].map((type) => (
            <label key={type} className="inline-flex items-center">
              <input
                type="radio"
                name="addressType"
                value={type}
                checked={address.addressType === type}
                onChange={handleInputChange}
                className="form-radio text-teal-600"
              />
              <span className="ml-2">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          Save Address
        </button>
      </div>
    </form>
  );
};

AddressForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  initialAddress: PropTypes.shape({
    name: PropTypes.string,
    phoneNumber: PropTypes.string,
    pinCode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    locality: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    landmark: PropTypes.string,
    alternatePhone: PropTypes.string,
    addressType: PropTypes.oneOf(["Home", "Office"]),
  }),
};

export default AddressForm;
