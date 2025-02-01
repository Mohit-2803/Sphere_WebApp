import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import SignupForm from "../components/SignupForm";
// import SocialButtons from "../components/SocialButtons";
import logo from "../assets/logo.svg";
import axios from "axios";
import { useState } from "react";
import loginImage from "../assets/20456186.jpg"; // This is the decorative image
import VerificationCodePage from "./VerificationCodePage";

const SignUpPage = () => {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [email, setEmail] = useState(""); // State to store the email
  const [token, setToken] = useState(""); // State to store the token
  const [userId, setUserId] = useState(""); // State to store the userId

  // Function to handle form submission
  const onSubmit = async (data) => {
    try {
      // Sending data to the backend using axios
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        data
      );

      console.log("Response data:", response.data);
      toast.success("Verification code sent to email");

      // Set the email and token state to pass to the next page
      setEmail(data.email);
      setToken(response.data.token);
      setUserId(response.data.userId);

      // Set isCodeSent to true to show the VerificationCodePage
      setIsCodeSent(true);
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error(error.response.data.message);
    }
  };

  // If the code is sent, redirect to VerificationCodePage with email and token as props
  if (isCodeSent) {
    return <VerificationCodePage email={email} token={token} userId={userId} />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Sign Up Form */}
      <div className="min-w-xl max-w-4xl flex items-center justify-center p-4 bg-gradient-to-b">
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
            Create Account
          </h1>
          <p className="text-center text-gray-600">
            Sign up to get started with your account
          </p>

          {/* Sign Up Form */}
          <SignupForm onSubmit={onSubmit} />

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-green-600 hover:text-green-500"
            >
              Log in
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
            className="object-cover h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
