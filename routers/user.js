require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const router = express.Router();

// Create a new user
// User signup
router.post("/signup", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      username,
      email,
      password: hashedPassword,
    };

    // Only add the role if it's present in the request body
    if (role) {
      userData.role = role;
    }
    const user = await User.create(userData);

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found." });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).json({ error: "Invalid credentials." });

    console.log(user.role);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET
    );

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get("/all", async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
