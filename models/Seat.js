const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

const Seat = sequelize.define(
  "Seat",
  {
    row: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seat_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reserved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  { timestamps: true }
);

module.exports = Seat;
