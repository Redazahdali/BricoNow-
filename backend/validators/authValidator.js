const { body } = require("express-validator");

const requestOtpValidator = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
];

const verifyOtpValidator = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),

  body("code")
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("OTP must contain exactly 6 digits"),
];

module.exports = {
  requestOtpValidator,
  verifyOtpValidator,
};