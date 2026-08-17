const express = require("express");

const {
  createJob,
  publishJob,
  getPublishedJobs,
} = require("../controllers/jobController");

const {
  createJobValidator,
  getPublishedJobsValidator,
} = require("../validators/jobValidator");

const validatorMiddleware = require("../middlewares/validatorMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizationMiddleware = require(
  "../middlewares/authorizationMiddleware"
);

const router = express.Router();

// WORKER - Get published jobs
router.get(
  "/",
  authMiddleware,
  authorizationMiddleware("WORKER"),
  getPublishedJobsValidator,
  validatorMiddleware,
  getPublishedJobs
);
// EMPLOYER - Create a job
router.post(
  "/",
  authMiddleware,
  authorizationMiddleware("EMPLOYER"),
  createJobValidator,
  validatorMiddleware,
  createJob
);

// EMPLOYER - Publish a draft job
router.patch(
  "/:jobId/publish",
  authMiddleware,
  authorizationMiddleware("EMPLOYER"),
  publishJob
);

module.exports = router;