import { Router } from "express";
import {
  addToWishList,
  clearWishList,
  getWishList,
  isProductInWishlist,
  removeFromWishList,
  wishListToCart,
} from "../controllers/wishList-controller.js";
import { verifyBuyerJWT } from "../middlewares/auth.middleware.js";

const wishListRouter = Router();

wishListRouter.post("/add-product", verifyBuyerJWT, addToWishList);

wishListRouter.post("/remove-product", verifyBuyerJWT, removeFromWishList);

wishListRouter.post("/remove-all-products", verifyBuyerJWT, clearWishList);

wishListRouter.post("/get-wishlist", verifyBuyerJWT, getWishList);

wishListRouter.post("/add-to-cart", verifyBuyerJWT, wishListToCart);

wishListRouter.post(
  "/is-product-in-wishlist",
  verifyBuyerJWT,
  isProductInWishlist
);

export default wishListRouter;
