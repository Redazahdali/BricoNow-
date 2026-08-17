const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },

    coordinates: {
      type: [Number],
      default: undefined,
    },
  },
  {
    _id: false,
  }
);

const compensationSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 10,
    },

    type: {
      type: String,
      enum: ["FIXED", "DAILY", "HOURLY", "MONTHLY", "NEGOTIABLE"],
      default: "NEGOTIABLE",
    },
  },
  {
    _id: false,
  }
);

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    mode: {
      type: String,
      enum: ["EMPLOYMENT", "MISSION", "IMMEDIATE"],
      required: [true, "Job mode is required"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Skill is required"],
      index: true,
    },

    workersNeeded: {
      type: Number,
      required: [true, "Number of workers needed is required"],
      min: 1,
      default: 1,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    location: {
      type: locationSchema,
      default: undefined,
    },

    city: {
      type: String,
      trim: true,
      maxlength: 100,
      index: true,
    },

    area: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    startTime: {
      type: String,
      trim: true,
      maxlength: 10,
    },

    endTime: {
      type: String,
      trim: true,
      maxlength: 10,
    },

    compensation: {
      type: compensationSchema,
      default: undefined,
    },

    importantInformation: {
      type: String,
      trim: true,
      maxlength: 1500,
    },

    conditions: {
      type: String,
      trim: true,
      maxlength: 1500,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"],
      default: "DRAFT",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({
  location: "2dsphere",
});

jobSchema.index({
  status: 1,
  mode: 1,
  skillId: 1,
  createdAt: -1,
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;