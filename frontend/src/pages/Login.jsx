import {
  faCartArrowDown,
  faCartShopping,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/authentication/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitLoginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await axios.post(
        `${serverUrl}/api/buyer/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      // Access response data directly
      const resData = response.data;

      // Clear input fields and update auth state after successful login
      if (response.status === 200) {
        dispatch(setUser(resData.data.user));
        setEmail("");
        setPassword("");
        navigate("/");
      }
    } catch (error) {
      console.log("Error in logging in:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-3 w-full bg-gray-100 flex justify-center items-center">
      <form
        onSubmit={submitLoginHandler}
        className="flex flex-col gap-2 justify-center items-center border-gray-400 border bg-white w-96 sm:w-80 rounded-lg py-3"
      >
        <div className="text-3xl font-black py-2 self-start pl-4">Login</div>
        <div className="flex flex-col justify-center items-center py-2">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            className="border-2"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-center items-center pt-2">
          <label htmlFor="password">Password</label>
          <input
            name="password"
            type="password"
            className="border-2"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-center items-end w-48">
          <button
            type="button"
            onClick={() => navigate("/login/forgot-password")}
            className="hover:bg-gray-200 px-1 text-teal-700 hover:text-teal-900"
          >
            forgotpassword?
          </button>
        </div>
        <button
          type="submit"
          className="bg-teal-900 p-2 text-xl text-white rounded-xl hover:bg-teal-950"
        >
          Login
        </button>
        <button
          type="button"
          className="text-teal-900 shadow-gray-400 shadow-lg hover:bg-gray-200 bg-gray-50 my-2 p-2 text-base flex flex-col rounded-xl justify-center items-center text-center"
          onClick={() => navigate("/register")}
        >
          Not Registered ?<span>create an account</span>
        </button>
      </form>
    </div>
  );
};

export default Login;
