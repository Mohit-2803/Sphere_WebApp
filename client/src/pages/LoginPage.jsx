import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm"; // Your login form component
// import SocialButtons from "../components/SocialButtons"; // Your social buttons component
import logo from "../assets/logo.svg"; // Your logo image
import loginImage from "../assets/20456186.jpg"; // The decorative image for the right side
import { motion } from "framer-motion";
import VerificationCodePage from "./VerificationCodePage"; // Verification page

const LoginPage = () => {
  const [loading, setLoading] = useState(false); // For handling loading state
  const [email, setEmail] = useState(""); // To store the email
  const [token, setToken] = useState(""); // To store the token
  const [userId, setUserId] = useState(""); // To store the userId
  const [isVerified, setIsVerified] = useState(true); // To check if the user is verified
  const navigate = useNavigate(); // For redirecting the user to home page

  // Handle login and send request to backend
  const handleLogin = async (email, password) => {
    try {
      setLoading(true); // Show loading indicator during the request
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      if (response.status === 200) {
        const { token, user } = response.data;

        // User is verified, store the token and redirect to the home page
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.userId);
        toast.success("Login successful!");
        navigate("/profile");
      }
    } catch (error) {
      // Check for error message and handle accordingly
      if (error.response && error.response.data) {
        const { message, token, userId } = error.response.data;
        if (message === "Invalid email or password") {
          toast.error("Invalid credentials");
        } else if (
          message ===
          "Your account is not verified. A new verification code has been sent to your email."
        ) {
          toast.error("Your account is not verified.");

          // If the user is not verified, store email and token for later
          setEmail(email); // Store email
          setToken(token); // Store token from error response
          setUserId(userId); // Store userId from error response
          setIsVerified(false); // Set isVerified to false to show the verification page
        } else if (message === "User not found") {
          toast.error("User not found");
        }
      } else {
        toast.error("An unexpected error occurred.");
      }

      console.error("Login failed:", error);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // If user is not verified, show the verification page, otherwise show login page
  if (!isVerified) {
    return <VerificationCodePage email={email} token={token} userId={userId} />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
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
            Welcome Back
          </h1>
          <p className="text-center text-gray-600">
            Sign in to continue to your account
          </p>

          {/* Login Form */}
          <LoginForm handleLogin={handleLogin} loading={loading} />

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="font-semibold text-purple-600 hover:text-purple-500"
            >
              Sign up
            </a>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Decorative Image */}
      <div className="hidden md:block relative w-2/3">
        {/* To have the image overflow partially off-screen, we wrap it in a container with overflow-hidden */}
        <div className="absolute top-0 right-0 h-full w-full overflow-hidden">
          <img
            src={loginImage}
            alt="Decorative"
            className="object-cover h-full w-full "
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
