import { useState, useEffect, useCallback } from "react";

interface InternetIdentityHook {
  isAuthenticated: boolean;
  identity: string | null;
  principal: string | null;
  login: () => Promise<void>;
  logout: () => void;
  isInitializing: boolean;
  isLoggingIn: boolean;
}

export function useInternetIdentity(): InternetIdentityHook {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState<string | null>(null);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const storedIdentity = localStorage.getItem("ii_identity");
    const storedPrincipal = localStorage.getItem("ii_principal");
    
    if (storedIdentity && storedPrincipal) {
      setIdentity(storedIdentity);
      setPrincipal(storedPrincipal);
      setIsAuthenticated(true);
    }
    setIsInitializing(false);
  }, []);

  const login = useCallback(async () => {
    try {
      setIsLoggingIn(true);
      // For development, simulate Internet Identity login
      // In production, this would use @dfinity/internet-identity
      const mockPrincipal = "rrkah-fqaaa-aaaaa-aaaaq-cai";
      const mockIdentity = "dev-identity-" + Date.now();
      
      localStorage.setItem("ii_identity", mockIdentity);
      localStorage.setItem("ii_principal", mockPrincipal);
      
      setIdentity(mockIdentity);
      setPrincipal(mockPrincipal);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ii_identity");
    localStorage.removeItem("ii_principal");
    setIdentity(null);
    setPrincipal(null);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    identity,
    principal,
    login,
    logout,
    isInitializing,
    isLoggingIn,
  };
}
