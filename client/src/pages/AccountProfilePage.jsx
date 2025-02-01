/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserPlus, FaUserCheck, FaCommentDots } from "react-icons/fa";
import UserPosts from "../components/UserPosts";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import FollowersFollowingList from "../components/FollowersFollowingList";

const AccountProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showListModal, setShowListModal] = useState(false);
  const [listType, setListType] = useState("followers");

  const currentUserId = localStorage.getItem("userId");
  const isCurrentUser = userId === currentUserId;

  const fetchProfileData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const [profileResponse, postsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/getUser/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/posts/getPosts/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let followingStatus = false;
      if (!isCurrentUser) {
        const currentUserResponse = await axios.get(
          `http://localhost:5000/api/users/getUser/${currentUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const currentUserFollowing =
          currentUserResponse.data.user.following.map((id) => id.toString());
        followingStatus = currentUserFollowing.includes(userId);
      }

      setProfile(profileResponse.data.user);
      setPosts(postsResponse.data.posts || []);
      setIsFollowing(followingStatus);
      setIsLoading(false);
    } catch (error) {
      console.error("Profile load error:", error);
      toast.error("Failed to load profile");
    }
  }, [userId, currentUserId, isCurrentUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handlePostLike = (postId, updatedLikes) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, likes: updatedLikes } : post
      )
    );
  };

  const handleCommentAdded = (postId, newComment) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/users/toggleFollow/${currentUserId}`,
        { targetId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update state based on the toggle action
      setIsFollowing(!isFollowing);

      // Update followers count
      setProfile((prev) => ({
        ...prev,
        followers: isFollowing
          ? prev.followers.filter((id) => id !== currentUserId)
          : [...prev.followers, currentUserId],
        followersCount: isFollowing
          ? prev.followersCount - 1
          : prev.followersCount + 1,
      }));

      toast.success(
        `Successfully ${isFollowing ? "unfollowed" : "followed"} ${
          profile.name
        }`
      );
    } catch (error) {
      console.error("Follow action failed:", error);
      toast.error(
        error.response?.data?.message || "Action failed. Please try again."
      );
    }
  };
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#161f32] text-white p-8 ml-10">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold ml-4">Profile</h1>
        </div>

        {/* Profile Content */}
        <div className="flex items-center justify-between space-x-8 p-8">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center w-1/3">
            <div className="relative">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto || "/default-avatar.png"}
                  alt="Profile"
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
            </div>
          </div>

          {/* Profile Stats */}
          <div className="w-2/3">
            <div className="text-start ml-2">
              <h2 className="text-2xl font-bold mt-4">{profile.name}</h2>
              <p className="text-gray-400">@{profile.username}</p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center mb-5">
              <div
                className="bg-gray-800 p-1 rounded-lg flex flex-row items-center justify-center gap-2 cursor-pointer hover:bg-gray-700"
                onClick={() => {
                  setListType("followers");
                  setShowListModal(true);
                }}
              >
                <p className="text-white text-md font-semibold">
                  {profile.followersCount}
                </p>
                <p className="text-gray-300 text-md">Followers</p>
              </div>
              <div
                className="bg-gray-800 p-1 rounded-lg flex flex-row items-center justify-center gap-2 cursor-pointer hover:bg-gray-700"
                onClick={() => {
                  setListType("following");
                  setShowListModal(true);
                }}
              >
                <p className="text-white text-md font-semibold">
                  {profile.followingCount}
                </p>
                <p className="text-gray-300 text-md">Following</p>
              </div>
              <div className="bg-gray-800 p-1 rounded-lg flex flex-row items-center justify-center gap-2">
                <p className="text-white text-md font-semibold">
                  {posts.length}
                </p>
                <p className="text-gray-300 text-md">Posts</p>
              </div>
            </div>

            {/* Show actions only if viewing another user */}
            {!isCurrentUser && (
              <div className="flex gap-4">
                <button
                  onClick={handleFollow}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    isFollowing
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <FaUserCheck className="mr-2" /> Following
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2" /> Follow
                    </>
                  )}
                </button>

                {isFollowing && (
                  <button
                    className="flex items-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
                    onClick={() => navigate(`/messages/${userId}`)}
                  >
                    <FaCommentDots className="mr-2" /> Message
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
          <ProfileDetail label="Bio" value={profile.bio} />
          <ProfileDetail
            label="Joined"
            value={new Date(profile.createdAt).toLocaleDateString()}
          />
        </div>

        {showListModal && (
          <FollowersFollowingList
            userId={userId}
            listType={listType}
            onClose={() => setShowListModal(false)}
            onFollow={fetchProfileData}
          />
        )}

        {/* User Posts */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 ml-4">Recent Posts</h2>
          <UserPosts
            posts={posts}
            onLikeUpdated={handlePostLike}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      </div>
    </div>
  );
};

// Reusable profile detail component
const ProfileDetail = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400">{label}</label>
    <p className="text-white mt-1">{value || `No ${label.toLowerCase()}`}</p>
  </div>
);

export default AccountProfilePage;
