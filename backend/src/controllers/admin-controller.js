import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { adminModel } from "../models/admin.model.js";
import { generateAndSendOtp } from "../utils/generateAndSendOtp.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import generateAccessAndRefreshToken from "./user-controller.js";
import { sendForgotPassLink } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import { buyerModel } from "../models/buyer.model.js";
import { productModel } from "../models/product.model.js";
import { orderModel } from "../models/order.model.js";
import { agenda } from "../utils/agenda.js";
import { otpModel } from "../models/otp.model.js";

agenda.define("deleteUnverifiedUsers", async (job) => {
  const { userId } = job.attrs.data;
  try {
    const user = await userModel.findOne({
      _id: userId,
      role: "admin",
      isVerified: false,
    });
    if (!user) {
      return;
    }
    await Promise.all([
      userModel.findByIdAndDelete(userId),
      adminModel.deleteMany({ user: userId }),
      otpModel.deleteMany({ user: userId }),
    ]);
  } catch (error) {}
});

const register = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json(new ApiError(400, "All fields are required!"));
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json(new ApiError(400, "Invalid email format!"));
    }
    const userExists = await userModel.findOne({
      email,
      role: "admin",
      isVerified: true,
    });
    if (userExists) {
      return res.status(200).json(
        new ApiResponse(200, "You are already registered! please login", {
          userAlreadyExists: true,
        })
      );
    } else {
      const user = await userModel.create({
        fullName,
        email,
        phoneNumber,
        password,
        role: "admin",
        isVerified: false,
      });

      await adminModel.create({
        user: user._id,
      });

      await generateAndSendOtp(user);

      const time = new Date(Date.now() + 30 * 60 * 1000);

      await agenda.schedule(time, "deleteUnverifiedUsers", {
        userId: user._id,
      });

      return res.status(200).json(
        new ApiResponse(200, "user Registered!", {
          user,
        })
      );
    }
  } catch (error) {
    console.log("error : ", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error in registering user!", { error }));
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json(new ApiError(400, "OTP is required!"));
  }

  const user = await userModel.findOne({
    email,
    role: "admin",
    isVerified: false,
  });
  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Something went wrong!", { userNotFound: true })
      );
  }

  const otpUser = await otpModel.findOne({ user: user._id });
  if (!otpUser) {
    return res
      .status(200)
      .json(new ApiResponse(200, "OTP not found", { otpNotFound: true }));
  }

  if (otpUser.isOtpExpired()) {
    await otpUser.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, "OTP Expired!", { otpExpired: true }));
  }

  if (otpUser.otpAttempts >= 10) {
    await otpUser.deleteOne();
    return res.status(200).json(
      new ApiResponse(200, "Maximum OTP attempts exceeded!", {
        maxOtpAttempts: true,
      })
    );
  }

  const isOtpValid = await otpUser.isOtpCorrect(otp);
  if (!isOtpValid) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Please enter a valid OTP!", { isOtpValid: false })
      );
  }

  user.isVerified = true;
  await user.save();

  await agenda.cancel({
    name: "deleteUnverifiedUsers",
    "data.userId": user._id,
  });

  await otpModel.deleteMany({ user: user._id });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  return res
    .status(200)
    .cookie("adminAccessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000,
    })
    .cookie("adminRefreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(200, "OTP verified successfully!", {
        user,
      })
    );
});

const checkOtpStatus = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await userModel.findOne({
      email,
      role: "admin",
      isVerified: false,
    });

    if (!user) {
      return res.status(200).json(
        new ApiResponse(200, "User not found", {
          isOtpActive: false,
          remainingTime: 0,
        })
      );
    }

    // Find OTP for this user
    const otpRecord = await otpModel.findOne({ user: user._id });

    if (!otpRecord) {
      return res.status(200).json(
        new ApiResponse(200, "No OTP found", {
          isOtpActive: false,
          remainingTime: 0,
        })
      );
    }

    // Check if OTP is expired
    if (otpRecord.isOtpExpired()) {
      return res.status(200).json(
        new ApiResponse(200, "OTP has expired", {
          isOtpActive: false,
          remainingTime: 0,
        })
      );
    }

    // Calculate remaining time in seconds
    const currentTime = Date.now();
    const expiryTime = otpRecord.otpExpiration;
    const remainingTime = Math.max(
      0,
      Math.floor((expiryTime - currentTime) / 1000)
    );

    return res.status(200).json(
      new ApiResponse(200, "OTP is active", {
        isOtpActive: true,
        remainingTime,
      })
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong", { error }));
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(200)
      .json(new ApiError(200, "Email and password are required!", {}));
  }

  const user = await userModel.findOne({ email, role: "admin" });
  if (!user) {
    return res.status(200).json(
      new ApiError(200, "User not found! Please register first!", {
        userNotFound: true,
      })
    );
  }

  const isPassValid = await user.isPasswordCorrect(password);
  if (!isPassValid) {
    return res.status(200).json(
      new ApiError(200, "Password is wrong!", {
        isPassValid: false,
      })
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  return res
    .status(200)
    .cookie("adminAccessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    })
    .cookie("adminRefreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(200, "User logged in successfully!", {
        user,
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

    return res
      .status(200)
      .clearCookie("adminAccessToken")
      .clearCookie("adminRefreshToken")
      .json(new ApiResponse(200, "Admin logout successfully!", { user }));
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

const refreshAccessToken = async (refreshToken) => {
  try {
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await userModel.findOne({
      _id: decodedToken?._id,
      role: "admin",
    });
    if (!user) {
      return { success: false, message: "Invalid refresh token" };
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    return {
      success: true,
      data: { accessToken, user, refreshToken: newRefreshToken },
    };
  } catch (error) {
    return { success: false, message: "Invalid refresh token" };
  }
};

const checkAdmin = asyncHandler(async (req, res) => {
  const accessToken = req.cookies.adminAccessToken;

  if (!accessToken) {
    const refreshToken = req.cookies.adminRefreshToken;
    if (!refreshToken) {
      return res
        .status(200)
        .json(new ApiResponse(200, "Please login!", { isLoggedIn: false }));
    }

    const result = await refreshAccessToken(refreshToken);
    if (!result.success) {
      return res
        .status(200)
        .json(new ApiResponse(200, result.message, { isLoggedIn: false }));
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      result.data;

    return res
      .status(200)
      .cookie("adminAccessToken", newAccessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 60 * 60 * 1000,
      })
      .cookie("adminRefreshToken", newRefreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(200, "Tokens refreshed", {
          admin: result.data.user,
          isLoggedIn: true,
        })
      );
  }

  try {
    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const admin = await userModel.findOne(
      {
        _id: decodedToken?._id,
        role: decodedToken?.role,
      },
      {
        _id: 1,
        fullName: 1,
        phoneNumber: 1,
        email: 1,
        role: 1,
      }
    );

    if (!admin) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Invalid access token", { isLoggedIn: false })
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "User found", { admin, isLoggedIn: true }));
  } catch (error) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Invalid access token", { isLoggedIn: false })
      );
  }
});

const dashboardDetails = asyncHandler(async (req, res) => {
  try {
    const totalUsers = await buyerModel.countDocuments();
    const totalProducts = await productModel.countDocuments();
    const totalOrders = await orderModel.countDocuments();
    const totalRevenue = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);
    const totalRevenueAmount = totalRevenue[0]?.totalRevenue || 0;
    return res.status(200).json(
      new ApiResponse(200, "Dashboard details fetched successfully!", {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenueAmount,
      })
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiError(500, "Error fetching dashboard details", { error }));
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
  checkAdmin,
  dashboardDetails,
  checkOtpStatus,
};
