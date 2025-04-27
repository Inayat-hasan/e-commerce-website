import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartArrowDown,
  faCartShopping,
  faHome,
  faL,
} from "@fortawesome/free-solid-svg-icons";

const Register = () => {
  const [name, setName] = useState("");
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitRegisterHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/admin/register`,
        {
          email,
          password,
          fullName: name,
          phoneNumber: "1234567890",
        },
        { withCredentials: true }
      );
      const resData = response.data;
      console.log(resData);
      if (response.status === 200) {
        setPassword("");
        setName("");
        setPhone("");
        setOtpSent(true);
        setLoading(false);
        return resData;
      }
    } catch (error) {
      console.log("Error in logging in: ", error);
      return error;
    }
  };

  const verifyOtpHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/admin/verify-otp`,
        {
          email,
          otp,
        },
        { withCredentials: true }
      );
      const resData = response.data;
      console.log(resData);
      if (response.status === 200) {
        setOtp("");
        setEmail("");
        navigate("/");
        setOtpSent(false);
        setLoading(false);
        return resData;
      }
    } catch (error) {
      console.log("Error in logging in: ", error);
      return error;
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="w-1/2 bg-white rounded-lg p-8">
        <h1 className="text-3xl font-bold">Register</h1>
        <form onSubmit={submitRegisterHandler}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>

          {otpSent ? (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                OTP
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Register
            </button>
            <Link to="/admin/login">
              <button className="bg-transparent hover:bg-gray-500 text-gray-700 font-semibold py-2 px-4 border border-gray-900 rounded">
                Login
              </button>
            </Link>
          </div>
        </form>
        {loading ? (
          <div className="mt-4">
            <FontAwesomeIcon icon={faL} className="animate-spin mr-2" />
            Loading...
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Register;
