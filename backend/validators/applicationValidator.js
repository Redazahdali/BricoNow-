const { param } = require("express-validator");

const createApplicationValidator = [
  param("jobId")
    .isMongoId()
    .withMessage("Job ID must be a valid MongoDB ObjectId"),
];

module.exports = {
  createApplicationValidator,
};