import { cartModel } from "../models/cart.model.js";
import { productModel } from "../models/product.model.js";
import { wishListModel } from "../models/wishList.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// working fine
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const buyer = req.buyer._id;

  if (!buyer) {
    return res
      .status(404)
      .json(new ApiError(404, "Buyer not found", { buyer }));
  }

  if (!productId || !quantity) {
    return res.status(400).json(
      new ApiError(400, "Product ID and quantity are required", {
        productId,
        quantity,
      })
    );
  }

  const product = await productModel.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json(new ApiError(404, "Product not found", { product }));
  }
  try {
    let cart = await cartModel.findOne({ buyer });
    const price = product.discountedPrice;
    const actual = product.actualPrice;

    const item = {
      productId,
      quantity,
      totalPrice: Math.round(price * quantity),
      priceOfDiscount: Math.round((actual - price) * quantity),
      actualPrice: Math.round(actual * quantity),
    };

    if (!cart) {
      return res
        .status(404)
        .json(new ApiError(404, "Cart not found", { cart }));
    } else {
      const existing = cart.products.find(
        (i) => i.productId.toString() === productId
      );
      if (existing) {
        existing.quantity += quantity;
        existing.totalPrice = Math.round(
          existing.totalPrice + price * quantity
        );
        existing.priceOfDiscount = Math.round(
          existing.priceOfDiscount + (actual - price) * quantity
        );
        existing.actualPrice = Math.round(
          existing.actualPrice + actual * quantity
        );
      } else {
        cart.products.push(item);
        cart.productsCount += 1;
      }

      // recalculate totals
      const totals = cart.products.reduce(
        (acc, i) => ({
          totalActualPrice: acc.totalActualPrice + i.actualPrice,
          totalDiscount: acc.totalDiscount + i.priceOfDiscount,
          finalAmount: acc.finalAmount + i.totalPrice,
        }),
        { totalActualPrice: 0, totalDiscount: 0, finalAmount: 0 }
      );

      cart.totalActualPrice = Math.round(totals.totalActualPrice);
      cart.totalDiscount = Math.round(totals.totalDiscount);
      cart.finalAmount = Math.round(totals.finalAmount);
      cart.deliveryCharges = Math.round(totals.finalAmount) > 999 ? 0 : 40;
      cart.platformFee = 20;

      await cart.save();
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Product added to cart", { cart }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", { error }));
  }
});

// working fine
const updateQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const buyer = req.buyer._id;

  if (!buyer) {
    return res
      .status(404)
      .json(new ApiError(404, "Buyer not found", { buyer }));
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
    const cart = await cartModel.findOne({ buyer });
    const item = cart?.products.find(
      (i) => i.productId.toString() === productId
    );
    if (!item) {
      return res
        .status(404)
        .json(new ApiError(404, "Item not found in cart", { item }));
    }
    const product = await productModel.findById(productId);
    item.quantity = quantity;
    item.totalPrice = Math.round(product.discountedPrice * quantity);
    item.priceOfDiscount = Math.round(
      (product.actualPrice - product.discountedPrice) * quantity
    );
    item.actualPrice = Math.round(product.actualPrice * quantity);

    // recalculate totals
    const totals = cart.products.reduce(
      (acc, i) => ({
        totalActualPrice: acc.totalActualPrice + i.actualPrice,
        totalDiscount: acc.totalDiscount + i.priceOfDiscount,
        finalAmount: acc.finalAmount + i.totalPrice,
      }),
      { totalActualPrice: 0, totalDiscount: 0, finalAmount: 0 }
    );

    cart.totalActualPrice = Math.round(totals.totalActualPrice);
    cart.totalDiscount = Math.round(totals.totalDiscount);
    cart.finalAmount = Math.round(totals.finalAmount);
    cart.deliveryCharges = Math.round(totals.finalAmount) > 999 ? 0 : 40;
    cart.platformFee = 20;

    await cart.save();
    return res.status(200).json(new ApiResponse(200, "Cart updated", { cart }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", { error }));
  }
});

// working fine
const removeFromCart = asyncHandler(async (req, res) => {
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
    // productId is just a field in a product(item) object ,so we need to filter out the product(item) object from the cart.products array and remove the product(item) object from the cart.products array
    const cart = await cartModel.findOne({ buyer });
    cart.products = cart.products.filter(
      (i) => i.productId.toString() !== productId
    );
    cart.productsCount = cart.products.length;

    // recalculate totals
    const totals = cart.products.reduce(
      (acc, i) => ({
        totalActualPrice: acc.totalActualPrice + i.actualPrice,
        totalDiscount: acc.totalDiscount + i.priceOfDiscount,
        finalAmount: acc.finalAmount + i.totalPrice,
      }),
      { totalActualPrice: 0, totalDiscount: 0, finalAmount: 0 }
    );

    cart.totalActualPrice = Math.round(totals.totalActualPrice);
    cart.totalDiscount = Math.round(totals.totalDiscount);
    cart.finalAmount = Math.round(totals.finalAmount);
    cart.deliveryCharges = Math.round(totals.finalAmount) > 999 ? 0 : 40;
    cart.platformFee = 20;

    await cart.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Product removed from cart", { cart }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", { error }));
  }
});

