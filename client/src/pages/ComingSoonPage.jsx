import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const ComingSoonPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br text-gray-700">
      <div className="text-center space-y-6">
        {/* Lottie Animation */}
        <DotLottieReact
          src="https://lottie.host/cab5f06f-0bd5-45a9-af6e-20a6b923c977/y1yZdgW5Ka.lottie"
          loop
          autoplay
          className="w-80 h-80 mx-auto"
        />

        {/* Heading */}
        <h1 className="text-4xl font-bold">Coming Soon</h1>

        {/* Description */}
        <p className="text-lg font-medium">
          We&apos;re working hard to bring something amazing! Stay tuned for
          updates.
        </p>
      </div>
    </div>
  );
};

export default ComingSoonPage;
