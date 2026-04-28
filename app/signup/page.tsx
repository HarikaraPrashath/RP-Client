"use client";
import { useState } from "react";
import { useRegister } from "../../hook/useRegister";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from 'react-hot-toast';



const Page = () => {
  const { register, isLoading, error } = useRegister();
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!name.trim()) {
      toast.error("Please enter your username");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    const result = await register(name, email, password);

    if (!result.success) {
      toast.error(result.error || "Registration failed");
      return;
    }

    toast.success("Register Your Account Successfully");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Full Image */}
      <div className="w-1/2 min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/Images/hero.png')" }}>
        <div className="flex flex-col justify-between min-h-screen p-10 text-white">
          {/* Logo */}
          <div className="flex justify-center pt-10">
            <Image
              src="logo.png"
              alt="Logo"
              width={150}
              height={50}
              className="w-98 h-auto mt-30"
            />
          </div>
          {/* Footer */}
          <div className="text-blue-500 text-sm font-semibold">
            © 2025 Mentora. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Column - Signup Form */}
      <div className="w-1/2 flex items-center justify-center bg-blue-500 px-10">
        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Welcome</h1>
          <p className="text-gray-500 mb-8 text-center">Sign up to access your Education Service</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Username</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block mb-1 text-gray-700 font-medium">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter your password"
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-9 right-4 text-gray-500 cursor-pointer"
                style={{ top: '35px' }}
              >
                {showPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
              </span>
            </div>

            {/* Remember Me & Forgot */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  className="w-4 h-4 mr-2 accent-blue-500"
                />
                Remember me
              </label>
              <a href="/forgot-password" className="text-blue-500 hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 rounded-2xl text-white font-semibold transition ${
                isLoading ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Go To Dashboard..." : "Go To Dashboard"}
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Login
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
