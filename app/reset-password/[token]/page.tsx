"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isloading, setIsLoading] = useState(false);

  // Function to handle password reset
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    // Validate password and confirm password
    if (confirmPassword !== password) {
      setError("Passwords do not match");
      alert("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Send a POST request to reset the password
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      // Check if the response is ok
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Invalid or expired token");
      } else {
        setMessage(data.message || "Password reset successful!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setError("Server error");
    }

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen "
      style={{ backgroundImage: "url('/Images/bg.png')" }}
    >
      <div className="grid grid-cols-[30%_70%] min-h-screen b">
        {/* Left Column */}
        <div className="">
          {/* Logo */}
          <div className="flex items-center justify-center pt-10">
            <Image
              src="/Images/logo.png"
              alt="Logo"
              width={150}
              height={50}
              className="w-48 h-auto"
            />
          </div>

          {/* Footer Text */}
          <div className="absolute bottom-8 left-8 text-gray-700 text-sm font-semibold">
            © 2025 MediSync. All rights reserved.
          </div>
        </div>

        {/* Right Column */}
        <div
          className="w-full h-full bg-cover bg-center "
          style={{ backgroundImage: "url('/Images/hero.png')" }}
        >
          {/* Login Form */}
          <div className=" flex flex-col items-center justify-center h-full ml-50 text-white px-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-2">
              Reset Password
            </h1>
            <p className="text-lg mb-8">
              Enter your email address to reset your password
            </p>

            <form
              onSubmit={handleReset}
              className="rounded-2xl  px-8 py-6 w-full max-w-md  "
            >
              {/* password setup */}
              <div className="mb-4 relative">
                <label className="block mb-1 text-white">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border bg-white text-black border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white pr-10"
                  placeholder="Enter your password"
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-9 right-4 text-gray-500 cursor-pointer"
                >
                  {showPassword ? (
                    <AiOutlineEye size={20} />
                  ) : (
                    <AiOutlineEyeInvisible size={20} />
                  )}
                </span>
              </div>

              {/* Confirm Password */}
              <div className="mb-4 relative">
                <label className="block mb-1 text-white">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border bg-white text-black border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white pr-10"
                  placeholder="Confirm your password"
                />
                <span
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute top-9 right-4 text-gray-500 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <AiOutlineEye size={20} />
                  ) : (
                    <AiOutlineEyeInvisible size={20} />
                  )}
                </span>
              </div>

              {/* password description */}
              <div className="mb-4  text-white backdrop-blur-md bg-white/10 border border-white/20 rounded-md shadow-lg p-4">
                <h1 className="text-2xl pb-2">Password Requirement</h1>
                <p>
                  <span className="pr-2 text-sm">X</span> Minimum 8 Characters
                </p>
                <p>
                  <span className="pr-2 text-sm">X</span> At least one uppercase
                  letter
                </p>
                <p>
                  <span className="pr-2 text-sm">X</span> At least one lowercase
                  letter
                </p>
                <p>
                  <span className="pr-2 text-sm">X</span> At least one number
                </p>
                <p>
                  <span className="pr-2 text-sm">X</span> At least one special
                  character
                </p>
                <p>
                  <span className="pr-2 text-sm">X</span> Password Match
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isloading}
                className={`w-full bg-green-900 hover:bg-green-950 text-white font-semibold py-2 rounded-2xl transition ${
                  isloading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-green-700"
                }`}
              >
                {isloading ? "Rest Password..." : " Reset Password"}
              </button>
              {/* Messages */}
              {message && <p className="text-green-200 text-sm">{message}</p>}
              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="reset"
                disabled={isloading}
                className={`w-full bg-transparent text-white mt-2 border-2 font-semibold py-2 rounded-2xl transition ${
                  isloading
                    ? "bg-blue-300 cursor-not-allowed"
                    : " border-white hover:border-white cursor-pointer"
                }`}
              >
                {isloading ? "Canceling..." : "Cancel"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
