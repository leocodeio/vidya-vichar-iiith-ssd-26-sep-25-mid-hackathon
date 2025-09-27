import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Only use token from cookies
    let token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    
    // Find the user associated with the token
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    next(); // Proceed to the next middleware
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
