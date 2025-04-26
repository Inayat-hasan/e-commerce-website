import { stat } from "fs";
import { Schema, model } from "mongoose";
import { promiseHooks } from "v8";

const buyerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    addresses: [
      {
        name: { type: String },
        phoneNumber: { type: String }, // in this format : "+91 XXXXXXXXXX"
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
      },
    ],
    selectedAddress: {
      type: Schema.Types.Mixed, // This allows us to store the full address object
    },
  },
  { timestamps: true }
);

export const buyerModel = model("buyer", buyerSchema);
