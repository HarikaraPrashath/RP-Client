export const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("authToken") || "";
};

export const setAuthToken = (token: string) => {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem("authToken", token);
  } else {
    window.localStorage.removeItem("authToken");
  }
};

export const authHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
