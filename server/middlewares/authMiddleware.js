import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Extract token from the Authorization header (Expected format: "Bearer <token>")
  const token = req.headers.authorization?.split(" ")[1];

  // Check if the token is missing
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    // Verify the token using your secret key from the environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded information (userId, email, etc.) to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error during token verification:", error);
    // If the token is invalid or expired, respond with an error
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
