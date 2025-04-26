import { Router } from "express";
import {
  createOrder,
  verifyAndCompleteOrder,
  getOrders,
} from "../controllers/order-controller.js";
import { verifyBuyerJWT } from "../middlewares/auth.middleware.js";

const orderRouter = Router();

orderRouter.post("/create-order", verifyBuyerJWT, createOrder);

orderRouter.post("/verify-order", verifyBuyerJWT, verifyAndCompleteOrder);

orderRouter.get("/get-orders", verifyBuyerJWT, getOrders);

export default orderRouter;
