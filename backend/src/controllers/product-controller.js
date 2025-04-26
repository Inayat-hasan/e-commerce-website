import { count, error } from "console";
import { productModel } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteImageFromCloudinary,
  uploadMultipleFilesOnCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { faker } from "@faker-js/faker";
import { orderModel } from "../models/order.model.js";

// admin controllers

const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      actualPrice,
      stock,
      stockUnit,
      discountedPrice,
      category,
      brand,
    } = req.body;

    if (
      !name ||
      !description ||
      !actualPrice ||
      !stock ||
      !stockUnit ||
      !discountedPrice ||
      !category ||
      !brand
    ) {
      return res.status(400).json(new ApiError(400, "All fields are required"));
    }

    const images = req.files?.images;
    if (!images || images.length === 0) {
      return res.status(400).json(new ApiError(400, "Images are required"));
    }

    const filePaths = images.map((image) => image.path);
    const uploadedImages = await uploadMultipleFilesOnCloudinary(filePaths);

    const formattedImages = uploadedImages.map((img) => ({
      publicId: img.public_id,
      url: img.url,
    }));

    // Round the prices to whole numbers
    const roundedActualPrice = Math.round(Number(actualPrice));
    const roundedDiscountedPrice = Math.round(Number(discountedPrice));

    const product = await productModel.create({
      name,
      description,
      actualPrice: roundedActualPrice,
      stock,
      stockUnit,
      discountedPrice: roundedDiscountedPrice,
      category,
      brand,
      admin: req.admin._id,
      images: formattedImages,
    });
    if (!product) {
      return res
        .status(500)
        .json(new ApiError(500, "err in creating product!"));
    } else {
      return res.status(200).json(
        new ApiResponse(200, "Product created!", {
          success: true,
          data: product,
        })
      );
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiError(500, "err in creating product!", { error }));
  }
});

const uploadAndReturn = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const image = req.file;
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json(new ApiError(404, "Something went wrong in finding Product!"));
    }
    if (!image) {
      return res.status(400).json(new ApiError(400, "Image is required!"));
    }
    const uploadResponse = await uploadOnCloudinary(image.path);
    return res.status(200).json({
      success: true,
      data: {
        image: { url: uploadResponse.url, publicId: uploadResponse.public_id },
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiError(500, "err in editing product!", { error }));
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json(
          new ApiError(404, "Something went wrong in finding Product!", {})
        );
    }
    // const images = product.images;
    // if (product.images && product.images.length > 0) {
    //   const deletionPromises = product.images.map((image) =>
    //     deleteImageFromCloudinary(image.publicId)
    //   );
    //   const results = await Promise.allSettled(deletionPromises);

    //   const failedDeletions = results.filter(
    //     (result) =>
    //       result.status === "rejected" ||
    //       (result.value && result.value.statusCode !== 200)
    //   );

    //   if (failedDeletions.length > 0) {
    //     return res.status(500).json(
    //       new ApiError(500, "Failed to delete some product images", {
    //         failedDeletions,
    //       })
    //     );
    //   }
    // }

    await productModel.deleteOne({ _id: productId });

    return res
      .status(200)
      .json(new ApiResponse(200, "Product deleted successfully!"));
  } catch (error) {
    console.log("error : ", error);
    return res
      .status(500)
      .json(new ApiError(500, "Err in deleting product!", { error }));
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await productModel.find();
    if (products.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, "No products found!", {
          products,
        })
      );
    } else {
      return res.status(200).json(
        new ApiResponse(200, "Products received!", {
          products,
        })
      );
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiError(500, "Err in receiving products!", { error }));
  }
});

const generateProducts = asyncHandler(async (req, res) => {
  try {
    const numOfProducts = 60;

    if (!numOfProducts || isNaN(numOfProducts) || numOfProducts <= 0) {
      return res
        .status(400)
        .json(new ApiError(400, "Valid number of products is required"));
    }

    const products = [];
    for (let i = 0; i < numOfProducts; i++) {
      const product = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        actualPrice: faker.commerce.price(),
        stock: faker.number.int({ min: 10, max: 100 }),
        stockUnit: "pieces",
        discountedPrice: faker.commerce.price(),
        category: faker.commerce.department(),
        brand: faker.company.name(),
        admin: req.admin._id,
        images: [
          {
            publicId: faker.string.uuid(),
            url: faker.image.url(),
          },
          {
            publicId: faker.string.uuid(),
            url: faker.image.url(),
          },
          {
            publicId: faker.string.uuid(),
            url: faker.image.url(),
          },
          {
            publicId: faker.string.uuid(),
            url: faker.image.url(),
          },
          {
            publicId: faker.string.uuid(),
            url: faker.image.url(),
          },
        ],
        status: "active",
        isFeatured: "false",
        locations: ["india", "pakistan", "bangladesh", "nepal"],
      };
      products.push(product);
    }

    const createdProducts = await productModel.insertMany(products);

    return res.status(200).json(
      new ApiResponse(200, "Random products generated!", {
        success: true,
        data: createdProducts,
      })
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiError(500, "Error in generating products!", { error }));
  }
});

