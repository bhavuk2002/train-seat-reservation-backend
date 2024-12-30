const express = require("express");
const { Seat, User } = require("../models");
const {
  initializeSeats,
  reserveSeat,
} = require("../controller/seatController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get all seats
router.get("/all", async (req, res) => {
  try {
    const seats = await Seat.findAll({
      include: [
        {
          model: User,
          as: "reservedBy",
          attributes: ["id", "username", "email"], // Include user details if reserved
        },
      ],
    });
    const unreservedSeatsCount = await Seat.count({
      where: { reserved_by: null },
    });
    res.status(200).json({ seats, unreservedSeatsCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/reserve", authenticateToken, reserveSeat);

router.post("/:seatId/cancel", authenticateToken, async (req, res) => {
  const { seatId } = req.params;
  const userId = req.user.id;
  try {
    const seat = await Seat.findByPk(seatId);
    if (!seat) {
      return res.status(404).json({ error: "Seat not found" });
    }

    if (!seat.reserved_by) {
      return res.status(400).json({ error: "Seat is not reserved" });
    }
    if (seat.reserved_by !== userId) {
      return res.status(401).json({ error: "Booked by another user." });
    }
    seat.reserved_by = null;
    await seat.save();

    res.status(200).json(seat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/initialisation", authenticateToken, initializeSeats);

// Reset all seats (Admin only)
router.post("/reset", authenticateToken, async (req, res) => {
  try {
    await Seat.update({ reserved_by: null }, { where: {} });
    res.status(200).json({ message: "All seats have been reset." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
