import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Assuming Footer is imported
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Import the Toaster component

const Layout = () => {
  const location = useLocation(); // Access the current route

  // List of routes where the Sidebar should not be shown
  const hideSidebarRoutes = [
    "/",
    "/signup",
    "/login",
    "/terms",
    "/forgot-password",
  ];

  return (
    <>
      {/* Show Navbar only on '/' route */}
      {location.pathname === "/" && <Navbar />}

      {/* Show Sidebar only when NOT in the hideSidebarRoutes */}
      {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}

      {/* Main Content */}
      <Outlet />

      {/* Show Footer only on '/' route */}
      {location.pathname === "/" && <Footer />}

      {/* Toast Notifications Container */}
      <Toaster
        position="top-right" // Position toast at the top right
        reverseOrder={false} // Display toasts in the order they are called
      />
    </>
  );
};

export default Layout;
