const express = require("express");

const {
  createJob,
  publishJob,
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

// Create a new job
router.post(
  "/",
  authMiddleware,
  authorizationMiddleware("EMPLOYER"),
  createJobValidator,
  validatorMiddleware,
  createJob
);

// Publish a draft job
router.patch(
  "/:jobId/publish",
  authMiddleware,
  authorizationMiddleware("EMPLOYER"),
  publishJob
);

module.exports = router;