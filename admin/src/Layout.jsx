import { useLocation, matchPath } from "react-router-dom";
import Header2 from "./components/Header2";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useAppSelector } from "./redux/hooks";
import { selectIsOpen } from "./redux/reducers/sidebar/sidebarSelector";

const Layout = ({ children }) => {
  const location = useLocation();
  const isSideBarOpened = useAppSelector(selectIsOpen);

  const specialHeaderRoutes = [
    "/login",
    "/register",
    "/login/forgot-password",
    "/reset-password/:id/:token",
    "/reset-password/success",
    "/login/forgot-password/success",
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
      <main
        className={`flex-grow ${
          !isSpecialRoute() && isSideBarOpened ? "lg:ml-72" : ""
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
