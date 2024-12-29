require("dotenv").config();
const app = require("./app.js");
const sequelize = require("./config/database.js");

const port = process.env.PORT;

// Sync database
sequelize
  .sync({ force: false }) // Use `force: true` for development to drop/recreate tables
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
