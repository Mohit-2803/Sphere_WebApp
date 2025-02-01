/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { FaTimes, FaImage } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "react-avatar";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage"; // Utility function for cropping

const AddPost = ({ onClose }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // Loading state
  const [showCropModal, setShowCropModal] = useState(false); // State to control crop modal

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from localStorage
        const userId = localStorage.getItem("userId"); // Get userId from localStorage

        if (!token || !userId) {
          setLoading(false);
          return; // If no token or userId, exit early
        }

        // Fetch user data from backend using userId as part of the URL
        const response = await axios.get(
          `http://localhost:5000/api/users/getUserName/${userId}`, // Include userId in the URL
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send the token in the request header
            },
          }
        );

        setUser(response.data.user); // Set user data to state
      } catch (error) {
        console.error("Error fetching user data", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchUserData(); // Call the fetch function on component mount
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setShowCropModal(true); // Show crop modal when image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setCroppedImage(null);
    fileInputRef.current.value = "";
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels);
      setCroppedImage(croppedImage);
      setImage(croppedImage); // Set the cropped image as the final image
      setShowCropModal(false); // Close the crop modal
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  // In AddPost.jsx, update the handleSubmit function:
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (content.length === 0) {
        toast.error("Add a description");
        return;
      }
      const formData = new FormData();
      formData.append("content", content);
      formData.append("userId", userId);

      if (image) {
        // Convert cropped image URL to a File object
        const blob = await fetch(croppedImage).then((res) => res.blob());
        const file = new File([blob], "post-image.png", { type: "image/png" });
        formData.append("image", file);
      }

      const response = await axios.post(
        "http://localhost:5000/api/posts/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        toast.success("Post created successfully!");
        onClose();

        // Reload the page to reflect the new post
        window.location.reload();
      }
    } catch (error) {
      toast.error("Error creating post");
      console.error("Error creating post:", error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#161f32] z-50 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#161f32] z-50 overflow-y-auto pt-16">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold">Create New Post</h2>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Post
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Side - Image Upload */}
          <div className="md:w-1/2">
            <div className="border-2 border-dashed border-gray-700 rounded-lg h-96 flex items-center justify-center">
              {croppedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={croppedImage}
                    alt="Cropped Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    <FaTimes className="h-5 w-5 text-white" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <label className="cursor-pointer flex flex-col items-center">
                    <FaImage className="h-16 w-16 text-gray-500 mb-4" />
                    <span className="text-gray-400">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Caption */}
          <div className="md:w-1/2">
            <div className="flex items-center gap-3 mb-4">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <Avatar name={user?.name} size="40" round={true} />
              )}
              <span className="font-medium">{user?.username}</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a caption..."
              className="w-full h-64 bg-gray-800 rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-[#161f32] z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-lg h-96 relative">
            <Cropper
              image={imagePreview}
              crop={crop}
              zoom={zoom}
              aspect={1} // Set aspect ratio (1:1 for square)
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setShowCropModal(false)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Crop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPost;
