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
import { orderModel } from "../models/order.model.js";

// admin controllers

const createProduct = asyncHandler(async (req, res) => {
  try {
    const product = JSON.parse(req.body.product);
    const images = req.files?.images || [];

    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "actualPrice",
      "stock",
      "stockUnit",
      "category",
      "brand",
      "locations",
    ];

    const missingFields = requiredFields.filter((field) => !product[field]);
    if (missingFields.length > 0) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            `Missing required fields: ${missingFields.join(", ")}`
          )
        );
    }

    // Validate images
    if (!images || images.length === 0) {
      return res
        .status(400)
        .json(new ApiError(400, "At least one product image is required"));
    }

    if (images.length > 6) {
      return res
        .status(400)
        .json(new ApiError(400, "Maximum 6 images allowed"));
    }

    // Validate prices
    const actualPrice = Number(product.actualPrice);
    const discountedPrice = Number(product.discountedPrice);

    if (isNaN(actualPrice) || actualPrice <= 0) {
      return res.status(400).json(new ApiError(400, "Invalid actual price"));
    }

    if (discountedPrice && (isNaN(discountedPrice) || discountedPrice <= 0)) {
      return res
        .status(400)
        .json(new ApiError(400, "Invalid discounted price"));
    }

    if (discountedPrice && discountedPrice > actualPrice) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "Discounted price cannot be greater than actual price"
          )
        );
    }

    // Upload images to Cloudinary
    const filePaths = images.map((image) => image.path);
    const uploadedImages = await uploadMultipleFilesOnCloudinary(filePaths);

    if (!uploadedImages || uploadedImages.length === 0) {
      return res.status(500).json(new ApiError(500, "Failed to upload images"));
    }

    const formattedImages = uploadedImages.map((img) => ({
      publicId: img.public_id,
      url: img.url,
    }));

    // Create product with rounded prices
    const newProduct = await productModel.create({
      name: product.name,
      description: product.description,
      actualPrice: Math.round(actualPrice),
      stock: Number(product.stock),
      stockUnit: product.stockUnit,
      discountedPrice: discountedPrice
        ? Math.round(discountedPrice)
        : undefined,
      category: product.category,
      subCategory: product.subCategory,
      brand: product.brand,
      admin: req.admin._id,
      images: formattedImages,
      locations: product.locations,
      status: product.status || "active",
      isFeatured: product.isFeatured === "false",
    });

    if (!newProduct) {
      return res
        .status(500)
        .json(new ApiError(500, "Failed to create product"));
    }

    return res.status(201).json(
      new ApiResponse(201, "Product created successfully", {
        productId: newProduct._id,
      })
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Error creating product", { error: error.message })
      );
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
    const images = product.images;
    if (product.images && product.images.length > 0) {
      const deletionPromises = product.images.map((image) =>
        deleteImageFromCloudinary(image.publicId)
      );
      const results = await Promise.allSettled(deletionPromises);

      const failedDeletions = results.filter(
        (result) =>
          result.status === "rejected" ||
          (result.value && result.value.statusCode !== 200)
      );

      if (failedDeletions.length > 0) {
        return res.status(500).json(
          new ApiError(500, "Failed to delete some product images", {
            failedDeletions,
          })
        );
      }
    }

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
  const updatedProductData = JSON.parse(req.body.product);
  const imagesToDelete = JSON.parse(req.body.imagesToDelete || "[]");
  const images = req.files?.images || [];

  const requiredFields = [
    "name",
    "description",
    "actualPrice",
    "stock",
    "stockUnit",
    "category",
    "brand",
    "locations",
  ];

  const missingFields = requiredFields.filter(
    (field) => !updatedProductData[field]
  );
  if (missingFields.length > 0) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          `Missing required fields: ${missingFields.join(", ")}`
        )
      );
  }

  try {
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json(new ApiError(404, "Product not found!"));
    }

    // Update product fields
    Object.assign(product, updatedProductData);

    // Handle new image uploads
    if (images.length > 0) {
      const filePaths = images.map((img) => img.path);
      const uploadedImages = await uploadMultipleFilesOnCloudinary(filePaths);
      if (!uploadedImages || uploadedImages.length === 0) {
        return res
          .status(500)
          .json(new ApiError(500, "Failed to upload images"));
      }

      const formattedImages = uploadedImages.map((img) => ({
        publicId: img.public_id,
        url: img.url,
      }));

      product.images.push(...formattedImages);
    }

    // Handle image deletions with error handling for each image
    if (imagesToDelete.length > 0) {
      for (const publicId of imagesToDelete) {
        try {
          await deleteImageFromCloudinary(publicId);
        } catch (deleteError) {
          console.error(`Error deleting image ${publicId}:`, deleteError);
          // Continue with the other operations even if one deletion fails
        }

        // Remove from product images array regardless of deletion success
        product.images = product.images.filter(
          (img) => img.publicId !== publicId
        );
      }
    }

    await product.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Product updated!", { productId: product._id })
      );
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new ApiError(500, "Error in updating product!", { error: err }));
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
  // buyer controllers
  getProductDetails,
  getProductsAccordingToCategory,
  getProductsAccordingToBrand,
  getProductsAccordingToSearch,
  editProduct,
  getFeaturedProducts,
  getLatestProducts,
  getBestSellingProducts,
};
