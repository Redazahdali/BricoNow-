const Job = require("../models/jobModel");
const Skill = require("../models/skillModel");
const User = require("../models/userModel");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateCompensationForPublication = (compensation) => {
  if (!compensation) {
    throw createError(
      "Compensation information is required before publishing",
      400
    );
  }

  if (!["FIXED", "NEGOTIABLE"].includes(compensation.mode)) {
    throw createError(
      "Compensation mode must be FIXED or NEGOTIABLE",
      400
    );
  }

  if (
    compensation.proposedAmount === undefined ||
    compensation.proposedAmount === null ||
    compensation.proposedAmount <= 0
  ) {
    throw createError(
      "A proposed compensation amount greater than 0 is required",
      400
    );
  }

  if (!compensation.currency) {
    throw createError(
      "Compensation currency is required before publishing",
      400
    );
  }

  if (!compensation.unit) {
    throw createError(
      "Compensation unit is required before publishing",
      400
    );
  }
};

const validateJobForPublication = (job) => {
  if (!job.title || !job.skillId || !job.workersNeeded) {
    throw createError("Job is incomplete", 400);
  }

  if (job.workersNeeded < 1) {
    throw createError(
      "Number of workers needed must be at least 1",
      400
    );
  }

  if (!job.city) {
    throw createError(
      "City is required before publishing",
      400
    );
  }

  validateCompensationForPublication(job.compensation);

  if (job.mode === "EMPLOYMENT") {
    if (!job.description) {
      throw createError(
        "Description is required for employment jobs",
        400
      );
    }
  }

  if (job.mode === "MISSION") {
    if (!job.startDate || !job.endDate) {
      throw createError(
        "Start date and end date are required for missions",
        400
      );
    }

    if (job.endDate < job.startDate) {
      throw createError(
        "End date cannot be before start date",
        400
      );
    }
  }

  if (job.mode === "IMMEDIATE") {
    if (
      !job.location ||
      !Array.isArray(job.location.coordinates) ||
      job.location.coordinates.length !== 2
    ) {
      throw createError(
        "A valid location is required for immediate jobs",
        400
      );
    }
  }
};

const createJob = async (employerId, jobData) => {
  const employer = await User.findById(employerId);

  if (!employer) {
    throw createError("Employer not found", 404);
  }

  if (employer.role !== "EMPLOYER") {
    throw createError(
      "Only employers can create jobs",
      403
    );
  }

  if (employer.status !== "ACTIVE") {
    throw createError(
      "Employer account is not active",
      403
    );
  }

  const skill = await Skill.findOne({
    _id: jobData.skillId,
    active: true,
  });

  if (!skill) {
    throw createError(
      "Selected skill does not exist or is inactive",
      400
    );
  }

  const job = await Job.create({
    employerId,
    mode: jobData.mode,
    title: jobData.title,
    skillId: jobData.skillId,
    workersNeeded: jobData.workersNeeded,
    description: jobData.description,

    location: jobData.location,
    city: jobData.city,
    area: jobData.area,

    startDate: jobData.startDate,
    endDate: jobData.endDate,
    startTime: jobData.startTime,
    endTime: jobData.endTime,

    compensation: jobData.compensation,

    importantInformation: jobData.importantInformation,
    conditions: jobData.conditions,

    // La création produit toujours un brouillon.
    status: "DRAFT",
  });

  return Job.findById(job._id)
    .populate(
      "employerId",
      "firstName lastName role employerProfile"
    )
    .populate(
      "skillId",
      "name slug active"
    );
};

const publishJob = async (employerId, jobId) => {
  const employer = await User.findById(employerId);

  if (!employer) {
    throw createError("Employer not found", 404);
  }

  if (employer.role !== "EMPLOYER") {
    throw createError(
      "Only employers can publish jobs",
      403
    );
  }

  if (employer.status !== "ACTIVE") {
    throw createError(
      "Employer account is not active",
      403
    );
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw createError("Job not found", 404);
  }

  if (
    job.employerId.toString() !==
    employerId.toString()
  ) {
    throw createError(
      "You are not allowed to publish this job",
      403
    );
  }

  if (job.status !== "DRAFT") {
    throw createError(
      "Only draft jobs can be published",
      400
    );
  }

  const skill = await Skill.findOne({
    _id: job.skillId,
    active: true,
  });

  if (!skill) {
    throw createError(
      "Selected skill does not exist or is inactive",
      400
    );
  }

  validateJobForPublication(job);

  job.status = "PUBLISHED";

  await job.save();

  return Job.findById(job._id)
    .populate(
      "employerId",
      "firstName lastName role employerProfile"
    )
    .populate(
      "skillId",
      "name slug active"
    );
};

module.exports = {
  createJob,
  publishJob,
};