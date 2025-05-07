import axios from "axios";

const checkUser = async () => {
  try {
    const req = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/api/admin/check-admin`,
      { withCredentials: true }
    );
    if (req.data.data && req.data.data.user) {
      const user = req.data.data.user;
      return { user };
    } else {
      return { user: null };
    }
  } catch (error) {
    console.log("error : ", error);
    return { user: null };
  }
};

export default checkUser;
