const { body } = require("express-validator");

const createUserValidator = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("First name must contain between 2 and 80 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Last name must contain between 2 and 80 characters"),

  body("role")
    .isIn(["WORKER", "EMPLOYER"])
    .withMessage("Role must be WORKER or EMPLOYER"),

  body("authProvider")
    .isIn(["PHONE", "GOOGLE"])
    .withMessage("Auth provider must be PHONE or GOOGLE"),

  body("phone")
    .optional()
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("workerProfile.availability")
    .optional()
    .isIn(["AVAILABLE", "UNAVAILABLE", "AVAILABLE_NOW"])
    .withMessage("Invalid worker availability"),

  body("employerProfile.type")
    .optional()
    .isIn(["INDIVIDUAL", "PROFESSIONAL"])
    .withMessage("Invalid employer type"),
];
const updateWorkerProfileValidator = [
  body("skills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array"),

  body("skills.*")
    .optional()
    .isMongoId()
    .withMessage("Each skill must be a valid MongoDB ObjectId"),

  body("availability")
    .optional()
    .isIn(["AVAILABLE", "UNAVAILABLE", "AVAILABLE_NOW"])
    .withMessage("Invalid worker availability"),

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

  body("professionalInfo")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Professional info cannot exceed 1000 characters"),

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
    .withMessage("Location coordinates must contain longitude and latitude"),

  body("location.coordinates.0")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  body("location.coordinates.1")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
];
module.exports = {
  createUserValidator,
  updateWorkerProfileValidator,
};