import { reviewModel } from "../models/review.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { orderModel } from "../models/order.model.js";
import { productModel } from "../models/product.model.js";

// controller for checking is user eligible to add review or not
// need to make this as middleware which will be used in addReview & updateReview controller
const isUserEligibleToAddReview = asyncHandler(async (req, res) => {
  const buyer = req.buyer._id;
  const { productId } = req.body;

  if (!buyer) {
    return res.status(401).json(new ApiError(401, "Unauthorized", { buyer }));
  }

  if (!productId) {
    return res
      .status(400)
      .json(new ApiError(400, "Product ID is required", { productId }));
  }

  try {
    // Check if product exists first
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json(new ApiError(404, "Product not found", { productId }));
    }

    // Check if the user has already reviewed this product
    const existingReview = await reviewModel.findOne({
      product: productId,
      buyer,
    });

    if (existingReview) {
      return res.status(400).json(
        new ApiError(400, "You have already reviewed this product", {
          review: existingReview,
        })
      );
    }

    const order = await orderModel.findOne({
      buyer,
      "products.productId": productId,
      orderStatus: "delivered",
      "payment.status": "paid",
    });

    if (!order) {
      return res.status(400).json(
        new ApiError(
          400,
          "You can only review products you have purchased and received",
          {
            buyer,
            productId,
          }
        )
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "User is eligible to add review", { order }));
  } catch (error) {
    return res.status(500).json(
      new ApiError(500, "Error checking user eligibility", {
        error: error.message,
      })
    );
  }
});

/**
 * Create a new review for a product
 * Only buyers who have purchased the product can add a review
 * working fine
 */
const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const buyer = req.buyer._id;

  if (!buyer) {
    return res.status(401).json(new ApiError(401, "Unauthorized", { buyer }));
  }

  if (!productId || !rating) {
    return res.status(400).json(
      new ApiError(400, "Product ID and rating are required", {
        productId,
        rating,
      })
    );
  }

  try {
    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json(new ApiError(404, "Product not found", { productId }));
    }

    // Verify that buyer has purchased this product (optional)
    const hasPurchased = await orderModel.findOne({
      buyer,
      "products.productId": productId,
      orderStatus: "delivered",
      "payment.status": "paid",
    });

    if (!hasPurchased) {
      return res.status(403).json(
        new ApiError(403, "You can only review products you have purchased", {
          buyer,
          productId,
        })
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await reviewModel.findOne({
      product: productId,
      buyer,
    });

    if (existingReview) {
      return res.status(400).json(
        new ApiError(400, "You have already reviewed this product", {
          review: existingReview,
        })
      );
    }

    // Create new review
    const review = await reviewModel.create({
      product: productId,
      buyer,
      rating,
      comment: comment || "",
    });

    // Update product to include reference to the new review
    await productModel.findByIdAndUpdate(productId, {
      $push: { reviews: review._id },
    });

    // Update product's review stats
    await updateProductReviewStats(productId);

    return res
      .status(201)
      .json(new ApiResponse(201, "Review added successfully", { review }));
  } catch (error) {
    return res.status(500).json(
      new ApiError(500, "Error adding review", {
        error: error.message,
      })
    );
  }
});

/**
 * Get all reviews for a specific product with pagination
 * working fine
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = "newest" } = req.query;

  if (!productId) {
    return res
      .status(400)
      .json(new ApiError(400, "Product ID is required", { productId }));
  }

  try {
    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json(new ApiError(404, "Product not found", { productId }));
    }

    // Set up pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Set up sorting
    let sortOptions = {};
    if (sort === "newest") {
      sortOptions = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    } else if (sort === "highest") {
      sortOptions = { rating: -1 };
    } else if (sort === "lowest") {
      sortOptions = { rating: 1 };
    } else {
      sortOptions = { createdAt: -1 }; // Default to newest
    }

    // Get total count for pagination
    const totalReviews = await reviewModel.countDocuments({
      product: productId,
    });

    // Get all reviews for this product with buyer details and pagination
    const reviews = await reviewModel
      .find({ product: productId })
      .populate("buyer", "name avatar email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json(
      new ApiResponse(200, "Product reviews fetched successfully", {
        reviews,
        pagination: {
          total: totalReviews,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(totalReviews / limitNumber),
          hasMore: skip + reviews.length < totalReviews,
        },
      })
    );
  } catch (error) {
    return res.status(500).json(
      new ApiError(500, "Error fetching product reviews", {
        error: error.message,
      })
    );
  }
});

/**
 * Update an existing review
 * Users can only update their review within 30 days of posting
 * i hope this is working fine
 */
const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const buyer = req.buyer._id;

  if (!buyer) {
    return res.status(401).json(new ApiError(401, "Unauthorized", { buyer }));
  }

  if (!reviewId) {
    return res
      .status(400)
      .json(new ApiError(400, "Review ID is required", { reviewId }));
  }

  if (!rating) {
    return res
      .status(400)
      .json(new ApiError(400, "Rating is required", { rating }));
  }

  try {
    // Find the review
    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json(new ApiError(404, "Review not found", { reviewId }));
    }

    // Check if this review belongs to the buyer
    if (review.buyer.toString() !== buyer.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You can only update your own reviews"));
    }

    // Check if review is within 30 days (can be adjusted as needed)
    const reviewDate = new Date(review.createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate - reviewDate) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference > 30) {
      return res
        .status(403)
        .json(
          new ApiError(
            403,
            "Reviews can only be updated within 30 days of posting"
          )
        );
    }

    // Update the review
    review.rating = rating;
    review.comment = comment || review.comment;
    await review.save();

    // Update product's review stats
    await updateProductReviewStats(review.product);

    return res
      .status(200)
      .json(new ApiResponse(200, "Review updated successfully", { review }));
  } catch (error) {
    return res.status(500).json(
      new ApiError(500, "Error updating review", {
        error: error.message,
      })
    );
  }
});

/**
 * Admin controller to get all reviews in the system
 */
const getAllReviews = asyncHandler(async (req, res) => {
  // This route should be protected by admin middleware
  if (!req.admin) {
    return res.status(401).json(new ApiError(401, "Admin access required"));
  }

  const { page = 1, limit = 20, productId, rating } = req.query;

  try {
    // Set up pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build query based on filters
    const query = {};
    if (productId) query.product = productId;
    if (rating) query.rating = rating;

    // Get total count
    const totalReviews = await reviewModel.countDocuments(query);

    // Get reviews with pagination and populate product and buyer
    const reviews = await reviewModel
      .find(query)
      .populate("product", "name images")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json(
      new ApiResponse(200, "All reviews fetched successfully", {
        reviews,
        pagination: {
          total: totalReviews,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(totalReviews / limitNumber),
        },
      })
    );
  } catch (error) {
    return res.status(500).json(
      new ApiError(500, "Error fetching reviews", {
        error: error.message,
      })
    );
  }
});

/**
 * Helper function to update a product's review statistics
 * working fine
 */
const updateProductReviewStats = async (productId) => {
  try {
    // Get all reviews for this product
    const reviews = await reviewModel.find({ product: productId });

    // Calculate new average rating
    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

    // Update the product's review stats
    await productModel.findByIdAndUpdate(productId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewsCount: totalReviews,
    });
  } catch (error) {
    console.error("Error updating product review stats:", error);
    // Don't throw, just log the error to prevent breaking the request flow
  }
};

export {
  addReview,
  getProductReviews,
  updateReview,
  isUserEligibleToAddReview,
  getAllReviews,
};
