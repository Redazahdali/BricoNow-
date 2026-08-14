const crypto = require("crypto");

const Otp = require("../models/otpModel");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

const OTP_EXPIRATION_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

const hashOtp = (code) => {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
};

const requestOtp = async (phone) => {
  const otpCode = crypto.randomInt(100000, 1000000).toString();

  const codeHash = hashOtp(otpCode);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000
  );

  // Supprime les anciens OTP de ce numéro
  await Otp.deleteMany({ phone });

  await Otp.create({
    phone,
    codeHash,
    expiresAt,
  });

  return {
    expiresAt,

    // DEV uniquement : plus tard le code sera envoyé par SMS
    developmentOtp:
      process.env.NODE_ENV === "development"
        ? otpCode
        : undefined,
  };
};

const verifyOtp = async (phone, code) => {
  const otp = await Otp.findOne({ phone }).sort({
    createdAt: -1,
  });

  if (!otp) {
    const error = new Error("OTP not found or expired");
    error.statusCode = 400;
    throw error;
  }

  if (otp.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: otp._id });

    const error = new Error("OTP expired");
    error.statusCode = 400;
    throw error;
  }

  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    const error = new Error("Maximum OTP attempts exceeded");
    error.statusCode = 429;
    throw error;
  }

  const submittedHash = hashOtp(code);

  if (submittedHash !== otp.codeHash) {
    otp.attempts += 1;
    await otp.save();

    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ phone });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.phoneVerified = true;
  await user.save();

  await Otp.deleteOne({ _id: otp._id });

  const token = generateToken(user._id);

  return {
    user,
    token,
  };
};

module.exports = {
  requestOtp,
  verifyOtp,
};