/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import { FaRegCompass, FaUserCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const HomePage = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = localStorage.getItem("userId");
  const [followedUsers, setFollowedUsers] = useState([]);
  const navigate = useNavigate();

  // Fetch initial data (suggested users and follow status)
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [homeData, followingResponse] = await Promise.all([
          axios.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/users/getHomeData/${currentUserId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          axios.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/posts/${currentUserId}/following`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
        ]);

        const followingIds = new Set(followingResponse.data);

        // In the fetchHomeData useEffect
        const filteredSuggestions = (homeData.data.suggestedUsers || [])
          .filter((user) => user._id !== currentUserId)
          .map((user) => ({
            ...user,
            isFollowing: followingIds.has(user._id),
          }));

        setSuggestedUsers(filteredSuggestions);
        setFollowedUsers(followingResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, [currentUserId]);

  // Redirect to feed page when user follows 5 accounts
  useEffect(() => {
    if (followedUsers.length >= 5) {
      navigate("/feed");
    }
  }, [followedUsers, navigate]);

  // Search users with debounce and clear results when query is empty
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]); // Clear results when search query is empty
        return;
      }

      try {
        const [searchResponse, followingResponse] = await Promise.all([
          axios.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/users/searchUsers?query=${searchQuery}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          axios.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/users/${currentUserId}/following`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
        ]);

        const followingIds = new Set(followingResponse.data);
        const filteredResults = searchResponse.data
          .filter((user) => user._id !== currentUserId)
          .map((user) => ({
            ...user,
            isFollowing: followingIds.has(user._id),
          }));

        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentUserId]);

  // Handle follow/unfollow action
  const handleFollow = async (userId, isCurrentlyFollowing) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/toggleFollow/${currentUserId}`,
        { targetId: userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update suggested users
      setSuggestedUsers((users) =>
        users.map((user) =>
          user._id === userId
            ? {
                ...user,
                followersCount: response.data.followersCount,
                isFollowing: !isCurrentlyFollowing,
              }
            : user
        )
      );

      // Update search results
      setSearchResults((results) =>
        results.map((user) =>
          user._id === userId
            ? {
                ...user,
                followersCount: response.data.followersCount,
                isFollowing: !isCurrentlyFollowing,
              }
            : user
        )
      );

      // Update followed users list
      if (response.data.action === "follow") {
        setFollowedUsers((prev) => [...prev, userId]);
      } else {
        setFollowedUsers((prev) => prev.filter((id) => id !== userId));
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen bg-[#161f32] text-white">
      {/* Sidebar */}
      <Sidebar />
      <div className="min-h-screen bg-[#161f32] text-gray-100 p-6 ml-[430px] min-w-2xl">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to Sphere! 🌐</h1>
            <p className="text-gray-400">
              Follow at least 5 accounts to start seeing posts in your feed
            </p>
          </div>

          {/* Search Section */}
          <div className="mb-8 relative">
            <div className="flex items-center bg-gray-800 rounded-lg px-4 py-2">
              <FiSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full bg-transparent outline-none text-gray-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-xl z-10">
                {searchResults.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    onFollow={handleFollow}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Suggested Users */}
          <div className="flex flex-col gap-4">
            {suggestedUsers.map((user) => (
              <UserCard key={user._id} user={user} onFollow={handleFollow} />
            ))}
          </div>

          {/* Empty State */}
          {suggestedUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No more suggestions available. Try searching for users!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// UserCard Component
const UserCard = ({ user, onFollow }) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to={`/profile/${user._id}`}>
            {!imageError && user.profilePhoto ? (
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePhoto}`}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover mr-3"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold mr-3">
                {getInitials(user.name)}
              </div>
            )}
          </Link>

          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-gray-400 text-sm">@{user.username}</p>
            <p className="text-sm text-gray-400 mt-1">
              {user.followersCount} followers
            </p>
          </div>
        </div>
        <button
          onClick={() => onFollow(user._id, user.isFollowing)}
          className={`flex items-center ${
            user.isFollowing
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer`}
        >
          {user.isFollowing ? (
            <>
              <FaUserCheck className="mr-2" /> Following
            </>
          ) : (
            <>
              <FiUserPlus className="mr-2" /> Follow
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HomePage;
