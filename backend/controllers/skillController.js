const skillService = require("../services/skillService");

const getSkills = async (req, res, next) => {
  try {
    const skills = await skillService.getAllSkills();

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
};