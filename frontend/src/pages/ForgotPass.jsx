import {
  faCartArrowDown,
  faCartShopping,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const serverUrl = process.env.SERVER_URL;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitForgotPass = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/user/forgot-password`,
        { email },
        {
          withCredentials: true,
        }
      );

      const resData = response.data;
      console.log(resData);
      if (response.status === 200) {
        setEmail("");
        setLoading(false);
        navigate("/login/forgot-password/success");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      return error;
    }
  };
  return (
    <div className="py-3 w-full bg-gray-100 flex justify-center items-center">
      <form
        onSubmit={submitForgotPass}
        className="flex flex-col gap-2 justify-center items-center border-gray-400 border bg-white w-96 sm:w-80 rounded-lg py-3"
      >
        <div className="text-3xl font-black py-2 self-start pl-4">
          Forgot Password
        </div>
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

        <div className="flex flex-col justify-center items-end w-48">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="hover:bg-gray-200 px-1 text-teal-700 hover:text-teal-900"
          >
            tryLogin?
          </button>
        </div>
        <button
          type="submit"
          className="bg-teal-900 p-2 text-xl text-white rounded-xl hover:bg-teal-950"
        >
          Send link
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

export default ForgotPass;
