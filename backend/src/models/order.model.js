import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    totalDiscount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
      default: 20,
    },
    deliveryCharges: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderDetails: {
      orderId: { type: String },
      orderStatus: {
        type: String,
        enum: [
          "pending",
          "confirmed",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ],
        default: "pending",
      },
      orderCurrency: {
        type: String,
        default: "INR",
      },
      _id: false,
    },
    address: {
      name: { type: String },
      phoneNumber: { type: String },
      pinCode: { type: Number },
      locality: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      landmark: { type: String }, // optional
      alternatePhone: { type: String }, // optional
      addressType: {
        type: String,
        enum: ["Home", "Office"],
      },
      _id: false,
    },
    paymentDetails: {
      paymentId: { type: String },
      paymentStatus: {
        type: String,
        default: "pending",
      },
      paymentMethod: {
        type: Object,
        _id: false,
      },
      _id: false,
    },
    paymentGateway: {
      gatewayName: {
        type: String,
        default: "cashfree",
      },
      gatewayOrderId: { type: String },
      gatewayPaymentId: { type: String },
    },
    deliveryTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const orderModel = model("order", orderSchema);
