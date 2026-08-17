const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const skillRoutes = require("./routes/skillRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");

const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BricoNow API is running",
  });
});

app.use("/api/skills", skillRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

app.use(errorMiddleware);

module.exports = app;