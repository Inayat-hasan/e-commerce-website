import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";
import { useState, useEffect } from "react";
import Product from "../components/Product";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faChevronLeft,
  faChevronRight,
  faSort,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useAppSelector } from "../redux/hooks";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/slices/sidebar/sidebarSelector.js";

const MultipleProducts = () => {
  const { random } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get("page")) || 1;
  const currentLimit = parseInt(queryParams.get("limit")) || 12;
  const currentSort = queryParams.get("sort") || "latest";
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: currentPage,
    limit: currentLimit,
    hasMore: false,
  });

  // Get page title based on route parameter
  const getPageTitle = () => {
    switch (random) {
      case "featured":
        return "Featured Products";
      case "best-selling":
        return "Best Selling Products";
      case "new-arrivals":
        return "New Arrivals";
      default:
        return "Products";
    }
  };

  // Get API endpoint based on route parameter
  const getApiEndpoint = () => {
    switch (random) {
      case "featured":
        return `${serverUrl}/api/product/buyer/get-featured-products`;
      case "best-selling":
        return `${serverUrl}/api/product/buyer/get-best-selling-products`;
      case "new-arrivals":
        return `${serverUrl}/api/product/buyer/get-latest-products`;
      default:
        return `${serverUrl}/api/product/buyer/all`;
    }
  };

  // Function to fetch products with pagination
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Build query parameters for API call
      const params = {
        page: currentPage,
        limit: currentLimit,
        sort: currentSort,
      };

      // Make API call with params
      const response = await axios.get(
        getApiEndpoint(),
        { params },
        { withCredentials: true }
      );

      // Check response format and extract data
      if (response.data.data) {
        setProducts(response.data.data.products || []);
        setPagination(
          response.data.data.pagination || {
            total: 0,
            totalPages: 1,
            page: currentPage,
            limit: currentLimit,
            hasMore: false,
          }
        );
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Failed to load products. Unexpected response format.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Update query parameters and URL when page or sort changes
  const updateQueryParams = (params) => {
    const newQueryParams = new URLSearchParams(location.search);

    // Update each parameter if it exists in the params object
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        newQueryParams.set(key, value);
      }
    });

    // Navigate to new URL with updated query parameters
    navigate(`${location.pathname}?${newQueryParams.toString()}`);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      updateQueryParams({ page: newPage });
    }
  };

  // Handle sort change
  const handleSortChange = (sortOption) => {
    updateQueryParams({ sort: sortOption, page: 1 }); // Reset to page 1 when sort changes
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    updateQueryParams({ limit: newLimit, page: 1 }); // Reset to page 1 when limit changes
  };

  // Fetch products when URL params change
  useEffect(() => {
    fetchProducts();
  }, [location.search, random]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages || 1;
    const currentPageNum = pagination.page || 1;

    // If 5 or fewer pages, show all
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Otherwise show current page, 2 before and 2 after if possible
    const pages = [];

    // Always include first page
    pages.push(1);

    // Add ellipsis if needed
    if (currentPageNum > 3) {
      pages.push("...");
    }

    // Add pages around current page
    const start = Math.max(2, currentPageNum - 1);
    const end = Math.min(totalPages - 1, currentPageNum + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (currentPageNum < totalPages - 2) {
      pages.push("...");
    }

    // Always include last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className={`bg-gray-50 min-h-screen pb-10 ${
        isLargeScreen && isSideBarOpened ? "pl-80" : "w-full"
      } ${!isLargeScreen && isSideBarOpened ? "w-full" : ""}`}
    >
      {/* Header with title and back button */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-500 hover:text-teal-600 transition-colors"
            aria-label="Go back"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center">
              <span className="mr-2 text-gray-600">
                <FontAwesomeIcon icon={faSort} />
              </span>
              <span className="mr-2 font-medium">Sort by:</span>
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="latest">Latest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="popularity">Popularity</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="mr-2 font-medium">Show:</span>
                <select
                  value={currentLimit}
                  onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                  className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="12">12 items</option>
                  <option value="24">24 items</option>
                  <option value="48">48 items</option>
                </select>
              </div>

              <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Products grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="cursor-pointer"
                >
                  <Product product={product} />
                </div>
              ))}
            </div>

            {/* Results count */}
            <div className="mt-6 text-sm text-gray-500 text-center">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} products
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center border rounded-md divide-x overflow-hidden shadow-sm">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
                  </button>

                  {getPageNumbers().map((pageNum, index) =>
                    pageNum === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-3 py-2 text-gray-500"
                      >
                        {pageNum}
                      </span>
                    ) : (
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 min-w-[40px] ${
                          pageNum === pagination.page
                            ? "bg-teal-600 text-white hover:bg-teal-700"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-sm"
                    />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">No products found</div>
            <p className="text-gray-500 mt-2">
              Try changing your search criteria or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultipleProducts;
