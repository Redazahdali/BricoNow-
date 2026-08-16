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

const workerProfileSchema = new mongoose.Schema(
  {
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],

    availability: {
      type: String,
      enum: ["AVAILABLE", "UNAVAILABLE", "AVAILABLE_NOW"],
      default: "UNAVAILABLE",
    },

    location: {
      type: locationSchema,
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

    professionalInfo: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    _id: false,
  }
);

const employerProfileSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["INDIVIDUAL", "PROFESSIONAL"],
    },

    companyName: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    professionalInfo: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    _id: false,
  }
);



const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    role: {
      type: String,
      enum: ["WORKER", "EMPLOYER"],
      required: [true, "User role is required"],
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["PHONE", "GOOGLE"],
      required: true,
    },

    workerProfile: {
      type: workerProfileSchema,
      default: undefined,
    },

    employerProfile: {
      type: employerProfileSchema,
      default: undefined,
    },

    ratingSummary: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "DEACTIVATED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);



userSchema.index({
  "workerProfile.location": "2dsphere",
});

const User = mongoose.model("User", userSchema);

module.exports = User;