import { useDispatch, useSelector } from "react-redux";
import { loginThunk, logoutThunk, registerThunk } from "../state/slices/authSlice";
import { resetWorkspaceState } from "../state/slices/workspaceSlice";


export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const login = (payload) => dispatch(loginThunk(payload)).unwrap();
  const register = (payload) => dispatch(registerThunk(payload)).unwrap();
  const logout = async () => {
    await dispatch(logoutThunk()).unwrap();
    dispatch(resetWorkspaceState());
  };

  return { ...auth, login, register, logout };
}
