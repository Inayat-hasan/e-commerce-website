import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const otpSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    emailOtp: {
      type: String,
      required: true,
      trim: true,
    },
    otpExpiration: {
      type: Date,
      required: true,
      index: { expires: "1m" },
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.pre("save", async function (next) {
  if (!this.isModified("emailOtp")) return next();

  if (this.emailOtp.startsWith("$2b$")) return next();

  this.emailOtp = await bcrypt.hash(this.emailOtp, 10);
  next();
});

otpSchema.methods.isOtpCorrect = async function (inputOtp) {
  const MAX_ATTEMPTS = 10;

  if (this.otpAttempts >= MAX_ATTEMPTS) {
    throw new Error("Maximum OTP attempts exceeded");
  }

  const isMatch = await bcrypt.compare(inputOtp, this.emailOtp);

  if (!isMatch) {
    this.otpAttempts += 1;
    await this.save();
  }

  return isMatch;
};

otpSchema.methods.isOtpExpired = function () {
  return this.otpExpiration < Date.now();
};

export const otpModel = model("OTP", otpSchema);
