import { useEffect, useState } from "react";
import axios from "axios";
import { FaRegCompass } from "react-icons/fa";
import Post from "../components/Post";
import RightSidebar from "../components/RightSidebar"; // Right sidebar for follow suggestions
import LoadingSpinner from "../components/LoadingSpinner";
import Sidebar from "../components/Sidebar";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        // Fetch feed posts
        const feedResponse = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/posts/getFeedPosts/${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Fetch suggested users for follow recommendations
        const suggestionsResponse = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/users/suggestedUsers/${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Process posts
        const rawPosts = Array.isArray(feedResponse?.data?.posts)
          ? feedResponse.data.posts
          : Array.isArray(feedResponse?.data)
          ? feedResponse.data
          : [];

        setPosts(processPosts(rawPosts));
        setSuggestedUsers(suggestionsResponse.data.suggestedUsers || []);
        setError("");
      } catch (error) {
        console.error("Feed fetch error:", error);
        setError("Failed to load feed. Please try again later.");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    const processPosts = (postsArray) => {
      const safePosts = Array.isArray(postsArray) ? postsArray : [];

      return [...safePosts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by creation date
        .reduce((acc, post, index) => {
          if (
            index === 0 ||
            post.user?._id !== safePosts[index - 1].user?._id
          ) {
            acc.push(post);
          }
          return acc;
        }, []);
    };

    fetchFeedData();
  }, [currentUserId]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen bg-[#161f32] text-white">
      {/* Sidebar */}
      <Sidebar />
      <div className="min-h-screen bg-[#161f32] text-gray-100 p-4 flex pt-0 ml-[400px] min-w-3xl">
        {/* Main Feed Section */}
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-2xl font-bold mb-6 flex items-center text-white pt-5">
            <FaRegCompass className="mr-2" /> Your Feed
          </h1>

          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No posts to show. Follow more users to see their content!</p>
            </div>
          ) : (
            posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                className="mb-6 bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
              />
            ))
          )}
        </div>

        {/* Right Sidebar with Follow Suggestions */}
        <div className="fixed top-0 right-0 w-80 overflow-y-auto">
          <RightSidebar suggestedUsers={suggestedUsers} />
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
