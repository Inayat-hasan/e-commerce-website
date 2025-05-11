import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import buyerRouter from "./routes/buyer.route.js";
import adminRouter from "./routes/admin.route.js";
import productRouter from "./routes/product.route.js";
import orderRouter from "./routes/order.route.js";
import reviewRouter from "./routes/review.route.js";
import cartRouter from "./routes/cart.route.js";
import wishlistRouter from "./routes/wishlist.route.js";
dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    // "https://lushkart.onrender.com",
    // "https://lushkart-admin.onrender.com",
    // "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/api/buyer", buyerRouter);

app.use("/api/admin", adminRouter);

app.use("/api/product", productRouter);

app.use("/api/order", orderRouter);

app.use("/api/review", reviewRouter);

app.use("/api/cart", cartRouter);

app.use("/api/wishlist", wishlistRouter);

app.use("/", (req, res) => {
  res.send("Heyy, I am Inayat Hasan");
});

export default app;
