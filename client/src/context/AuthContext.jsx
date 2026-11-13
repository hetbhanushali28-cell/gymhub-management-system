import { createContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

export const AuthContext = createContext();

const parseErrorMessage = (err, fallback) => {
  const data = err.response?.data;
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.message).join(". ");
  }
  return data?.message || fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem("user");
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    // Load stored user on initial mount
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }

    // Listen for unauthorized 401 events from Axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
      setError("Your session has expired. Please log in again.");
    };

    // Sync logout across multiple tabs
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        if (!e.newValue) {
          setUser(null);
        } else {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
        }
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post("/auth/login", { email, password });
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      const msg = parseErrorMessage(err, "Login failed");
      setError(msg);
      throw err;
    }
  };

  const register = async (name, email, password, membershipTier = "VIP Elite") => {
    try {
      setError(null);
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        membershipTier,
      });
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      const msg = parseErrorMessage(err, "Registration failed");
      setError(msg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, clearError, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
