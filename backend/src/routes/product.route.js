import { Router } from "express";
import {
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
} from "../controllers/product-controller.js";
import {
  verifyAdminJWT,
  verifyBuyerJWT,
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const productRouter = Router();

// admin routes
productRouter.route("/admin/create-product").post(
  verifyAdminJWT,
  upload.fields([
    {
      name: "images",
      maxCount: 6,
      // Add file size limit (5MB per file)
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    },
  ]),
  createProduct
);

productRouter
  .route("/admin/get-all-products")
  .get(verifyAdminJWT, getAllProducts);

productRouter
  .route("/admin/delete-product/:productId")
  .delete(verifyAdminJWT, deleteProduct);

productRouter
  .route("/admin/get-product/:productId")
  .get(verifyAdminJWT, getProductDetails);

// buyer routes
productRouter.route("/buyer/get-product/:productId").get(getProductDetails);

productRouter
  .route("/buyer/category/:category")
  .get(getProductsAccordingToCategory);

productRouter
  .route("/buyer/get-products-by-brand/:brand")
  .get(getProductsAccordingToBrand);

productRouter
  .route("/buyer/get-products-by-search/:search")
  .get(getProductsAccordingToSearch);

productRouter.route("/admin/edit-product/:productId").post(
  verifyAdminJWT,
  upload.fields([
    {
      name: "images",
      maxCount: 6,
      // Add file size limit (5MB per file)
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    },
  ]),
  editProduct
);

productRouter.route("/buyer/get-featured-products").get(getFeaturedProducts);

productRouter.route("/buyer/get-latest-products").get(getLatestProducts);

productRouter
  .route("/buyer/get-best-selling-products")
  .get(getBestSellingProducts);

export default productRouter;
