const express = require("express");

const {
  createUser,
  getCurrentUser,
} = require("../controllers/userController");

const {
  createUserValidator,
} = require("../validators/userValidator");

const validatorMiddleware = require("../middlewares/validatorMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/",
  createUserValidator,
  validatorMiddleware,
  createUser
);

router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

module.exports = router;