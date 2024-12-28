const express = require("express");
const cors = require("cors");

const userRoutes = require("./routers/user");
const seatRoutes = require("./routers/seat");

const app = express();

const allowedOrigins = [];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/seat", seatRoutes);

module.exports = app;
