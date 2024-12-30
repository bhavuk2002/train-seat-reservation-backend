const { Seat } = require("../models");

const initializeSeats = async (req, res) => {
  try {
    const role = req.user.role;
    console.log(req.user);
    if (role === "user") {
      return res.status(401).json("Only admin can reset.");
    }

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

const reserveSeat = async (req, res) => {
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

    if (availableSeats.length < seatCount) {
      return res.status(400).json({ error: "Not enough seats available." });
    }

    const seatMap = {};
    availableSeats.forEach((seat) => {
      if (!seatMap[seat.row]) seatMap[seat.row] = [];
      seatMap[seat.row].push(seat);
    });

    const seatsToReserve = [];

    // Step 1: Try booking a new row
    const tryNewRow = () => {
      for (const row in seatMap) {
        const rowSeats = seatMap[row];
        if (rowSeats.length === 7 && seatCount <= 7) {
          seatsToReserve.push(...rowSeats.slice(0, seatCount));
          return true;
        }
      }
      return false;
    };

    // Step 2: Try filling gaps in proximity
    const fillGapsInProximity = () => {
      for (const row in seatMap) {
        const rowSeats = seatMap[row];
        if (rowSeats.length >= seatCount) {
          const contiguousSeats = findContiguousSeats(rowSeats, seatCount);
          if (contiguousSeats) {
            seatsToReserve.push(...contiguousSeats);
            return true;
          }
        }
      }
      return false;
    };

    // Step 3: Book nearby seats from multiple rows
    const bookNearbySeats = () => {
      let remainingSeats = seatCount;
      for (const row in seatMap) {
        if (remainingSeats === 0) break;
        const rowSeats = seatMap[row];
        for (const seat of rowSeats) {
          if (remainingSeats === 0) break;
          seatsToReserve.push(seat);
          remainingSeats--;
        }
      }
      return remainingSeats === 0;
    };

    // Function to find contiguous seats
    const findContiguousSeats = (seats, count) => {
      let tempSeats = [];
      for (let i = 0; i < seats.length; i++) {
        if (
          tempSeats.length > 0 &&
          seats[i].seat_number !==
            tempSeats[tempSeats.length - 1].seat_number + 1
        ) {
          tempSeats = [];
        }
        tempSeats.push(seats[i]);
        if (tempSeats.length === count) {
          return tempSeats;
        }
      }
      return null;
    };

    // Execute steps in priority order
    if (!tryNewRow() && !fillGapsInProximity() && !bookNearbySeats()) {
      return res
        .status(400)
        .json({ error: "Not enough seats available in proximity." });
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
};

module.exports = { initializeSeats, reserveSeat };
