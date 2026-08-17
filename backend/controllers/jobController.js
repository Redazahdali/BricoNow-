const jobService = require("../services/jobService");

const createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob(
      req.user._id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const publishJob = async (req, res, next) => {
  try {
    const job = await jobService.publishJob(
      req.user._id,
      req.params.jobId
    );

    res.status(200).json({
      success: true,
      message: "Job published successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const getPublishedJobs = async (req, res, next) => {
  try {
    const result = await jobService.getPublishedJobs(
      req.query
    );

    res.status(200).json({
      success: true,
      message: "Published jobs retrieved successfully",
      data: result.jobs,
      pagination: result.pagination,
      geo: result.geo,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  publishJob,
  getPublishedJobs,
};