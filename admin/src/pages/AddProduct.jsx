import {
  faChevronDown,
  faHome,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { selectIsOpen } from "../redux/reducers/sidebar/sidebarSelector.js";

const AddProduct = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [stock, setStock] = useState("");
  const [stockUnit, setStockUnit] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("active");
  const [isFeatured, setIsFeatured] = useState(false);
  const [locations, setLocations] = useState([]);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const isSideBarOpened = useAppSelector(selectIsOpen);

  const fileInputRef = useRef(null);

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
    if (locations.some((loc) => loc.toLowerCase() === location.toLowerCase())) {
      return;
    }
    setLocations([...locations, location]);
    setInputValue("");
    setIsDropdownOpen(false);
  };

  const handleLocationRemove = (locationToRemove) => {
    setLocations(locations.filter((loc) => loc !== locationToRemove));
  };

  const filterLocations = (input) => {
    if (!input) {
      setFilteredLocations(allLocations);
      return;
    }
    const filtered = allLocations.filter((loc) =>
      loc.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredLocations(filtered);
  };

  useEffect(() => {
    const timer = setTimeout(() => filterLocations(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const validateProduct = () => {
    let errors = [];

    if (!productName.trim()) errors.push("Product name is required");
    if (!category) errors.push("Category is required");
    if (isNaN(parseFloat(actualPrice)) || parseFloat(actualPrice) <= 0) {
      errors.push("Actual price must be a positive number");
    }
    if (
      discountedPrice &&
      (isNaN(parseFloat(discountedPrice)) || parseFloat(discountedPrice) <= 0)
    ) {
      errors.push("Discounted price must be a positive number");
    }
    if (parseFloat(discountedPrice) > parseFloat(actualPrice)) {
      errors.push("Discounted price cannot be greater than actual price");
    }
    if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      errors.push("Stock must be a non-negative number");
    }
    if (images.length === 0) {
      errors.push("At least one product image is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
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
    // Add your publish logic here
    const productData = {
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
    };
    console.log("Product data to submit:", productData);
    // Add your API call here
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Temporarily store files as URLs for preview
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [
          ...prev,
          {
            url: reader.result,
            file: file,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    fileInputRef.current.value = null;
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`flex flex-col gap-4 bg-gray-300 items-center justify-center py-4`}
    >
      {/* Header */}
      <div className="bg-teal-900 text-white w-[95%] rounded-lg flex items-center justify-between px-6 py-4">
        <p className="text-3xl font-serif cursor-default">Add Product</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-teal-600 p-1 rounded-xl hover:bg-teal-700 flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-teal-900 text-white w-[95%] rounded-lg flex flex-col px-6 py-4 justify-center gap-2">
        <h5 className="text-2xl font-serif cursor-default">
          Basic Information
        </h5>

        {/* Product Name */}
        <div className="flex flex-col gap-1">
          <label>PRODUCT NAME</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
            placeholder="Product Name"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label>DESCRIPTION</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
            placeholder="Description"
          />
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2">
          {/* Category */}
          <div className="flex flex-col gap-2">
            <label>CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg cursor-pointer"
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label>SUB-CATEGORY</label>
            <select
              onChange={(e) => setSubCategory(e.target.value)}
              value={subCategory}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg cursor-pointer"
            >
              <option value="">Select Sub-Category</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label>ACTUAL-PRICE</label>
            <input
              onChange={(e) => setActualPrice(e.target.value)}
              type="text"
              value={actualPrice}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
              placeholder="Actual Price"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>DISCOUNTED-PRICE</label>
            <input
              onChange={(e) => setDiscountedPrice(e.target.value)}
              type="text"
              value={discountedPrice}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
              placeholder="Discounted Price"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>STOCK</label>
            <input
              onChange={(e) => setStock(e.target.value)}
              type="text"
              value={stock}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
              placeholder="Stock"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>STOCK-UNIT</label>
            <select
              onChange={(e) => setStockUnit(e.target.value)}
              value={stockUnit}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg cursor-pointer"
            >
              <option value="">Select Unit</option>
              <option value="Kg">Kg</option>
              <option value="Litre">Litre</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label>STATUS</label>
            <select
              onChange={(e) => setStatus(e.target.value)}
              value={status}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label>IS-FEATURED</label>
            <select
              onChange={(e) => setIsFeatured(e.target.value === "true")}
              value={isFeatured.toString()}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg cursor-pointer"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label>BRAND</label>
            <input
              onChange={(e) => setBrand(e.target.value)}
              type="text"
              value={brand}
              className="bg-[#306c67] outline-none py-1.5 rounded-md px-2 text-lg"
              placeholder="Brand"
            />
          </div>
        </div>

        {/* Locations */}
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
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              ))}
            </div>

            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                className="outline-none h-10 pl-2 bg-teal-900 text-lg rounded-xl"
                placeholder="Add a location..."
              />
              {isDropdownOpen && (
                <ul className="absolute w-full bg-teal-700 mt-1 rounded-md shadow-md z-10 h-28 overflow-y-scroll">
                  {filteredLocations.map((location) => (
                    <li
                      key={location}
                      onClick={() => handleLocationSelect(location)}
                      className="px-3 py-2 cursor-pointer text-white hover:bg-teal-300"
                    >
                      {location}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-row gap-1 justify-center items-center">
              <button
                onClick={() => setLocations([])}
                className="text-xl hover:bg-teal-800 px-2 py-1 rounded-xl"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <span className="bg-white w-0.5 h-9"></span>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-xl hover:bg-teal-800 px-2 py-1 rounded-xl"
              >
                <FontAwesomeIcon icon={faChevronDown} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Section */}
      <div className="bg-teal-900 text-white w-[95%] rounded-lg flex flex-col justify-center px-6 py-4 gap-3">
        <h5 className="self-start text-2xl font-serif cursor-default">Media</h5>
        <div className="flex flex-row gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.url}
                alt={`Product ${index + 1}`}
                className="w-28 h-32 object-cover rounded-lg border-2 border-teal-800"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 h-6 w-6 rounded-full"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-center bg-teal-800 rounded-lg">
            <input
              type="file"
              multiple
              className="hidden"
              id="fileUpload"
              onChange={handleImageUpload}
              ref={fileInputRef}
              accept="image/*"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer w-28 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 hover:border-teal-900 hover:bg-teal-50 hover:text-teal-800 transition-colors ease-in-out duration-300 rounded-lg text-gray-300"
            >
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
            </label>
          </div>
        </div>

        {/* Publish Button */}
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
            Publish Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
