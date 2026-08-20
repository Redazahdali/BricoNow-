const { param, body } = require("express-validator");

const createApplicationValidator = [
  param("jobId")
    .isMongoId()
    .withMessage("Job ID must be a valid MongoDB ObjectId"),

  body("message")
    .optional()
    .isString()
    .withMessage("Message must be a string")
    .isLength({ max: 5000 })
    .withMessage("Message must not exceed 5000 characters"),
];

module.exports = {
  createApplicationValidator,
};