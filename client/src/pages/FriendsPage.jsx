import { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch, FiUserPlus, FiUserCheck, FiUsers } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";

const FriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [activeTab, setActiveTab] = useState("following");
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = localStorage.getItem("userId");

  // Fetch initial following and followers
  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        const token = localStorage.getItem("token");

        const followingRes = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/users/${currentUserId}/following`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const followersRes = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/users/${currentUserId}/followers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setFollowing(followingRes.data.following);
        setFollowers(followersRes.data.followers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching relationships:", error);
        setIsLoading(false);
      }
    };

    fetchRelationships();
  }, [currentUserId]);

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

        // Make sure to extract the 'following' property
        const followingArray = followingResponse.data.following;
        const followingIds = new Set(followingArray.map((user) => user._id));

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

  const handleFollowToggle = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/toggleFollow/${currentUserId}`,
        { targetId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Re-fetch relationships after toggling follow
      const followingRes = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/${currentUserId}/following`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowing(followingRes.data.following);
    } catch (error) {
      console.error("Follow toggle error:", error);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#161f32] text-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="flex items-center bg-gray-800 rounded-lg px-4 py-3">
            <FiSearch className="text-gray-400 mr-3" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-transparent outline-none placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-gray-900 rounded-lg shadow-xl z-10">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0"
                >
                  <div className="flex items-center">
                    <Link to={`/profile/${user._id}`}>
                      {user.profilePhoto ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${
                            user.profilePhoto
                          }`}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-600 rounded-full mr-4">
                          {user.name[0].toUpperCase()}
                        </div>
                      )}
                    </Link>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollowToggle(user._id)}
                    className={`flex items-center px-4 py-2 rounded-full text-sm cursor-pointer ${
                      following.some((u) => u._id === user._id)
                        ? "bg-gray-600 text-gray-300"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {following.some((u) => u._id === user._id) ? (
                      <>
                        <FiUserCheck className="mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="mr-2" />
                        Follow
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            className={`flex-1 py-3 text-center ${
              activeTab === "following"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("following")}
          >
            <FiUsers className="inline mr-2" />
            Following ({following.length})
          </button>
          <button
            className={`flex-1 py-3 text-center ${
              activeTab === "followers"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("followers")}
          >
            <FiUsers className="inline mr-2" />
            Followers ({followers.length})
          </button>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {(activeTab === "following" ? following : followers).map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <Link to={`/profile/${user._id}`}>
                  {user.profilePhoto ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${
                        user.profilePhoto
                      }`}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-600 rounded-full mr-4">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                </Link>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                  {user.bio && (
                    <p className="text-sm mt-1 text-gray-400">{user.bio}</p>
                  )}
                </div>
              </div>
              {activeTab === "followers" &&
                !following.some((u) => u._id === user._id) && (
                  <button
                    onClick={() => handleFollowToggle(user._id)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm cursor-pointer"
                  >
                    <FiUserPlus className="mr-2" />
                    Follow Back
                  </button>
                )}
            </div>
          ))}

          {activeTab === "following" && following.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              You&apos;re not following anyone yet
            </div>
          )}

          {activeTab === "followers" && followers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              You don&apos;t have any followers yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
