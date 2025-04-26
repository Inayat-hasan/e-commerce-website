import React from "react";
import { Link, useNavigate } from "react-router-dom";

const CategoriesBar = () => {
  //  16 Categories
  const categories = [
    {
      urlName: "/category/products/fashion?page=1&limit=10&sort=latest",
      name: "Fashion",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/edc3692c0eec7429.jpg",
    },
    {
      urlName: "/category/products/food-health?page=1&limit=10&sort=latest",
      name: "Food & Health",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/ee559381b6ea7271.jpg",
    },
    {
      urlName: "/category/products/gifts?page=1&limit=10&sort=latest",
      name: "Gifts",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/e2b3c05cdbd8ae6f.jpg",
    },
    {
      urlName: "/category/products/electronics?page=1&limit=12&sort=latest",
      name: "Electronics",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/9967fdcd55d6841f.jpg",
    },
    {
      urlName: "/category/products/travel?page=1&limit=12&sort=latest",
      name: "Travel",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/d7eae409dc461a54.jpg",
    },
    {
      urlName: "/category/products/vehicles?page=1&limit=12&sort=latest",
      name: "2 Wheelers",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/a0e8d0f1c845b58e.jpg",
    },
    {
      urlName: "/category/products/toys?page=1&limit=12&sort=latest",
      name: "Toys, Baby...",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/d682cf0128d92afa.png",
    },
    {
      urlName: "/category/products/sports?page=1&limit=12&sort=latest",
      name: "Sports",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/498066194ca66480.jpg",
    },
    {
      urlName: "/category/products/mobiles?page=1&limit=12&sort=latest",
      name: "Mobiles",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/32eba959bf99ceba.jpg",
    },
    {
      urlName: "/category/products/beauty?page=1&limit=12&sort=latest",
      name: "Beauty",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/bba788fb3c265bb0.png",
    },
    {
      urlName: "/category/products/gadgets?page=1&limit=12&sort=latest",
      name: "Gadgets",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/bf5504adae5eee4c.jpg",
    },
    {
      urlName: "/category/products/appliances?page=1&limit=12&sort=latest",
      name: "Appliances",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/861f2d79a7fed0d3.jpg",
    },
    {
      urlName: "/category/products/furniture?page=1&limit=12&sort=latest",
      name: "Furniture",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/bfbe9ce08b5cc1cb.jpg",
    },
    {
      urlName: "/category/products/fashion?page=1&limit=12&sort=latest",
      name: "GenZ Trends",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/b97a9ac17f9869a2.jpg",
    },
    {
      urlName: "/category/products/safety?page=1&limit=12&sort=latest",
      name: "Safety",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/5ef719c9f2e281bd.jpg",
    },
    {
      urlName: "/category/products/groceries?page=1&limit=12&sort=latest",
      name: "Groceries",
      image:
        "https://rukminim1.flixcart.com/fk-p-flap/101/101/image/95a6f3f022057163.jpg",
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="w-full bg-gray-300 flex items-center justify-center py-3">
      <div className="bg-white lg:w-[97%] xl:w-[98%] sm:w-[94%] md:w-[95%] xs:w-[94%] px-5 py-3">
        {/* Small screens (xs, sm, md): 2 rows, 8 items each, scrollable horizontally */}
        <div className="block lg:hidden xl:hidden">
          <div className="flex flex-col gap-5">
            <div className="flex gap-5 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 pb-2 snap-x snap-mandatory">
              {categories.slice(0, 8).map((category, index) => (
                <div
                  key={category.id || index}
                  className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-teal-900 hover:border-2 p-2 h-28 bg-cover min-w-[6rem] max-w-24 rounded-lg snap-start"
                  onClick={() => navigate(`${category.urlName}`)}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-16 h-16 object-cover mb-2 rounded-md"
                  />
                  <p className="text-sm font-semibold truncate w-full text-center">
                    {category.name}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-5 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 pb-2 snap-x snap-mandatory">
              {categories.slice(8, 16).map((category, index) => (
                <div
                  key={category.id || index}
                  className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-teal-900 hover:border-2 p-2 h-28 bg-cover min-w-[6rem] max-w-24 rounded-lg snap-start"
                  onClick={() => navigate(`${category.urlName}`)}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-16 h-16 object-cover mb-2 rounded-md"
                  />
                  <p className="text-sm font-semibold truncate w-full text-center">
                    {category.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Big screens (lg, xl): 1 row, 16 items */}
        <div
          className="hidden lg:flex xl:flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          style={{
            scrollbarWidth: "thin", // Firefox: thin scrollbar
            scrollbarColor: "transparent transparent", // Firefox: hidden by default
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.scrollbarColor = "#d1d5db transparent")
          } // Gray-300 on hover/scroll
          onMouseLeave={(e) =>
            (e.currentTarget.style.scrollbarColor = "transparent transparent")
          }
        >
          {categories.map((category, index) => (
            <div
              key={category.id || index}
              className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-teal-900 hover:border-2 p-2 h-28 bg-cover min-w-[6rem] max-w-24 rounded-lg snap-start"
              onClick={() => navigate(`${category.urlName}`)}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-16 h-16 object-cover mb-2 rounded-md"
              />
              <p className="text-sm font-semibold truncate w-full text-center">
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesBar;
