const applicationService = require("../services/applicationService");

const createApplication = async (req, res, next) => {
  try {
    const application = await applicationService.createApplication(
      req.user._id,
      req.params.jobId
    );

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
};