const deleteAllProducts = asyncHandler(async (req, res) => {
  try {
    const deletionResponse = await productModel.deleteMany();
    return res.status(200).json(
      new ApiResponse(200, "All products deleted successfully", {
        deletionResponse,
      })
    );
  } catch (error) {
    console.error("Error deleting all products:", error);
    return res.status(500).json(
      new ApiError(500, "Error deleting all products", {
        error: error.message,
      })
    );
  }
});

// buyer controllers

const getProductDetails = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(500)
        .json(new ApiError(500, "Err in receiving product details!"));
    } else {
      return res.status(200).json(
        new ApiResponse(200, "Product details received!", {
          product,
        })
      );
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiError(500, "Err in receiving product details!", { error }));
  }
});

const getProductsAccordingToCategory = asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 50);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "latest";

    // Build sort options based on sort parameter
    let sortOptions = {};
    switch (sort) {
      case "price-low-high":
        sortOptions = { discountedPrice: 1 };
        break;
      case "price-high-low":
        sortOptions = { discountedPrice: -1 };
        break;
      case "popularity":
        sortOptions = { ratingsSum: -1 }; // Sort by ratings sum instead of views
        break;
      case "rating":
        sortOptions = { averageRating: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; // Latest by default
    }

    const products = await productModel
      .find({
        $or: [{ category: category }, { subCategory: category }],
        status: { $ne: "inactive" },
      })
      .sort(sortOptions)
      .select("-__v")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await productModel.countDocuments({
      $or: [{ category: category }, { subCategory: category }],
      status: { $ne: "inactive" },
    });

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json(
      new ApiResponse(
        200,
        products.length === 0
          ? `No products found in ${category}`
          : `Products in ${category} retrieved successfully`,
        {
          products,
          pagination: {
            total: totalProducts,
            page,
            limit,
            totalPages,
            hasMore: page < totalPages,
          },
        }
      )
    );
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json(
      new ApiError(500, "Failed to retrieve products by category", {
        error: error.message,
      })
    );
  }
});

const getProductsAccordingToBrand = asyncHandler(async (req, res) => {
  try {
    const { brand } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 50);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "latest";

    // Build sort options based on sort parameter
    let sortOptions = {};
    switch (sort) {
      case "price-low-high":
        sortOptions = { discountedPrice: 1 };
        break;
      case "price-high-low":
        sortOptions = { discountedPrice: -1 };
        break;
      case "popularity":
        sortOptions = { ratingsSum: -1 }; // Sort by ratings sum instead of views
        break;
      case "rating":
        sortOptions = { averageRating: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; // Latest by default
    }

    const products = await productModel
      .find({
        brand: brand,
        status: { $ne: "inactive" },
      })
      .sort(sortOptions)
      .select("-__v")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await productModel.countDocuments({
      brand: brand,
      status: { $ne: "inactive" },
    });

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json(
      new ApiResponse(
        200,
        products.length === 0
          ? `No products found for ${brand}`
          : `Products for ${brand} retrieved successfully`,
        {
          products,
          pagination: {
            total: totalProducts,
            page,
            limit,
            totalPages,
            hasMore: page < totalPages,
          },
        }
      )
    );
  } catch (error) {
    console.error("Error fetching products by brand:", error);
    return res.status(500).json(
      new ApiError(500, "Failed to retrieve products by brand", {
        error: error.message,
      })
    );
  }
});

