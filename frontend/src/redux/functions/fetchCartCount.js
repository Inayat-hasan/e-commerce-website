import axios from "axios";

const fetchCartCount = async () => {
  try {
    const serverUrl = process.env.SERVER_URL;
    const response = await axios.get(`${serverUrl}/api/cart/get-cart-count`, {
      withCredentials: true,
    });

    // Backend will return null for unauthenticated users, or the actual count for authenticated users
    return { cartCount: response.data.data.cartCount };
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return { cartCount: 0 }; // Return 0 for any other errors
  }
};

export default fetchCartCount;
