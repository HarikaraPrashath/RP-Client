"use client";
import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { User } from "../context/authContext";

export const useLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { dispatch } = useAuthContext();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    // send a POST request to the backend
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      // Check if the response is ok
        const json: User & { message?: string } = await response.json();

      if (!response.ok) {
        const errorMsg = json.message || "Login Failure";
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }

      // Save user to local storage
      localStorage.setItem("user", JSON.stringify(json));
      // If the backend returned a bearer token (DB token), save it for Authorization header
      try {
        if ((json as any).token) {
          localStorage.setItem("authToken", (json as any).token);
        }
      } catch (e) {
        // ignore storage errors
      }
      dispatch({ type: "LOGIN", payload: json }); // give return
      setIsLoading(false);

      return { success: true, error: null };
    } catch (err) {
      const errorMsg = "Something went wrong.";
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  };
  return { login, error, isLoading };
};
