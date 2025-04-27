import {
  faCartArrowDown,
  faCartShopping,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";

const ResetPass = ({ url }) => {
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const navigate = useNavigate();
  const { id, token } = useParams();
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const submitResetPassword = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirmPass) {
        console.log("Passwords do not match!");
        return;
      }
      const response = await axios.post(
        `${serverUrl}/api/user/reset-password/${id}/${token}`,
        {
          password,
          confirmPassword: confirmPass,
        }
      );
      const resData = response.data;
      console.log(resData);
      if (response.status === 200) {
        setPassword("");
        setConfirmPass("");
        navigate("/reset-password/success");
        return resData;
      }
    } catch (error) {
      console.log("Error in logging in:", error);
      return error;
    }
  };
  return (
    <div className="py-3 w-full bg-gray-100 flex justify-center items-center">
      <form
        onSubmit={submitResetPassword}
        className="flex flex-col gap-2 justify-center items-center border-gray-400 border bg-white w-96 sm:w-80 rounded-lg py-3"
      >
        <div className="text-3xl font-black py-2 self-start pl-4">
          Reset Password
        </div>
        <div className="flex flex-col justify-center items-center py-2">
          <label htmlFor="password">password</label>
          <input
            type="text"
            name="password"
            className="border-2"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-center items-center py-2">
          <label htmlFor="confirmPass">confirm password</label>
          <input
            type="text"
            name="confirmPass"
            className="border-2"
            placeholder="confirm your password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-teal-900 p-2 text-xl text-white rounded-xl hover:bg-teal-950"
        >
          change password
        </button>
      </form>
    </div>
  );
};

export default ResetPass;
