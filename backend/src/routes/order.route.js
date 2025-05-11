import { Router } from "express";
import {
  createOrder,
  verifyAndCompleteOrder,
  getOrders,
  getOrdersForAdmin
} from "../controllers/order-controller.js";
import { verifyAdminJWT, verifyBuyerJWT } from "../middlewares/auth.middleware.js";

const orderRouter = Router();

orderRouter.post("/create-order", verifyBuyerJWT, createOrder);

orderRouter.post("/verify-order", verifyBuyerJWT, verifyAndCompleteOrder);

orderRouter.get("/get-orders", verifyBuyerJWT, getOrders);

orderRouter.get("/admin/get-orders", verifyAdminJWT, getOrdersForAdmin);

export default orderRouter;