const getProductsAccordingToSearch = asyncHandler(async (req, res) => {
  const { search } = req.params;

  // Input validation
  if (!search || search.trim() === "") {
    return res.status(400).json(new ApiError(400, "Search query is required"));
  }

  try {
    // Sanitize the search input
    const sanitizedSearch = search.trim();

    // Add pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 50);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "latest";

    // Build sort options based on sort parameter
    let sortOptions = {};
    switch (sort) {
      case "price-low-high":
        sortOptions = { discountedPrice: 1 };
        break;
      case "price-high-low":
        sortOptions = { discountedPrice: -1 };
        break;
      case "popularity":
        sortOptions = { ratingsSum: -1 }; // Sort by ratings sum instead of views
        break;
      case "rating":
        sortOptions = { averageRating: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; // Latest by default
    }

    // Build the query with proper index usage
    const searchQuery = {
      $and: [
        { status: { $ne: "inactive" } },
        {
          $or: [
            { name: { $regex: sanitizedSearch, $options: "i" } },
            { category: { $regex: sanitizedSearch, $options: "i" } },
            { brand: { $regex: sanitizedSearch, $options: "i" } },
            { description: { $regex: sanitizedSearch, $options: "i" } },
          ],
        },
      ],
    };

    // Get total count for pagination info
    const totalCount = await productModel.countDocuments(searchQuery);

    // Execute query with pagination
    const products = await productModel
      .find(searchQuery)
      .sort(sortOptions)
      .select("-__v") // Exclude unnecessary fields
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JS objects for better performance

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);

    // Return appropriate response
    return res.status(200).json(
      new ApiResponse(
        200,
        products.length === 0
          ? `No products found for "${sanitizedSearch}"`
          : `Products found for "${sanitizedSearch}"`,
        {
          products,
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages,
            hasMore: page < totalPages,
          },
        }
      )
    );
  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json(
      new ApiError(500, "Error searching products", {
        error: error.message,
      })
    );
  }
});

const editProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const {
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
    pendingAddImages,
    pendingDeleteImages,
    pendingReplaceImages, // in repalce images there is 2 objects in each array like this : [ [{oldimage},{newimage}] , [{oldimage},{newimage}] ]
  } = req.body;

  try {
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json(new ApiError(404, "Product not found!"));
    }

    product.name = productName;
    product.description = description;
    product.category = category;
    product.subCategory = subCategory;
    product.brand = brand;
    product.actualPrice = actualPrice;
    product.discountedPrice = discountedPrice;
    product.stock = stock;
    product.stockUnit = stockUnit;
    product.status = status;
    product.isFeatured = isFeatured;
    product.locations = locations;

    if (pendingAddImages.length > 0) {
      pendingAddImages.forEach((image) => {
        product.images.push(image);
      });
    }
    if (pendingDeleteImages.length > 0) {
      for (const image of pendingDeleteImages) {
        // await deleteImageFromCloudinary(image.publicId);
        product.images = product.images.filter(
          (img) => img.publicId !== image.publicId
        );
      }
    }

    if (pendingReplaceImages.length > 0) {
      for (const image of pendingReplaceImages) {
        product.images = product.images.map((img) =>
          img.publicId === image[0].publicId ? image[1] : img
        );
        // await deleteImageFromCloudinary(image[0].publicId);
      }
    }

    await product.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Product updated!", { product }));
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new ApiError(500, "err in updating product!", { error: err }));
  }
});

