import { useState, useEffect, useCallback } from "react";
import { FaEdit, FaCamera, FaSave, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AddPost from "./AddPost"; // Update path as needed
import { FaPlus } from "react-icons/fa";
import UserPosts from "../components/UserPosts"; // Import the UserPosts component
import FollowersFollowingList from "../components/FollowersFollowingList"; // Update path as needed
import Sidebar from "../components/Sidebar";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    gender: "",
    profilePhoto: null,
  });
  const [showAddPost, setShowAddPost] = useState(false);
  const [posts, setPosts] = useState([]); // State to store user posts
  const [showListModal, setShowListModal] = useState(false);
  const [listType, setListType] = useState("followers");

  useEffect(() => {
    return () => {
      if (profile && profile?.photoURL) {
        URL.revokeObjectURL(profile?.photoURL);
      }
    };
  }, [profile]);

  // Fetch user data from the backend
  const fetchUserProfile = useCallback(async () => {
    try {
      console.log(
        "import.meta.env.VITE_BACKEND_URL",
        import.meta.env.VITE_BACKEND_URL
      );
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/getUser/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("response.data.user", response.data.user);
      if (response.data.user) {
        setProfile(response.data.user);
      } else {
        console.error("User data not found in response");
      }
      const postsResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/getPosts/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(postsResponse.data.posts || []);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  // Update your useEffect to use the callback
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Add this function to update posts with new comments
  const handleCommentAdded = (postId, newComment) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );
  };

  const handleLikeUpdated = (postId, updatedLikes) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, likes: updatedLikes } : post
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const photoURL = URL.createObjectURL(file); // Create a URL for the file
      setProfile({ ...profile, profilePhoto: file, photoURL }); // Store file object and URL
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (profile.name.length > 15) {
        toast.error("Name is too long");
        return;
      } else if (profile.name.length < 3) {
        toast.error("Name is too short");
        return;
      }

      if (profile.username.length > 15) {
        toast.error("UserName is too long");
        return;
      } else if (profile.username.length < 3) {
        toast.error("UserName is too short");
        return;
      }

      if (profile.bio.length > 60) {
        toast.error("Bio is too long");
        return;
      } else if (profile.bio.length < 10) {
        toast.error("Bio is too short");
        return;
      }

      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("username", profile.username);
      formData.append("bio", profile.bio);
      formData.append("gender", profile.gender);
      if (profile.profilePhoto) {
        formData.append("profilePhoto", profile.profilePhoto);
      }

      // Send the PUT request and capture the response
      const response = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/updateUserProfile/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the profile state with the server's response
      setProfile((prev) => ({
        ...prev,
        ...response.data.user, // Merges updated fields from the server
        profilePhoto: response.data.user.profilePhoto,
        photoURL: null, // Clear temporary URL
      }));

      setIsEditing(false);
      window.dispatchEvent(new Event("userProfileUpdated")); // Add this line
      toast.success("profile Updated successfully");
    } catch (error) {
      if (error.response.data.message === "Username is already taken") {
        toast.error(error.response.data.message);
      }
      console.error("Error saving profile:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="flex min-h-screen bg-[#161f32] text-white">
      {/* Sidebar */}
      <Sidebar />
      <div className="min-h-screen bg-[#161f32] text-white p-8 ml-[420px]">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold">Profile</h1>
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                <FaSave className="mr-2" /> Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                <FaEdit className="mr-2" /> Edit Profile
              </button>
            )}
          </div>

          <div className="flex items-center justify-between space-x-8 p-8">
            {/* Left Section - Profile Picture */}
            <div className="flex flex-col items-center w-1/3">
              <div className="relative">
                {profile.photoURL || profile.profilePhoto ? (
                  <img
                    src={profile?.photoURL || profile?.profilePhoto} // Use photoURL if available
                    alt="Profile picture"
                    className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-gray-700 text-white text-3xl font-bold rounded-full border-4 border-blue-500">
                    {profile.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer">
                    <FaCamera className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Right Section - Profile Details */}
            <div className="w-2/3">
              <div className="text-start ml-2">
                <h2 className="text-2xl font-bold mt-4">{profile.name}</h2>
                <p className="text-gray-400">@{profile.username}</p>
              </div>

              {/* Stats (Followers, Following, Posts) */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div
                  className="bg-gray-800 p-1 rounded-lg flex flex-row items-center gap-1.5 justify-center cursor-pointer hover:bg-gray-700"
                  onClick={() => {
                    setListType("followers");
                    setShowListModal(true);
                  }}
                >
                  <p className="text-white text-lg font-semibold">
                    {profile.followersCount}
                  </p>
                  <p className="text-gray-400 text-md">Followers</p>
                </div>
                <div
                  className="bg-gray-800 p-1 rounded-lg flex flex-row items-center gap-1.5 justify-center cursor-pointer hover:bg-gray-700"
                  onClick={() => {
                    setListType("following");
                    setShowListModal(true);
                  }}
                >
                  <p className="text-white text-lg font-semibold">
                    {profile.followingCount}
                  </p>
                  <p className="text-gray-400 text-md">Following</p>
                </div>
                <div className="bg-gray-800 p-1 rounded-lg flex flex-row items-center gap-1.5 justify-center">
                  <p className="text-white tlgt-xl font-semibold">
                    {posts?.length}
                  </p>
                  <p className="text-gray-400 text-md">Posts</p>
                </div>
              </div>

              {/* New Post Button */}
              <div className="mt-6 flex justify-start">
                <button
                  onClick={() => setShowAddPost(true)}
                  className="flex flex-row items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-105 cursor-pointer"
                >
                  <FaPlus className="h-3 w-3" />
                  <span className="text-sm font-medium pr-1">New Post</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                  />
                ) : (
                  <p className="text-white">{profile.name}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                  />
                ) : (
                  <p className="text-white">@{profile.username}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg resize-none"
                    rows="5"
                  />
                ) : (
                  <p className="text-white">{profile.bio}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Gender
                </label>
                {isEditing ? (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={profile.gender === "male"}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Male
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={profile.gender === "female"}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Female
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={profile.gender === "other"}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Other
                    </label>
                  </div>
                ) : (
                  <p className="text-white capitalize">{profile.gender}</p>
                )}
              </div>
            </div>
          </div>

          {/* User Posts */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 ml-2.5">Posts</h2>
            <UserPosts
              posts={posts}
              onCommentAdded={handleCommentAdded}
              onLikeUpdated={handleLikeUpdated}
            />
          </div>

          {/* Logout Button */}
          <div className="mt-8 flex justify-start">
            <button
              onClick={openLogoutModal}
              className="flex items-center bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeLogoutModal}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
        {showAddPost && (
          <AddPost
            onClose={() => setShowAddPost(false)}
            setPosts={setPosts} // Pass setPosts as a prop
          />
        )}

        {showListModal && (
          <FollowersFollowingList
            userId={localStorage.getItem("userId")} // Current user's profile
            listType={listType}
            onClose={() => setShowListModal(false)}
            onFollow={fetchUserProfile} // Refresh profile data after follow action
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
