import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

const SocialButtons = () => {
  return (
    <div className="flex gap-4">
      <button className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50 transition duration-300">
        <FcGoogle className="mr-2" size={20} />
        <span className="text-sm font-medium">Google</span>
      </button>
      <button className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50 transition duration-300">
        <FaFacebook className="mr-2 text-blue-600" size={20} />
        <span className="text-sm font-medium">Facebook</span>
      </button>
    </div>
  );
};

export default SocialButtons;
