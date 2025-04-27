import React, { useEffect, useState } from "react";
import ProductsList from "../components/ProductsList";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "../redux/hooks";
import { selectIsOpen } from "../redux/reducers/sidebar/sidebarSelector";
import { selectIsLoggedIn } from "../redux/reducers/authentication/authSelector";

const AllProducts = () => {
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();
  const isSideBarOpened = useAppSelector(selectIsOpen);
  const isUserLoggedIn = useAppSelector(selectIsLoggedIn);

  const handleProductDelete = (deletedProductId) => {
    setAllProducts((prev) =>
      prev.filter((product) => product._id !== deletedProductId)
    );
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const req = await axios.get(`${process.env.SERVER_URL}/api/product/admin/get-all-products`);
        if (req.status === 200) {
          setAllProducts(req.data.data.products);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getProducts();
  }, []);

  return (
    <div
      className={`${
        isSideBarOpened ? "lg:ml-72" : "w-full"
      } bg-gray-200 flex flex-col items-center py-2 gap-2`}
    >
      <div className="bg-teal-900 w-[95%] flex justify-between items-center rounded-lg px-4 text-white py-2">
        <span className="text-2xl">Product List</span>
        <button
          onClick={() => navigate("/admin/add-product")}
          className="hover:bg-teal-950 bg-teal-700 px-1.5 py-2 rounded-lg font-bold text-base"
        >
          Add Product
        </button>
      </div>
      <div className="bg-gray-200 w-[95%] flex items-center text-white py-2 text-xl justify-between">
        <div className="bg-white rounded-lg px-4 py-2 font-bold">
          <span className="text-gray-600">Total Orders</span>{" "}
          <span className="text-blue-600">150</span>
        </div>
        <div className="bg-white rounded-lg px-4 py-2 font-bold">
          <span className="text-gray-600">Total Orders</span>{" "}
          <span className="text-blue-600">150</span>
        </div>
        <div className="bg-white rounded-lg px-4 py-2 font-bold">
          <span className="text-gray-600">Total Orders</span>{" "}
          <span className="text-blue-600">150</span>
        </div>
      </div>
      <ProductsList
        heading={"All Products"}
        products={allProducts}
        onProductDelete={handleProductDelete}
      />
    </div>
  );
};

export default AllProducts;
