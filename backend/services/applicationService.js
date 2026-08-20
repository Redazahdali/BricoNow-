const Application = require("../models/applicationModel");
const Job = require("../models/jobModel");
const Skill = require("../models/skillModel");
const User = require("../models/userModel");
const Message = require("../models/messageModel");
const conversationService = require("./conversationService");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toPlainObject = (value) => {
  if (!value) {
    return undefined;
  }

  if (typeof value.toObject === "function") {
    return value.toObject();
  }

  return value;
};

const getSkillSnapshotName = (skill) => {
  if (!skill || skill.active !== true || !skill.name) {
    return "Métier non disponible";
  }

  return skill.name;
};

const buildJobSnapshot = (job, skill) => {
  return {
    mode: job.mode,
    title: job.title,
    skillId: job.skillId,
    skillName: getSkillSnapshotName(skill),
    workersNeeded: job.workersNeeded,
    description: job.description,
    location: toPlainObject(job.location),
    city: job.city,
    area: job.area,
    startDate: job.startDate,
    endDate: job.endDate,
    startTime: job.startTime,
    endTime: job.endTime,
    compensation: toPlainObject(job.compensation),
    importantInformation: job.importantInformation,
    conditions: job.conditions,
    capturedAt: new Date(),
  };
};

const createApplication = async (
  workerId,
  jobId,
  messageText
) => {
  const worker = await User.findById(workerId);

  if (!worker) {
    throw createError("Worker not found", 404);
  }

  if (worker.role !== "WORKER") {
    throw createError("Only workers can apply to jobs", 403);
  }

  if (worker.status !== "ACTIVE") {
    throw createError("Worker account is not active", 403);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw createError("Job not found", 404);
  }

  if (job.status !== "PUBLISHED") {
    throw createError(
      "Applications can only be submitted to published jobs",
      400
    );
  }

  if (job.applicationsOpen !== true) {
    throw createError(
      "Applications for this job are closed",
      409
    );
  }

  const existingApplication = await Application.findOne({
    jobId: job._id,
    workerId: worker._id,
  });

  if (existingApplication) {
    throw createError(
      "You have already applied to this job",
      409
    );
  }

  const skill = await Skill.findById(job.skillId);

  const jobSnapshot = buildJobSnapshot(job, skill);

  const normalizedMessage =
    typeof messageText === "string"
      ? messageText.trim()
      : "";

  let application = null;
  let conversation = null;
  let message = null;

  try {
    application = await Application.create({
      jobId: job._id,
      workerId: worker._id,
      employerId: job.employerId,
      jobSnapshot,
      status: "SUBMITTED",
      employerViewedAt: null,
      phoneAccess: {
        status: "LOCKED",
      },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      throw createError(
        "You have already applied to this job",
        409
      );
    }

    throw error;
  }

  try {
    conversation =
      await conversationService.createApplicationConversation({
        applicationId: application._id,
        workerId: worker._id,
        employerId: job.employerId,
      });

    if (normalizedMessage.length > 0) {
      message = await Message.create({
        conversationId: conversation._id,
        senderId: worker._id,
        type: "TEXT",
        text: normalizedMessage,
        readAt: null,
      });

      conversation.lastMessageAt = message.createdAt;

      await conversation.save();
    }
  } catch (error) {
    // Rollback MVP :
    // tant que MongoDB n'utilise pas encore de transaction,
    // on nettoie manuellement les documents créés.

    if (message) {
      try {
        await Message.deleteOne({
          _id: message._id,
        });
      } catch (rollbackError) {
        console.error(
          "Failed to rollback message:",
          rollbackError
        );
      }
    }

    if (conversation) {
      try {
        await conversation.deleteOne();
      } catch (rollbackError) {
        console.error(
          "Failed to rollback conversation:",
          rollbackError
        );
      }
    }

    if (application) {
      try {
        await Application.deleteOne({
          _id: application._id,
        });
      } catch (rollbackError) {
        console.error(
          "Failed to rollback application:",
          rollbackError
        );
      }
    }

    throw error;
  }

  return application;
};

module.exports = {
  createApplication,
};