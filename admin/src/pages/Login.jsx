import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setUser } from "../redux/reducers/authentication/authReducer.js";
import Loading from "../components/Loading";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff, Home } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks.js";
import { selectIsLoggedIn } from "../redux/reducers/authentication/authSelector.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const submitLoginHandler = async (e) => {
    e.preventDefault();
    setIsEmailTouched(true);
    setIsPasswordTouched(true);

    let isValid = true;

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) return;

    try {
      setLoading(true);

      const response = await axios.post(
        `${serverUrl}/api/admin/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      if (response.data.data.user) {
        setEmail("");
        setPassword("");
        setLoading(false);
        dispatch(setUser(response.data.data.user));
        navigate("/", {
          state: { successMessage: "Successfully logged in!" },
        });
      } else if (response.data.data.userNotFound) {
        setEmail("");
        setPassword("");
        setLoading(false);
        toast.error("User not found! Please register first!");
      } else if (response.data.data.isPassValid === false) {
        setPassword("");
        setLoading(false);
        toast.error("Password is wrong!");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong, please try again");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoggedIn) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-center mt-20">
          You are already logged in!
        </h1>
        <button
          onClick={() => navigate("/")}
          className=" mt-4 flex items-center justify-center bg-teal-700 text-white py-2 px-4 rounded-lg shadow-md hover:bg-teal-800 transition-colors duration-200"
        >
          <Home size={20} className="mr-2" />
          Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-teal-50 to-gray-100 flex justify-center items-center py-8 px-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <form
          onSubmit={submitLoginHandler}
          className="bg-white rounded-2xl shadow-xl overflow-hidden animate-scaleIn"
        >
          <div className="bg-teal-700 py-6 px-8">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-teal-100 mt-2">Sign in to your account</p>
          </div>

          <div className="p-8 space-y-6">
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
                  setIsEmailTouched(true);
                  if (e.target.value && validateEmail(e.target.value))
                    setEmailError("");
                }}
                className={`w-full p-3 border ${
                  emailError ? "border-red-500" : "border-gray-300"
                } 
                  rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  transition-all duration-200 outline-none`}
              />
              {isEmailTouched && emailError && (
                <p className="text-red-500 text-sm mt-1 animate-slideUp">
                  {emailError}
                </p>
              )}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIsPasswordTouched(true);
                    if (e.target.value) setPasswordError("");
                  }}
                  className={`w-full p-3 border ${
                    passwordError ? "border-red-500" : "border-gray-300"
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
              {isPasswordTouched && passwordError && (
                <p className="text-red-500 text-sm mt-1 animate-slideUp">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/login/forgot-password")}
                className="text-sm text-teal-600 hover:text-teal-800 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 px-4 rounded-lg
                font-medium transition-colors duration-200 shadow-md hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            >
              {loading ? <Loading /> : "Sign In"}
            </button>

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">Don't have an account?</p>
              <button
                type="button"
                className="mt-2 text-teal-600 hover:text-teal-800 font-medium transition-colors"
                onClick={() => navigate("/register")}
              >
                Create an account
              </button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
