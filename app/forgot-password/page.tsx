"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data.message);
      } else {
        setMessage(data.message);
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
              onSubmit={handleSubmit}
              className="rounded-2xl  px-8 py-6 w-full max-w-md  "
            >
              {/* Username */}
              <div className="mb-4">
                <label className="block mb-1 text-white">Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border text-black bg-white border-gray-300 mb-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="Enter your email"
                />

                {/* Success Message */}
                {message && (
                  <p className="text-green-100 text-sm text-center -mt-9 flex items-center justify-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-circle-check-big"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                    {message}
                  </p>
                )}

                {/* Error Message */}
                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}
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
                {isLoading ? " Send Rest Link..." : " Send Rest Link"}
              </button>
              {/* Messages */}

              {/* Already have account */}
              <p className="text-center text-white text-sm mt-6">
                Back to Login{" "}
                <Link href="/" className="text-green-600 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
