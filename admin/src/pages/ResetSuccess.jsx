import React from "react";
import { useNavigate } from "react-router-dom";

const ResetSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="py-10 w-full bg-gray-100 flex justify-center items-center">
      <div className="flex flex-col gap-5 justify-center items-center border-gray-400 border bg-white w-96 sm:w-80 rounded-lg py-10">
        <h1 className="text-2xl font-bold text-teal-950 text-center">
          Password Reset Successful
        </h1>
        <button
          className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl lg:text-lg justify-center items-center hover:cursor-pointer text-white hover:bg-teal-950"
          onClick={() => navigate("/admin/login")}
          type="button"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default ResetSuccess;
