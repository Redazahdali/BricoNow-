const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      required: true,
      trim: true,
    },

    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },

    storageKey: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const relatedEntitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["PROPOSAL", "NEGOTIATION", "WORK_AGREEMENT"],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "TEXT",
        "ATTACHMENT",
        "SYSTEM",
        "PROPOSAL_EVENT",
        "NEGOTIATION_EVENT",
      ],
      required: true,
    },

    text: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: null,
    },

    attachment: {
      type: attachmentSchema,
      default: null,
    },

    relatedEntity: {
      type: relatedEntitySchema,
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Chargement chronologique/paginé des messages d'une conversation.
messageSchema.index({
  conversationId: 1,
  createdAt: -1,
});

// Recherche des messages non lus d'un utilisateur/contexte.
// senderId permet notamment d'exclure les propres messages de l'utilisateur.
messageSchema.index({
  conversationId: 1,
  readAt: 1,
  senderId: 1,
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;