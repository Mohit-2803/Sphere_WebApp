/* eslint-disable react/prop-types */
import { useState } from "react"; // Import useState for managing password visibility
import { toast } from "react-hot-toast";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons

const SignupForm = ({ onSubmit }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for toggling password visibility
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    termsAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // State for tracking form submission status

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value, // Handle checkbox vs input fields
    }));
  };

  // Validation function
  const validateForm = () => {
    // Username Validation
    if (
      !formData.username ||
      formData.username.length < 3 ||
      formData.username.length > 20
    ) {
      toast.error("Username must be between 3 and 20 characters.");
      return false;
    }

    // Fullname Validation
    if (
      !formData.fullname ||
      formData.fullname.length < 3 ||
      formData.fullname.length > 50
    ) {
      toast.error("Full name must be between 3 and 50 characters.");
      return false;
    }

    // Email Validation
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email address.");
      return false;
    }

    // Password Validation
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }

    // Terms and Conditions Validation
    if (!formData.termsAccepted) {
      toast.error("You must accept the terms and conditions.");
      return false;
    }

    return true; // All validations passed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable button when submitting

    const isValid = validateForm(); // Validate form input
    if (!isValid) {
      setIsSubmitting(false); // Re-enable if validation fails
      return;
    }

    try {
      await onSubmit(formData); // Try sending data
    } catch (error) {
      // Handle API errors
      console.error("Signup Error:", error);
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      // Ensure button is always re-enabled, even if an error occurs
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto min-w-80"
    >
      {/* Username Input */}
      <div className="relative">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>

      {/* Full Name Input */}
      <div className="relative">
        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          value={formData.fullname}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>

      {/* Email Input */}
      <div className="relative">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>

      {/* Password Input */}
      <div className="relative">
        <input
          type={isPasswordVisible ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full pl-10 pr-12 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className="absolute right-3 top-2.5 text-gray-400"
        >
          {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="termsAccepted"
          checked={formData.termsAccepted}
          onChange={handleChange}
          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <label htmlFor="terms" className="text-sm text-gray-600">
          I agree to the{" "}
          <a href="/terms" className="text-green-600 hover:text-green-500">
            Terms and Conditions
          </a>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting} // Disable the button when submitting
        className={`w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300 cursor-pointer ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isSubmitting ? "Submitting..." : "Sign Up"}{" "}
        {/* Show "Submitting..." when in submitting state */}
      </button>
    </form>
  );
};

export default SignupForm;
