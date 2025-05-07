import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { userModel } from "../models/user.model.js";
import { generateAndSendOtp } from "../utils/generateAndSendOtp.js";
import { buyerModel } from "../models/buyer.model.js";
import generateAccessAndRefreshToken from "./user-controller.js";
import { otpModel } from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import { sendForgotPassLink } from "../utils/sendEmail.js";
import { cartModel } from "../models/cart.model.js";
import { wishListModel } from "../models/wishList.model.js";
import { agenda } from "../utils/agenda.js";

agenda.define("deleteUnverifiedUsers", async (job) => {
  const { userId } = job.attrs.data;
  try {
    const user = await userModel.findOne({
      _id: userId,
      role: "buyer",
      isVerified: false,
    });
    if (!user) {
      console.log("User not found");
      return;
    }
    await Promise.all([
      userModel.findByIdAndDelete(userId),
      cartModel.deleteMany({ buyer: userId }),
      wishListModel.deleteMany({ buyer: userId }),
      buyerModel.deleteMany({ user: userId }),
      otpModel.deleteMany({ user: userId }),
    ]);
  } catch (error) {
    console.error("Error deleting user:", error);
  }
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
      role: "buyer",
      isVerified: true,
    });
    if (userExists) {
      return res.status(200).json(
        new ApiResponse(200, "You are already registered! please login", {
          userAlreadyExists,
        })
      );
    } else {
      const user = await userModel.create({
        fullName,
        email,
        phoneNumber,
        password,
        role: "buyer",
        isVerified: false,
      });

      await cartModel.create({
        buyer: user._id,
        products: [],
      });

      await wishListModel.create({
        buyer: user._id,
        products: [],
      });

      await buyerModel.create({
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
    console.log(error);
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
    role: "buyer",
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
    .cookie("buyerAccessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000,
    })
    .cookie("buyerRefreshToken", refreshToken, {
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

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({
      email,
      role: "buyer",
      isVerified: false,
    });
    const otpSent = await generateAndSendOtp(user);
    if (!otpSent) {
      return res
        .status(200)
        .json(new ApiResponse(200, "Something went wrong", { otpSent: false }));
    } else {
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Otp sent successfully!", { otpSent: true })
        );
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong", { error }));
  }
});

const checkOtpStatus = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await userModel.findOne({
      email,
      role: "buyer",
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
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong", { error }));
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json(new ApiError(400, "Email and password are required!"));
  }

  try {
    const user = await userModel.findOne({ email, role: "buyer" });
    if (!user) {
      return res.status(200).json(
        new ApiResponse(200, "User not found! Please register first!", {
          userNotFound: true,
        })
      );
    }

    const isPassValid = await user.isPasswordCorrect(password);
    if (!isPassValid) {
      return res.status(200).json(
        new ApiResponse(200, "Password is wrong!", {
          isPassValid: false,
        })
      );
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("buyerAccessToken", accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 60 * 60 * 1000,
      })
      .cookie("buyerRefreshToken", refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(200, "User logged in successfully!", {
          user,
        })
      );
  } catch (error) {
    return res
      .status(402)
      .json(new ApiError(402, "Error while logging in", { error }));
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    const user = await userModel
      .findByIdAndUpdate(
        req.buyer?._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
      )
      .select("-password -refreshToken");

    if (!user) {
      return res.status(400).json(new ApiError(400, "user is not logged in !"));
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("buyerAccessToken", options)
      .clearCookie("buyerRefreshToken", options)
      .json(new ApiResponse(200, "User logout successfully!", { user }));
  } catch (error) {
    console.log("error : ", error);
    return res
      .status(402)
      .json(new ApiError(402, "Error while logging out", { error }));
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json(new ApiError(400, "Email is required!"));
  }
  const userExist = await userModel.findOne({ email, role: "buyer" });
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

  const link = `http://localhost:3000/api/buyer/reset-password/${userExist._id}/${token}`;

  await sendForgotPassLink(userExist.email, link);
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
  const user = await userModel.findOne({ _id: id, role: "buyer" });
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

const getCurrentBuyer = asyncHandler(async (req, res) => {
  const buyerId = req.buyer._id;
  if (!buyerId) {
    return res.status(400).json(
      new ApiError(400, "User not found! Please login!", {
        navigateToLogin: true,
      })
    );
  } else {
    const user = await userModel
      .findById(buyerId)
      .select("-password -refreshToken");
    if (!user) {
      return res.status(400).json(
        new ApiError(400, "User not found! Please register!", {
          navigateToRegister: true,
        })
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, "current user fetched successfully", { user })
      );
  }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  try {
    const { fullName, phoneNumber, email } = req.body;

    if (!fullName || !phoneNumber || !email) {
      throw new ApiError(400, "All fields are required");
    }

    const user = await userModel
      .findByIdAndUpdate(
        req.buyer?._id,
        {
          $set: {
            fullName,
            phoneNumber,
            email,
          },
        },
        { new: true }
      )
      .select("-password -refreshToken");

    if (!user) {
      return res
        .status(500)
        .json(new ApiError(500, "Err updating account details!"));
    } else {
      return res
        .status(200)
        .json(new ApiResponse(200, "Account details updated!", { user }));
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, "error", { error }));
  }
});

const changePassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json(new ApiError(400, "All fields are required to be filled!"));
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json(new ApiError(400, "Password and confirm password do not match!"));
    }
    const user = await userModel.findById(req.buyer?._id);
    const isPassValid = await user.isPasswordCorrect(oldPassword);
    if (!isPassValid) {
      return res
        .status(400)
        .json(new ApiError(400, "Old password is incorrect!"));
    } else {
      user.password = newPassword;
      await user.save();
      return res.status(200).json(
        new ApiResponse(200, "Password changed successfully!", {
          passChanged: true,
        })
      );
    }
  } catch (error) {
    console.log("error : ", error);
    return res
      .status(402)
      .json(new ApiError(402, "Error while changing password", { error }));
  }
});

