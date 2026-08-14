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
const authorizationMiddleware = require(
  "../middlewares/authorizationMiddleware"
);

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


router.get(
  "/worker-only",
  authMiddleware,
  authorizationMiddleware("WORKER"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Worker access granted",
    });
  }
);

router.get(
  "/worker-only",
  authMiddleware,
  authorizationMiddleware("WORKER"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Worker access granted",
    });
  }
);

router.get(
  "/worker-only",
  authMiddleware,
  authorizationMiddleware("WORKER"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Worker access granted",
    });
  }
);

router.get(
  "/employer-only",
  authMiddleware,
  authorizationMiddleware("EMPLOYER"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Employer access granted",
    });
  }
);

module.exports = router;