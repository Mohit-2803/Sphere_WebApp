import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const Layout = () => {
  const location = useLocation();

  const hideSidebarRoutes = [
    "/",
    "/signup",
    "/login",
    "/terms",
    "/forgot-password",
    // "/notifications",
    // "/messages",
    // "/friends",
    // "/home",
    // "/feed",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Show Navbar only on '/' route */}
      {location.pathname === "/" && <Navbar />}

      <div className="flex flex-1">
        {/* Show Sidebar only when NOT in the hideSidebarRoutes */}
        {!hideSidebarRoutes.includes(location.pathname) && (
          <div className="w-64 shrink-0">
            {" "}
            {/* Fixed width for sidebar */}
            <Sidebar />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 bg-gray-800">
          {" "}
          {/* Flexible content area */}
          <Outlet />
        </main>
      </div>

      {/* Show Footer only on '/' route */}
      {location.pathname === "/" && <Footer />}

      {/* Toast Notifications Container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
          },
        }}
      />
    </div>
  );
};

export default Layout;