const refreshAccessToken = async (refreshToken) => {
  try {
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await userModel.findOne({
      _id: decodedToken?._id,
      role: decodedToken?.role,
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

const checkBuyer = asyncHandler(async (req, res) => {
  const accessToken = req.cookies.buyerAccessToken;

  if (!accessToken) {
    const refreshToken = req.cookies.buyerRefreshToken;
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
      .cookie("buyerAccessToken", newAccessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 60 * 60 * 1000,
      })
      .cookie("buyerRefreshToken", newRefreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(200, "Tokens refreshed", {
          user: result.data.user,
          isLoggedIn: true,
        })
      );
  }

  try {
    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = await userModel.findOne(
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

    if (!user) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Invalid access token", { isLoggedIn: false })
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "User found", { user, isLoggedIn: true }));
  } catch (error) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Invalid access token", { isLoggedIn: false })
      );
  }
});

const getAddresses = asyncHandler(async (req, res) => {
  const buyerId = req.buyer._id;
  const addresses = await buyerModel.findOne({ user: buyerId });
  return res
    .status(200)
    .json(new ApiResponse(200, "Addresses fetched", { addresses }));
});

const addAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;
  const buyerId = req.buyer._id;
  const buyerDoc = await buyerModel.findOne({ user: buyerId });

  // Add the new address
  buyerDoc.addresses.push(address);

  // Set the new address as selected
  const newAddress = buyerDoc.addresses[buyerDoc.addresses.length - 1];
  buyerDoc.selectedAddress = newAddress;

  await buyerDoc.save();
  return res.status(200).json(
    new ApiResponse(200, "Address added", {
      addedAddress: newAddress,
      selectedAddress: buyerDoc.selectedAddress,
    })
  );
});

const updateAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;
  if (!address) {
    console.log("address is not present!");
    return res.status(400).json(new ApiError(400, "Address is required!"));
  }
  const buyerId = req.buyer._id;
  const buyerDoc = await buyerModel.findOne({ user: buyerId });

  const addressIndex = buyerDoc.addresses.findIndex(
    (addr) => addr._id.toString() === address._id
  );

  if (addressIndex === -1) {
    return res.status(400).json(new ApiError(400, "Address not found"));
  }

  // Update the address
  buyerDoc.addresses[addressIndex] = address;

  // Set this address as selected
  buyerDoc.selectedAddress = address;

  await buyerDoc.save();
  return res.status(200).json(
    new ApiResponse(200, "Address updated", {
      updatedAddress: buyerDoc.addresses[addressIndex],
      selectedAddress: buyerDoc.selectedAddress,
    })
  );
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.body;
  if (!addressId) {
    return res.status(400).json(new ApiError(400, "Address ID is required!"));
  }
  const buyerId = req.buyer._id;
  const buyerDoc = await buyerModel.findOne({ user: buyerId });
  const addressIndex = buyerDoc.addresses.findIndex(
    (address) => address._id.toString() === addressId
  );
  if (addressIndex === -1) {
    return res.status(400).json(new ApiError(400, "Address not found"));
  } else {
    // Check if we're deleting the selected address
    const isSelectedAddress =
      buyerDoc.selectedAddress?._id.toString() === addressId;

    // Remove the address
    buyerDoc.addresses.splice(addressIndex, 1);

    // If we deleted the selected address, set selectedAddress to the first remaining address if it exists
    if (isSelectedAddress) {
      buyerDoc.selectedAddress =
        buyerDoc.addresses.length > 0 ? buyerDoc.addresses[0] : null;
    }

    await buyerDoc.save();
    return res.status(200).json(
      new ApiResponse(200, "Address deleted", {
        isAddressDeleted: true,
        selectedAddress: buyerDoc.selectedAddress,
      })
    );
  }
});

const selectAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.body;
  const buyerId = req.buyer._id;
  const buyerDoc = await buyerModel.findOne({ user: buyerId });

  const address = buyerDoc.addresses.find(
    (addr) => addr._id.toString() === addressId
  );

  if (!address) {
    return res.status(400).json(new ApiError(400, "Address not found"));
  }

  buyerDoc.selectedAddress = address;
  await buyerDoc.save();

  return res.status(200).json(
    new ApiResponse(200, "Address selected", {
      addressSelected: buyerDoc.selectedAddress,
    })
  );
});

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(new ApiError(400, "Email is required!"));
  }

  // For profile update, we need to check if the user is authenticated
  // This is handled by the verifyBuyerJWT middleware
  // We should check if the email is already in use by another user
  const existingUser = await userModel.findOne({ email, role: "buyer" });

  if (
    existingUser &&
    existingUser._id.toString() !== req.buyer._id.toString()
  ) {
    return res.status(200).json(
      new ApiResponse(200, "Email already in use", {
        emailAlreadyExist: true,
      })
    );
  }

  // Get the current user from the request (set by middleware)
  const user = await userModel.findById(req.buyer._id);
  if (!user) {
    return res.status(400).json(new ApiError(400, "User not found"));
  }

  // Generate and send OTP to the new email
  const { newOtp } = await generateAndSendOtp({
    ...user.toObject(),
    email: email, // Use the new email for OTP
  });

  if (!newOtp) {
    return res.status(400).json(new ApiError(400, "Something went wrong!"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Otp sent successfully!", { otpSent: true }));
});

const verifyOtpForEmailChange = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json(new ApiError(400, "Email and otp are required!"));
  }

  // Get the current user from the request (set by middleware)
  const currentUser = await userModel.findById(req.buyer._id);
  if (!currentUser) {
    return res.status(400).json(new ApiError(400, "User not found"));
  }

  // Find the OTP document for the current user
  const otpDoc = await otpModel.findOne({ user: currentUser._id });

  if (!otpDoc) {
    return res
      .status(400)
      .json(new ApiError(400, "OTP not found. Please request a new OTP."));
  }

  const isOtpExpired = otpDoc.isOtpExpired();

  if (isOtpExpired) {
    await otpDoc.deleteOne();
    return res.status(200).json(
      new ApiResponse(200, "OTP expired. Please request a new OTP.", {
        otpExpired: true,
      })
    );
  }

  const isOtpCorrect = await otpDoc.isOtpCorrect(otp);

  if (!isOtpCorrect) {
    return res
      .status(400)
      .json(new ApiError(400, "Invalid OTP. Please try again."));
  }

  // OTP is valid, clean up the OTP document
  await otpModel.deleteMany({ user: currentUser._id });

  return res.status(200).json(
    new ApiResponse(200, "Email verified successfully!", {
      otpVerified: true,
    })
  );
});

export {
  register,
  login,
  logout,
  refreshAccessToken,
  changePassword,
  getCurrentBuyer,
  updateAccountDetails,
  checkBuyer,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  selectAddress,
  verifyOtp,
  resendOtp,
  checkOtpStatus,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtpForEmailChange,
};
