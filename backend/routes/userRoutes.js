const express = require("express");

const {
  createUser,
  getCurrentUser,
  updateWorkerProfile,
  updateEmployerProfile,
} = require("../controllers/userController");

const {
  createUserValidator,
  updateWorkerProfileValidator,
  updateEmployerProfileValidator,
} = require("../validators/userValidator");

const validatorMiddleware = require("../middlewares/validatorMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizationMiddleware = require(
  "../middlewares/authorizationMiddleware"
);

const router = express.Router();

// Create user
router.post(
  "/",
  createUserValidator,
  validatorMiddleware,
  createUser
);

// Get current authenticated user
router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

// Update worker profile
router.patch(
  "/me/worker-profile",
  authMiddleware,
  authorizationMiddleware("WORKER"),
  updateWorkerProfileValidator,
  validatorMiddleware,
  updateWorkerProfile
);

// Update employer profile
router.patch(
  "/me/employer-profile",
  authMiddleware,
  authorizationMiddleware("EMPLOYER"),
  updateEmployerProfileValidator,
  validatorMiddleware,
  updateEmployerProfile
);

module.exports = router;