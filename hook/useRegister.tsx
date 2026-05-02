"use client";

import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { User } from "../context/authContext";

export const useRegister = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { dispatch } = useAuthContext();

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    if (!name || !email || !password) {
      const errorMsg = "All fields are required";
      setIsLoading(false);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // send a POST request to the backend
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies in the request
          // This is important if your server uses cookies for session management
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );
      const json: User & { message?: string } = await response.json();

      if (!response.ok) {
        const errorMsg = json.message || "Registration failed";
        setIsLoading(false);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Save user to local storage
      localStorage.setItem("user", JSON.stringify(json));
      if (json.token) {
        localStorage.setItem("authToken", json.token);
      }
      dispatch({ type: "LOGIN", payload: json });
      setIsLoading(false);
      return { success: true, error: null };
    } catch (err) {
      const errorMsg = "Something went wrong";
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  };
  return { register, isLoading, error };
};
