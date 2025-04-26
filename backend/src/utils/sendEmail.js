import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 587,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendEmail = async (email, otpCode) => {
  const mailOptions = {
    from: `"LUSHCART OTP"<${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Verification OTP from LUSHCART",
    text: `Your OTP code is ${otpCode}. This will be valid for 5 minutes.`,
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};

const sendForgotPassLink = async (email, link) => {
  const mainOptions = {
    from: `"Lushkart"<${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Reset Password Link",
    text: `Please click on below link to reset your LUSHCART account password \n ${link} \n Only valid for 10 minutes!`,
  };
  const info = await transporter.sendMail(mainOptions);
  return info;
};

export { sendEmail, sendForgotPassLink };
