const express = require("express");
const { Seat, User } = require("../models");
const { initializeSeats } = require("../controller/seatController");
const { where } = require("sequelize");
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
    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/reserve", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { seatCount } = req.body;

  // Validate seat count (between 1 and 7)
  if (seatCount < 1 || seatCount > 7) {
    return res
      .status(400)
      .json({ error: "You can reserve between 1 to 7 seats only." });
  }

  try {
    // Check the total number of unreserved seats
    const unreservedSeatsCount = await Seat.count({
      where: { reserved_by: null },
    });

    // If there are no unreserved seats, return an error indicating that all seats are filled
    if (unreservedSeatsCount === 0) {
      return res.status(400).json({ error: "All seats are filled." });
    }

    // Fetch all available seats, ordered by row and seat number.
    const availableSeats = await Seat.findAll({
      where: { reserved_by: null },
      order: [
        ["row", "ASC"],
        ["seat_number", "ASC"],
      ],
    });

    // If not enough available seats
    if (availableSeats.length < seatCount) {
      return res.status(400).json({ error: "Not enough seats available." });
    }

    const seatsToReserve = [];
    const seatMap = {}; // Group seats by rows

    availableSeats.forEach((seat) => {
      if (!seatMap[seat.row]) seatMap[seat.row] = [];
      seatMap[seat.row].push(seat);
    });

    // Try to find a row with enough seats
    let rowSeats = null;
    for (const row in seatMap) {
      if (seatMap[row].length >= seatCount) {
        rowSeats = seatMap[row].slice(0, seatCount);
        break;
      }
    }

    // If no row with enough seats, try booking nearby seats from adjacent rows
    if (!rowSeats) {
      let remainingSeats = seatCount;
      for (const row in seatMap) {
        for (const seat of seatMap[row]) {
          if (remainingSeats === 0) break;
          seatsToReserve.push(seat);
          remainingSeats--;
        }
        if (remainingSeats === 0) break;
      }

      // If not enough seats available in nearby rows (edge case)
      if (remainingSeats > 0) {
        return res
          .status(400)
          .json({ error: "Not enough seats available in nearby rows." });
      }
    } else {
      // Otherwise, if enough seats found in a row, reserve them
      seatsToReserve.push(...rowSeats);
    }

    // Handle edge case for 7 seat reservation
    // If trying to reserve 7 seats but we can only book 6 or fewer, return error.
    if (seatCount === 7 && seatsToReserve.length < 7) {
      return res
        .status(400)
        .json({ error: "Not enough seats available to reserve 7 seats." });
    }

    // Reserve the selected seats
    for (const seat of seatsToReserve) {
      seat.reserved_by = userId;
      await seat.save();
    }

    res.status(200).json(seatsToReserve);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:seatId/cancel", async (req, res) => {
  const { seatId } = req.params;

  try {
    const seat = await Seat.findByPk(seatId);
    if (!seat) {
      return res.status(404).json({ error: "Seat not found" });
    }

    if (!seat.reserved_by) {
      return res.status(400).json({ error: "Seat is not reserved" });
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
