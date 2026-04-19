require("dotenv").config();

const express = require("express");
const app = express();
const routes = require("./routes/routes");
const errorMiddleware = require("./middleware/error.middleware");
const { globalLimiter } = require("./middleware/rateLimit.middleware");

app.use(express.json());
app.use(globalLimiter)

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok"
  });
});

app.use("/api", routes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "route not found"
  });
});

app.use(errorMiddleware)

module.exports = app;