import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { adminModel } from "../models/admin.model.js";
import { generateAndSendOtp } from "../utils/generateAndSendOtp.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import generateAccessAndRefreshToken from "./user-controller.js";
import { sendForgotPassLink } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

const register = asyncHandler(async (req, res) => {
  try {
    const { fullName, phoneNumber, email, password } = req.body;

    if (!fullName || !phoneNumber || !email || !password) {
      return res
        .status(400)
        .json(new ApiError(400, "All fields are required!"));
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json(new ApiError(400, "Invalid email format!"));
    }

    const userExists = await userModel.findOne({ email, role: "admin" });

    if (userExists) {
      return res
        .status(400)
        .json(new ApiError(400, "User already exists as an admin!"));
    } else {
      const user = await userModel.create({
        fullName,
        email,
        phoneNumber,
        password,
        role: "admin",
      });
      const admin = await adminModel.create({
        user: user._id,
      });
      await generateAndSendOtp(user);
      return res
        .status(200)
        .json(
          new ApiResponse(200, "User and admin registered!", { user, admin })
        );
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error in registration!", { error }));
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json(new ApiError(400, "Email and password are required!"));
  }

  const user = await userModel.findOne({ email, role: "admin" });
  if (!user) {
    return res
      .status(400)
      .json(new ApiError(400, "User not found! Please register first!"));
  }

  const isPassValid = await user.isPasswordCorrect(password);
  if (!isPassValid) {
    return res.status(400).json(new ApiError(400, "Password is wrong!"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // const options = {
  //   httpOnly: true,
  //   secure: true,
  // };

  return res
    .status(200)
    .cookie("adminAccessToken", accessToken)
    .cookie("adminRefreshToken", refreshToken)
    .json(
      new ApiResponse(200, "User logged in successfully!", {
        user,
        accessToken,
        refreshToken,
      })
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json(new ApiError(400, "Email is required!"));
  }
  const userExist = await userModel.findOne({ email, role: "admin" });
  if (!userExist) {
    return res.status(400).json(new ApiError(400, "Pls register!"));
  }
  const secret = process.env.RESET_TOKEN_SECRET + userExist.password;

  const token = jwt.sign(
    { email: userExist.email, id: userExist._id, role: userExist.role },
    secret,
    {
      expiresIn: "15m",
    }
  );

  const link = `https://localhost:3000/api/admin/reset-password/${userExist._id}/${token}`;

  await sendForgotPassLink(email, link);
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Email sent successfully!", { link, userExist })
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    return res
      .status(400)
      .json(new ApiError(400, "All fields are required to be filled!"));
  }
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json(new ApiError(400, "Password and confirm password do not match!"));
  }
  const user = await userModel.findOne({ _id: id, role: "admin" });
  if (!user) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "User with provided id does not exist! Please register"
        )
      );
  }
  const secret = process.env.RESET_TOKEN_SECRET + user.password;
  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      return res
        .status(400)
        .json(new ApiError(400, "Token is expired or invalid!"));
    }
    user.password = password;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Password reset successful!"));
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json(new ApiError(400, "Otp is required!"));
  }
  const user = await userModel.findOne({ email, role: "admin" });
  const otpUser = await otpModel.findOne({ user: user._id });

  if (user.isOtpExpired()) {
    await userModel.findOneAndDelete({ _id: user._id });
    await adminModel.findOneAndDelete({ user: user._id });
    return res.status(400).json(new ApiError(400, "OTP Expired!"));
  }

  const isOtpValid = await otpUser.isOtpCorrect(otp);
  if (!isOtpValid) {
    await userModel.findOneAndDelete({ _id: user._id });
    await adminModel.findOneAndDelete({ user: user._id });
    return res.status(400).json(new ApiError(400, "Pls Enter Valid Otp!"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Otp verified successfully!", {
        user,
        accessToken,
        refreshToken,
      })
    );
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email, role: "admin" });
  const otpSent = await generateAndSendOtp(user);
  if (!otpSent) {
    return res.status(500).json(new ApiError(500, "Something went wrong"));
  } else {
    return res.status(200).json(new ApiResponse(200, "Otp sent successfully!"));
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    const user = await userModel
      .findByIdAndUpdate(
        req.admin?._id,
        {
          $unset: {
            refreshToken: 1,
          },
        },
        {
          new: true,
        }
      )
      .select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("adminAccessToken", options)
      .clearCookie("adminRefreshToken", options)
      .json(new ApiResponse(200, "User logout successfully!", { user }));
  } catch (error) {
    console.log("error : ", error);
    return res
      .status(402)
      .json(new ApiError(402, "Error while logging out", { error }));
  }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    if (!fullName || !phoneNumber) {
      return res.status(400).json(new ApiError(400, "All fields are required"));
    }
    const user = await userModel
      .findByIdAndUpdate(
        req.admin?._id,
        {
          fullName,
          phoneNumber,
        },
        { new: true }
      )
      .select("-password -refreshToken");
    if (!user) {
      return res.status(400).json(new ApiError(400, "User not found!"));
    } else {
      return res
        .status(200)
        .json(new ApiResponse(200, "Account details updated!", { user }));
    }
  } catch (error) {
    console.log("error : ", error);
    return res
      .status(402)
      .json(new ApiError(402, "Error while updating user", { error }));
  }
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  const user = await userModel
    .findById(req.admin?._id)
    .select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully!", { user }));
});

const refreshAdminAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await userModel.findOne({
      _id: decodedToken?._id,
      role: "admin",
    });

    if (!user) {
      throw new ApiError(401, "Invalid or used refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return { accessToken, refreshToken, user };
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid refresh token");
  }
};

const isAdminLoggedIn = asyncHandler(async (req, res) => {
  const accessToken = req.cookies.adminAccessToken;
  const options = {
    httpOnly: true,
    // secure: true,
  };

  if (accessToken) {
    try {
      const decodedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );
      const user = await userModel.findOne({
        _id: decodedToken?._id,
        role: "admin",
      });

      if (!user) {
        throw new ApiError(401, "Invalid admin session");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, "User is logged in!", { user }));
    } catch (error) {
      return res.status(401).json(new ApiError(401, error.message));
    }
  }

  const refreshToken = req.cookies.adminRefreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json(
        new ApiError(401, "Authentication required", { navigateToLogin: true })
      );
  }

  try {
    const {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    } = await refreshAdminAccessToken(refreshToken);

    if (!user || !accessToken || !newRefreshToken) {
      return res
        .status(401)
        .json(new ApiError(401, "User not found", { navigateToLogin: true }));
    }

    return res
      .status(200)
      .cookie("adminAccessToken", accessToken, options)
      .cookie("adminRefreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, "User is logged in using refresh token!", {
          user,
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    return res.status(401).json(
      new ApiError(401, error.message || "Session expired", {
        navigateToLogin: true,
      })
    );
  }
});

export {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
  logout,
  updateAccountDetails,
  getCurrentAdmin,
  isAdminLoggedIn,
};
