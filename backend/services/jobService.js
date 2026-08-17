const Job = require("../models/jobModel");
const Skill = require("../models/skillModel");
const User = require("../models/userModel");

const createJob = async (employerId, jobData) => {
  const employer = await User.findById(employerId);

  if (!employer) {
    const error = new Error("Employer not found");
    error.statusCode = 404;
    throw error;
  }

  if (employer.role !== "EMPLOYER") {
    const error = new Error("Only employers can create jobs");
    error.statusCode = 403;
    throw error;
  }

  if (employer.status !== "ACTIVE") {
    const error = new Error("Employer account is not active");
    error.statusCode = 403;
    throw error;
  }

  const skill = await Skill.findOne({
    _id: jobData.skillId,
    active: true,
  });

  if (!skill) {
    const error = new Error("Selected skill does not exist or is inactive");
    error.statusCode = 400;
    throw error;
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

    // Important :
    // le frontend ne décide pas du statut à la création.
    status: "DRAFT",
  });

  return Job.findById(job._id)
    .populate("employerId", "firstName lastName role employerProfile")
    .populate("skillId", "name slug active");
};

module.exports = {
  createJob,
};