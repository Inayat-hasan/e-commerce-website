import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useAppDispatch } from "../redux/hooks";
import { setUser } from "../redux/slices/authentication/authSlice.js";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // Start with 0 to indicate no active OTP
  const [error, setError] = useState("");
  const [isOtpActive, setIsOtpActive] = useState(false); // Track if OTP is active
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      // Check if OTP is active when component mounts
      checkOtpStatus(location.state.email);
    } else {
      navigate("/register");
    }
  }, [location.state, navigate]);

  // Check if OTP exists and is valid for this email
  const checkOtpStatus = async (emailAddress) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/buyer/check-otp-status`,
        { email: emailAddress },
        { withCredentials: true }
      );

      if (response.data.data.isOtpActive) {
        setIsOtpActive(true);
        setTimer(response.data.data.remainingTime || 300);
        startTimer();
      } else {
        setIsOtpActive(false);
        setTimer(0);
      }
      setLoading(false);
    } catch (error) {
      setIsOtpActive(false);
      setLoading(false);
    }
  };

  const startTimer = () => {
    // Only start timer if OTP is active
    if (isOtpActive) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(countdown);
            setIsOtpActive(false); // OTP is no longer active when timer expires
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  };

  useEffect(() => {
    // Start timer when isOtpActive changes to true
    if (isOtpActive) {
      return startTimer();
    }
  }, [isOtpActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const validateForm = () => {
    if (!otp.trim()) {
      setError("OTP is required");
      return false;
    }
    setError("");
    return true;
  };

  const verifyOtpHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/buyer/verify-otp`,
        {
          email,
          otp,
        },
        { withCredentials: true }
      );

      if (response.data.data.userNotFound) {
        setOtp("");
        setLoading(false);
        toast.error("Something went wrong, please try again!");
        setTimeout(() => navigate("/register"), 2000);
      } else if (response.data.data.otpNotFound) {
        setOtp("");
        setLoading(false);
        setIsOtpActive(false);
        toast.error("OTP not found, please request a new one");
      } else if (response.data.data.otpExpired) {
        setOtp("");
        setLoading(false);
        setIsOtpActive(false);
        toast.error("OTP has expired, please request a new one");
      } else if (response.data.data.maxOtpAttempts) {
        setOtp("");
        setLoading(false);
        setIsOtpActive(false);
        toast.error("Maximum OTP attempts exceeded, please request a new one");
      } else if (response.data.data.isOtpValid === false) {
        setOtp("");
        setLoading(false);
        toast.error("Invalid OTP, please try again");
      } else if (response.data.data.user) {
        setOtp("");
        toast.success("Account verified successfully!");
        dispatch(setUser(response.data.data.user));
        navigate("/", {
          state: { successMessage: "User registered successfully!" },
        });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setOtp("");
      toast.error("Something went wrong, please try again!");
    }
  };

  const resendOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/buyer/resend-otp`,
        { email },
        { withCredentials: true }
      );

      if (response.data.data.otpSent === false) {
        toast.error("Failed to send OTP, please try again");
        setIsOtpActive(false);
      } else {
        toast.success("OTP sent successfully!");
        setTimer(300);
        setIsOtpActive(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong, please try again!");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-teal-50 to-gray-100 flex justify-center items-center py-8 px-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <form
          onSubmit={verifyOtpHandler}
          className="bg-white rounded-2xl shadow-xl overflow-hidden animate-scaleIn"
        >
          <div className="bg-teal-700 py-6 px-8">
            <h1 className="text-3xl font-bold text-white">Verify Account</h1>
            <p className="text-teal-100 mt-2">
              Enter the OTP sent to your email
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Email Field (Read Only) */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                readOnly
                className="w-full p-3 border border-gray-300 bg-gray-50
                  rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  transition-all duration-200 outline-none"
              />
            </div>

            {/* Conditional rendering based on OTP status */}
            {isOtpActive ? (
              // Show OTP field and timer when OTP is active
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700"
                  >
                    OTP Code
                  </label>
                  <span className="text-sm text-gray-500">
                    Expires in:{" "}
                    <span
                      className={`font-medium ${
                        timer < 60 ? "text-red-500" : "text-teal-600"
                      }`}
                    >
                      {formatTime(timer)}
                    </span>
                  </span>
                </div>
                <input
                  id="otp"
                  type="text"
                  name="otp"
                  placeholder="Enter OTP code"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (e.target.value) setError("");
                  }}
                  className={`w-full p-3 border ${
                    error ? "border-red-500" : "border-gray-300"
                  } 
                    rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent
                    transition-all duration-200 outline-none text-center tracking-widest text-lg`}
                  maxLength="6"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1 animate-slideUp">
                    {error}
                  </p>
                )}
              </div>
            ) : (
              // Show message when OTP is not active or expired
              <div className="text-center py-4">
                <p className="text-gray-600 mb-2">
                  No active OTP found or OTP has expired
                </p>
                <p className="text-gray-500 text-sm">
                  Please click the button below to request a new OTP
                </p>
              </div>
            )}

            {/* Conditional buttons based on OTP status */}
            {isOtpActive ? (
              // Show verify button when OTP is active
              <button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 px-4 rounded-lg
                  font-medium transition-colors duration-200 shadow-md hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Verifying...
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>
            ) : (
              // Show resend button when OTP is not active or expired
              <button
                type="button"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 px-4 rounded-lg
                  font-medium transition-colors duration-200 shadow-md hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                onClick={resendOtp}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Sending...
                  </div>
                ) : (
                  "Send OTP"
                )}
              </button>
            )}

            {/* Back to Register */}
            <div className="text-center border-t border-gray-200 pt-4 mt-4">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-800 transition-colors"
                onClick={() => navigate("/register")}
              >
                ← Back to Registration
              </button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default VerifyOtp;
