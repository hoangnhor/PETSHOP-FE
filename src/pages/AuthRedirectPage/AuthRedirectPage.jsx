import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthRedirectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const authMode =
      location.pathname === "/register"
        ? "register"
        : location.pathname === "/forgot-password"
          ? "forgot"
          : "login";
    navigate(`/?auth=${authMode}`, { replace: true });
  }, [location.pathname, navigate]);

  return null;
};

export default AuthRedirectPage;
