import { useRouter } from "next/navigation";
import { useAuthContext } from "./useAuthContext";

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const router = useRouter();

  const logout = () => {
    //remove storage
    localStorage.removeItem("user");

    //dispatch logout action
    dispatch({ type: "LOGOUT" });
    setTimeout(() => {
      router.push("/");
    }, 200);
  };

  return { logout };
};
