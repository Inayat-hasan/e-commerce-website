import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "../redux/hooks"; // Assuming path is correct
import {
  selectIsLargeScreen,
  selectIsSideBarOpened,
} from "../redux/reducers/sidebar/sidebarSelector"; // Assuming path is correct
import {
  selectIsLoggedIn,
  // selectUser, // Not used in this component
} from "../redux/reducers/authentication/authSelector.js"; // Assuming path is correct
import {
  ChevronDown,
  Home,
  Replace,
  X,
  ImagePlus,
  Trash2,
  Edit3,
  UploadCloud,
  LoaderCircle,
  AlertTriangle,
  Save,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Assuming these components are correctly imported and can be styled via className
import Select from "../components/Select.jsx";
import FormField from "../components/FormField.jsx";
import Textarea from "../components/Textarea.jsx";
import Input from "../components/Input.jsx";

const ProductEdit = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const isLargeScreen = useAppSelector(selectIsLargeScreen);
  const isSideBarOpened = useAppSelector(selectIsSideBarOpened);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    actualPrice: "",
    discountedPrice: "",
    stock: "",
    stockUnit: "",
    discountPercentage: "", // Will be calculated or fetched
    brand: "",
    status: "active",
    isFeatured: false,
    images: [], // Holds { url: '...', publicId: '...' }
    locations: [],
  });

  const { productId } = useParams();
  const navigate = useNavigate();

  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingAddImages, setPendingAddImages] = useState([]); // Files to be uploaded { id: tempId, file: File }
  const [pendingDeleteImages, setPendingDeleteImages] = useState([]); // publicIds of Cloudinary images to delete
  const [locationInputValue, setLocationInputValue] = useState(""); // For location input
  // const [isUploading, setIsUploading] = useState(false); // Can be useful if adding images is a separate step
  const [filteredLocations, setFilteredLocations] = useState([]);
  // const [replacedImagesMap, setReplacedImagesMap] = useState({}); // For tracking, might not be strictly needed for backend
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null); // For adding new images
  const replaceFileRefs = useRef([]); // For replacing existing images
  const locationDropdownRef = useRef(null);

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

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      toast.error("No product ID provided.");
      setIsLoadingProduct(false);
      navigate("/"); // Or to a relevant error page/product list
      return;
    }
    setIsLoadingProduct(true);
    try {
      const req = await axios.get(
        `${serverUrl}/api/product/admin/get-product/${productId}`,
        { withCredentials: true }
      );
      if (req.data.data.product) {
        const fetchedProduct = req.data.data.product;
        setProduct({
          ...fetchedProduct,
          actualPrice: fetchedProduct.actualPrice || "",
          discountedPrice: fetchedProduct.discountedPrice || "",
          stock: fetchedProduct.stock || "",
          isFeatured: fetchedProduct.isFeatured || false,
          images: fetchedProduct.images || [],
          locations: fetchedProduct.locations || [],
        });
      } else {
        toast.error("Product not found.");
        setProduct(null); // Explicitly set to null or an empty state
        navigate("/"); // Or your products list page
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch product details."
      );
      setProduct(null); // Indicate error or not found
      navigate("/");
    } finally {
      setIsLoadingProduct(false);
    }
  }, [serverUrl, productId, navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProduct();
    }
  }, [isLoggedIn, fetchProduct]); // fetchProduct is memoized by useCallback

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isTemporaryImage = (publicId) =>
    publicId && publicId.startsWith("temp-");

  const handleAddNewImages = (e) => {
    const files = Array.from(e.target.files);
    const currentImageCount = product.images.length;
    const newImagesForPreview = [];
    const newPendingImages = [];

    files.forEach((file) => {
      if (product.images.length + newImagesForPreview.length >= 6) {
        toast.warn("Maximum 6 images allowed.");
        return; // Stop processing if limit is reached
      }
      // Add validation for type and size here if needed
      const reader = new FileReader();
      const imageId = `temp-${Date.now()}-${file.name}`;
      reader.onloadend = () => {
        newImagesForPreview.push({ url: reader.result, publicId: imageId });
        // Directly update product state for preview
        setProduct((prev) => ({
          ...prev,
          images: [...prev.images, { url: reader.result, publicId: imageId }],
        }));
      };
      reader.readAsDataURL(file);
      newPendingImages.push({ id: imageId, file });
    });

    setPendingAddImages((prev) => [
      ...prev,
      ...newPendingImages.slice(0, 6 - currentImageCount),
    ]);

    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleDeleteImage = (publicIdToDelete, index) => {
    const imageExists = product.images.find(
      (img) => img.publicId === publicIdToDelete
    );
    if (!imageExists) return;

    if (!isTemporaryImage(publicIdToDelete)) {
      // It's a Cloudinary image, mark for deletion on backend
      setPendingDeleteImages((prev) => [
        ...new Set([...prev, publicIdToDelete]),
      ]);
    } else {
      // It's a new temporary image, remove from pendingAddImages
      setPendingAddImages((prev) =>
        prev.filter((pImg) => pImg.id !== publicIdToDelete)
      );
    }
    // Remove from UI
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.publicId !== publicIdToDelete),
    }));
  };

  const handleReplaceImage = (indexToReplace) => {
    const file = replaceFileRefs.current[indexToReplace]?.files[0];
    if (!file) return;

    const oldImage = product.images[indexToReplace];
    if (!oldImage) return;

    // Add validation for type and size here if needed
    const reader = new FileReader();
    reader.onloadend = () => {
      const newTempId = `temp-${Date.now()}-${file.name}`;
      const newImagePreview = { url: reader.result, publicId: newTempId };

      // Update UI
      const updatedImages = [...product.images];
      updatedImages[indexToReplace] = newImagePreview;
      setProduct((prev) => ({ ...prev, images: updatedImages }));

      // Manage pending states
      if (!isTemporaryImage(oldImage.publicId)) {
        setPendingDeleteImages((prev) => [
          ...new Set([...prev, oldImage.publicId]),
        ]);
      } else {
        setPendingAddImages((prev) =>
          prev.filter((pImg) => pImg.id !== oldImage.publicId)
        );
      }
      setPendingAddImages((prev) => [...prev, { id: newTempId, file }]);
    };
    reader.readAsDataURL(file);
    if (replaceFileRefs.current[indexToReplace])
      replaceFileRefs.current[indexToReplace].value = null;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue =
      name === "isFeatured"
        ? value === "true"
        : type === "number"
        ? value === ""
          ? ""
          : Number(value)
        : value;
    setProduct((prev) => ({ ...prev, [name]: processedValue }));
  };

  const calculateDiscountPercentage = useCallback(() => {
    const actual = parseFloat(product.actualPrice);
    const discounted = parseFloat(product.discountedPrice);
    if (
      !isNaN(actual) &&
      actual > 0 &&
      !isNaN(discounted) &&
      discounted > 0 &&
      discounted <= actual
    ) {
      return Math.round(((actual - discounted) / actual) * 100);
    }
    return product.discountPercentage || ""; // Keep existing if not calculable or fallback
  }, [
    product.actualPrice,
    product.discountedPrice,
    product.discountPercentage,
  ]);

  const validateProduct = () => {
    let errors = [];
    if (!product.name?.trim()) errors.push("Product name is required.");
    if (!product.description?.trim()) errors.push("Description is required.");
    if (!product.category) errors.push("Category is required.");
    if (!product.brand?.trim()) errors.push("Brand is required.");
    if (!product.stockUnit) errors.push("Stock unit is required.");
    if (!product.locations || product.locations.length === 0)
      errors.push("At least one location is required.");
    if (!product.status) errors.push("Product status is required.");

    const actualPrice = parseFloat(product.actualPrice);
    if (isNaN(actualPrice) || actualPrice <= 0)
      errors.push("Actual price must be a positive number.");
    if (product.discountedPrice) {
      const discountedPrice = parseFloat(product.discountedPrice);
      if (isNaN(discountedPrice) || discountedPrice <= 0)
        errors.push("Discounted price must be positive if provided.");
      if (discountedPrice > actualPrice)
        errors.push("Discounted price cannot exceed actual price.");
    }
    const stock = parseInt(product.stock);
    if (isNaN(stock) || stock < 0)
      errors.push("Stock must be a non-negative number.");
    if (!product.images || product.images.length === 0)
      errors.push("At least one product image is required.");

    errors.forEach((err) => toast.error(err));
    return errors.length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateProduct()) return;
    setIsSaving(true);

    const finalDiscountPercentage = calculateDiscountPercentage();
    const productDataToSubmit = {
      ...product,
      discountPercentage: finalDiscountPercentage,
      images: product.images
        .filter((img) => !isTemporaryImage(img.publicId))
        .map((img) => ({ url: img.url, publicId: img.publicId })), // Send only existing Cloudinary images' info
    };

    // delete productDataToSubmit._id; // // API might not want _id in body, or might use it for update path

    const formData = new FormData();
    formData.append("product", JSON.stringify(productDataToSubmit));
    pendingAddImages.forEach(({ file }) => formData.append("newImages", file)); // Changed key to 'newImages'
    formData.append("imagesToDelete", JSON.stringify(pendingDeleteImages));

    try {
      const res = await axios.put(
        // Changed to PUT for update
        `${serverUrl}/api/product/admin/edit-product/${productId}`, // Ensure productId is used
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success && res.data.data.product) {
        toast.success("Product updated successfully!");
        // Optionally refetch or update state more precisely
        setPendingAddImages([]);
        setPendingDeleteImages([]);
        fetchProduct(); // Refetch to get the latest state including new image URLs
        navigate(`/view-product/${res.data.data.product._id || productId}`, {
          state: { successMessage: "Product updated successfully" },
        });
      } else {
        toast.error(
          res.data.message || "Failed to update product. Please try again."
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setIsSaving(false);
    }
  };

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
    setLocationInputValue("");
    setFilteredLocations(
      allLocations.filter(
        (loc) => !product.locations.includes(loc) && loc !== location
      )
    );
    setIsDropdownOpen(false);
  };

  const handleLocationRemove = (locationToRemove) => {
    setProduct((prev) => ({
      ...prev,
      locations: prev.locations.filter((loc) => loc !== locationToRemove),
    }));
  };

  useEffect(() => {
    const currentLocationsLower =
      product.locations?.map((l) => l.toLowerCase()) || [];
    const filtered = locationInputValue
      ? allLocations.filter(
          (loc) =>
            loc.toLowerCase().includes(locationInputValue.toLowerCase()) &&
            !currentLocationsLower.includes(loc.toLowerCase())
        )
      : allLocations.filter(
          (loc) => !currentLocationsLower.includes(loc.toLowerCase())
        );
    setFilteredLocations(filtered);
  }, [locationInputValue, product.locations]);

  const mainContentClass = `min-h-screen flex flex-col items-center bg-gray-50 dark:bg-slate-900 py-6 sm:py-8 px-4 transition-all duration-300 ease-in-out ${
    isSideBarOpened && isLargeScreen ? "lg:ml-72" : "w-full"
  }`;

  // Common ClassNames for form elements (assuming custom components accept className)
  const inputClassName =
    "w-full px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent dark:focus:border-transparent placeholder-gray-400 dark:placeholder-slate-400 transition-colors";
  const labelClassName =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  if (!isLoggedIn) {
    return (
      <div className={`${mainContentClass} justify-center`}>
        <div className="text-center p-8 bg-white dark:bg-slate-800 shadow-xl rounded-xl max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-6" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm sm:text-base">
            Please log in to edit product details.
          </p>
          <button
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            onClick={() => navigate("/login")}
            aria-label="Go to Login Page"
          >
            <Home size={20} />{" "}
            {/* Changed to Home for consistency, or use LogIn icon */}
            Go to Login
          </button>
        </div>
        <ToastContainer position="bottom-right" theme="colored" />
      </div>
    );
  }

  if (isLoadingProduct) {
    return (
      <div className={`${mainContentClass} justify-center`}>
        <div className="flex flex-col items-center p-10 bg-white dark:bg-slate-800 shadow-xl rounded-xl">
          <LoaderCircle className="w-12 h-12 text-teal-600 dark:text-teal-400 animate-spin mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading Product Details...
          </p>
        </div>
        <ToastContainer position="bottom-right" theme="colored" />
      </div>
    );
  }

  if (!product) {
    // Product not found or error after loading
    return (
      <div className={`${mainContentClass} justify-center`}>
        <div className="text-center p-8 bg-white dark:bg-slate-800 shadow-xl rounded-xl max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-6" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            The product you are trying to edit could not be found or an error
            occurred.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
            aria-label="Back to Products"
          >
            Back to Products
          </button>
        </div>
        <ToastContainer position="bottom-right" theme="colored" />
      </div>
    );
  }

  return (
    <div className={mainContentClass}>
      <div className="w-full max-w-6xl space-y-8">
        <header className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Edit3 className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Edit Product
              </h1>
            </div>
            <button
              onClick={() => navigate("/")} // Or to product list
              className="flex items-center gap-2 text-sm font-medium py-2.5 px-5 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-300"
              aria-label="Go to Dashboard"
            >
              <Home size={18} />
              <span>Dashboard</span>
            </button>
          </div>
        </header>

        {/* Basic Information */}
        <section className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-slate-700">
            Basic Information
          </h2>
          <div className="space-y-6">
            <FormField
              label="Product Name"
              htmlFor="name"
              labelClassName={labelClassName}
            >
              <Input
                name="name"
                value={product.name}
                onChange={handleInputChange}
                placeholder="e.g., Premium Wireless Headphones"
                className={inputClassName}
              />
            </FormField>
            <FormField
              label="Description"
              htmlFor="description"
              labelClassName={labelClassName}
            >
              <Textarea
                name="description"
                value={product.description}
                onChange={handleInputChange}
                placeholder="Detailed description of the product..."
                rows={5}
                className={inputClassName}
              />
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                label="Category"
                htmlFor="category"
                labelClassName={labelClassName}
              >
                <Select
                  name="category"
                  value={product.category}
                  onChange={handleInputChange}
                  className={inputClassName}
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home & Kitchen</option>
                  <option value="Sports">Sports & Outdoors</option>
                  {/* Add more categories */}
                </Select>
              </FormField>
              <FormField
                label="Sub-Category (Optional)"
                htmlFor="subCategory"
                labelClassName={labelClassName}
              >
                <Input
                  name="subCategory"
                  value={product.subCategory || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., Mens T-shirts, Over-ear"
                  className={inputClassName}
                />
              </FormField>
              <FormField
                label="Brand"
                htmlFor="brand"
                labelClassName={labelClassName}
              >
                <Input
                  name="brand"
                  value={product.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Sony, Nike, Apple"
                  className={inputClassName}
                />
              </FormField>
            </div>
          </div>
        </section>

        {/* Pricing & Stock Section */}
        <section className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-slate-700">
            Pricing & Stock
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              label="Actual Price ($)"
              htmlFor="actualPrice"
              labelClassName={labelClassName}
            >
              <Input
                type="number"
                name="actualPrice"
                value={product.actualPrice}
                onChange={handleInputChange}
                placeholder="e.g., 199.99"
                className={inputClassName}
              />
            </FormField>
            <FormField
              label="Discounted Price ($) (Optional)"
              htmlFor="discountedPrice"
              labelClassName={labelClassName}
            >
              <Input
                type="number"
                name="discountedPrice"
                value={product.discountedPrice}
                onChange={handleInputChange}
                placeholder="e.g., 149.99"
                className={inputClassName}
              />
            </FormField>
            <FormField
              label="Discount Percentage (%)"
              htmlFor="discountPercentage"
              labelClassName={labelClassName}
            >
              <Input
                type="text"
                name="discountPercentage"
                value={calculateDiscountPercentage()}
                readOnly
                placeholder="Auto-calculated"
                className={`${inputClassName} bg-gray-100 dark:bg-slate-600 cursor-not-allowed`}
              />
            </FormField>
            <FormField
              label="Stock Quantity"
              htmlFor="stock"
              labelClassName={labelClassName}
            >
              <Input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleInputChange}
                placeholder="e.g., 150"
                className={inputClassName}
              />
            </FormField>
            <FormField
              label="Stock Unit"
              htmlFor="stockUnit"
              labelClassName={labelClassName}
            >
              <Select
                name="stockUnit"
                value={product.stockUnit}
                onChange={handleInputChange}
                className={inputClassName}
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
        <section className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-slate-700">
            Settings & Availability
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Product Status"
              htmlFor="status"
              labelClassName={labelClassName}
            >
              <Select
                name="status"
                value={product.status}
                onChange={handleInputChange}
                className={inputClassName}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </Select>
            </FormField>
            <FormField
              label="Is Featured Product?"
              htmlFor="isFeatured"
              labelClassName={labelClassName}
            >
              <Select
                name="isFeatured"
                value={product.isFeatured.toString()}
                onChange={handleInputChange}
                className={inputClassName}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </Select>
            </FormField>
          </div>

          <FormField
            label="Available Locations"
            htmlFor="location-input"
            className="mt-6"
            labelClassName={labelClassName}
          >
            <div className="relative" ref={locationDropdownRef}>
              <div
                className={`flex flex-wrap gap-2 p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 mb-2 min-h-[48px] items-center ${inputClassName} h-auto`}
              >
                {product.locations?.map((location) => (
                  <span
                    key={location}
                    className="flex items-center gap-1.5 bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-100 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full"
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => handleLocationRemove(location)}
                      className="text-teal-500 dark:text-teal-300 hover:text-teal-700 dark:hover:text-teal-100"
                      aria-label={`Remove ${location}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <input
                  id="location-input"
                  type="text"
                  value={locationInputValue}
                  onChange={(e) => setLocationInputValue(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="flex-grow p-1 outline-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400"
                  placeholder={
                    product.locations?.length > 0
                      ? "Add another..."
                      : "Type to search locations..."
                  }
                />
              </div>
              {isDropdownOpen && (
                <ul className="absolute w-full max-h-60 overflow-y-auto bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg z-20 mt-1">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((location) => (
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
                    ))
                  ) : (
                    <li className="px-4 py-2.5 text-sm text-gray-500 dark:text-slate-400 italic">
                      No locations match your search.
                    </li>
                  )}
                </ul>
              )}
            </div>
            {product.locations?.length > 0 && (
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setProduct((prev) => ({ ...prev, locations: [] }))
                  }
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                  aria-label="Clear all selected locations"
                >
                  Clear All Locations
                </button>
              </div>
            )}
          </FormField>
        </section>

        {/* Media Section */}
        <section className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-slate-700">
            Product Media
          </h2>
          <FormField
            label="Product Images (Max 6, up to 5MB each)"
            htmlFor="fileUpload"
            labelClassName={labelClassName}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              {product.images?.map((image, index) => (
                <div
                  key={image.publicId || `img-${index}`}
                  className="relative group aspect-w-1 aspect-h-1"
                >
                  <img
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 rounded-lg flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => replaceFileRefs.current[index]?.click()}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md"
                      aria-label={`Replace image ${index + 1}`}
                    >
                      <Replace size={16} />
                    </button>
                    <input
                      type="file"
                      className="hidden"
                      ref={(el) => (replaceFileRefs.current[index] = el)}
                      onChange={() => handleReplaceImage(index)}
                      accept="image/jpeg,image/png,image/gif,image/webp"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.publicId, index)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md"
                      aria-label={`Delete image ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {product.images?.length < 6 && (
                <label
                  htmlFor="fileUpload"
                  className="aspect-w-1 aspect-h-1 cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-teal-500 dark:hover:border-teal-400 rounded-lg text-gray-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-150 ease-in-out p-2"
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
              onChange={handleAddNewImages}
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/gif,image/webp"
              disabled={product.images?.length >= 6 || isSaving}
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Accepted formats: JPG, PNG, GIF, WEBP.{" "}
              {Math.max(0, 6 - (product.images?.length || 0))} slots remaining.
            </p>
          </FormField>
        </section>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-6 pb-2">
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving || isLoadingProduct}
            className={`flex items-center justify-center gap-2.5 min-w-[200px] bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
              ${
                isSaving || isLoadingProduct
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }
            `}
            aria-label="Save all changes to product"
          >
            {isSaving ? (
              <>
                <LoaderCircle size={20} className="animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
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

export default ProductEdit;
