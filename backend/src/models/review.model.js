import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      enum: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
      min: 0.5,
      max: 5,
    },
    comment: {
      type: String, // optional
    },
  },
  { timestamps: true }
);

export const reviewModel = model("review", reviewSchema);
