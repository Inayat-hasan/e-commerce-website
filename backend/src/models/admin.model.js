import { Schema, model } from "mongoose";

const adminSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export const adminModel = model("admin", adminSchema);
