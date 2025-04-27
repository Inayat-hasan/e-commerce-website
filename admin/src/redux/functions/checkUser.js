import axios from "axios";

const checkUser = async () => {
  try {
    const req = await axios.get(
      `${import.meta.env.SERVER_URL}/api/user/check-user`
    );
    if (req.data.data.user) {
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
