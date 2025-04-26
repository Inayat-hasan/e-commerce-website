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
    const userExists = await userModel.findOne({ email, role: "buyer" });
    if (userExists) {
      return res.status(400).json(
        new ApiError(400, "You are already registered! please login", {
          navigateToLogin: true,
          user: userExists,
        })
      );
    } else {
      const user = await userModel.create({
        fullName,
        email,
        phoneNumber,
        password,
        role: "buyer",
      });
      const cart = await cartModel.create({
        buyer: user._id,
        products: [],
      });
      const wishlist = await wishListModel.create({
        buyer: user._id,
        products: [],
      });
      const buyer = await buyerModel.create({
        user: user._id,
      });
      const otp = await generateAndSendOtp(user);
      return res.status(200).json(
        new ApiResponse(200, "user Registered!", {
          user,
          cart,
          wishlist,
          buyer,
          otp,
        })
      );
    }
  } catch (error) {
    console.log("err : ", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error in registering user!", { error }));
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json(new ApiError(400, "Email and password are required!"));
  }

  const user = await userModel.findOne({ email, role: "buyer" });
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
    .cookie("buyerAccessToken", accessToken)
    .cookie("buyerRefreshToken", refreshToken)
    .json(
      new ApiResponse(200, "User logged in successfully!", {
        user,
        accessToken,
        refreshToken,
      })
    );
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

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json(new ApiError(400, "Otp is required!"));
  }
  const user = await userModel.findOne({ email, role: "buyer" });
  const otpUser = await otpModel.findOne({ user: user._id });

  if (otpUser.isOtpExpired()) {
    return res.status(400).json(new ApiError(400, "OTP Expired!"));
  }

  const isOtpValid = await otpUser.isOtpCorrect(otp);
  if (!isOtpValid) {
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
    .cookie("buyerAccessToken", accessToken, options)
    .cookie("buyerRefreshToken", refreshToken, options)
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
  const user = await userModel.findOne({ email, role: "buyer" });
  const otpSent = await generateAndSendOtp(user);
  if (!otpSent) {
    return res.status(500).json(new ApiError(500, "Something went wrong"));
  } else {
    return res.status(200).json(new ApiResponse(200, "Otp sent successfully!"));
  }
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
    const { fullName, phoneNumber } = req.body;

    if (!fullName || !phoneNumber) {
      throw new ApiError(400, "All fields are required");
    }

    const user = await userModel
      .findByIdAndUpdate(
        req.buyer?._id,
        {
          $set: {
            fullName,
            phoneNumber,
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
      return res
        .status(200)
        .json(new ApiResponse(200, "Password changed successfully!"));
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
      .cookie("buyerAccessToken", newAccessToken)
      .cookie("buyerRefreshToken", newRefreshToken)
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

export {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
  logout,
  getCurrentBuyer,
  updateAccountDetails,
  changePassword,
  checkBuyer,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  selectAddress,
};
