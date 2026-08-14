const express = require("express");

const {
  requestOtp,
  verifyOtp,
} = require("../controllers/authController");

const {
  requestOtpValidator,
  verifyOtpValidator,
} = require("../validators/authValidator");

const validatorMiddleware = require(
  "../middlewares/validatorMiddleware"
);

const router = express.Router();

router.post(
  "/request-otp",
  requestOtpValidator,
  validatorMiddleware,
  requestOtp
);

router.post(
  "/verify-otp",
  verifyOtpValidator,
  validatorMiddleware,
  verifyOtp
);

module.exports = router;