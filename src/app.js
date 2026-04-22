require("dotenv").config();

const express = require("express");
const app = express();
const routes = require("./routes/routes");
const errorMiddleware = require("./middleware/error.middleware");
const { globalLimiter } = require("./middleware/rateLimit.middleware");
const pinoHttp = require("pino-http");
const logger = require("./config/logger");
const helmet = require("helmet");
const cors = require("cors");

app.use(helmet());
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PATCH", "DELETE"]
}));

app.use(express.json({ 
  limit: "1mb" 
}));

app.use(cors());
app.use(express.json());
app.use(globalLimiter)
app.use(pinoHttp({ logger }));

app.use("/api", routes);

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok"
  });
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "route not found"
  });
});

app.use(errorMiddleware)

module.exports = app;