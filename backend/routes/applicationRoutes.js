const express = require("express");

const {
  createApplication,
} = require("../controllers/applicationController");

const {
  createApplicationValidator,
} = require("../validators/applicationValidator");

const validatorMiddleware = require("../middlewares/validatorMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizationMiddleware = require(
  "../middlewares/authorizationMiddleware"
);

const router = express.Router();

// WORKER - Apply to a published job
router.post(
  "/:jobId/applications",
  authMiddleware,
  authorizationMiddleware("WORKER"),
  createApplicationValidator,
  validatorMiddleware,
  createApplication
);

module.exports = router;