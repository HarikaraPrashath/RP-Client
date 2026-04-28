export const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  const token = window.localStorage.getItem("authToken");
  if (token) return token;

  // Fallback: check if it's inside the 'user' object
  try {
    const user = window.localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.token || parsed.user?.token || "";
    }
  } catch (e) {
    return "";
  }
  return "";
};

export const setAuthToken = (token: string) => {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem("authToken", token);
  } else {
    window.localStorage.removeItem("authToken");
  }
};

export const authHeader = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
