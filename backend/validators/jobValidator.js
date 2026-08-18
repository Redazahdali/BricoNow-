const { body, query, param } = require("express-validator");

const createJobValidator = [
  body("mode")
    .notEmpty()
    .withMessage("Job mode is required")
    .isIn(["EMPLOYMENT", "MISSION", "IMMEDIATE"])
    .withMessage("Job mode must be EMPLOYMENT, MISSION or IMMEDIATE"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Job title must contain between 3 and 150 characters"),

  body("skillId")
    .notEmpty()
    .withMessage("Skill is required")
    .isMongoId()
    .withMessage("Skill must be a valid MongoDB ObjectId"),

  body("workersNeeded")
    .notEmpty()
    .withMessage("Number of workers needed is required")
    .isInt({ min: 1 })
    .withMessage("Workers needed must be at least 1")
    .toInt(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),

  body("city")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters"),

  body("area")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Area cannot exceed 150 characters"),

  body("location")
    .optional()
    .isObject()
    .withMessage("Location must be an object"),

  body("location.type")
    .optional()
    .equals("Point")
    .withMessage("Location type must be Point"),

  body("location.coordinates")
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage(
      "Location coordinates must contain longitude and latitude"
    ),

  body("location.coordinates.0")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180")
    .toFloat(),

  body("location.coordinates.1")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90")
    .toFloat(),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date")
    .toDate(),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date")
    .toDate(),

  body("endDate").custom((endDate, { req }) => {
    if (
      endDate &&
      req.body.startDate &&
      new Date(endDate) < new Date(req.body.startDate)
    ) {
      throw new Error("End date cannot be before start date");
    }

    return true;
  }),

  body("startTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Start time must use HH:mm format"),

  body("endTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("End time must use HH:mm format"),

  body("compensation")
    .optional()
    .isObject()
    .withMessage("Compensation must be an object"),

  body("compensation.mode")
    .optional()
    .isIn(["FIXED", "NEGOTIABLE"])
    .withMessage("Compensation mode must be FIXED or NEGOTIABLE"),

  body("compensation.proposedAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Proposed compensation amount cannot be negative")
    .toFloat(),

  body("compensation.currency")
    .optional()
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage(
      "Compensation currency must contain between 3 and 10 characters"
    ),

  body("compensation.unit")
    .optional()
    .isIn(["HOURLY", "DAILY", "MISSION", "MONTHLY"])
    .withMessage(
      "Compensation unit must be HOURLY, DAILY, MISSION or MONTHLY"
    ),

  body("importantInformation")
    .optional()
    .trim()
    .isLength({ max: 1500 })
    .withMessage(
      "Important information cannot exceed 1500 characters"
    ),

  body("conditions")
    .optional()
    .trim()
    .isLength({ max: 1500 })
    .withMessage("Conditions cannot exceed 1500 characters"),
];

const getPublishedJobsValidator = [
  query("skillId")
    .optional()
    .isMongoId()
    .withMessage("Skill must be a valid MongoDB ObjectId"),

  query("city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("City must contain between 2 and 100 characters"),

  query("mode")
    .optional()
    .isIn(["EMPLOYMENT", "MISSION", "IMMEDIATE"])
    .withMessage(
      "Job mode must be EMPLOYMENT, MISSION or IMMEDIATE"
    ),

  query("scope")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(["NEARBY", "ALL"])
    .withMessage("Scope must be NEARBY or ALL"),

  query("lat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90")
    .toFloat(),

  query("lng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180")
    .toFloat(),

  query("radius")
    .optional()
    .isFloat({ min: 1, max: 200 })
    .withMessage("Radius must be between 1 and 200 kilometers")
    .toFloat(),

  query("lat").custom((value, { req }) => {
    const hasLat =
      req.query.lat !== undefined &&
      req.query.lat !== "";

    const hasLng =
      req.query.lng !== undefined &&
      req.query.lng !== "";

    const scope =
      req.query.scope?.toUpperCase();

    const hasRadius =
      req.query.radius !== undefined &&
      req.query.radius !== "";

    if (hasLat !== hasLng) {
      throw new Error(
        "Latitude and longitude must be provided together"
      );
    }

    if (scope === "NEARBY" && !hasLat) {
      throw new Error(
        "Latitude and longitude are required for NEARBY scope"
      );
    }

    if (hasRadius && !hasLat) {
      throw new Error(
        "Radius requires latitude and longitude"
      );
    }

    if (scope === "ALL" && hasRadius) {
      throw new Error(
        "Radius cannot be used with ALL scope"
      );
    }

    return true;
  }),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be an integer greater than or equal to 1")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),
];

const getJobByIdValidator = [
  param("jobId")
    .isMongoId()
    .withMessage("Job ID must be a valid MongoDB ObjectId"),
];


module.exports = {
  createJobValidator,
  getPublishedJobsValidator,
  getJobByIdValidator,
};