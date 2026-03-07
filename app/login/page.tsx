"use client";
import { useState } from "react";
import { useLogin } from "../../hook/useLogin";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from 'react-hot-toast';


const Page = () => {
  const { login, isLoading,error } = useLogin();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }
    
    const result = await login(email, password);

    if (!result.success) {
      toast.error(result.error || "Login failed");
      return;
    }
    
    toast.success("Login Your Account Successfully");
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

  {/* Right Column - Login Form */}
  <div className="w-1/2 flex items-center justify-center bg-blue-500 px-10">
    <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
      <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Welcome</h1>
      <p className="text-gray-500 mb-8 text-center">Sign in to access your Education Service</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Email</label>
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
            className="absolute top-2.5 right-3 text-gray-500 cursor-pointer"
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

        {/* Signup Link */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Signup
          </a>
        </p>
      </form>
    </div>
  </div>
</div>
  );
};

export default Page;
