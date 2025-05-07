import axios from "axios";

const checkBuyer = async () => {
  try {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    const req = await axios.get(`${serverUrl}/api/buyer/check-buyer`, {
      withCredentials: true,
    });
    const { user, isLoggedIn } = req.data.data;

    if (isLoggedIn && user) {
      return { buyer: user, isLoggedIn };
    } else {
      return { buyer: null, isLoggedIn: false };
    }
  } catch (error) {
    console.error("Error checking buyer:", error);
    return { buyer: null, isLoggedIn: false };
  }
};

export default checkBuyer;
