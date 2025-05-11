import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  AddProduct,
  AllProducts,
  ForgotPass,
  ForgotSuccess,
  Home,
  Login,
  ProductDetail,
  ProductEdit,
  ProductOrders,
  ProductRam,
  ProductSize,
  ProductWeight,
  Register,
  ResetPass,
  ResetSuccess,
  VerifyOtp,
} from "./pages/index.js";
import Layout from "./Layout.jsx";

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password/:id/:token" element={<ResetPass />} />
          <Route path="/reset-password/success" element={<ResetSuccess />} />
          <Route path="/forgot-password/success" element={<ForgotSuccess />} />
          <Route path="/view-product/:productId" element={<ProductDetail />} />
          <Route path="/edit-product/:productId" element={<ProductEdit />} />
          <Route path="/product-list" element={<AllProducts />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/product-ram" element={<ProductRam />} />
          <Route path="/product-weight" element={<ProductWeight />} />
          <Route path="/product-size" element={<ProductSize />} />
          <Route path="/orders" element={<ProductOrders />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
