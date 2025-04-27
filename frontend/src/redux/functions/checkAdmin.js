import axios from "axios";

const checkAdmin = async () => {
  try {
    const serverUrl = process.env.SERVER_URL;
    const req = await axios.get(`${serverUrl}/api/user/check-admin`);
    if (req.data.data.admin) {
      const admin = req.data.data.admin;
      return { admin };
    } else {
      return { admin: null };
    }
  } catch (error) {
    console.log("error : ", error);
    return { admin: null };
  }
};

export default checkAdmin;
