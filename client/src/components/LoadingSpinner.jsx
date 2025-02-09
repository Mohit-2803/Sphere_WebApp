/* eslint-disable react/prop-types */
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LoadingSpinner = ({
  size = "10",
  color = "border-blue-500",
  useLottie = true, // Toggle Lottie animation
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-3 bg-[#161f32]">
      {/* Lottie Animation or Spinner */}
      {useLottie ? (
        <DotLottieReact
          src="https://lottie.host/42794b7a-8bd7-4eaf-8eab-c113640c180e/xeTdWdsAYV.lottie"
          loop
          autoplay
          style={{ width: "200px", height: "200px" }} // Adjust size as needed
        />
      ) : (
        <div
          className={`w-${size} h-${size} border-4 border-t-transparent ${color} rounded-full animate-spin`}
        ></div>
      )}
    </div>
  );
};

export default LoadingSpinner;
