import { tr } from "@faker-js/faker";
import { cartModel } from "../models/cart.model.js";
import { wishListModel } from "../models/wishList.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { productModel } from "../models/product.model.js";

// working fine
const addToWishList = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const buyer = req.buyer._id;

  if (!buyer) {
    return res
      .status(404)
      .json(new ApiError(404, "Buyer not found", { buyer }));
  }

  if (!productId) {
    return res
      .status(400)
      .json(new ApiError(400, "Product ID is required", { productId }));
  }

  try {
    // if there is producuts in the products array then it should be populate that product through productId
    const wishList = await wishListModel
      .findOne({ buyer })
      .populate("products.productId");
    if (!wishList) {
      return res
        .status(400)
        .json(new ApiError(400, "WishList not found", { wishList }));
    }
    wishList.products.push({ productId });
    await wishList.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Product added to wishList", { wishList }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", { error }));
  }
});

// working fine
const removeFromWishList = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const buyer = req.buyer._id;

  if (!buyer) {
    return res
      .status(404)
      .json(new ApiError(404, "Buyer not found", { buyer }));
  }

  if (!productId) {
    return res
      .status(400)
      .json(new ApiError(400, "Product ID is required", { productId }));
  }

  try {
    const wishList = await wishListModel
      .findOne({ buyer })
      .populate("products.productId");
    if (!wishList) {
      return res
        .status(404)
        .json(new ApiError(404, "WishList not found", { wishList }));
    }

    const product = wishList.products.find(
      (i) => i.productId._id.toString() === productId.toString()
    );
    if (!product) {
      return res
        .status(404)
        .json(
          new ApiError(404, "Product not found in wishlist", { productId })
        );
    }
    wishList.products = wishList.products.filter(
      (i) => i.productId._id.toString() !== productId.toString()
    );
    await wishList.save();
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Product removed from wishList", { done: true })
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", { error }));
  }
});

// working fine
const getWishList = asyncHandler(async (req, res) => {
  const buyer = req.buyer._id;
  if (!buyer) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Buyer not found", { buyer }));
  }

  try {
    const wishList = await wishListModel
      .findOne({ buyer })
      .populate("products.productId");

    if (!wishList) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, "WishList not found", { isWishlistFound: false })
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "WishList fetched", { wishList }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", { error }));
  }
});

// working fine
const clearWishList = asyncHandler(async (req, res) => {
  const buyer = req.buyer._id;
  if (!buyer) {
    return res
      .status(404)
      .json(new ApiError(404, "Buyer not found", { buyer }));
  }
  try {
    // just make the products array empty
    const wishList = await wishListModel.findOneAndUpdate(
      { buyer },
      {
        $set: {
          products: [],
        },
      },
      { new: true }
    );
    if (!wishList) {
      return res
        .status(404)
        .json(new ApiError(404, "WishList not found", { wishList }));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "WishList cleared", { wishList }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", { error }));
  }
});

// working fine
const wishListToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const buyer = req.buyer._id;

  if (!buyer) {
    return res.status(404).json(new ApiError(404, "Buyer not found"));
  }

  if (!productId) {
    return res.status(200).json(
      new ApiResponse(200, "Product ID is required", {
        credentialsAreMissing: true,
      })
    );
  }

  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Product not found", { productIsMissing: true })
        );
    }

    // Find the wishlist
    const wishList = await wishListModel.findOne({ buyer });
    if (!wishList) {
      return res.status(404).json(new ApiError(404, "WishList not found"));
    }

    // Check if product exists in wishlist
    const productInWishList = wishList.products.find(
      (item) => item.productId.toString() === productId
    );
    if (!productInWishList) {
      return res.status(200).json(
        new ApiResponse(200, "Product not found in wishlist", {
          productNotInWishlist: true,
        })
      );
    }

    // Find cart
    const cart = await cartModel.findOne({ buyer });
    if (!cart) {
      return res.status(404).json(new ApiError(404, "Cart not found"));
    }

    // Extract price values similar to addToCart function
    const price = product.discountedPrice;
    const actual = product.actualPrice;

    // Check if product already exists in cart
    const existingProduct = cart.products.find(
      (item) => item.productId.toString() === productId
    );

    if (existingProduct) {
      // Update quantity if product exists
      return res.status(200).json(
        new ApiResponse(200, "Product already exists in cart", {
          productAlreadyExists: true,
        })
      );
    } else {
      // Add new product to cart
      cart.products.push({
        productId,
        quantity: 1,
        totalPrice: price * 1,
        priceOfDiscount: (actual - price) * 1,
        actualPrice: actual * 1,
      });
    }

    // Update cart totals
    cart.totalActualPrice = cart.products.reduce(
      (sum, item) => sum + item.actualPrice,
      0
    );
    cart.totalDiscount = cart.products.reduce(
      (sum, item) => sum + item.priceOfDiscount,
      0
    );
    cart.finalAmount = cart.products.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    cart.productsCount = cart.products.length;

    // Remove product from wishlist
    wishList.products = wishList.products.filter(
      (item) => item.productId.toString() !== productId
    );

    // Save both cart and wishlist
    await Promise.all([cart.save(), wishList.save()]);

    return res.status(200).json(
      new ApiResponse(200, "Product moved from wishlist to cart successfully", {
        done: true,
      })
    );
  } catch (error) {
    console.error("Error in wishListToCart:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", error));
  }
});

