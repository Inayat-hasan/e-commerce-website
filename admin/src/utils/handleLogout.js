import { toast } from "react-toastify";
import axios from "axios";
import { logout } from "../redux/reducers/authentication/authReducer.js";

const handleLogout = async (dispatch, navigate) => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  try {
    // Call the backend logout endpoint
    const response = await axios.post(
      `${serverUrl}/api/admin/logout`,
      {},
      { withCredentials: true }
    );

    // The backend response structure uses ApiResponse with status code
    if (response.status === 200) {
      // Dispatch logout actions to update Redux state
      dispatch(logout());

      // Show success message and redirect
      toast.success("Logged out successfully");
      navigate("/", { state: { successMessage: "Logged out successfully!" } });
      return true;
    } else {
      toast.error("Something went wrong during logout");
      return false;
    }
  } catch (error) {
    toast.error("Failed to log out");
    return false;
  }
};

export default handleLogout;
