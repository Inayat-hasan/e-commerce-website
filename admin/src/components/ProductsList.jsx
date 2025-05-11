import axios from "axios";
import { Delete, Eye, Pen, Trash } from "lucide-react";
import { useState, useMemo } from "react";
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
  const [rowsPerPage, setRowsPerPage] = useState(10); // Changed default to 10 for better UX
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
          import.meta.env.VITE_SERVER_URL
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
      navigate("/");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDropdown = (productId) => {
    setProductToDelete(productId);
    setDeleteDropdown(true);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen w-full transition-colors duration-200">
      {/* Delete Confirmation Modal */}
      {deleteDropdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteDropdown(false);
                  setProductToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  productToDelete && handleDeleteProduct(productToDelete)
                }
                disabled={isDeleting}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-20"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="p-4 md:p-6 bg-teal-700 dark:bg-teal-900">
          <h1 className="text-2xl font-bold text-white">{heading}</h1>

          {/* Filters and Search - Responsive layout */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <label className="text-teal-100 dark:text-teal-200 text-sm font-medium">
                Filter by category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-teal-600 dark:bg-teal-800 text-white p-2 rounded-lg cursor-pointer focus:ring-2 focus:ring-teal-400 focus:outline-none transition-all w-full sm:w-auto"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-teal-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-teal-600 dark:bg-teal-800 text-white placeholder-teal-200 pl-10 pr-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-teal-400 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            <table className="w-full min-w-max">
              <thead className="sticky top-0 z-20">
                <tr className="bg-teal-600 dark:bg-teal-800 text-white">
                  <th className="p-3 text-left sticky left-0 bg-teal-600 dark:bg-teal-800 z-20">
                    IMAGE
                  </th>
                  <th className="p-3 text-left min-w-[200px]">PRODUCT</th>
                  <th className="p-3 text-left min-w-[120px]">CATEGORY</th>
                  <th className="p-3 text-left min-w-[120px]">PRICE</th>
                  <th className="p-3 text-left min-w-[100px]">STOCK</th>
                  <th className="p-3 text-left min-w-[100px]">DISCOUNT</th>
                  <th className="p-3 text-left min-w-[150px] sticky right-0 bg-teal-600 dark:bg-teal-800 z-20">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="p-3 sticky left-0 bg-white dark:bg-gray-800 z-10">
                        <div className="h-12 w-12 rounded-md overflow-hidden">
                          <img
                            src={getMainImageUrl(product.images)}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {product.description}
                        </div>
                      </td>
                      <td className="p-3 capitalize text-gray-700 dark:text-gray-300">
                        {product.category}
                      </td>
                      <td className="p-3">
                        <div className="text-red-600 dark:text-red-400">
                          Rs {product.actualPrice.toLocaleString()}
                        </div>
                        {product.discountedPrice && (
                          <div className="text-green-600 dark:text-green-400">
                            Rs {product.discountedPrice.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock > 10
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                          }`}
                        >
                          {product.stock} {product.stockUnit}
                        </span>
                      </td>
                      <td className="p-3">
                        {product.discountPercentage ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                            {product.discountPercentage}%
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            No discount
                          </span>
                        )}
                      </td>
                      <td className="p-3 sticky right-0 bg-white dark:bg-gray-800 z-10">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/view-product/${product._id}`)
                            }
                            className="p-2 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            aria-label="View product"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/edit-product/${product._id}`)
                            }
                            className="p-2 rounded-md bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                            aria-label="Edit product"
                          >
                            <Pen size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteDropdown(product._id)}
                            className="p-2 rounded-md bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-6 text-center text-gray-500 dark:text-gray-400"
                    >
                      No products found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 gap-4">
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
              Rows per page:
            </label>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md px-3 py-1 text-sm focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
            >
              {[10, 20, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-teal-600 dark:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-label="Previous page"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-teal-600 dark:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-label="Next page"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
