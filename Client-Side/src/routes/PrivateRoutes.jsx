import { Navigate, useLocation } from "react-router";

import { useEffect } from "react";

function PrivateRoutes({ children }) {
  const location = useLocation();
  const getToken = localStorage.getItem("token");
  useEffect(() => {}, [getToken]);

  if (getToken) {
    return children;
  }
  return <Navigate to="/" state={{ from: location }} replace />;
}

export default PrivateRoutes;
