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
    // check if the productIds object is present in the products array if present then remove it if not send 404 error
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
        new ApiResponse(200, "Product removed from wishList", { wishList })
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
      .status(404)
      .json(new ApiError(404, "Buyer not found", { buyer }));
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

  if (!productId || !quantity) {
    return res.status(400).json(
      new ApiError(400, "Product ID and quantity are required", {
        productId,
        quantity,
      })
    );
  }

  try {
    // Get product details directly from productModel
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json(new ApiError(404, "Product not found"));
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
      return res
        .status(404)
        .json(new ApiError(404, "Product not found in wishlist"));
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
      existingProduct.quantity = quantity;
      existingProduct.totalPrice = price * quantity;
      existingProduct.priceOfDiscount = (actual - price) * quantity;
      existingProduct.actualPrice = actual * quantity;
    } else {
      // Add new product to cart
      cart.products.push({
        productId,
        quantity,
        totalPrice: price * quantity,
        priceOfDiscount: (actual - price) * quantity,
        actualPrice: actual * quantity,
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
        cart,
        wishList,
      })
    );
  } catch (error) {
    console.error("Error in wishListToCart:", error);
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
};
