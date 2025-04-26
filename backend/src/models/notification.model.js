import { Schema, model } from "mongoose";

const notificationSchema = Schema(
  {
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const notificationModel = model("notification", notificationSchema);
