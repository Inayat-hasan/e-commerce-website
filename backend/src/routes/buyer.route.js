import { Router } from "express";
import { verifyBuyerJWT } from "../middlewares/auth.middleware.js";
import {
  register,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
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
} from "../controllers/buyer-controller.js";

const buyerRouter = Router();

buyerRouter.route("/register").post(register);

buyerRouter.route("/login").post(login);

buyerRouter.route("/logout").post(verifyBuyerJWT, logout);

buyerRouter.route("/resend-otp").post(resendOtp);

buyerRouter.route("/update-buyer").post(verifyBuyerJWT, updateAccountDetails);

buyerRouter.route("/current-user").get(verifyBuyerJWT, getCurrentBuyer);

buyerRouter.route("/verify-otp").post(verifyOtp);

buyerRouter.route("/forgot-password").post(forgotPassword);

buyerRouter.route("/reset-password/:id/:token").post(resetPassword);

buyerRouter.route("/change-password").post(verifyBuyerJWT, changePassword);

buyerRouter.route("/check-buyer").get(checkBuyer);

buyerRouter.route("/get-addresses").get(verifyBuyerJWT, getAddresses);

buyerRouter.route("/address/add-address").post(verifyBuyerJWT, addAddress);

buyerRouter.route("/address/edit-address").post(verifyBuyerJWT, updateAddress);

buyerRouter
  .route("/address/delete-address")
  .delete(verifyBuyerJWT, deleteAddress);

buyerRouter
  .route("/address/select-address")
  .post(verifyBuyerJWT, selectAddress);

export default buyerRouter;
