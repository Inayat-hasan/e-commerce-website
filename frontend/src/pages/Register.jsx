import {
  faCartArrowDown,
  faCartShopping,
  faHome,
  faL,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const serverUrl = process.env.SERVER_URL;

  const submitRegisterHandler = async (e) => {
    e.preventDefault();
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
      // Access response data directly
      const resData = response.data;
      console.log(resData);
      // Clear input fields after successful login

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
      setLoading(false);
      return error;
    }
  };

  const verifyOtpHandler = async (e) => {
    e.preventDefault();
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
      // Access response data directly
      const resData = response.data;
      console.log(resData);
      // Clear input fields after successful login
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
    <div className="py-3 w-full bg-gray-100 flex justify-center items-center">
      {otpSent ? (
        <form
          className="flex flex-col gap-2 justify-center items-center border-gray-400 border bg-white w-96 sm:w-80 rounded-lg py-3"
          onSubmit={verifyOtpHandler}
          action=""
        >
          <div className="text-3xl font-black py-2 self-start pl-4">
            Register
          </div>
          <div className="flex flex-col justify-center items-center py-2">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              className="border-2 px-2 lg:w-60 text-start text-lg py-0.5"
              value={email}
              readOnly
            />
          </div>
          <div className="flex flex-col justify-center items-center py-2">
            <label htmlFor="otp">Otp</label>
            <input
              name="otp"
              type="number"
              className="border-2 px-2 lg:w-60 text-start text-lg py-0.5"
              placeholder="Enter Otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="loading-spinner">
              <svg
                className="animate-spin h-5 w-5 border-t-2 border-b-2 border-teal-900 rounded-full"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  strokeWidth="4"
                ></circle>
              </svg>
            </div>
          ) : (
            <button
              type="submit"
              className="bg-teal-900 p-2 text-xl text-white rounded-xl hover:bg-teal-950"
            >
              verify otp
            </button>
          )}
        </form>
      ) : (
        <form
          onSubmit={submitRegisterHandler}
          className="flex flex-col gap-2 justify-center items-center border-gray-400 border bg-white w-96 sm:w-80 rounded-lg py-3"
        >
          <div className="text-3xl font-black py-2 self-start pl-4">
            Register
          </div>
          <div className="flex flex-col justify-center items-center py-2">
            <label htmlFor="name">full name</label>
            <input
              type="text"
              name="name"
              className="border-2 px-2 lg:w-60 text-start text-lg py-0.5"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-center items-center py-2">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              className="border-2 px-2 lg:w-60 text-start text-lg py-0.5"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-center items-center py-2">
            <label htmlFor="phone">phone number</label>
            <input
              type="number"
              name="phone"
              className="border-2 px-2 lg:w-60 text-start text-lg py-0.5"
              placeholder="Enter your email address"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-center items-center py-2">
            <label htmlFor="password">Password</label>
            <input
              name="password"
              type="password"
              className="border-2 px-2 lg:w-60 text-start text-lg py-0.5"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="loading-spinner">
              <svg
                className="animate-spin h-5 w-5 border-t-2 border-b-2 border-teal-900 rounded-full"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  strokeWidth="4"
                ></circle>
              </svg>
            </div>
          ) : (
            <button
              type="submit"
              className="bg-teal-900 p-2 text-xl text-white rounded-xl hover:bg-teal-950"
            >
              verify email
            </button>
          )}

          <button
            type="button"
            className="text-teal-900 shadow-gray-400 shadow-lg hover:bg-gray-200 bg-gray-50 my-2 p-2 text-base flex flex-col rounded-xl text-center justify-center items-center"
            onClick={() => navigate("/login")}
          >
            Already Registered?<span>Login</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;
