import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {
  faUser,
  faTruck,
  faLocationDot,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

const LoginSection = ({
  user = {},
  isLoggedIn,
  activeSection = null,
  setActiveSection,
}) => {
  const navigate = useNavigate();

  const handleSectionClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      setActiveSection(activeSection === "login" ? null : "login");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-3">
            <span className="text-lg font-medium">1</span>
          </div>
          <div>
            <h2 className="font-medium">Login</h2>
            {isLoggedIn ? (
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <span className="font-medium text-gray-600">
                      {user.fullName?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {user.fullName}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">
                Please login to continue with checkout
              </p>
            )}
          </div>
        </div>

        {isLoggedIn ? (
          <button
            onClick={handleSectionClick}
            className="text-teal-600 text-sm px-4 py-2 border border-teal-600 rounded hover:bg-teal-50"
            disabled={activeSection && activeSection !== "login"}
          >
            Change
          </button>
        ) : (
          <button
            onClick={handleSectionClick}
            className="text-teal-600 text-sm px-4 py-2 border border-teal-600 rounded hover:bg-teal-50"
          >
            Login
          </button>
        )}
      </div>

      {activeSection === "login" && isLoggedIn && (
        <div className="mt-4 border-t pt-4">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 mb-4 md:mb-0">
              <div className="mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <span className="font-medium text-gray-600">
                      {user.fullName?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {user.fullName}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="w-full px-4 py-2 text-gray-700 border rounded hover:bg-gray-50 mb-3"
              >
                Logout & Sign in to another account
              </button>
              <button
                onClick={() => setActiveSection(null)}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                Continue Checkout
              </button>
            </div>

            <div className="md:w-1/2 md:pl-6">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium mb-3">
                  Benefits of our secure login
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <FontAwesomeIcon
                      icon={faTruck}
                      className="text-teal-600 mt-1 mr-2"
                    />
                    <span>Track orders easily</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="text-teal-600 mt-1 mr-2"
                    />
                    <span>Access saved addresses</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon
                      icon={faShieldHalved}
                      className="text-teal-600 mt-1 mr-2"
                    />
                    <span>Secure checkout process</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

LoginSection.propTypes = {
  user: PropTypes.shape({
    fullName: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
  }),
  isLoggedIn: PropTypes.bool.isRequired,
  activeSection: PropTypes.string,
  setActiveSection: PropTypes.func.isRequired,
};

export default LoginSection;
