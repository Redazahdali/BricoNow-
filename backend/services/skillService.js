const Skill = require("../models/skillModel");

const getAllSkills = async () => {
  return Skill.find({ active: true }).sort({ name: 1 });
};

module.exports = {
  getAllSkills,
};