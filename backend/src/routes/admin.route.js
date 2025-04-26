import { Router } from "express";
import {
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
} from "../controllers/admin-controller.js";
import { verifyAdminJWT } from "../middlewares/auth.middleware.js";

const adminRouter = Router();

adminRouter.route("/reset-password/:id/:token").post(resetPassword);

adminRouter.route("/register").post(register);

adminRouter.route("/forgot-password").post(forgotPassword);

adminRouter.route("/login").post(login);

adminRouter.route("/verify-otp").post(verifyOtp);

adminRouter.route("/resend-otp").post(resendOtp);

adminRouter.route("/updateUser").post(verifyAdminJWT, updateAccountDetails);

adminRouter.route("/logout").post(verifyAdminJWT, logout);

adminRouter.route("/check-admin").get(isAdminLoggedIn);

adminRouter.route("/current-user").get(verifyAdminJWT, getCurrentAdmin);

// adminRouter.route("/clear").post((req, res) => {
//   res
//     .status(200)
//     .clearCookie("adminAccessToken")
//     // .clearCookie("adminRefreshToken")
//     .json({ message: "Cookies cleared" });
// });

export default adminRouter;
