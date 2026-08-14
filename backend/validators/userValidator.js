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

module.exports = {
  createUserValidator,
};