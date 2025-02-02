import { motion } from "framer-motion";

// Staggered animation for features
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const SphereFrontPage = () => {
  // Dynamic floating elements
  const FloatingOrbs = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <motion.div
        key={index}
        className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-500 opacity-20 blur-lg"
        initial={{ x: Math.random() * 100 - 50, y: Math.random() * 100 - 50 }}
        animate={{
          x: [0, Math.random() * 100 - 50, 0],
          y: [0, Math.random() * 100 - 50, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 5 + Math.random() * 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ));
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative h-[650px] flex items-center justify-center overflow-hidden isolate">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,_rgba(79,_70,_229,_0.1)_25%,_transparent_25%),_linear-gradient(-45deg,_rgba(79,_70,_229,_0.1)_25%,_transparent_25%),_linear-gradient(45deg,_transparent_75%,_rgba(79,_70,_229,_0.1)_75%),_linear-gradient(-45deg,_transparent_75%,_rgba(79,_70,_229,_0.1)_75%)] bg-[size:20px_20px] opacity-20" />

        <FloatingOrbs />

        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-gray-900/80 to-purple-900/50"
          animate={{
            background: [
              "linear-gradient(45deg, #4f46e5aa 0%, #1a1a1aaa 50%, #6d28d9aa 100%)",
              "linear-gradient(135deg, #6d28d9aa 0%, #1a1a1aaa 50%, #4f46e5aa 100%)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
        />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1
              className="text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent font-['Inter']"
              initial={{ letterSpacing: "-0.05em" }}
              animate={{ letterSpacing: "0em" }}
              transition={{ duration: 2, delay: 0.5 }}
            >
              Welcome to <span className="text-indigo-400">Sphere</span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 1 }}
            >
              Connect, Share, and Explore the World Through Images
            </motion.p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-gradient-to-br from-indigo-600 to-purple-500 p-[2px] rounded-lg shadow-2xl"
            >
              <a
                href="/signup"
                className="block px-8 py-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-300 text-lg font-medium"
              >
                Get Started
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2
          className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent"
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
        >
          Features
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300 shadow-2xl"
              variants={itemVariants}
              whileHover={{ y: -10, borderColor: "#6366f155" }}
            >
              <motion.div
                className="text-4xl mb-4 inline-block"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* CTA Section */}
      <div className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-gray-900/50 to-purple-900/30" />
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ scale: 0.5 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <h2 className="text-3xl font-bold mb-6">Why Choose Sphere?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Sphere is more than just a social media app. It&apos;s a community
              where you can express yourself, connect with others, and explore
              the world through images. Join us today and be part of something
              extraordinary.
            </p>
            <motion.a
              href="/signup"
              className="inline-block px-8 py-3 bg-gradient-to-br from-indigo-600 to-purple-500 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join Now
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: "📸",
    title: "Post Images",
    desc: "Share your favorite moments with the world. Upload high-quality images and let your creativity shine.",
  },
  {
    icon: "👥",
    title: "Follow/Unfollow",
    desc: "Connect with friends, influencers, and creators. Build your network and stay updated with their latest posts.",
  },
  {
    icon: "❤️",
    title: "Like & Comment",
    desc: "Engage with posts by liking and commenting. Share your thoughts and spread positivity.",
  },
  {
    icon: "💬",
    title: "Chat with Users",
    desc: "Send direct messages to your friends and followers. Stay connected in real-time.",
  },
  {
    icon: "🌍",
    title: "Explore Feed",
    desc: "Discover new content from around the world. Tailored to your interests and preferences.",
  },
  {
    icon: "🌙",
    title: "Dark Theme",
    desc: "Enjoy a sleek and modern dark theme that's easy on the eyes, day or night.",
  },
];

export default SphereFrontPage;
