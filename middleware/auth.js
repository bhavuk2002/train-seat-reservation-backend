require("dotenv").config();
const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  try {
    const authtoken = req.header("Authorization");
    if (!authtoken) {
      return res
        .status(401)
        .json({ message: "Access Denied: No Token Provided" });
    }
    const token = authtoken.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret key
    // console.log(decoded);
    req.user = decoded; // Attach the user payload to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(403).json({ message: "Invalid Token" });
  }
};

module.exports = { authenticateToken };
