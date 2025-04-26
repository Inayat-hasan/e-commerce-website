import { Schema, model } from "mongoose";

const cartSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        totalPrice: Number, // particular products discounted price * quantity
        priceOfDiscount: Number, // particular product actual price - discounted price * quantity
        actualPrice: Number, // particular product actual price * quantity
      },
    ],
    totalActualPrice: {
      type: Number,
      default: 0,
    }, // sum of all the actual prices of the items
    totalDiscount: {
      type: Number,
      default: 0,
    }, // sum of all the discount prices of the items
    finalAmount: {
      type: Number,
      default: 0,
    }, // sum of all the total prices of the items
    productsCount: {
      type: Number,
      default: 0,
    }, // number of items in the cart
    deliveryCharges: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const cartModel = model("cart", cartSchema);
