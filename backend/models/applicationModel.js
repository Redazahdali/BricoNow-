const mongoose = require("mongoose");

const locationSnapshotSchema = new mongoose.Schema(
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

const compensationSnapshotSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ["FIXED", "NEGOTIABLE"],
    },

    proposedAmount: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 10,
    },

    unit: {
      type: String,
      enum: ["HOURLY", "DAILY", "MISSION", "MONTHLY"],
    },
  },
  {
    _id: false,
  }
);

const jobSnapshotSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ["EMPLOYMENT", "CHANTIER", "MISSION", "HELP_REQUEST"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    skillName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    workersNeeded: {
      type: Number,
      required: true,
      min: 1,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    location: {
      type: locationSnapshotSchema,
      default: undefined,
    },

    city: {
      type: String,
      trim: true,
      maxlength: 100,
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
      type: compensationSnapshotSchema,
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

    capturedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const phoneAccessSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["LOCKED", "REQUESTED", "GRANTED", "DENIED", "REVOKED"],
      default: "LOCKED",
      required: true,
    },

    requestedAt: {
      type: Date,
      default: null,
    },

    grantedAt: {
      type: Date,
      default: null,
    },

    deniedAt: {
      type: Date,
      default: null,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    jobSnapshot: {
      type: jobSnapshotSchema,
      required: true,
    },

    status: {
      type: String,
      enum: ["SUBMITTED", "WITHDRAWN", "REJECTED", "PROPOSAL_CREATED"],
      default: "SUBMITTED",
      required: true,
      index: true,
    },

    employerViewedAt: {
      type: Date,
      default: null,
    },

    phoneAccess: {
      type: phoneAccessSchema,
      default: () => ({
        status: "LOCKED",
      }),
    },

    withdrawnAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    proposalCreatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index(
  {
    jobId: 1,
    workerId: 1,
  },
  {
    unique: true,
  }
);

applicationSchema.index({
  employerId: 1,
  status: 1,
  createdAt: -1,
});

applicationSchema.index({
  workerId: 1,
  status: 1,
  createdAt: -1,
});

applicationSchema.index({
  jobId: 1,
  status: 1,
  createdAt: -1,
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;