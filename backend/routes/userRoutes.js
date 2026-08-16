const express = require("express");

const {
  createUser,
  getCurrentUser,
  updateWorkerProfile,
} = require("../controllers/userController");

const {
  createUserValidator,
  updateWorkerProfileValidator,
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

// Get authenticated user
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

module.exports = router;