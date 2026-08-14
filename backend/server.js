require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(
      `BricoNow API running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });
};

startServer();