/* eslint-disable react/prop-types */
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

const LoginForm = ({ handleLogin, loading }) => {
  // State to hold form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for toggling password visibility

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation logic
    if (!email || !password) {
      toast.error("Please fill in both email and password!");
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    // Call the handleLogin function passed from the parent
    handleLogin(email, password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 items-center justify-center min-w-80"
    >
      {/* Email Input */}
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <Mail className="absolute left-3 top-[12px] text-gray-400" size={18} />
      </div>

      {/* Password Input */}
      <div className="relative">
        <input
          type={isPasswordVisible ? "text" : "password"} // Toggle the type based on visibility state
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <Lock className="absolute left-3 top-[11px] text-gray-400" size={18} />

        {/* Eye Icon for toggling password visibility */}
        <div
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className="absolute right-3 top-2.5 cursor-pointer text-gray-400"
        >
          {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </div>
      </div>

      {/* Forgot Password */}
      <div className="flex justify-end">
        <a
          href="/forgot-password"
          className="text-sm text-purple-600 hover:text-purple-500"
        >
          Forgot password?
        </a>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full py-2 rounded-lg transition duration-300 cursor-pointer ${
          loading
            ? "bg-purple-500 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-800 text-white"
        }`}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};

export default LoginForm;
