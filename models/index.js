const User = require("./User");
const Seat = require("./Seat");

// Define Associations

// User ↔ Seat (One-to-Many relationship)
User.hasMany(Seat, { foreignKey: "reserved_by", as: "seats" });
Seat.belongsTo(User, { foreignKey: "reserved_by", as: "reservedBy" });

// Export Models
module.exports = { User, Seat };
