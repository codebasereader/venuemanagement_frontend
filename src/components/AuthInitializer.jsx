import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { decodeToken } from "react-jwt";
import { fetchCurrentUser, logout } from "../reducers/user";
import verifyToken from "../verifyToken";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { is_logged_in, access_token } = useSelector(
    (state) => state.user.value,
  );
  const expiryTimerRef = useRef(null);

  useEffect(() => {
    if (!is_logged_in || !access_token) {
      return;
    }

    // Verify token before any API call; logout if expired or invalid
    const { status } = verifyToken(access_token);
    if (!status) {
      dispatch(logout());
      return;
    }

    // Fetch fresh user data including venue and venueProfile
    dispatch(fetchCurrentUser(access_token));

    // Schedule automatic logout when token expires
    try {
      const decoded = decodeToken(access_token);
      const exp = decoded?.exp; // seconds since epoch
      if (typeof exp === "number") {
        const msUntilExpiry = exp * 1000 - Date.now();
        const logoutMs = Math.min(msUntilExpiry - 1000, 2147483647); // 1s before expiry, cap for setTimeout
        if (logoutMs > 0) {
          expiryTimerRef.current = setTimeout(() => {
            dispatch(logout());
            window.location.href = "/login";
          }, logoutMs);
        }
      }
    } catch {
      // ignore decode errors; token was already verified above
    }

    return () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
    };
  }, [dispatch, is_logged_in, access_token]);

  return children;
};

export default AuthInitializer;
