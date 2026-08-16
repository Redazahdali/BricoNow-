const userService = require("../services/userService");

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

const updateWorkerProfile = async (req, res, next) => {
  try {
    const user = await userService.updateWorkerProfile(
      req.user._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Worker profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getCurrentUser,
  updateWorkerProfile,
};