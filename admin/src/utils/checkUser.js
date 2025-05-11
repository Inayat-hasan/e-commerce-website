import axios from "axios";

const checkUser = async () => {
  try {
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    const req = await axios.get(`${serverUrl}/api/admin/check-admin`, {
      withCredentials: true,
    });

    if (req.data.data.isLoggedIn && req.data.data.admin) {
      return {
        admin: req.data.data.admin,
        isLoggedIn: req.data.data.isLoggedIn,
      };
    } else {
      return { admin: null, isLoggedIn: false };
    }
  } catch (error) {
    return { admin: null, isLoggedIn: false };
  }
};

export default checkUser;
