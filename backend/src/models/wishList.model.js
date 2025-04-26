import { Schema, model } from "mongoose";

const wishListSchema = new Schema(
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
      },
    ],
  },
  { timestamps: true }
);

export const wishListModel = model("WishList", wishListSchema);
