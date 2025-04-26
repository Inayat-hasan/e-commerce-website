import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {
  faLocationDot,
  faCheck,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import AddressForm from "./AddressForm";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../Loading";
import ConfirmationModal from "../ConfirmationModal";

const AddressSection = ({
  isLoggedIn,
  addresses,
  selectedAddress,
  setSelectedAddress,
  activeSection,
  setActiveSection,
  newAddress,
  setNewAddress,
  editingAddress,
  setEditingAddress,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  formatAddress,
}) => {
  const navigate = useNavigate();
  const [selectingAddressId, setSelectingAddressId] = React.useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Helper to check if address is valid for selection
  const isAddressSelectable = (address) => {
    return address && (!activeSection || activeSection === "address");
  };

  const handleAddressSelect = async (address) => {
    if (!isAddressSelectable(address)) return;
    setActiveSection("address");
    setSelectingAddressId(address._id);
    try {
      const result = await axios.post(`/api/buyer/address/select-address`, {
        addressId: address._id,
      });
      if (result.data.data.addressSelected) {
        setSelectedAddress(result.data.data.addressSelected);
        setActiveSection(null);
      } else {
        setSelectedAddress((prev) => prev);
        console.error("Error selecting address:", result.data.message);
        toast.error("Error selecting address. Please try again later.");
      }
    } catch (error) {
      console.error("Error selecting address:", error);
      toast.error("Error selecting address. Please try again later.");
    } finally {
      setSelectingAddressId(null);
    }
  };

  // Handle new address mode
  const handleNewAddressClick = () => {
    setActiveSection("new-address");
    setNewAddress({
      name: "",
      phoneNumber: "",
      pinCode: "",
      locality: "",
      address: "",
      city: "",
      state: "",
      landmark: "",
      alternatePhone: "",
      addressType: "Home",
    });
  };

  // Handle edit address mode
  const handleEditClick = (e, address) => {
    e.stopPropagation();
    setEditingAddress(address);
    setActiveSection("edit-address");
  };

  // Handle address deletion with confirmation
  const handleDeleteClick = (e, address) => {
    e.stopPropagation();
    setAddressToDelete(address);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (addressToDelete) {
      await onDeleteAddress(addressToDelete);
      setShowDeleteConfirm(false);
      setAddressToDelete(null);
    }
  };

  const handleAddAddress = (address) => {
    onAddAddress(address);
    setActiveSection(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-3">
            <FontAwesomeIcon icon={faLocationDot} />
          </div>
          <div>
            <h2 className="font-medium">Delivery Address</h2>
            {isLoggedIn ? (
              <>
                {selectedAddress ? (
                  <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {formatAddress(selectedAddress)}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    {addresses.length > 0
                      ? "Please select a delivery address."
                      : "Please add a delivery address."}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-red-500 mt-1">
                Please login to add delivery address
              </p>
            )}
          </div>
        </div>

        {isLoggedIn ? (
          <>
            {addresses.length > 0 ? (
              <button
                onClick={() =>
                  setActiveSection(
                    activeSection === "address" ? null : "address"
                  )
                }
                className="text-teal-600 text-sm px-4 py-2 border border-teal-600 rounded hover:bg-teal-50"
                disabled={activeSection && activeSection !== "address"}
              >
                Change
              </button>
            ) : (
              <button
                onClick={handleNewAddressClick}
                className="text-teal-600 text-sm px-4 py-2 border border-teal-600 rounded hover:bg-teal-50"
                disabled={!!activeSection}
              >
                Add Address
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="text-teal-600 text-sm px-4 py-2 border border-teal-600 rounded hover:bg-teal-50"
          >
            Login
          </button>
        )}
      </div>

      {isLoggedIn && activeSection === "address" && addresses.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-medium mb-3">Select Delivery Address</h3>
          <div className="flex flex-wrap gap-4">
            {addresses.map((address) => (
              <div
                key={address._id}
                onClick={() => handleAddressSelect(address)}
                className={`border rounded-lg p-4 flex flex-col w-full md:w-[calc(50%-0.5rem)] cursor-pointer ${
                  selectedAddress?._id === address._id
                    ? "border-teal-600"
                    : "border-gray-200 hover:border-gray-300"
                } relative`}
              >
                {selectingAddressId === address._id && (
                  <div className="absolute inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2">
                      {address.addressType}
                    </span>
                    {address.isDefault && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  {selectedAddress?._id === address._id ? (
                    <FontAwesomeIcon icon={faCheck} className="text-teal-600" />
                  ) : selectingAddressId === address._id ? (
                    <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : null}
                </div>

                <div className="text-sm space-y-1">
                  <div className="font-medium">{address.name}</div>
                  <div className="text-gray-600">
                    {address.address}
                    {address.landmark && `, ${address.landmark}`}
                  </div>
                  <div className="text-gray-600">
                    {address.locality}, {address.city}, {address.state} -{" "}
                    {address.pinCode}
                  </div>
                  <div className="text-gray-600">
                    Phone: {address.phoneNumber}
                    {address.alternatePhone &&
                      `, Alt: ${address.alternatePhone}`}
                  </div>
                </div>

                <div className="flex mt-4 space-x-2">
                  <button
                    onClick={(e) => handleEditClick(e, address)}
                    className="text-sm text-gray-600 px-3 py-1 border rounded hover:bg-gray-50 flex items-center"
                  >
                    <FontAwesomeIcon icon={faPen} className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, address)}
                    className="text-sm text-red-600 px-3 py-1 border border-red-200 rounded hover:bg-red-50 flex items-center"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <div
              onClick={handleNewAddressClick}
              className="border border-dashed rounded-lg p-4 flex flex-col justify-center items-center w-full md:w-[calc(50%-0.5rem)] cursor-pointer hover:bg-gray-50"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <FontAwesomeIcon icon={faPlus} className="text-gray-500" />
              </div>
              <div className="font-medium">Add New Address</div>
            </div>
          </div>
        </div>
      )}

      {isLoggedIn && activeSection === "new-address" && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-medium mb-3">
            {addresses.length === 0
              ? "Add Delivery Address"
              : "Add New Delivery Address"}
          </h3>
          <AddressForm
            address={newAddress}
            setAddress={setNewAddress}
            onSubmit={handleAddAddress}
            onCancel={() => setActiveSection("address")}
            showCancelButton={addresses.length > 0}
          />
        </div>
      )}

      {isLoggedIn && activeSection === "edit-address" && editingAddress && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-medium mb-3">Edit Delivery Address</h3>
          <AddressForm
            initialAddress={editingAddress}
            onSubmit={(address) => {
              onEditAddress({ address });
              setActiveSection(null);
              setEditingAddress(null);
            }}
            onCancel={() => {
              setActiveSection("address");
              setEditingAddress(null);
            }}
          />
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        message="Are you sure you want to delete this address?"
        onClose={() => {
          setShowDeleteConfirm(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

AddressSection.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  addresses: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      phoneNumber: PropTypes.string.isRequired,
      pinCode: PropTypes.number.isRequired,
      locality: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      landmark: PropTypes.string,
      alternatePhone: PropTypes.string,
      addressType: PropTypes.oneOf(["Home", "Office"]).isRequired,
    })
  ).isRequired,
  selectedAddress: PropTypes.object,
  setSelectedAddress: PropTypes.func.isRequired,
  activeSection: PropTypes.string,
  setActiveSection: PropTypes.func.isRequired,
  newAddress: PropTypes.object.isRequired,
  setNewAddress: PropTypes.func.isRequired,
  editingAddress: PropTypes.object,
  setEditingAddress: PropTypes.func.isRequired,
  onAddAddress: PropTypes.func.isRequired,
  onEditAddress: PropTypes.func.isRequired,
  onDeleteAddress: PropTypes.func.isRequired,
  formatAddress: PropTypes.func.isRequired,
};

export default AddressSection;
