import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import Layout from "./layout";
import SignUpPage from "./pages/SignUpPage";
import PrivateRoute from "./components/PrivateRoute";
import HomePage from "./pages/HomePage";
import FriendsPage from "./pages/FriendsPage";
import ProfilePage from "./pages/ProfilePage";
import FeedPage from "./pages/FeedPage";
import AccountProfilePage from "./pages/AccountProfilePage";
import { SocketProvider } from "./context/SocketContext";
import MessagePage from "./pages/MessagesPage";
import MessageChat from "./pages/MessageChat";
import TermsAndConditions from "./pages/TermsAndConditions";
import SphereFrontPage from "./pages/SphereFrontPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import NotificationPage from "./pages/NotificationPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      {/* Public routes */}
      <Route index element={<SphereFrontPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignUpPage />} />
      <Route path="terms" element={<TermsAndConditions />} />

      {/* coming soon routes */}
      <Route path="forgot-password" element={<ComingSoonPage />} />
      <Route path="saved" element={<ComingSoonPage />} />
      <Route path="settings" element={<ComingSoonPage />} />

      {/* Protected Routes */}
      <Route path="home" element={<PrivateRoute element={HomePage} />} />
      <Route path="profile" element={<PrivateRoute element={ProfilePage} />} />
      <Route
        path="profile/:userId"
        element={<PrivateRoute element={AccountProfilePage} />}
      />
      <Route path="friends" element={<PrivateRoute element={FriendsPage} />} />
      <Route
        path="notifications"
        element={<PrivateRoute element={NotificationPage} />}
      />
      <Route path="feed" element={<PrivateRoute element={FeedPage} />} />
      <Route path="messages" element={<PrivateRoute element={MessagePage} />} />
      <Route
        path="messages/:userId"
        element={<PrivateRoute element={MessageChat} />}
      />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  </React.StrictMode>
);
