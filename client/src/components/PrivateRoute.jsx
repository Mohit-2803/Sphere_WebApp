/* eslint-disable react/prop-types */
import { Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// PrivateRoute component to protect routes
const PrivateRoute = ({ element: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/verify-token`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        if (error.response?.data?.message === "Invalid token") {
          toast.error("Session expired, please log in again.");
        } else {
          toast.error("An error occurred, please try again.");
        }
        setIsAuthenticated(false);
        navigate("/login");
      }
    };

    verifyToken();
  }, [navigate, token]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show a loading message while we verify the token
  }

  // If authenticated, render the requested component; otherwise, redirect to login page
  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;
