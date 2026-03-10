import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "../reducers/user";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { is_logged_in, access_token } = useSelector(
    (state) => state.user.value,
  );

  useEffect(() => {
    if (is_logged_in && access_token) {
      // Fetch fresh user data including venue and venueProfile
      dispatch(fetchCurrentUser(access_token));
    }
  }, [dispatch, is_logged_in, access_token]);

  return children;
};

export default AuthInitializer;
