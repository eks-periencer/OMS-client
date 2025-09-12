import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import FullScreenLoader from "./FullScreenLoader";

type RootState = {
  authentication: {
    isAuthenticated: boolean;
    loading: boolean;
  };
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.authentication
  );

  if (loading) {
    return <FullScreenLoader label="Authenticating" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}


