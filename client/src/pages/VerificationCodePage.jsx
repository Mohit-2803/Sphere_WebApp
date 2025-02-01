/* eslint-disable react/prop-types */
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirecting
import axios from "axios"; // Import axios to send the verification request
import logo from "../assets/logo.svg"; // Your logo image
import verificationImage from "../assets/20456186.jpg"; // Your new image for verification page
import { motion } from "framer-motion";

// VerificationCodePage Component
const VerificationCodePage = ({ email, token, userId }) => {
  const [code, setCode] = useState("");
  const navigate = useNavigate(); // Hook for navigating to the home page

  const handleCodeChange = (e) => {
    const input = e.target.value;
    // Allow only digits and limit to 8 characters
    if (/^\d*$/.test(input) && input.length <= 8) {
      setCode(input);
    }
  };

  const validateCode = () => {
    if (code.length !== 8) {
      toast.error("Verification code must be exactly 8 digits.");
      return false;
    }
    return true; // You can add additional validation logic if needed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateCode()) {
      try {
        // Sending email and code to the backend to validate
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`,
          {
            email,
            code,
          }
        );

        if (response.data.message === "User verified successfully") {
          toast.success("Verification successful!");

          // Save the token and userId to localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("userId", userId); // Store the userId

          // Redirect to home page upon successful verification
          navigate("/profile");
        }
      } catch (error) {
        console.log(error);
        if (error.response?.data?.message === "Invalid verification code") {
          toast.error("Invalid verification code. Please try again.");
        } else {
          toast.error("An error occurred. Please try again.");
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Verification Form */}
      <div className="min-w-xl max-w-4xl flex items-center justify-center p-4 bg-gradient-to-br">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-6 flex flex-col items-center justify-center"
        >
          <header className="flex items-center justify-start mb-10 gap-2">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-full" />
            <h1 className="text-3xl font-bold text-gray-600">Sphere</h1>
          </header>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Enter Verification Code
          </h1>
          <p className="text-center text-gray-600 mb-4">
            Sent to <span className="font-bold">{email}</span>
          </p>

          {/* Verification Code Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-6">
            <div className="mb-6">
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="Enter 8-digit code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-lg font-semibold"
                maxLength={8}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Verify
            </button>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Decorative Image */}
      <div className="hidden md:block relative w-2/3">
        {/* To have the image overflow partially off-screen, we wrap it in a container with overflow-hidden */}
        <div className="absolute top-0 right-0 h-full w-full overflow-hidden">
          <img
            src={verificationImage}
            alt="Decorative"
            className="object-cover h-full w-full "
          />
        </div>
      </div>
    </div>
  );
};

export default VerificationCodePage;
