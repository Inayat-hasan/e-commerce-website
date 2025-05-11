import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/reducers/sidebar/sidebarSelector.js";
import { selectIsLoggedIn } from "../redux/reducers/authentication/authSelector.js";
import {
  ChevronDown,
  Home,
  X,
  ImagePlus,
  UploadCloud,
  LogIn,
  PackagePlus,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import FormField from "../components/FormField.jsx";
import Input from "../components/Input.jsx";
import Textarea from "../components/Textarea.jsx";
import Select from "../components/Select.jsx";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    actualPrice: "",
    discountedPrice: "",
    stock: "",
    stockUnit: "",
    discountPercentage: "",
    brand: "",
    status: "active",
    isFeatured: false,
    images: [],
    locations: [],
  });
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingAddImages, setPendingAddImages] = useState([]);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allLocations = [
    "india",
    "pakistan",
    "australia",
    "canada",
    "united states",
    "united kingdom",
    "germany",
    "france",
    "italy",
    "spain",
    "japan",
    "china",
    "mexico",
    "russia",
    "south korea",
  ];
  const [filteredLocations, setFilteredLocations] = useState(allLocations);

  const handleLocationSelect = (location) => {
    if (
      !product.locations.some(
        (loc) => loc.toLowerCase() === location.toLowerCase()
      )
    ) {
      setProduct((prev) => ({
        ...prev,
        locations: [...prev.locations, location],
      }));
    }
    setInputValue("");
    setFilteredLocations(allLocations); // Reset filter
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const handleLocationRemove = (locationToRemove) => {
    setProduct((prev) => ({
      ...prev,
      locations: prev.locations.filter((loc) => loc !== locationToRemove),
    }));
  };

  const filterLocations = (input) => {
    const filtered = input
      ? allLocations.filter((loc) =>
          loc.toLowerCase().includes(input.toLowerCase())
        )
      : allLocations;
    setFilteredLocations(filtered);
  };

  useEffect(() => {
    const timer = setTimeout(() => filterLocations(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const validateProduct = () => {
    let errors = [];
    if (!product.name.trim()) errors.push("Product name is required");
    if (!product.description.trim()) errors.push("Description is required");
    if (!product.category) errors.push("Category is required");
    // subCategory can be optional
    if (!product.brand.trim()) errors.push("Brand is required");
    if (!product.stockUnit) errors.push("Stock unit is required");
    if (product.locations.length === 0)
      errors.push("At least one location is required");
    if (!product.status) errors.push("Product status is required");

    const actualPrice = parseFloat(product.actualPrice);
    const discountedPrice = parseFloat(product.discountedPrice);
    if (isNaN(actualPrice) || actualPrice <= 0)
      errors.push("Actual price must be a positive number");
    if (
      product.discountedPrice &&
      (isNaN(discountedPrice) || discountedPrice <= 0)
    ) {
      errors.push("Discounted price must be a positive number if provided");
    }
    if (product.discountedPrice && discountedPrice > actualPrice) {
      errors.push("Discounted price cannot be greater than actual price");
    }
    const stock = parseInt(product.stock);
    if (isNaN(stock) || stock < 0)
      errors.push("Stock must be a non-negative number");
    if (pendingAddImages.length === 0)
      errors.push("At least one product image is required");

    return { isValid: errors.length === 0, errors };
  };

  const calculateDiscountPercentage = () => {
    if (product.discountedPrice && product.actualPrice) {
      const actual = parseFloat(product.actualPrice);
      const discounted = parseFloat(product.discountedPrice);
      if (actual > 0 && discounted > 0 && discounted <= actual) {
        const percentage = ((actual - discounted) / actual) * 100;
        return Math.round(percentage);
      }
    }
    return ""; // Return empty or 0 if not calculable
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const validation = validateProduct();
    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      setIsPublishing(false);
      return;
    }

    const calculatedDiscount = calculateDiscountPercentage();
    // Create a product object that includes the calculated discount for submission
    const productToSubmit = {
      ...product,
      discountPercentage: calculatedDiscount,
      images: [], // Images are handled by FormData
    };

    try {
      const formData = new FormData();
      pendingAddImages.forEach(({ file }) => formData.append("images", file));
      formData.append("product", JSON.stringify(productToSubmit));

      const response = await axios.post(
        `${serverUrl}/api/product/admin/create-product`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.data.productId) {
        toast.success("Product created successfully!");
        // Reset form
        setProduct({
          name: "",
          description: "",
          category: "",
          subCategory: "",
          actualPrice: "",
          discountedPrice: "",
          stock: "",
          stockUnit: "",
          discountPercentage: "",
          brand: "",
          status: "active",
          isFeatured: false,
          images: [],
          locations: [],
        });
        setPendingAddImages([]);
        setInputValue("");
        if (fileInputRef.current) fileInputRef.current.value = null;

        navigate(`/view-product/${response.data.data.productId}`, {
          state: { successMessage: "Product created successfully" },
        });
      } else {
        toast.error(
          response.data.message || "Failed to get product ID from response."
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create product. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const newImagesForPreview = [];
    const newPendingImages = [];

    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        toast.warn(
          `Invalid file type: ${file.name}. Only JPG, PNG, GIF, WEBP are allowed.`
        );
        return;
      }
      if (file.size > maxSize) {
        toast.warn(`File too large: ${file.name}. Max size is 5MB.`);
        return;
      }
      if (product.images.length + newImagesForPreview.length >= 6) {
        toast.warn("Maximum 6 images allowed.");
        return; // Stop if we've already collected enough valid new images for this batch
      }

      const reader = new FileReader();
      const imageId = `temp-${Date.now()}-${file.name}`;
      reader.onloadend = () => {
        newImagesForPreview.push({ url: reader.result, publicId: imageId });
        // Check again before setting state to avoid race conditions if multiple readers finish
        if (product.images.length + newImagesForPreview.length <= 6) {
          setProduct((prev) => ({
            ...prev,
            images: [...prev.images, { url: reader.result, publicId: imageId }],
          }));
        }
      };
      reader.readAsDataURL(file);
      newPendingImages.push({ id: imageId, file });
    });

    // Update pending images state only after all files are processed by readers if needed, or directly
    if (product.images.length + newPendingImages.length <= 6) {
      setPendingAddImages((prev) => [...prev, ...newPendingImages]);
    } else if (newPendingImages.length > 0) {
      // Handle case where some images were valid but exceeded total limit after selection
      const spaceAvailable = 6 - product.images.length;
      const imagesToAdd = newPendingImages.slice(0, spaceAvailable);
      // To reflect this in preview, you might need more complex logic or simply rely on the toast message
      setPendingAddImages((prev) => [...prev, ...imagesToAdd]);
      if (spaceAvailable < newPendingImages.length) {
        toast.warn(
          `Only ${
            spaceAvailable > 0 ? spaceAvailable : 0
          } more images could be added to reach the limit of 6.`
        );
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = null; // Reset file input
  };

  const removeImage = (indexToRemove) => {
    const imageToRemove = product.images[indexToRemove];
    if (imageToRemove) {
      setProduct((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== indexToRemove),
      }));
      setPendingAddImages((prev) =>
        prev.filter((item) => item.id !== imageToRemove.publicId)
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "isFeatured"
          ? value === "true"
          : value,
    }));
  };

  const mainContentClass = `min-h-screen flex flex-col items-center bg-gray-100 dark:bg-slate-900 py-6 sm:py-8 px-4 transition-all duration-300 ease-in-out ${
    isSideBarOpened && isLargeScreen ? "lg:ml-72" : "w-full"
  }`;

  if (!isLoggedIn) {
    return (
      <div className={`${mainContentClass} justify-center`}>
        <div className="text-center p-8 bg-white dark:bg-slate-800 shadow-xl rounded-xl max-w-md w-full">
          <LogIn className="w-16 h-16 text-teal-600 dark:text-teal-400 mx-auto mb-6" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm sm:text-base">
            Please log in to add a new product to the catalog.
          </p>
          <button
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            onClick={() => navigate("/login")}
          >
            <LogIn size={20} />
            Go to Login
          </button>
        </div>
        <ToastContainer position="bottom-center" theme="colored" />
      </div>
    );
  }

  return (
    <div className={mainContentClass}>
      <div className="w-full max-w-5xl space-y-8">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PackagePlus className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Add New Product
              </h1>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-medium py-2.5 px-5 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white shadow hover:shadow-md transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-300"
            >
              <Home size={18} />
              <span>Dashboard</span>
            </button>
          </div>
        </header>

        {/* Basic Information Section */}
        <section className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-slate-700">
            Basic Information
          </h2>
          <div className="space-y-6">
            <FormField label="Product Name" htmlFor="name">
              <Input
                name="name"
                value={product.name}
                onChange={handleInputChange}
                placeholder="e.g., Premium Wireless Headphones"
              />
            </FormField>
            <FormField label="Description" htmlFor="description">
              <Textarea
                name="description"
                value={product.description}
                onChange={handleInputChange}
                placeholder="Detailed description of the product..."
              />
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField label="Category" htmlFor="category">
                <Select
                  name="category"
                  value={product.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home & Kitchen</option>
                  <option value="Sports">Sports & Outdoors</option>
                  {/* Add more categories */}
                </Select>
              </FormField>
              <FormField label="Sub-Category (Optional)" htmlFor="subCategory">
                <Input
                  name="subCategory"
                  value={product.subCategory}
                  onChange={handleInputChange}
                  placeholder="e.g., Mens T-shirts, Over-ear"
                />
              </FormField>
              <FormField label="Brand" htmlFor="brand">
                <Input
                  name="brand"
                  value={product.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Sony, Nike, Apple"
                />
              </FormField>
            </div>
          </div>
        </section>

        {/* Pricing & Stock Section */}
        <section className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-slate-700">
            Pricing & Stock
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField label="Actual Price ($)" htmlFor="actualPrice">
              <Input
                type="number"
                name="actualPrice"
                value={product.actualPrice}
                onChange={handleInputChange}
                placeholder="e.g., 199.99"
              />
            </FormField>
            <FormField
              label="Discounted Price ($) (Optional)"
              htmlFor="discountedPrice"
            >
              <Input
                type="number"
                name="discountedPrice"
                value={product.discountedPrice}
                onChange={handleInputChange}
                placeholder="e.g., 149.99"
              />
            </FormField>
            <FormField
              label="Discount Percentage (%)"
              htmlFor="discountPercentage"
            >
              <Input
                type="text"
                name="discountPercentage"
                value={
                  calculateDiscountPercentage() || product.discountPercentage
                }
                readOnly
                placeholder="Auto-calculated"
                className="bg-gray-100 dark:bg-slate-600 cursor-not-allowed"
              />
            </FormField>
            <FormField label="Stock Quantity" htmlFor="stock">
              <Input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleInputChange}
                placeholder="e.g., 150"
              />
            </FormField>
            <FormField label="Stock Unit" htmlFor="stockUnit">
              <Select
                name="stockUnit"
                value={product.stockUnit}
                onChange={handleInputChange}
              >
                <option value="">Select Unit</option>
                <option value="pieces">Pieces</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="liters">Liters (L)</option>
                <option value="grams">Grams (g)</option>
                <option value="packs">Packs</option>
                <option value="sets">Sets</option>
              </Select>
            </FormField>
          </div>
        </section>

        {/* Settings & Availability Section */}
        <section className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-slate-700">
            Settings & Availability
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Product Status" htmlFor="status">
              <Select
                name="status"
                value={product.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </Select>
            </FormField>
            <FormField label="Is Featured Product?" htmlFor="isFeatured">
              <Select
                name="isFeatured"
                value={product.isFeatured.toString()}
                onChange={handleInputChange}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </Select>
            </FormField>
          </div>

          {/* Locations */}
          <FormField
            label="Available Locations"
            htmlFor="location-input"
            className="mt-6"
          >
            <div className="relative" ref={dropdownRef}>
              <div className="flex flex-wrap gap-2 p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 mb-2 min-h-[46px]">
                {product.locations.map((location) => (
                  <span
                    key={location}
                    className="flex items-center gap-1.5 bg-teal-100 dark:bg-teal-700 text-teal-700 dark:text-teal-100 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full"
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => handleLocationRemove(location)}
                      className="text-teal-500 dark:text-teal-300 hover:text-teal-700 dark:hover:text-teal-100"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <input
                  id="location-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="flex-grow p-1 outline-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400"
                  placeholder={
                    product.locations.length > 0
                      ? "Add another location..."
                      : "Type to search locations..."
                  }
                />
              </div>
              {isDropdownOpen && filteredLocations.length > 0 && (
                <ul className="absolute w-full max-h-60 overflow-y-auto bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg z-20 mt-1">
                  {filteredLocations.map((location) => (
                    <li
                      key={location}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleLocationSelect(location);
                      }}
                      className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-slate-600 cursor-pointer"
                    >
                      {location}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() =>
                  setProduct((prev) => ({ ...prev, locations: [] }))
                }
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                disabled={product.locations.length === 0}
              >
                Clear All Locations
              </button>
            </div>
          </FormField>
        </section>

        {/* Media Section */}
        <section className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-slate-700">
            Product Media
          </h2>
          <FormField
            label="Upload Images (Max 6, up to 5MB each)"
            htmlFor="fileUpload"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              {product.images.map((image, index) => (
                <div
                  key={image.publicId}
                  className="relative group aspect-square"
                >
                  <img
                    src={image.url}
                    alt={`Product preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white h-7 w-7 rounded-full flex items-center justify-center shadow-md transition-opacity opacity-0 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {product.images.length < 6 && (
                <label
                  htmlFor="fileUpload"
                  className="aspect-square cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-teal-500 dark:hover:border-teal-400 rounded-lg text-gray-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-150 ease-in-out p-2"
                >
                  <ImagePlus size={32} className="mb-1" />
                  <span className="text-xs sm:text-sm text-center">
                    Add Image
                  </span>
                </label>
              )}
            </div>
            <input
              type="file"
              multiple
              className="hidden"
              id="fileUpload"
              onChange={handleImageUpload}
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/gif,image/webp"
              disabled={product.images.length >= 6}
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Accepted formats: JPG, PNG, GIF, WEBP. {6 - product.images.length}{" "}
              slots remaining.
            </p>
          </FormField>
        </section>

        {/* Publish Button */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || product.images.length === 0}
            className={`flex items-center justify-center gap-2.5 min-w-[180px] bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
              ${
                isPublishing || product.images.length === 0
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }
            `}
          >
            {isPublishing ? (
              <>
                <LoaderCircle size={20} className="animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                Publish Product
              </>
            )}
          </button>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default AddProduct;
