import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/slices/sidebar/sidebarSelector.js";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectIsLoggedIn } from "../redux/slices/authentication/authSelector.js";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import handleLogoutUtil from "../utils/handleLogout";
import {
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  User,
  CreditCard,
  Settings,
  Bell,
  Eye,
  EyeOff,
} from "react-feather";
import axios from "axios";
import AddressForm from "../components/AddressForm";

const Profile = () => {
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState("profile");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({});
  const [editingAddress, setEditingAddress] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState({
    addresses: true,
    profile: true,
    password: false,
    logout: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otp, setOtp] = useState(""); // 6 digit all numbers
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");

  const fetchCurrentUser = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, profile: true }));
      const response = await axios.get(`${serverUrl}/api/buyer/current-user`, {
        withCredentials: true,
      });
      if (response.data.data.user) {
        setProfileData(response.data.data.user);
        setOriginalEmail(response.data.data.user.email || "");
        setIsEmailChanged(false);
        setIsEmailVerified(false);
      }
    } catch (error) {
      setProfileData({});
    } finally {
      setIsLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const fetchAddresses = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, addresses: true }));
      const response = await axios.get(`${serverUrl}/api/buyer/get-addresses`, {
        withCredentials: true,
      });
      if (response.data.data.addresses) {
        setAddresses(response.data.data.addresses.addresses || []);
        // Set selected address from backend, fallback to first address if none selected
        setSelectedAddress(
          response.data.data.addresses.selectedAddress ||
            (response.data.data.addresses.addresses?.length > 0
              ? response.data.data.addresses.addresses[0]
              : null)
        );
      } else {
        setAddresses([]);
        setSelectedAddress(null);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
      setSelectedAddress(null);
    } finally {
      setIsLoading((prev) => ({ ...prev, addresses: false }));
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCurrentUser();
      fetchAddresses();
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    setIsLoading((prev) => ({ ...prev, logout: true }));

    try {
      // Use the handleLogout utility function
      await handleLogoutUtil(dispatch, navigate);
    } catch (error) {
      toast.error("Failed to log out");
    } finally {
      setIsLoading((prev) => ({ ...prev, logout: false }));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Check if email has been changed but not verified
    if (isEmailChanged && !isEmailVerified) {
      toast.error("Please verify your email before saving changes");
      return;
    }

    try {
      const response = await axios.put(
        `${serverUrl}/api/buyer/update-buyer`,
        {
          email: profileData.email,
          fullName: profileData.fullName,
          phoneNumber: profileData.phoneNumber,
        },
        { withCredentials: true }
      );
      if (response.data.data.user) {
        setProfileData(response.data.data.user);
        setOriginalEmail(response.data.data.user.email || "");
        setIsEmailChanged(false);
        setIsEmailVerified(false);
        toast.success("Profile updated successfully");
        setIsEditingProfile(false);
      }
    } catch (error) {
      toast.error("Failed to update profile, Pls try again!");
      setIsEditingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    // Set loading state
    setIsLoading((prev) => ({ ...prev, password: true }));

    try {
      const response = await axios.post(
        `${serverUrl}/api/buyer/change-password`,
        {
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        },
        { withCredentials: true }
      );

      const { passChanged } = response.data.data;

      if (passChanged) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success("Password changed successfully");
        setIsLoading((prev) => ({ ...prev, password: false }));
      }
    } catch (error) {
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message;

      if (errorMessage === "Old password is incorrect!") {
        toast.error("Current password is incorrect");
      } else if (
        errorMessage === "Password and confirm password do not match!"
      ) {
        toast.error("New password and confirm password don't match");
      } else if (errorMessage === "All fields are required to be filled!") {
        toast.error("All password fields are required");
      } else {
        toast.error(errorMessage || "Failed to change password");
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, password: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Check if email is being changed
    if (name === "email" && value !== originalEmail) {
      setIsEmailChanged(true);
      setIsEmailVerified(false);
    } else if (name === "email" && value === originalEmail) {
      setIsEmailChanged(false);
      setIsEmailVerified(false);
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddAddress = async (address) => {
    try {
      // Remove _id field if present to avoid validation errors
      const { _id, ...addressWithoutId } = address;

      const response = await axios.post(
        `${serverUrl}/api/buyer/address/add-address`,
        { address: addressWithoutId },
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchAddresses(); // Refresh addresses after adding
        toast.success("Address added successfully");
        return true;
      }
    } catch (error) {
      console.error("Add address error:", error);
      toast.error("Failed to add address");
      return false;
    }
  };

  const handleEditAddress = async (addressData) => {
    try {
      const { address } = addressData;
      const response = await axios.post(
        `${serverUrl}/api/buyer/address/edit-address`,
        { address },
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchAddresses(); // Refresh addresses after editing
        toast.success("Address updated successfully");
        return true;
      }
    } catch (error) {
      console.error("Edit address error:", error);
      toast.error("Failed to update address");
      return false;
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/buyer/address/select-address`,
        { addressId },
        { withCredentials: true }
      );
      if (response.data.data.addressSelected) {
        fetchAddresses(); // Refresh addresses after setting default
        toast.success("Default address updated");
        return true;
      }
    } catch (error) {
      console.error("Set default address error:", error);
      toast.error("Failed to update default address");
      return false;
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

  const handleDeleteAddress = async (address) => {
    try {
      const response = await axios.delete(
        `${serverUrl}/api/buyer/address/delete-address`,
        {
          withCredentials: true,
          data: { addressId: address._id },
        }
      );
      if (response.data.success) {
        // Check if we're deleting the selected address
        if (selectedAddress && selectedAddress._id === address._id) {
          setSelectedAddress(null);
        }
        fetchAddresses(); // Refresh addresses after deletion
        toast.success("Address deleted successfully");
        return true;
      }
    } catch (error) {
      console.error("Delete address error:", error);
      toast.error("Failed to delete address");
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (addressToDelete) {
      await handleDeleteAddress(addressToDelete);
      setShowDeleteConfirm(false);
      setAddressToDelete(null);
    }
  };

  const handleNewAddressClick = () => {
    setIsAddingAddress(true);
    setNewAddress({
      name: profileData.fullName || "",
      phoneNumber: profileData.phoneNumber || "",
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

  const handleEditAddressClick = (address) => {
    setIsEditingAddress(true);
    setEditingAddress(address);
  };

  const handleDeleteAddressClick = (address) => {
    setAddressToDelete(address);
    setShowDeleteConfirm(true);
  };

  const handleSendOtp = async () => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/buyer/send-otp`,
        { email: profileData.email },
        { withCredentials: true }
      );
      if (response.data.data.otpSent) {
        toast.success("OTP sent successfully");
        setIsOtpSent(true);
      } else if (response.data.data.emailAlreadyExist) {
        toast.error("Pls Use another email, This email is in use.");
        setIsOtpSent(false);
      }
    } catch (error) {
      toast.error("Failed to send OTP");
      setIsOtpSent(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/buyer/verify-otp-for-email-change`,
        { email: profileData.email, otp },
        { withCredentials: true }
      );
      if (response.data.data.otpExpired) {
        toast.error("OTP expired");
        setIsOtpSent(false);
      } else if (response.data.data.otpIsWrong) {
        toast.error("OTP is wrong"); // instead of toast show something diffrent on UI
      } else if (response.data.data.otpVerified) {
        toast.success("OTP verified successfully");
        setIsEmailVerified(true);
        setOtp(""); // Clear OTP field after successful verification
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
      setIsOtpSent(false);
    }
  };

  const renderTabContent = () => {
    if (isLoading.profile || isLoading.addresses) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "profile":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {isEditingProfile ? (
              <form onSubmit={handleProfileUpdate}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="h-28 w-28 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-4xl font-bold text-teal-600 dark:text-teal-300 overflow-hidden">
                      <span>
                        {profileData.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <div className="flex flex-col md:flex-row gap-2 mb-2">
                        <input
                          type="email"
                          name="email"
                          value={profileData.email || ""}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                          onClick={handleSendOtp}
                          disabled={!isEmailChanged}
                        >
                          Send OTP
                        </button>
                      </div>
                      {isEmailChanged && (
                        <div className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 inline mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          Email changed. Verification required.
                        </div>
                      )}
                      {isEmailChanged && (
                        <div className="flex flex-col md:flex-row gap-2 mb-2">
                          <input
                            type="text"
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                            placeholder="Enter OTP"
                            disabled={!isOtpSent}
                          />
                          <button
                            type="button"
                            className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                            onClick={handleVerifyOtp}
                            disabled={!isOtpSent}
                          >
                            Verify OTP
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={profileData.phoneNumber || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                        placeholder="+91 XXXXXXXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                  <div className="h-28 w-28 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-4xl font-bold text-teal-600 dark:text-teal-300 overflow-hidden">
                    <span>{profileData.fullName?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {profileData.fullName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {profileData.email}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {profileData.phoneNumber}
                    </p>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="mt-4 px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "addresses":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
              Manage Addresses
            </h2>

            {isAddingAddress ? (
              <div className="border-t dark:border-gray-700 pt-4">
                <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                  {addresses.length === 0
                    ? "Add Delivery Address"
                    : "Add New Delivery Address"}
                </h3>
                <AddressForm
                  initialAddress={newAddress}
                  onSubmit={(address) => {
                    handleAddAddress(address);
                    setIsAddingAddress(false);
                  }}
                  onCancel={() => setIsAddingAddress(false)}
                />
              </div>
            ) : isEditingAddress ? (
              <div className="border-t dark:border-gray-700 pt-4">
                <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                  Edit Delivery Address
                </h3>
                <AddressForm
                  initialAddress={editingAddress}
                  onSubmit={(address) => {
                    handleEditAddress({ address });
                    setIsEditingAddress(false);
                    setEditingAddress(null);
                  }}
                  onCancel={() => {
                    setIsEditingAddress(false);
                    setEditingAddress(null);
                  }}
                />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {addresses?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className={`border rounded-lg p-4 ${
                            selectedAddress?._id === address._id
                              ? "border-teal-500 dark:border-teal-400"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                                  {address.addressType}
                                </h3>
                                {selectedAddress?._id === address._id && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {address.name}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {formatAddress(address)}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                Phone: {address.phoneNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex mt-4 space-x-2">
                            {selectedAddress?._id !== address._id && (
                              <button
                                onClick={() =>
                                  handleSetDefaultAddress(address._id)
                                }
                                className="text-sm text-teal-600 dark:text-teal-400 px-3 py-1 border border-teal-200 dark:border-teal-700 rounded hover:bg-teal-50 dark:hover:bg-teal-900 flex items-center"
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              onClick={() => handleEditAddressClick(address)}
                              className="text-sm text-gray-600 dark:text-gray-400 px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddressClick(address)}
                              className="text-sm text-red-600 dark:text-red-400 px-3 py-1 border border-red-200 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900 flex items-center"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}

                      <div
                        onClick={handleNewAddressClick}
                        className="border border-dashed rounded-lg p-4 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-500 dark:text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          Add New Address
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No addresses found. Add a new address to get started.
                      </p>
                      <button
                        onClick={handleNewAddressClick}
                        className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 transition"
                      >
                        Add New Address
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Confirmation Modal for Address Deletion */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Delete Address
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to delete this address?
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setAddressToDelete(null);
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "change-password":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                  >
                    {showPasswords.current ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                  >
                    {showPasswords.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 flex items-center justify-center"
                  disabled={isLoading.password}
                >
                  {isLoading.password ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

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
      className={`min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 md:px-8 ${
        isLargeScreen && isSideBarOpened ? "ml-80" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-10">
          My Account
        </h1>

        {/* Profile navigation tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-b-2 border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "addresses"
                ? "border-b-2 border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Addresses
          </button>
          <button
            onClick={() => setActiveTab("change-password")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "change-password"
                ? "border-b-2 border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Change Password
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="ml-auto px-4 py-2 text-red-600 dark:text-red-400 font-medium text-sm hover:text-red-700 dark:hover:text-red-300"
          >
            Logout
          </button>
        </div>

        {/* Main content */}
        {renderTabContent()}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition flex items-center justify-center"
                disabled={isLoading.logout}
              >
                {isLoading.logout ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Logging out...
                  </>
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default Profile;
