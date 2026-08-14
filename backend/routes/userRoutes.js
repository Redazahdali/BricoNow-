const express = require("express");

const { createUser } = require("../controllers/userController");
const { createUserValidator } = require("../validators/userValidator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

const router = express.Router();

router.post(
  "/",
  createUserValidator,
  validatorMiddleware,
  createUser
);

module.exports = router;
