require("dotenv").config();

const express = require("express");
const app = express();
const routes = require("./routes/routes");

app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok"
  });
});

app.use("/api", routes);

app.use((req, res) => {
  return res.status(404).json({
    message: "route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  return res.status(500).json({
    message: "internal server error"
  });
});

module.exports = app;