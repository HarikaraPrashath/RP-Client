"use client";
import {
  createContext,
  useEffect,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

//Define use type
export interface User {
  id: string;
  email: string;
  token?: string;
}

//Define state and action types
interface AuthState {
  user: User | null;
}

interface AuthAction {
  type: "LOGIN" | "LOGOUT";
  payload?: User;
}

interface AuthContextType extends AuthState {
  dispatch: Dispatch<AuthAction>;
}

//create the context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

//Reduce function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload || null }; //actual data being sent
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

//context provider
export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null });

  // Check local storage for user data on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      dispatch({ type: "LOGIN", payload: parsedUser });
    }
  }, []);

  // Provide the context to children components
  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
