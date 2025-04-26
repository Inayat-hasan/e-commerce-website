import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { userModel } from "../models/user.model.js";

const verifyBuyerJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.buyerAccessToken;
    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await userModel
      .findOne({ _id: decodedToken?._id, role: "buyer" })
      .select("-refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    req.buyer = user;
    next();
  } catch (error) {
    console.log("JWT Verification Error: ", error);
    throw new ApiError(401, "Invalid token or unauthorized access", {
      err: error,
    });
  }
});

const verifyAdminJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.adminAccessToken;
    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await userModel
      .findOne({ _id: decodedToken?._id, role: "admin" })
      .select("-refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    req.admin = user;
    next();
  } catch (error) {
    console.log("JWT Verification Error: ", error);
    throw new ApiError(401, "Invalid token or unauthorized access", {
      err: error,
    });
  }
});

export { verifyBuyerJWT, verifyAdminJWT };
