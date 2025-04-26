import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  Register,
  Cart,
  CategorisedProducts,
  Checkout,
  ForgotPass,
  ForgotSuccess,
  Home,
  Login,
  MultipleProducts,
  OrderDetail,
  Orders,
  ProductDetail,
  Profile,
  ResetPass,
  ResetSuccess,
  SearchProduct,
} from "./pages/index.js";
import Layout from "./Layout.jsx";

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login/forgot-password" element={<ForgotPass />} />
          <Route path="/reset-password/:id/:token" element={<ResetPass />} />
          <Route path="/reset-password/success" element={<ResetSuccess />} />
          <Route
            path="/login/forgot-password/success"
            element={<ForgotSuccess />}
          />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
          <Route path="/products/:random" element={<MultipleProducts />} />
          <Route path="/category/products/:category" element={<CategorisedProducts />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