const userBackout = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { pendingAddImages, pendingReplaceImages } = req.body;
  if (!productId) {
    return res.status(400).json(new ApiError(400, "Something went wrong!"));
  }
  try {
    const product = await productModel.findById(productId);
    if (pendingAddImages.length > 0) {
      await Promise.all(
        pendingAddImages.map(async (image) => {
          await deleteImageFromCloudinary(image.publicId);
        })
      );
    }
    if (pendingReplaceImages.length > 0) {
      await Promise.all(
        pendingReplaceImages.map(async (image) => {
          await deleteImageFromCloudinary(image[1].publicId);
        })
      );
    }
    return res.status(200).json(new ApiResponse(200, "Done"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error", { error }));
  }
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 50);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "latest";

    // Build sort options based on sort parameter
    let sortOptions = {};
    switch (sort) {
      case "price-low-high":
        sortOptions = { discountedPrice: 1 };
        break;
      case "price-high-low":
        sortOptions = { discountedPrice: -1 };
        break;
      case "popularity":
        sortOptions = { ratingsSum: -1 }; // Sort by ratings sum instead of views
        break;
      case "rating":
        sortOptions = { averageRating: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; // Latest by default
    }

    const products = await productModel
      .find({
        isFeatured: true,
        status: { $ne: "inactive" },
      })
      .sort(sortOptions)
      .select("-__v")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await productModel.countDocuments({
      isFeatured: true,
      status: { $ne: "inactive" },
    });

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json(
      new ApiResponse(200, "Featured products retrieved successfully", {
        products,
        pagination: {
          total: totalProducts,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return res.status(500).json(
      new ApiError(500, "Failed to retrieve featured products", {
        error: error.message,
      })
    );
  }
});

const getLatestProducts = asyncHandler(async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 50);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "latest";

    // Build sort options based on sort parameter
    let sortOptions = {};
    switch (sort) {
      case "price-low-high":
        sortOptions = { discountedPrice: 1 };
        break;
      case "price-high-low":
        sortOptions = { discountedPrice: -1 };
        break;
      case "popularity":
        sortOptions = { ratingsSum: -1 }; // Sort by ratings sum instead of views
        break;
      case "rating":
        sortOptions = { averageRating: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; // Latest by default
    }

    const products = await productModel
      .find({ status: { $ne: "inactive" } })
      .sort(sortOptions)
      .select("-__v")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await productModel.countDocuments({
      status: { $ne: "inactive" },
    });

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json(
      new ApiResponse(200, "Latest products retrieved successfully", {
        products,
        pagination: {
          total: totalProducts,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching latest products:", error);
    return res.status(500).json(
      new ApiError(500, "Failed to retrieve latest products", {
        error: error.message,
      })
    );
  }
});

const getBestSellingProducts = asyncHandler(async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 50);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "sales";

    // Start with the base match condition for valid products
    const matchStage = {
      orderStatus: { $in: ["delivered", "completed"] },
    };

    // Build sort options based on sort parameter
    let sortField = "totalSold";
    let sortDirection = -1;

    if (sort === "price-low-high") {
      sortField = "discountedPrice";
      sortDirection = 1;
    } else if (sort === "price-high-low") {
      sortField = "discountedPrice";
      sortDirection = -1;
    } else if (sort === "rating") {
      sortField = "averageRating";
      sortDirection = -1;
    } else if (sort === "latest") {
      sortField = "createdAt";
      sortDirection = -1;
    }

    // First get product sales data
    const productSales = await orderModel.aggregate([
      { $match: matchStage },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const productIds = productSales.map((item) => item._id);

    // Find the actual products
    let products = await productModel
      .find({
        _id: { $in: productIds },
        status: { $ne: "inactive" },
      })
      .select("-__v")
      .lean();

    // If sorting by something other than sales, we need to sort after fetching products
    if (sortField !== "totalSold") {
      // Need to enrich products with sales data first
      const productsWithSales = productIds
        .map((id) => {
          const product = products.find(
            (p) => p._id.toString() === id.toString()
          );
          const salesData = productSales.find(
            (item) => item._id.toString() === id.toString()
          );

          if (product) {
            return {
              ...product,
              totalSold: salesData?.totalSold || 0,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      // Then sort by the requested field
      products = productsWithSales.sort((a, b) => {
        if (sortField.includes(".")) {
          const [field, subfield] = sortField.split(".");
          return sortDirection * (a[field][subfield] - b[field][subfield]);
        }
        if (typeof a[sortField] === "string") {
          return sortDirection * a[sortField].localeCompare(b[sortField]);
        }
        return sortDirection * (a[sortField] - b[sortField]);
      });
    } else {
      // Enrich with sales data but keep original order (by totalSold)
      products = productIds
        .map((id) => {
          const product = products.find(
            (p) => p._id.toString() === id.toString()
          );
          const salesData = productSales.find(
            (item) => item._id.toString() === id.toString()
          );

          if (product) {
            return {
              ...product,
              totalSold: salesData?.totalSold || 0,
            };
          }
          return null;
        })
        .filter((item) => item !== null);
    }

    // Get total count for pagination
    const totalProductsWithSales = await orderModel.aggregate([
      { $match: matchStage },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
        },
      },
      { $count: "total" },
    ]);

    const totalProducts =
      totalProductsWithSales.length > 0 ? totalProductsWithSales[0].total : 0;

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json(
      new ApiResponse(200, "Best selling products retrieved successfully", {
        products,
        pagination: {
          total: totalProducts,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching best selling products:", error);
    return res.status(500).json(
      new ApiError(500, "Failed to retrieve best selling products", {
        error: error.message,
      })
    );
  }
});

export {
  // admin controllers
  createProduct,
  deleteProduct,
  getAllProducts,
  generateProducts,
  deleteAllProducts,
  // buyer controllers
  getProductDetails,
  getProductsAccordingToCategory,
  getProductsAccordingToBrand,
  getProductsAccordingToSearch,
  editProduct,
  uploadAndReturn,
  userBackout,
  getFeaturedProducts,
  getLatestProducts,
  getBestSellingProducts,
};
