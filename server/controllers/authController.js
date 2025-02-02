import User from "../models/userSchema.js";
import VerificationCode from "../models/verificationCodeSchema.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import createTransporter from "../config/nodemailerConfig.js";
import jwt from "jsonwebtoken";
import Notification from "../models/notificationSchema.js";
import { createWelcomeNotification } from "../controllers/notificationController.js";

dotenv.config(); // Load environment variables

// Function to generate an 8-digit OTP
const generateVerificationCode = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

dotenv.config();

export const signup = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;
    const name = fullname;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already registered" });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (but not verified yet)
    user = new User({
      username,
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      firstLogin: true, // Add firstLogin flag
    });

    await user.save(); // Save user to DB

    // Generate a new OTP
    const verificationCode = generateVerificationCode();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // Check if an OTP already exists for this user
    let existingOTP = await VerificationCode.findOne({ userId: user._id });
    if (existingOTP) {
      // Update existing OTP
      existingOTP.code = verificationCode;
      existingOTP.expiresAt = expirationTime;
      await existingOTP.save();
    } else {
      // Create new OTP entry
      const newOTP = new VerificationCode({
        userId: user._id,
        email,
        code: verificationCode,
        expiresAt: expirationTime,
      });
      await newOTP.save();
    }

    // Create transporter using OAuth2
    const transporter = await createTransporter(); // Await transporter creation

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Account",
      text: `Your verification code is: ${verificationCode}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions); // Send the email

    // Generate a JWT token to send to the frontend
    const token = jwt.sign(
      { userId: user._id, email: user.email }, // Payload
      process.env.JWT_SECRET, // Secret key from environment variables
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Send success response to client with the token and userId
    res.status(201).json({
      message: "User registered successfully. Verification code sent to email.",
      userId: user._id,
      token, // Send the token to the frontend
    });
  } catch (error) {
    console.error("Error during signup:", error); // Log the error
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//verification code
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body; // Extract email and code from the request body

    // Check if the user exists by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Find the OTP associated with the user by email
    const verificationRecord = await VerificationCode.findOne({ email });
    if (!verificationRecord) {
      return res
        .status(400)
        .json({ message: "No verification code found for this email" });
    }

    // Check if the OTP has expired
    if (new Date() > new Date(verificationRecord.expiresAt)) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Check if the OTP is correct
    if (verificationRecord.code !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Mark the user as verified
    user.isVerified = true;
    await user.save();

    // Optionally, delete the OTP record after successful verification
    await VerificationCode.deleteOne({ email });

    // Send success response
    res.status(200).json({
      message: "User verified successfully",
    });
  } catch (error) {
    console.error("Error during verification:", error); // Log the error
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token (for both verified and unverified users)
    const token = jwt.sign(
      { userId: user._id, email: user.email }, // Payload
      process.env.JWT_SECRET, // Secret key from environment variables
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // If the user is not verified, send the token and prompt for verification
    if (!user.isVerified) {
      const verificationCode = generateVerificationCode();
      const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // Code expires in 10 minutes

      // Check if an OTP already exists for this user
      let existingOTP = await VerificationCode.findOne({ userId: user._id });
      if (existingOTP) {
        // Update the existing OTP
        existingOTP.code = verificationCode;
        existingOTP.expiresAt = expirationTime;
        await existingOTP.save();
      } else {
        // Create a new OTP record
        const newOTP = new VerificationCode({
          userId: user._id,
          email,
          code: verificationCode,
          expiresAt: expirationTime,
        });
        await newOTP.save();
      }

      // Create transporter and send the verification code email
      const transporter = await createTransporter();
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Please Verify Your Account",
        text: `Your verification code is: ${verificationCode}. It will expire in 10 minutes.`,
      };

      await transporter.sendMail(mailOptions); // Send the email

      // Send the message and token to the frontend, user is not verified
      return res.status(400).json({
        message:
          "Your account is not verified. A new verification code has been sent to your email.",
        token, // Send the token along with the message for unverified user
        userId: user._id, // Send the userId of the unverified user
      });
    }

    // Check if this is the user's first login
    if (user.firstLogin) {
      // Create a welcome notification
      await createWelcomeNotification(user._id);

      // Update the user's firstLogin status
      user.firstLogin = false;
      await user.save();
    }

    // If the user is verified, send the token and user info
    res.status(200).json({
      message: "Login successful",
      token, // Send the JWT token for verified user
      user: {
        email: user.email,
        username: user.username,
        name: user.name,
        userId: user._id, // Send the userId of the verified user
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