// working fine
const getCart = asyncHandler(async (req, res) => {
  const buyer = req.buyer._id;
  if (!buyer) {
    return res
      .status(404)
      .json(new ApiError(404, "Buyer not found", { buyer }));
  }
  try {
    const cart = await cartModel
      .findOne({ buyer })
      .populate("products.productId");
    if (!cart) {
      return res
        .status(404)
        .json(new ApiError(404, "Cart not found", { cartNotFound: true }));
    }
    return res.status(200).json(new ApiResponse(200, "Cart fetched", { cart }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", { error }));
  }
});

// working fine
const clearCart = asyncHandler(async (req, res) => {
  const buyer = req.buyer._id;
  if (!buyer) {
    return res
      .status(404)
      .json(new ApiError(404, "Buyer not found", { buyer }));
  }
  try {
    // just set the products array to an empty array and update the productsCount, totalActualPrice, totalDiscount, finalAmount
    const cart = await cartModel.findOneAndUpdate(
      { buyer },
      {
        $set: {
          products: [],
          productsCount: 0,
          totalActualPrice: 0,
          totalDiscount: 0,
          finalAmount: 0,
        },
      },
      { new: true }
    );
    return res.status(200).json(new ApiResponse(200, "Cart cleared", { cart }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", { error }));
  }
});

// working fine
const addProductFromCartToWishList = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const buyer = req.buyer._id;

  if (!buyer) {
    return res.status(404).json(new ApiError(404, "Buyer not found"));
  }

  if (!productId) {
    return res.status(400).json(new ApiError(400, "Product ID is required"));
  }

  try {
    // Find cart and populate product details
    const cart = await cartModel
      .findOne({ buyer })
      .populate("products.productId");

    if (!cart) {
      return res.status(404).json(new ApiError(404, "Cart not found"));
    }

    // Find product in cart
    const productInCart = cart.products.find(
      (item) => item.productId._id.toString() === productId
    );

    if (!productInCart) {
      return res
        .status(404)
        .json(new ApiError(404, "Product not found in cart"));
    }

    // Find or create wishlist
    let wishList = await wishListModel.findOne({ buyer });

    if (!wishList) {
      return res.status(404).json(new ApiError(404, "Wishlist not found"));
    }

    // Check if product already exists in wishlist
    const existingProduct = wishList.products.find(
      (item) => item.productId.toString() === productId
    );
    if (existingProduct) {
      return res
        .status(400)
        .json(new ApiError(400, "Product already exists in wishlist"));
    }

    // Add product to wishlist
    wishList.products.push({ productId });

    // Remove product from cart : working now
    cart.products = cart.products.filter(
      (item) => item.productId._id.toString() !== productId
    );

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
    cart.deliveryCharges = Math.round(totals.finalAmount) > 999 ? 0 : 40;
    cart.platformFee = 20;
    cart.productsCount = cart.products.length;

    // Save both cart and wishlist
    await Promise.all([cart.save(), wishList.save()]);

    return res.status(200).json(
      new ApiResponse(200, "Product moved from cart to wishlist successfully", {
        cart,
        wishList,
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", error));
  }
});

const isProductInCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const buyer = req.buyer._id;
  if (!buyer) {
    return res.status(404).json(new ApiError(404, "Buyer not found"));
  }
  if (!productId) {
    return res.status(400).json(new ApiError(400, "Product ID is required"));
  }
  try {
    const cart = await cartModel.findOne({ buyer });
    const isProductInCart = cart.products.some(
      (item) => item.productId.toString() === productId
    );
    return res
      .status(200)
      .json(new ApiResponse(200, "Product in cart", { isProductInCart }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", error));
  }
});

const getCartCount = asyncHandler(async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.buyer?._id) {
      return res.status(200).json(
        new ApiResponse(200, "Cart count for unauthenticated user", {
          cartCount: null,
        })
      );
    }

    const buyer = req.buyer._id;
    const cart = await cartModel.findOne({ buyer });
    const cartCount = cart?.productsCount || 0;

    return res
      .status(200)
      .json(new ApiResponse(200, "Cart count fetched", { cartCount }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", error));
  }
});

export {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  addProductFromCartToWishList,
  isProductInCart,
  getCartCount,
};
