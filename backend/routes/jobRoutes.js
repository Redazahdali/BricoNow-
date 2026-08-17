const express = require("express");

const {
  createJob,
} = require("../controllers/jobController");

const {
  createJobValidator,
} = require("../validators/jobValidator");

const validatorMiddleware = require("../middlewares/validatorMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizationMiddleware = require(
  "../middlewares/authorizationMiddleware"
);

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizationMiddleware("EMPLOYER"),
  createJobValidator,
  validatorMiddleware,
  createJob
);

module.exports = router;