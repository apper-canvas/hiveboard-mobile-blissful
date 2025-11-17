import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getApperClient } from "@/services/api/apperClientInit";
import { clearUser, setInitialized, setUser } from "@/store/userSlice";

export const AuthContext = createContext(null);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>
);

export default function Root() {
  const { isInitialized, user } = useSelector(state => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const apperClient = getApperClient();

      if (!apperClient || !window.ApperSDK) {
        console.error('Failed to initialize ApperSDK or ApperClient');
        dispatch(clearUser());
        handleAuthComplete();
        return;
      }

      const { ApperUI } = window.ApperSDK;

      ApperUI.setup(apperClient, {
        target: "#authentication",
        clientId: import.meta.env.VITE_APPER_PROJECT_ID,
        view: "both",
        onSuccess: handleAuthSuccess,
        onError: handleAuthError,
      });

    } catch (error) {
      console.error('Failed to initialize authentication:', error);
      dispatch(clearUser());
      handleAuthComplete();
    }
  };

  const handleAuthSuccess = (userObj) => {
    if (userObj) {
      dispatch(setUser(userObj));
      handleNavigation();
    } else {
      dispatch(clearUser());
    }
    handleAuthComplete();
  };

  const handleAuthError = (error) => {
    console.error("Auth error:", error);
    dispatch(clearUser());
    handleAuthComplete();
  };

  const handleAuthComplete = () => {
    setAuthInitialized(true);
    dispatch(setInitialized(true));
  };

  const handleNavigation = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get("redirect");

    if (redirectPath) {
      navigate(redirectPath);
    } else {
      const authPages = ["/login", "/signup", "/callback"];
      const isOnAuthPage = authPages.some(page =>
        window.location.pathname.includes(page)
      );
      if (isOnAuthPage) {
        navigate("/");
      }
    }
  };

  const logout = async () => {
    try {
      dispatch(clearUser());
      navigate("/login");
      if (window.ApperSDK?.ApperUI?.logout) {
        await window.ApperSDK.ApperUI.logout();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!authInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={{ logout, isInitialized: authInitialized }}>
      <Outlet />
    </AuthContext.Provider>
  );
}