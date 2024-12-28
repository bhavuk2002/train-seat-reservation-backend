const { Seat } = require("../models");

const initializeSeats = async (req, res) => {
  try {
    // Clear any existing seat records (optional, depending on your setup)
    await Seat.destroy({ where: {} });

    // Initialize 10 rows with 7 seats and 1 row with 3 seats
    const seats = [];
    for (let row = 1; row <= 11; row++) {
      for (let seatNumber = 1; seatNumber <= 7; seatNumber++) {
        seats.push({
          row: row,
          seat_number: seatNumber,
          reserved_by: null, // Initially, no one has reserved the seat
        });
      }
    }

    // Add the last row with only 3 seats
    for (let seatNumber = 1; seatNumber <= 3; seatNumber++) {
      seats.push({
        row: 12,
        seat_number: seatNumber,
        reserved_by: null, // Initially, no one has reserved the seat
      });
    }

    // Bulk create all the seats
    await Seat.bulkCreate(seats);
    res.status(201).json("Seats have been initialized successfully.");
    console.log("Seats have been initialized successfully.");
  } catch (error) {
    res.status(500).json("Internal error occured.");
    console.error("Error initializing seats:", error);
  }
};

module.exports = { initializeSeats };
