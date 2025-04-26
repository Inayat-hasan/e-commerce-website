import { Router } from "express";
import {
  addReview,
  getAllReviews,
  getProductReviews,
  isUserEligibleToAddReview,
  updateReview,
} from "../controllers/review-controller.js";
import { verifyBuyerJWT } from "../middlewares/auth.middleware.js";

const reviewRouter = Router();

reviewRouter.post("/add-review", verifyBuyerJWT, addReview);

reviewRouter.get(
  "/get-product-reviews/:productId",
  verifyBuyerJWT,
  getProductReviews
);

reviewRouter.get("/get-all-reviews", verifyBuyerJWT, getAllReviews);

reviewRouter.put("/update-review/:reviewId", verifyBuyerJWT, updateReview);

reviewRouter.get(
  "/is-user-eligible/:productId",
  verifyBuyerJWT,
  isUserEligibleToAddReview
);

export default reviewRouter;