const selectedProductsToCart = asyncHandler(async (req, res) => {
  const { productIds } = req.body; // array of product IDs to be moved
  const buyer = req.buyer._id;

  if (!buyer) {
    return res.status(404).json(new ApiError(404, "Buyer not found"));
  }

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res
      .status(400)
      .json(
        new ApiError(400, "Product IDs are required and should be an array")
      );
  }

  try {
    const wishList = await wishListModel.findOne({ buyer });
    if (!wishList) {
      return res.status(404).json(new ApiError(404, "WishList not found"));
    }

    const cart = await cartModel.findOne({ buyer });
    if (!cart) {
      return res.status(404).json(new ApiError(404, "Cart not found"));
    }

    let addedCount = 0;
    let alreadyExistCount = 0;
    let notFoundCount = 0;

    for (const productId of productIds) {
      // Find the product
      const product = await productModel.findById(productId);
      if (!product) {
        notFoundCount++;
        continue;
      }

      // Check if product exists in wishlist
      const productInWishList = wishList.products.find(
        (item) => item.productId.toString() === productId
      );
      if (!productInWishList) {
        notFoundCount++;
        continue;
      }

      // Check if product already exists in cart
      const existingProduct = cart.products.find(
        (item) => item.productId.toString() === productId
      );

      if (existingProduct) {
        alreadyExistCount++;
        continue;
      }

      // Add product to cart
      cart.products.push({
        productId,
        quantity: 1,
        totalPrice: product.discountedPrice,
        priceOfDiscount: product.actualPrice - product.discountedPrice,
        actualPrice: product.actualPrice,
      });
      addedCount++;

      // Remove product from wishlist
      wishList.products = wishList.products.filter(
        (item) => item.productId._id.toString() !== productId
      );
    }

    // Update cart totals
    const totals = cart.products.reduce(
      (acc, item) => ({
        totalActualPrice: acc.totalActualPrice + item.actualPrice,
        totalDiscount: acc.totalDiscount + item.priceOfDiscount,
        finalAmount: acc.finalAmount + item.totalPrice,
      }),
      { totalActualPrice: 0, totalDiscount: 0, finalAmount: 0 }
    );

    cart.totalActualPrice = Math.round(totals.totalActualPrice);
    cart.totalDiscount = Math.round(totals.totalDiscount);
    cart.finalAmount = Math.round(totals.finalAmount);
    cart.productsCount = cart.products.length;
    cart.deliveryCharges = Math.round(totals.finalAmount) > 999 ? 0 : 40;
    cart.platformFee = 20;

    // Save both cart and wishlist
    await Promise.all([cart.save(), wishList.save()]);

    let message = "Selected products moved to cart successfully";
    if (alreadyExistCount > 0 || notFoundCount > 0) {
      message = `${addedCount} products moved to cart. `;
      if (alreadyExistCount > 0) {
        message += `${alreadyExistCount} products were already in your cart. `;
      }
      if (notFoundCount > 0) {
        message += `${notFoundCount} products were not found.`;
      }
    }

    return res.status(200).json(
      new ApiResponse(200, message, {
        cart,
        wishList,
        addedCount,
        alreadyExistCount,
        notFoundCount,
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", error));
  }
});

// working fine
const isProductInWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const buyer = req.buyer._id;
  if (!buyer) {
    return res.status(404).json(new ApiError(404, "Buyer not found"));
  }
  if (!productId) {
    return res.status(400).json(new ApiError(400, "Product ID is required"));
  }
  try {
    const wishList = await wishListModel.findOne({ buyer });
    const isProductInWishlist = wishList.products.some(
      (item) => item.productId.toString() === productId
    );
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Product in wishlist", { isProductInWishlist })
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", error));
  }
});

export {
  addToWishList,
  removeFromWishList,
  getWishList,
  clearWishList,
  wishListToCart,
  isProductInWishlist,
  selectedProductsToCart,
};
