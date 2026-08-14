const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Security HTTP headers
app.use(helmet());

// Allow frontend applications to communicate with the API
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// HTTP request logs during development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Temporary health route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BricoNow API is running",
  });
});

module.exports = app;