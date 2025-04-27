import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const submitForgotPass = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.SERVER_URL}/api/admin/forgot-password`,
        { email },
        {
          withCredentials: true,
        }
      );

      const resData = response.data;
      console.log(resData);
      if (response.status === 200) {
        setEmail("");
        navigate("/admin/login/forgot-password/success");
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  return (
    <div className="py-10 w-full bg-gray-100 flex justify-center items-center">
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
        <button
          className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl lg:text-lg justify-center items-center hover:cursor-pointer text-white hover:bg-teal-950"
          type="submit"
        >
          Send Email
        </button>
      </form>
    </div>
  );
};

export default ForgotPass;
