import React from "react";
import { useLocation, matchPath } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Header2 from "./components/Header2";

const Layout = ({ children }) => {
  const location = useLocation();

  const specialHeaderRoutes = [
    "/login",
    "/register",
    "/login/forgot-password",
    "/reset-password/:id/:token",
    "/reset-password/success",
    "/login/forgot-password/success",
    "/verify-otp",
  ];

  const isSpecialRoute = () => {
    return specialHeaderRoutes.some((route) =>
      matchPath({ path: route, exact: true }, location.pathname)
    );
  };

  const renderHeader = () => {
    if (isSpecialRoute()) return <Header2 />;
    return <Header />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {renderHeader()}
      <main className="flex-grow relative transition-all duration-300 overflow-y-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
