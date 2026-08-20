const Conversation = require("../models/conversationModel");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createApplicationConversation = async ({
  applicationId,
  workerId,
  employerId,
}) => {
  if (!applicationId || !workerId || !employerId) {
    throw createError(
      "Application conversation requires applicationId, workerId and employerId",
      400
    );
  }

  try {
    const conversation = await Conversation.create({
      workerId,
      employerId,

      context: {
        type: "APPLICATION",
        contextId: applicationId,
      },

      initiatedBy: workerId,

      status: "ACTIVE",

      participantState: {
        worker: {
          archivedAt: null,
        },
        employer: {
          archivedAt: null,
        },
      },

      lastMessageAt: null,
    });

    return conversation;
  } catch (error) {
    // Protection supplémentaire contre deux conversations
    // pour la même Application.
    if (error && error.code === 11000) {
      throw createError(
        "A conversation already exists for this application",
        409
      );
    }

    throw error;
  }
};

const getOrCreateWorkerProfileConversation = async ({
  workerId,
  employerId,
  contextId,
}) => {
  if (!workerId || !employerId || !contextId) {
    throw createError(
      "Worker profile conversation requires workerId, employerId and contextId",
      400
    );
  }

  const existingConversation = await Conversation.findOne({
    workerId,
    employerId,
    "context.type": "WORKER_PROFILE",
  });

  if (existingConversation) {
    return existingConversation;
  }

  try {
    const conversation = await Conversation.create({
      workerId,
      employerId,

      context: {
        type: "WORKER_PROFILE",
        contextId,
      },

      initiatedBy: employerId,

      status: "ACTIVE",

      participantState: {
        worker: {
          archivedAt: null,
        },
        employer: {
          archivedAt: null,
        },
      },

      lastMessageAt: null,
    });

    return conversation;
  } catch (error) {
    // Cas de concurrence :
    // deux requêtes tentent de créer la même conversation simultanément.
    if (error && error.code === 11000) {
      const conversation = await Conversation.findOne({
        workerId,
        employerId,
        "context.type": "WORKER_PROFILE",
      });

      if (conversation) {
        return conversation;
      }
    }

    throw error;
  }
};

module.exports = {
  createApplicationConversation,
  getOrCreateWorkerProfileConversation,
};