const User = require("../models/userModel");
const Skill = require("../models/skillModel");

const createUser = async (userData) => {
  const existingUser = await User.findOne({
    $or: [
      userData.phone ? { phone: userData.phone } : null,
      userData.email ? { email: userData.email } : null,
    ].filter(Boolean),
  });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  if (userData.role === "WORKER") {
    userData.employerProfile = undefined;
  }

  if (userData.role === "EMPLOYER") {
    userData.workerProfile = undefined;
  }

  return User.create(userData);
};

const updateWorkerProfile = async (userId, profileData) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "WORKER") {
    const error = new Error("Only workers can update a worker profile");
    error.statusCode = 403;
    throw error;
  }

  if (profileData.skills) {
    const uniqueSkillIds = [
      ...new Set(profileData.skills.map((skillId) => skillId.toString())),
    ];

    const existingSkills = await Skill.find({
      _id: { $in: uniqueSkillIds },
      active: true,
    }).select("_id");

    if (existingSkills.length !== uniqueSkillIds.length) {
      const error = new Error(
        "One or more selected skills do not exist or are inactive"
      );
      error.statusCode = 400;
      throw error;
    }

    profileData.skills = uniqueSkillIds;
  }

  if (!user.workerProfile) {
    user.workerProfile = {};
  }

  if (profileData.skills !== undefined) {
    user.workerProfile.skills = profileData.skills;
  }

  if (profileData.availability !== undefined) {
    user.workerProfile.availability = profileData.availability;
  }

  if (profileData.location !== undefined) {
    user.workerProfile.location = profileData.location;
  }

  if (profileData.city !== undefined) {
    user.workerProfile.city = profileData.city;
  }

  if (profileData.area !== undefined) {
    user.workerProfile.area = profileData.area;
  }

  if (profileData.professionalInfo !== undefined) {
    user.workerProfile.professionalInfo = profileData.professionalInfo;
  }

  await user.save();

  return User.findById(user._id).populate(
    "workerProfile.skills",
    "name slug active"
  );
};

const updateEmployerProfile = async (userId, profileData) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "EMPLOYER") {
    const error = new Error("Only employers can update an employer profile");
    error.statusCode = 403;
    throw error;
  }

  if (!user.employerProfile) {
    user.employerProfile = {};
  }

  if (profileData.type !== undefined) {
    user.employerProfile.type = profileData.type;
  }

  if (profileData.type === "PROFESSIONAL") {
    if (!profileData.companyName || !profileData.companyName.trim()) {
      const error = new Error(
        "Company name is required for professional employers"
      );
      error.statusCode = 400;
      throw error;
    }

    user.employerProfile.companyName = profileData.companyName;
  }

  if (profileData.type === "INDIVIDUAL") {
    user.employerProfile.companyName = undefined;
  }

  if (
    profileData.companyName !== undefined &&
    profileData.type === undefined &&
    user.employerProfile.type === "PROFESSIONAL"
  ) {
    user.employerProfile.companyName = profileData.companyName;
  }

  if (profileData.professionalInfo !== undefined) {
    user.employerProfile.professionalInfo = profileData.professionalInfo;
  }

  await user.save();

  return user;
};

module.exports = {
  createUser,
  updateWorkerProfile,
  updateEmployerProfile,
};