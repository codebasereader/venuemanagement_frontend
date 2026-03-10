import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../reducers/user";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { value: user, loading, error } = useSelector((state) => state.user);

  const refreshUser = (token) => {
    if (token) {
      dispatch(fetchCurrentUser(token));
    }
  };

  return {
    user,
    loading,
    error,
    refreshUser,
    isLoggedIn: user.is_logged_in,
  };
};
