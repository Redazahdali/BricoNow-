const User = require("../models/userModel");

const createUser = async (userData) => {
  const existingUser = await User.findOne({
    $or: [
      userData.phone ? { phone: userData.phone } : null,
      userData.email ? { email: userData.email } : null,
    ].filter(Boolean),
  });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  if (userData.role === "WORKER") {
    userData.employerProfile = undefined;
  }

  if (userData.role === "EMPLOYER") {
    userData.workerProfile = undefined;
  }

  return User.create(userData);
};

module.exports = {
  createUser,
};