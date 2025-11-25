// AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import useIdleTimer from "./useIdleTimer.";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("session")
  );

  const login = (data) => {
    sessionStorage.setItem("session", JSON.stringify(data));
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("session");
    setIsAuthenticated(false);
  };

  // Auto logout on inactivity
  useIdleTimer(() => {
    if (isAuthenticated) logout();
  }, 30 * 60 * 1000); // 30 minutes

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
