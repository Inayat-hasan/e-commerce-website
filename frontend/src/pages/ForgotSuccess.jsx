import React from "react";

const ForgotSuccess = () => {
  return (
    <div className="py-10 w-full bg-gray-100 flex justify-center items-center">
      <div className="flex flex-col gap-5 justify-center items-center border-gray-400 border bg-white w-96 sm:w-80 rounded-lg py-10">
        <h1 className="text-2xl font-bold text-teal-950 text-center">
          Reset password link sent on your Email
        </h1>
        <button
          className="bg-teal-900 px-1.5 py-2 rounded-lg sm:text-xl lg:text-lg justify-center items-center hover:cursor-pointer text-white hover:bg-teal-950"
          onClick={() => navigate("/login")}
          type="button"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default ForgotSuccess;
