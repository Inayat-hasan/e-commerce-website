import { otpModel } from "../models/otp.model.js";
import { sendEmail } from "./sendEmail.js";
import otpGenerator from "otp-generator";

const generateAndSendOtp = async (user) => {
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });

  const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);

  await otpModel.deleteMany({ user: user._id });

  const newOtp = await otpModel.create({
    user: user._id,
    emailOtp: otp,
    otpExpiration,
  });

  await sendEmail(user.email, otp);

  return { newOtp };
};

export { generateAndSendOtp };
