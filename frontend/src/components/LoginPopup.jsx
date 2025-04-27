import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const LoginPopup = ({ isOpen, onClose, isMobile }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 480);
  const serverUrl = import.meta.env.SERVER_URL;

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setLoading(false);
    }
  }, [isOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 480);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!password) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${serverUrl}/api/buyer/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("Login successful!");
        onClose();
        window.location.reload(); // Reload to update auth state
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    onClose();
    navigate("/register");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ position: "fixed", overflow: "hidden" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xl" />
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isMobileView
                  ? "Please Login or Register"
                  : "Login to Your Account"}
              </h2>
              <p className="text-gray-600 mb-6">
                {isMobileView
                  ? "Create an account if you're new here"
                  : "Don't have an account? Click Register below to create one"}
              </p>

              {isMobileView ? (
                <div className="space-y-4">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegisterClick}
                    className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate("/login/forgot-password");
                      }}
                      className="text-sm text-teal-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Register
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginPopup;
