import axios from "axios";

const checkAdmin = async () => {
  try {
    const req = await axios.get("/api/user/check-admin");
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
