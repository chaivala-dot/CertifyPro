import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  loginWithGoogle as apiLoginWithGoogle,
  type AuthUser,
} from "../api/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (params: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadMe = async () => {
      try {
        const me = await getCurrentUser();
        if (!cancelled) {
          setUser(me);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadMe();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const me = await apiLogin({ email, password });
    setUser(me);
  };

  const signup = async (params: {
    email: string;
    password: string;
    name?: string;
  }) => {
    const me = await apiSignup(params);
    setUser(me);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const loginWithGoogle = () => {
    apiLoginWithGoogle();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
