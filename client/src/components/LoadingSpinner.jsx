/* eslint-disable react/prop-types */
const LoadingSpinner = ({ size = "10", color = "border-blue-500" }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-3 bg-[#161f32]">
      {/* Spinner Animation */}
      <div
        className={`w-${size} h-${size} border-4 border-t-transparent ${color} rounded-full animate-spin`}
      ></div>

      {/* Loading Text */}
      <p className="text-gray-300 text-sm animate-pulse">
        Loading, please wait...
      </p>
    </div>
  );
};

export default LoadingSpinner;
