import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, folder = "products") => {
  try {
    if (!localFilePath) {
      throw new Error("Local file path is required");
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder,
    });

    await fs.unlink(localFilePath);
    return response;
  } catch (error) {
    if (localFilePath) {
      await fs.unlink(localFilePath).catch((err) => {
        console.error("Error deleting local file:", err);
      });
    }
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

const uploadMultipleFilesOnCloudinary = async (
  filePaths,
  folder = "products"
) => {
  try {
    if (!filePaths || filePaths.length === 0) {
      throw new Error("File paths are required");
    }

    const uploadPromises = filePaths.map((filePath) =>
      uploadOnCloudinary(filePath, folder)
    );

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Error uploading multiple files to Cloudinary:", error);
    throw error;
  }
};

const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) {
    throw new Error("No public ID provided");
  }

  try {
    const response = await cloudinary.uploader.destroy(publicId);

    if (!response || response.result !== "ok") {
      throw new Error(`Failed to delete image: ${publicId}`);
    }

    return {
      statusCode: 200,
      message: "Image deleted successfully",
      data: response,
    };
  } catch (error) {
    throw new Error(`Error deleting image ${publicId}: ${error.message}`);
  }
};

export {
  uploadOnCloudinary,
  uploadMultipleFilesOnCloudinary,
  deleteImageFromCloudinary,
};
