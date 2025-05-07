import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", password: "" };

    // Validate name
    if (!name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const submitRegisterHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/buyer/register`,
        {
          email,
          password,
          fullName: name,
          phoneNumber: phone,
        },
        { withCredentials: true }
      );

      if (response.data.data.userAlreadyExists) {
        setPassword("");
        setName("");
        setPhone("");
        setLoading(false);
        toast.error("User already exists! Please login");
      } else if (response.data.data.user) {
        navigate("/verify-otp", { state: { email } });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong, Please try again!");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-teal-50 to-gray-100 flex justify-center items-center py-8 px-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <form
          onSubmit={submitRegisterHandler}
          className="bg-white rounded-2xl shadow-xl overflow-hidden animate-scaleIn"
        >
          <div className="bg-teal-700 py-6 px-8">
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-teal-100 mt-2">Join our community today</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value) setErrors({ ...errors, name: "" });
                }}
                className={`w-full p-3 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } 
                  rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  transition-all duration-200 outline-none`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 animate-slideUp">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
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
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value && /\S+@\S+\.\S+/.test(e.target.value)) {
                    setErrors({ ...errors, email: "" });
                  }
                }}
                className={`w-full p-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } 
                  rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  transition-all duration-200 outline-none`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 animate-slideUp">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Field (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full p-3 border border-gray-300 
                  rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  transition-all duration-200 outline-none`}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (e.target.value && e.target.value.length >= 6) {
                      setErrors({ ...errors, password: "" });
                    }
                  }}
                  className={`w-full p-3 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } 
                    rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent
                    transition-all duration-200 outline-none pr-10`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-500" />
                  ) : (
                    <Eye size={20} className="text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 animate-slideUp">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Register Button */}
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
                  Sending Otp...
                </div>
              ) : (
                "Verify Email"
              )}
            </button>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">Already have an account?</p>
              <button
                type="button"
                className="mt-2 text-teal-600 hover:text-teal-800 font-medium transition-colors"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;
