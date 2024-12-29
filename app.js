const express = require("express");
const cors = require("cors");

const userRoutes = require("./routers/user");
const seatRoutes = require("./routers/seat");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://train-seat-reservation-demo.netlify.app",
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/seats", seatRoutes);

module.exports = app;
