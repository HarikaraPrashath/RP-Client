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
    <div
      className="min-h-screen "
      style={{ backgroundImage: "url('/Images/bg.png')" }}
    >
      <div className="grid grid-cols-[30%_70%] min-h-screen b">
        {/* Left Column */}
        <div className="">
          {/* Logo */}
          <div className="flex items-center justify-center pt-10">
         
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
            <h1 className="text-5xl md:text-6xl font-bold mb-2">Welcome</h1>
            <p className="text-lg mb-8">Sign up to access your EMR Dashboard</p>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl  px-8 py-6 w-full max-w-md  "
            >
              {/* Username */}
              <div className="mb-4">
                <label className="block mb-1 text-white">Username</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border bg-white text-black border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="Enter your username"
                />
              </div>

              {/* email */}
              <div className="mb-4">
                <label className="block mb-1  text-white">E-mail Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border bg-white text-black border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="Enter your Email"
                />
              </div>

              {/*  Password */}
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

              {/* Remember Me and Forgot */}
              <div className="flex justify-between items-center mb-6 text-sm">
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mr-2 appearance-none border-2 border-white rounded-sm bg-transparent checked:bg-white checked:border-white checked:accent-white focus:outline-none"
                  />
                  Remember me
                </label>
                <a
                  href="/ForgotPassword"
                  className="text-white hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-green-900 hover:bg-green-950 text-white font-semibold py-2 rounded-2xl transition ${
                  isLoading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-green-700"
                }`}
              >
                {isLoading ? " Go To Dashboard..." : " Go To Dashboard"}
              </button>

              {/* Already have account */}
              <p className="text-center text-white text-sm mt-6">
                Already have an account?{" "}
                <a href="/login" className="text-green-600 hover:underline">
                  Login
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
