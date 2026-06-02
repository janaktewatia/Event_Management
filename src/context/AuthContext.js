import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({});

const STORAGE_KEY = "em_auth_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const login = (userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const hasPermission = (key) => user?.permissions?.includes(key) ?? false;

  // NOTE: inactivity timeout and activity listeners removed temporarily
  // to avoid automatic logouts during testing / development.

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
