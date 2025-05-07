import { Router } from "express";
import {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  addProductFromCartToWishList,
  isProductInCart,
  getCartCount,
  moveAllToWishlist,
  moveSelectedToWishlist,
} from "../controllers/cart-controller.js";
import { verifyBuyerJWT } from "../middlewares/auth.middleware.js";

const cartRouter = Router();

cartRouter.route("/get-cart-count").get(getCartCount);

cartRouter.route("/add-product").post(verifyBuyerJWT, addToCart);
cartRouter.route("/get-cart").get(verifyBuyerJWT, getCart);
cartRouter
  .route("/update-quantity/:productId")
  .post(verifyBuyerJWT, updateQuantity);
cartRouter.route("/remove-product").post(verifyBuyerJWT, removeFromCart);
cartRouter.route("/clear-cart").delete(verifyBuyerJWT, clearCart);
cartRouter
  .route("/move-to-wishlist")
  .post(verifyBuyerJWT, addProductFromCartToWishList);
cartRouter
  .route("/move-all-to-wishlist")
  .post(verifyBuyerJWT, moveAllToWishlist);
cartRouter
  .route("/move-selected-to-wishlist")
  .post(verifyBuyerJWT, moveSelectedToWishlist);
cartRouter.route("/is-product-in-cart").post(verifyBuyerJWT, isProductInCart);

export default cartRouter;
