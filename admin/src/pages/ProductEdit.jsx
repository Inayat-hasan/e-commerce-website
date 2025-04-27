import {
  faChevronDown,
  faHome,
  faSyncAlt,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "../redux/hooks";
import { selectIsOpen } from "../redux/reducers/sidebar/sidebarSelector";
import { selectIsLoggedIn } from "../redux/reducers/authentication/authSelector";

const ProductEdit = () => {
  const { isMenuOpen } = useMenu();
  const isUserLoggedIn = useAppSelector(selectIsLoggedIn);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const isSideBarOpened = useAppSelector(selectIsOpen);
  const [productName, setProductName] = useState(""); // 1
  const [description, setDescription] = useState(""); // 2
  const [category, setCategory] = useState(""); // 3
  const [subCategory, setSubCategory] = useState(""); // 4
  const [actualPrice, setActualPrice] = useState(""); // 5
  const [discountedPrice, setDiscountedPrice] = useState(""); // 6
  const [stock, setStock] = useState(""); // 7
  const [stockUnit, setStockUnit] = useState(""); // 8
  const [brand, setBrand] = useState(""); // 9
  const [status, setStatus] = useState(""); // 10
  const [isFeatured, setIsFeatured] = useState(""); // 11
  const [locations, setLocations] = useState([]); // 12
  const [images, setImages] = useState([]);
  const [product, setProduct] = useState({});
  const { productId } = useParams();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingDeleteImages, setPendingDeleteImages] = useState([]);
  const [pendingAddImages, setPendingAddImages] = useState([]);
  const [pendingReplaceImages, setPendingReplaceImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(allLocations);

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const req = await axios.get(
          `${serverUrl}/api/product/admin/get-product/${productId}`
        );
        if (req.status === 200) {
          const product = req.data.data.product;
          setProduct(product);
          setProductName(product.name); // 1
          setDescription(product.description); // 2
          setCategory(product.category); // 3
          setSubCategory(product.subCategory); // 4
          setActualPrice(product.actualPrice); // 5
          setDiscountedPrice(product.discountedPrice); // 6
          setStock(product.stock); // 7
          setStockUnit(product.stockUnit); // 8
          setBrand(product.brand); // 9
          setStatus(product.status); // 10
          setIsFeatured(product.isFeatured); // 11
          setLocations(product.locations || []); // 12
          setImages(product.images);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchProduct();
  }, [productId]);

  const replaceFileRef = useRef([]);

  const handleImageOperations = {
    add: (e) => {
      const files = Array.from(e.target.files);
      setIsUploading(true);

      files.forEach((file) => {
        // Add raw file to pendingAddImages
        setPendingAddImages((prev) => [...prev, file]);

        // Create FileReader for preview
        const reader = new FileReader();
        reader.onload = () => {
          // Create preview object
          const previewImage = {
            url: reader.result,
            file: file,
            publicId: `temp-${Date.now()}-${file.name}`,
          };
          setImages((prev) => [...prev, previewImage]);
        };
        reader.readAsDataURL(file);
      });

      setIsUploading(false);
      fileInputRef.current.value = null;
      setHasUnsavedChanges(true);
    },

    replace: async (oldImage, index) => {
      const file = replaceFileRef.current[index].files[0];
      if (!file) return;

      // Create FileReader for preview
      const reader = new FileReader();
      reader.onload = () => {
        // Create preview object
        const previewImage = {
          url: reader.result,
          file: file,
          publicId: oldImage.publicId, // Keep old publicId for reference
        };

        // Update images array with preview
        setImages((prev) =>
          prev.map((img, idx) => (idx === index ? previewImage : img))
        );

        // Add to pending replacements
        setPendingReplaceImages((prev) => [...prev, [oldImage, file]]);
        setHasUnsavedChanges(true);
      };

      // Read file as data URL for preview
      reader.readAsDataURL(file);
      replaceFileRef.current[index].value = null;
    },

    delete: (publicId) => {
      const imageToDelete = images.find((img) => img.publicId === publicId);
      if (!imageToDelete) return;

      setPendingDeleteImages((prev) => [...prev, imageToDelete]);
      setImages((prev) => prev.filter((img) => img.publicId !== publicId));
      setHasUnsavedChanges(true);
    },
  };

  const fileInputRef = useRef(null);

  const validateProduct = () => {
    const errors = {
      productName: !productName.trim() && "Product name is required",
      category: !category && "Category is required",
      actualPrice:
        (isNaN(parseFloat(actualPrice)) || parseFloat(actualPrice) <= 0) &&
        "Actual price must be a positive number",
      discountedPrice:
        discountedPrice &&
        (isNaN(parseFloat(discountedPrice)) ||
          parseFloat(discountedPrice) <= 0) &&
        "Discounted price must be a positive number",
      priceComparison:
        parseFloat(discountedPrice) > parseFloat(actualPrice) &&
        "Discounted price cannot be greater than actual price",
      stock:
        (isNaN(parseInt(stock)) || parseInt(stock) < 0) &&
        "Stock must be a non-negative number",
      images: images.length === 0 && "At least one product image is required",
    };

    const activeErrors = Object.values(errors).filter(Boolean);
    return {
      isValid: activeErrors.length === 0,
      errors: activeErrors,
    };
  };

  const handlePublish = async () => {
    const validation = validateProduct();
    if (!validation.isValid) {
      alert(
        "Please correct the following errors:\n" + validation.errors.join("\n")
      );
      return;
    }

    try {
      const response = await axios.post(
        `${serverUrl}/api/product/admin/update-product/${productId}`,
        {
          productName,
          description,
          category,
          subCategory,
          actualPrice,
          discountedPrice,
          stock,
          stockUnit,
          brand,
          status,
          isFeatured,
          locations,
          images,
          pendingAddImages,
          pendingDeleteImages,
          pendingReplaceImages,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setHasUnsavedChanges(false);
        navigate(`/admin/product/${productId}`);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Please try again.");
    }
  };

  const handleLocationSelect = (location) => {
    // Normalize location for case-insensitive comparison
    const normalizedLocation = location.toLowerCase();
    if (locations.some((loc) => loc.toLowerCase() === normalizedLocation)) {
      return;
    }
    setLocations((prev) => [...prev, location]);
    setInputValue("");
    setFilteredLocations(allLocations);
  };

  const handleLocationRemove = (locationToRemove) => {
    setLocations((prev) => prev.filter((loc) => loc !== locationToRemove));
    setHasUnsavedChanges(true);
  };

  const filterLocations = (input) => {
    const normalizedInput = input.toLowerCase();
    const filtered = allLocations.filter(
      (loc) =>
        loc.toLowerCase().includes(normalizedInput) &&
        !locations.some(
          (selected) => selected.toLowerCase() === loc.toLowerCase()
        )
    );
    setFilteredLocations(filtered);
  };

  useEffect(() => {
    if (inputValue) {
      filterLocations(inputValue);
    } else {
      // Show only unselected locations when input is empty
      setFilteredLocations(
        allLocations.filter(
          (loc) =>
            !locations.some(
              (selected) => selected.toLowerCase() === loc.toLowerCase()
            )
        )
      );
    }
  }, [inputValue, locations]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".location-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div
      className={`flex flex-col gap-4 bg-gray-300 items-center justify-center py-4 ${
        isSideBarOpened ? "ml-72" : "w-full"
      }`}
    >
      {/* Header */}
      <div className="bg-teal-900 text-white w-[95%] rounded-lg flex items-center justify-between px-6 py-4">
        <p className="text-3xl font-serif cursor-default">Product Edit</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-teal-600 p-1 rounded-xl hover:bg-teal-700 flex items-center gap-1"
          >
            <FontAwesomeIcon aria-hidden="true" icon={faHome}></FontAwesomeIcon>
            <span>Dashboard</span>
          </button>
          <span className="text-2xl">/</span>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-teal-600 p-1 rounded-xl hover:bg-teal-700"
          >
            Products
          </button>
          <span className="text-2xl">/</span>
          <button className="bg-teal-600 p-1 rounded-xl hover:bg-teal-700">
            Product View
          </button>
        </div>
      </div>
      {/* Basic Information */}
      <div className="bg-teal-900 text-white w-[95%] rounded-lg flex flex-col px-6 py-4 justify-center gap-2">
        {/* Heading */}
        <h5 className="text-2xl font-serif cursor-default">
          Basic Information
        </h5>
        {/* Product Name */}
        <div className="flex flex-col gap-1">
          <label>PRODUCT NAME</label>
          <input
            type="text"
            name="productName"
            className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        {/* Description */}
        <div className="flex flex-col gap-1">
          <label>DESCRIPTION</label>
          <textarea
            type="text"
            name="description"
            id=""
            placeholder="Description"
            className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {/* grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2">
          <div id="1" className="flex flex-col gap-2">
            <label>CATEGORY</label>
            <select
              value={category}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg cursor-pointer"
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Electronics</option>
              <option value="">Men</option>
              <option value="">Women</option>
            </select>
          </div>
          <div id="2" className="flex flex-col gap-2">
            <label>SUB-CATEGORY</label>
            <select
              onChange={(e) => setSubCategory(e.target.value)}
              name=""
              id=""
              value={subCategory}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg cursor-pointer"
            >
              <option value="">Men</option>
              <option value="">Women</option>
            </select>
          </div>
          <div id="3" className="flex flex-col gap-2">
            <label>ACTUAL-PRICE</label>
            <input
              onChange={(e) => setActualPrice(e.target.value)}
              type="text"
              name=""
              id=""
              value={actualPrice}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
              placeholder="Actual Price"
            />
          </div>
          <div id="4" className="flex flex-col gap-2">
            <label>DISCOUNTED-PRICE</label>
            <input
              onChange={(e) => setDiscountedPrice(e.target.value)}
              type="text"
              name=""
              id=""
              value={discountedPrice}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
              placeholder="Discounted Price"
            />
          </div>
          <div id="5" className="flex flex-col gap-2">
            <label>STOCK</label>
            <input
              onChange={(e) => setStock(e.target.value)}
              type="text"
              name=""
              id=""
              value={stock}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
              placeholder="Stock"
            />
          </div>
          <div id="6" className="flex flex-col gap-2">
            <label>STOCK-UNIT</label>
            <select
              onChange={(e) => setStockUnit(e.target.value)}
              name=""
              id=""
              value={stockUnit}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg cursor-pointer"
            >
              <option value="">Kg</option>
              <option value="">Litre</option>
            </select>
          </div>
          <div id="7" className="flex flex-col gap-2">
            <label>STATUS</label>
            <select
              onChange={(e) => setStatus(e.target.value)}
              name=""
              id=""
              value={status}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg cursor-pointer"
            >
              <option value="">Active</option>
              <option value="">Inactive</option>
            </select>
          </div>
          <div id="8" className="flex flex-col gap-2">
            <label>IS-FEATURED</label>
            <select
              onChange={(e) => setIsFeatured(e.target.value)}
              name=""
              id=""
              value={isFeatured}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg cursor-pointer"
            >
              <option value="">True</option>
              <option value="">False</option>
            </select>
          </div>
          <div id="9" className="flex flex-col gap-2">
            <label>BRAND</label>
            <input
              onChange={(e) => setBrand(e.target.value)}
              type="text"
              name=""
              id=""
              value={brand}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
              placeholder="Brand"
            />
          </div>
        </div>
        {/* LOCATION */}
        <div className="flex flex-col gap-1">
          <label>LOCATION</label>
          <div className="bg-[#306c67] rounded-md flex gap-3 items-center">
            <div className="flex flex-wrap gap-1 pl-1 py-2">
              {locations.map((location) => (
                <div
                  key={location}
                  className="bg-teal-800 text-white rounded-xl flex items-center border border-teal-600 font-semibold justify-center pl-2 py-1 text-sm"
                >
                  {location}
                  <button
                    onClick={() => handleLocationRemove(location)}
                    className="text-white h-7 w-7 rounded-full hover:bg-teal-700"
                  >
                    <FontAwesomeIcon aria-hidden="true" icon={faXmark} />
                  </button>
                </div>
              ))}
            </div>

            <div className="relative flex-1 location-dropdown">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                className="outline-none h-10 pl-2 bg-teal-900 text-lg rounded-xl w-full"
                placeholder="Add a location..."
              />
              {isDropdownOpen && filteredLocations.length > 0 && (
                <ul className="absolute w-full bg-teal-700 mt-1 rounded-md shadow-md z-10 max-h-48 overflow-y-auto">
                  {filteredLocations.map((location) => (
                    <li
                      key={location}
                      onClick={() => handleLocationSelect(location)}
                      className="px-3 py-2 cursor-pointer text-white hover:bg-teal-600 transition-colors"
                    >
                      {location}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-row gap-1 justify-center items-center">
              <button
                onClick={() => {
                  setLocations([]);
                  setHasUnsavedChanges(true);
                }}
                className="text-xl hover:bg-teal-800 px-2 py-1 rounded-xl"
              >
                <FontAwesomeIcon aria-hidden="true" icon={faXmark} />
              </button>
              <span className="bg-white w-0.5 h-9"></span>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-xl hover:bg-teal-800 px-2 py-1 rounded-xl"
              >
                <FontAwesomeIcon aria-hidden="true" icon={faChevronDown} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Media And Published */}
      <div className="bg-teal-900 text-white w-[95%] rounded-lg flex flex-col justify-center px-6 py-4 gap-3">
        <h5 className="self-start text-2xl font-serif cursor-default">
          Media And Published
        </h5>
        <div className="flex flex-row gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.url}
                alt={`Product ${index + 1}`}
                className="w-28 h-32 object-cover rounded-lg border-2 border-teal-800"
              />
              <button
                onClick={() => handleImageOperations.delete(image.publicId)}
                className="absolute -top-2 -right-2 bg-red-500 h-6 w-6 rounded-full"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <input
                type="file"
                className="hidden"
                ref={(el) => (replaceFileRef.current[index] = el)}
                onChange={() => handleImageOperations.replace(image, index)}
                accept="image/*"
              />
              <button
                onClick={() => replaceFileRef.current[index].click()}
                className="absolute top-5 -right-2 bg-white text-teal-900 h-6 w-6 rounded-full"
              >
                <FontAwesomeIcon icon={faSyncAlt} />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-center bg-teal-800 rounded-lg">
            <input
              type="file"
              multiple
              className="hidden"
              id="fileUpload"
              onChange={handleImageOperations.add}
              ref={fileInputRef}
              accept="image/*"
              disabled={isUploading}
            />
            <label
              htmlFor="fileUpload"
              className={`cursor-pointer w-28 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 hover:border-teal-900 hover:bg-teal-50 hover:text-teal-800 transition-colors ease-in-out duration-300 rounded-lg text-gray-300 ${
                isUploading ? "opacity-50" : ""
              }`}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
              ) : (
                <>
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 576 512"
                    height="2em"
                    width="2em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M480 416v16c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V176c0-26.51 21.49-48 48-48h16v48H54a6 6 0 0 0-6 6v244a6 6 0 0 0 6 6h372a6 6 0 0 0 6-6v-10h48zm42-336H150a6 6 0 0 0-6 6v244a6 6 0 0 0 6 6h372a6 6 0 0 0 6-6V86a6 6 0 0 0-6-6zm6-48c26.51 0 48 21.49 48 48v256c0 26.51-21.49 48-48 48H144c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h384zM264 144c0 22.091-17.909 40-40 40s-40-17.909-40-40 17.909-40 40-40 40 17.909 40 40zm-72 96l39.515-39.515c4.686-4.686 12.284-4.686 16.971 0L288 240l103.515-103.515c4.686-4.686 12.284-4.686 16.971 0L480 208v80H192v-48z"></path>
                  </svg>
                  <p className="text-sm text-center">Add Images</p>
                </>
              )}
            </label>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <button
            onClick={handlePublish}
            className="bg-green-600 flex flex-row items-center justify-center gap-2 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl w-[100%] border-2 border-green-500 hover:border-green-600"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 640 512"
              height="1.5em"
              width="1.5em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zM393.4 288H328v112c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16V288h-65.4c-14.3 0-21.4-17.2-11.3-27.3l105.4-105.4c6.2-6.2 16.4-6.2 22.6 0l105.4 105.4c10.1 10.1 2.9 27.3-11.3 27.3z"></path>
            </svg>
            Publish And View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;

// for example, product : {
//   "_id":  "67cf658b903ee894b6e27f16",
//   "name": "Oriental Steel Salad",
//   "description": "The Horizontal mobile moratorium Hat offers reliable performance and shy design",
//   "actualPrice": 464.39,
//   "brand": "Hilpert - Franecki",
//   "stock": 75,
//   "stockUnit": "pieces",
//   "admin": "67c05520634a0170758de266",
//   "images": [
//     {
//       "publicId": "bdab1ebb-c744-4b3f-a5e2-6dab0bb10a97",
//       "url": "https://loremflickr.com/23/884?lock=988385178348345",
//     },
//     {
//       "publicId": "d77e3f66-927a-4eff-9e2f-2de677538c31",
//       "url": "https://loremflickr.com/1955/1936?lock=6604803886033999",
//     },
//     {
//       "publicId": "d55f297b-2c08-4aad-ab2b-03d8b44c56ac",
//       "url": "https://loremflickr.com/1854/1064?lock=5002704257188413",
//     },
//     {
//       "publicId": "6ea86361-593b-40ec-bb67-7d079053932d",
//       "url": "https://loremflickr.com/3234/2514?lock=7884969944064260",
//     },
//     {
//       "publicId": "c20d3306-cedf-49b0-ae97-0f2593ddf392",
//       "url": "https://picsum.photos/seed/oAqm2j/2270/252",
//     }
//   ],
//   "category": "Music",
//   "reviews": [],
//   "discountedPrice": 924.15,
//   "locations": ["india","nepal","australia","america"],
//   "status": "active",
//   "isFeatured": false,
//   "__v": 0,
//   "createdAt": "2025-03-10T22:19:55.915Z",
//   "updatedAt": "2025-03-10T22:19:55.915Z"
// }
