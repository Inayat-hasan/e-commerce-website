import axios from "axios";

const checkBuyer = async () => {
  try {
    const req = await axios.get("/api/buyer/check-buyer");
    if (req.data.data.user) {
      const buyer = req.data.data.user;
      return { buyer };
    } else {
      return { buyer: null };
    }
  } catch (error) {
    console.log("error : ", error);
    return { buyer: null };
  }
};

export default checkBuyer;
