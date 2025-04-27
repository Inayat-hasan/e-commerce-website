import axios from "axios";
import React, { useState, useMemo } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProductsList = ({ products, heading, onProductDelete }) => {
  const categories = [
    "All",
    "Electronics",
    "Fashion",
    "Food & Health",
    "Home",
    "Sports",
    "Travel",
    "Vehicles",
    "Others",
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDropdown, setDeleteDropdown] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  // Pagination logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getMainImageUrl = (images) => {
    return images && images.length > 0 ? images[0].url : "";
  };

  const navigate = useNavigate();

  const handleDeleteProduct = async (productId) => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${
          import.meta.env.SERVER_URL
        }/api/product/admin/delete-product/${productId}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        onProductDelete(productId); // Call parent handler to update state
        setDeleteDropdown(false);
        setProductToDelete(null);
      }
    } catch (error) {
      console.error("Err in deleting Product : ", error);
      navigate("/admin/dashboard");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDropdown = (productId) => {
    setProductToDelete(productId);
    setDeleteDropdown(true);
  };

  return (
    <div className="p-6 bg-gray-200 w-full">
      {deleteDropdown && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex flex-col gap-4">
            <p className="text-black">
              Are you sure you want to delete this product?
            </p>
            <div className="flex gap-4">
              <button
                className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() =>
                  productToDelete && handleDeleteProduct(productToDelete)
                }
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : null}
                {isDeleting ? "Deleting..." : "Yes"}
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  setDeleteDropdown(false);
                  setProductToDelete(null);
                }}
                disabled={isDeleting}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="p-6 bg-teal-900 text-white max-h-screen w-[100%] rounded-2xl">
        <h1 className="text-2xl font-bold mb-4">{heading}</h1>

        {/* Filters and Search */}
        <div className="flex flex-row justify-between mb-4 gap-4">
          <div className="flex items-center">
            <label className="mr-2">CATEGORY BY</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-teal-800 text-white p-2 rounded cursor-pointer"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Search here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-teal-800 text-white p-2 rounded w-1/2 sm:w-1/3"
          />
        </div>

        {/* Table with both horizontal and vertical scrolling */}
        <div className="border border-teal-700 rounded">
          {/* Table container with both vertical and horizontal scrolling */}
          <div className="overflow-x-auto">
            <div className="overflow-y-auto h-96">
              <table className="w-[100%] table-auto border-collapse min-w-max">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-green-950 text-white">
                    <th className="p-3 text-left w-16 min-w-16">IMAGE</th>
                    <th className="p-3 text-left w-64 min-w-64">PRODUCT</th>
                    <th className="p-3 text-left w-32 min-w-32">CATEGORY</th>
                    <th className="p-3 text-left w-40 min-w-40">PRICE</th>
                    <th className="p-3 text-left w-32 min-w-32">STOCK</th>
                    <th className="p-3 text-left w-32 min-w-32">DISCOUNT</th>
                    <th className="p-3 text-left w-32 min-w-32">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="bg-teal-900 border border-gray-300"
                    >
                      <td className="p-3 w-16 min-w-16">
                        <img
                          src={getMainImageUrl(product.images)}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      </td>
                      <td className="p-3 w-64 min-w-64">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {product.description}
                        </div>
                      </td>
                      <td className="p-3 w-32 min-w-32 capitalize">
                        {product.category}
                      </td>
                      <td className="p-3 w-40 min-w-40">
                        <div className="text-red-500">
                          Rs {product.actualPrice.toLocaleString()}
                        </div>
                        {product.discountedPrice && (
                          <div className="text-green-500">
                            Rs {product.discountedPrice.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="p-3 w-32 min-w-32">
                        <span
                          className={`px-2 py-1 rounded ${
                            product.stock > 10 ? "bg-green-800" : "bg-red-800"
                          }`}
                        >
                          {product.stock} {product.stockUnit}
                        </span>
                      </td>
                      <td className="p-3 w-32 min-w-32">
                        {product.discountPercentage ? (
                          <span className="bg-purple-800 px-2 py-1 rounded">
                            {product.discountPercentage}%
                          </span>
                        ) : (
                          <span className="text-gray-500">No discount</span>
                        )}
                      </td>
                      <td className="p-3 w-32 min-w-32">
                        <div className="flex space-x-2">
                          <button
                            className="bg-purple-500 p-2 rounded"
                            onClick={() =>
                              navigate(`/admin/view-product/${product._id}`)
                            }
                          >
                            <FaEye />
                          </button>
                          <button
                            className="bg-green-500 p-2 rounded"
                            onClick={() =>
                              navigate(`/admin/edit-product/${product._id}`)
                            }
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="bg-red-500 p-2 rounded"
                            onClick={() => handleDeleteDropdown(product._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-row sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="flex items-center">
            <label className="mr-2">Rows per page:</label>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="bg-teal-800 text-white p-2 rounded cursor-pointer"
            >
              {[10, 20, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1 ? "bg-teal-800 text-gray-100" : "bg-teal-700"
              }`}
            >
              ←
            </button>
            <span>
              {startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${
                currentPage === totalPages
                  ? "bg-teal-800 text-gray-100"
                  : "bg-teal-700"
              }`}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
