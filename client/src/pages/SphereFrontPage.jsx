import { motion } from "framer-motion";

const SphereFrontPage = () => {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Hero Section */}
      <div className="relative h-[550px] flex items-center justify-center bg-gradient-to-r from-indigo-900 to-gray-900 overflow-hidden">
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-gray-900 opacity-50"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        ></motion.div>

        {/* Hero Content */}
        <div className="relative z-10 text-center">
          <motion.h1
            className="text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Welcome to <span className="text-indigo-500">Sphere</span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Connect, Share, and Explore the World Through Images
          </motion.p>
          <motion.a
            href="/signup"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.a>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Post Images */}
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-indigo-500 text-4xl mb-4">📸</div>
            <h3 className="text-2xl font-semibold mb-2">Post Images</h3>
            <p className="text-gray-300">
              Share your favorite moments with the world. Upload high-quality
              images and let your creativity shine.
            </p>
          </motion.div>

          {/* Feature 2: Follow/Unfollow */}
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-indigo-500 text-4xl mb-4">👥</div>
            <h3 className="text-2xl font-semibold mb-2">Follow/Unfollow</h3>
            <p className="text-gray-300">
              Connect with friends, influencers, and creators. Build your
              network and stay updated with their latest posts.
            </p>
          </motion.div>

          {/* Feature 3: Like & Comment */}
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-indigo-500 text-4xl mb-4">❤️</div>
            <h3 className="text-2xl font-semibold mb-2">Like & Comment</h3>
            <p className="text-gray-300">
              Engage with posts by liking and commenting. Share your thoughts
              and spread positivity.
            </p>
          </motion.div>

          {/* Feature 4: Chat with Users */}
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-indigo-500 text-4xl mb-4">💬</div>
            <h3 className="text-2xl font-semibold mb-2">Chat with Users</h3>
            <p className="text-gray-300">
              Send direct messages to your friends and followers. Stay connected
              in real-time.
            </p>
          </motion.div>

          {/* Feature 5: Explore Feed */}
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-indigo-500 text-4xl mb-4">🌍</div>
            <h3 className="text-2xl font-semibold mb-2">Explore Feed</h3>
            <p className="text-gray-300">
              Discover new content from around the world. Tailored to your
              interests and preferences.
            </p>
          </motion.div>

          {/* Feature 6: Dark Theme */}
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-indigo-500 text-4xl mb-4">🌙</div>
            <h3 className="text-2xl font-semibold mb-2">Dark Theme</h3>
            <p className="text-gray-300">
              Enjoy a sleek and modern dark theme that&apos;s easy on the eyes,
              day or night.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Ads Section */}
      <div className="bg-gray-800 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Why Choose Sphere?</h2>
          <p className="text-gray-300 mb-8">
            Sphere is more than just a social media app. It&apos;s a community
            where you can express yourself, connect with others, and explore the
            world through images. Join us today and be part of something
            extraordinary.
          </p>
          <a
            href="/signup"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Join Now
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 text-center text-gray-400">
        <p>&copy; 2023 Sphere. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SphereFrontPage;
