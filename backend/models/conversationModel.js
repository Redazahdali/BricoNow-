const mongoose = require("mongoose");

const participantStateSchema = new mongoose.Schema(
  {
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const conversationContextSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["APPLICATION", "WORKER_PROFILE"],
      required: true,
    },

    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const conversationSchema = new mongoose.Schema(
  {
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

    context: {
      type: conversationContextSchema,
      required: true,
    },

    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED"],
      default: "ACTIVE",
      required: true,
      index: true,
    },

    participantState: {
      worker: {
        type: participantStateSchema,
        default: () => ({
          archivedAt: null,
        }),
      },

      employer: {
        type: participantStateSchema,
        default: () => ({
          archivedAt: null,
        }),
      },
    },

    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Une seule Conversation pour une Application donnée.
conversationSchema.index(
  {
    "context.type": 1,
    "context.contextId": 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      "context.type": "APPLICATION",
    },
  }
);

// Une seule Conversation WORKER_PROFILE par paire Employer <-> Worker.
conversationSchema.index(
  {
    "context.type": 1,
    workerId: 1,
    employerId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      "context.type": "WORKER_PROFILE",
    },
  }
);

// Recherche des conversations d'un Worker.
conversationSchema.index({
  workerId: 1,
  status: 1,
  lastMessageAt: -1,
  createdAt: -1,
});

// Recherche des conversations d'un Employer.
conversationSchema.index({
  employerId: 1,
  status: 1,
  lastMessageAt: -1,
  createdAt: -1,
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;