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

module.exports = {
  createJob,
};
