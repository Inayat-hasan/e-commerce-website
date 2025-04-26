import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { orderModel } from "../models/order.model.js";
import { cartModel } from "../models/cart.model.js";
import { productModel } from "../models/product.model.js";
import { userModel } from "../models/user.model.js";

import axios from "axios";
import crypto, { randomUUID } from "crypto";
import { agenda } from "../utils/agenda.js";

agenda.define("updateOrderStatus", async (job) => {
  const { orderId } = job.attrs.data;

  try {
    const result = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: { "orderDetails.orderStatus": "delivered" } },
      { new: true }
    );
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const { cart, selectedAddress } = req.body;
  const buyer = req.buyer._id;

  if (!buyer) {
    return res.status(404).json(new ApiError(404, "User not found", { buyer }));
  }

  if (!cart || !selectedAddress) {
    return res.status(400).json(
      new ApiError(400, "Cart and selected address are required", {
        cart,
        selectedAddress,
      })
    );
  }

  const url = process.env.CASHFREE_URL;
  const orderId = `order_${crypto.randomBytes(6).toString("hex")}`;

  try {
    const buyerDetails = await userModel.findById(buyer);

    if (!buyerDetails) {
      return res
        .status(404)
        .json(new ApiError(404, "User not found", { buyerDetails }));
    }

    const result = await axios.post(
      `${url}/orders`,
      {
        order_id: orderId,
        order_amount: cart.finalAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: String(buyerDetails._id),
          customer_phone: String(selectedAddress.phoneNumber).replace(
            /\s/g,
            ""
          ),
          customer_name: buyerDetails.fullName,
          customer_email: buyerDetails.email,
        },
        cart_details: {
          cart_id: String(randomUUID()),
          shipping_address: `${selectedAddress.address}, ${selectedAddress.locality}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pinCode}, India`,
          cart_items: [
            ...cart.products.map((prod) => ({
              product_id: String(prod.productId._id),
              quantity: prod.quantity,
              price: prod.productId.discountedPrice,
            })),
            {
              product_id: "Extras",
              quantity: 1,
              price: `${cart.platformFee + cart.deliveryCharges}`,
            },
          ],
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "2025-01-01",
        },
      }
    );

    if (result.status === 200) {
      const { order_id, payment_session_id } = result.data;

      const orderDocs = await Promise.all(
        cart.products.map(async (prod) => {
          return await orderModel.create({
            buyer,
            product: prod.productId._id,
            quantity: prod.quantity,
            productPrice: prod.productId.discountedPrice,
            totalDiscount: prod.priceOfDiscount,
            platformFee: cart.platformFee,
            deliveryCharges: cart.deliveryCharges,
            totalAmount: prod.totalPrice,
            address: selectedAddress,
            orderDetails: {
              orderId: order_id,
              orderStatus: "pending",
              orderCurrency: "INR",
            },
            paymentDetails: {
              paymentId: payment_session_id,
              paymentStatus: "pending",
            },
          });
        })
      );

      return res.status(200).json(
        new ApiResponse(200, "Order created", {
          orders: orderDocs,
          orderId: order_id,
          paymentSessionId: payment_session_id,
        })
      );
    } else {
      return res.status(400).json(new ApiError(400, "Order creation failed"));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

const verifyAndCompleteOrder = asyncHandler(async (req, res) => {
  try {
    const { orderId, orders, orderDays, buy, cart } = req.body;
    const buyer = req.buyer._id;

    if (orderId) {
      const response = await axios.get(
        `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-client-id": process.env.CASHFREE_CLIENT_ID,
            "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
            "x-api-version": "2025-01-01",
          },
        }
      );

      const { data } = response;
      const neededObject = data.find(
        (item) => item.payment_status === "SUCCESS"
      );

      if (!neededObject) {
        console.log("No successful payment found in response");
        return res
          .status(400)
          .json(new ApiError(400, "No successful payment found in response"));
      }

      const paymentMethod = neededObject.payment_method;

      await Promise.all(
        orders.map(async (order) => {
          const orderDoc = await orderModel.findById(order._id);
          switch (true) {
            case orderDays === 0:
              orderDoc.orderDetails.orderStatus = "delivered";
              orderDoc.deliveryTime = Date.now();
              break;
            case orderDays >= 1 && orderDays <= 3:
              orderDoc.orderDetails.orderStatus = "out_for_delivery";

              const deliveryTime = new Date(
                Date.now() + orderDays * 24 * 60 * 60 * 1000
              );

              orderDoc.deliveryTime = deliveryTime;

              await agenda.schedule(deliveryTime, "updateOrderStatus", {
                orderId: order._id,
              });
              break;
          }
          orderDoc.paymentDetails.paymentStatus = "paid";
          orderDoc.paymentDetails.paymentMethod = paymentMethod;
          await orderDoc.save();
        })
      );

      if (buy === "cartBuy") {
        const existingCart = await cartModel
          .findOne({ buyer })
          .populate("products.productId");
        cart.products.map(async (prod) => {
          const updatedProducts = existingCart.products.filter(
            (i) => i.productId._id.toString() !== prod.productId._id
          );

          const totalActualPrice = updatedProducts.reduce(
            (acc, i) => acc + i.actualPrice,
            0
          );
          const totalDiscount = updatedProducts.reduce(
            (acc, i) => acc + i.priceOfDiscount,
            0
          );
          const finalAmount = updatedProducts.reduce(
            (acc, i) => acc + i.totalPrice,
            0
          );
          existingCart.deliveryCharges = finalAmount > 999 ? 0 : 40;
          existingCart.platformFee = 20;
          existingCart.totalActualPrice = totalActualPrice;
          existingCart.totalDiscount = totalDiscount;
          existingCart.finalAmount = finalAmount;
          existingCart.productsCount = updatedProducts.length;
          existingCart.products = updatedProducts;
          await existingCart.save();
        });
      }

      return res.status(200).json(
        new ApiResponse(200, "Order verified and completed.", {
          response: data,
        })
      );
    } else {
      return res.status(400).json(new ApiError(400, "Order ID is required"));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, "Internal server error", error));
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const buyer = req.buyer._id;
  if (!buyer) {
    return res.status(404).json(new ApiError(404, "Buyer not found"));
  }
  try {
    const user = await userModel.findById(buyer);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }
    const orders = await orderModel.find({ buyer: buyer }).populate("product"); // orders will be an array.
    return res
      .status(200)
      .json(new ApiResponse(200, "Orders fetched", { orders }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", error));
  }
});

export { createOrder, verifyAndCompleteOrder, getOrders };
