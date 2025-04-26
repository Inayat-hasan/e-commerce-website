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
} from "../controllers/cart-controller.js";
import { verifyBuyerJWT } from "../middlewares/auth.middleware.js";

const cartRouter = Router();

// Route without auth middleware
cartRouter.route("/get-cart-count").get(getCartCount);

// Apply verifyBuyerJWT middleware to all other routes
cartRouter.use(verifyBuyerJWT);

cartRouter.route("/add-product").post(addToCart);
cartRouter.route("/get-cart").get(getCart);
cartRouter.route("/update-quantity/:productId").post(updateQuantity);
cartRouter.route("/remove-product").post(removeFromCart);
cartRouter.route("/clear-cart").delete(clearCart);
cartRouter.route("/move-to-wishlist").post(addProductFromCartToWishList);
cartRouter.route("/is-product-in-cart").post(verifyBuyerJWT, isProductInCart);

export default cartRouter;
