const authService = require("../services/authService");

const requestOtp = async (req, res, next) => {
  try {
    const result = await authService.requestOtp(
      req.body.phone
    );

    res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const result = await authService.verifyOtp(
      req.body.phone,
      req.body.code
    );

    res.status(200).json({
      success: true,
      message: "Phone verified successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
};