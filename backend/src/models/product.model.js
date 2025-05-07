import { Schema, model } from "mongoose";

const locationSchema = new Schema({ countryName: String }, { _id: true });

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    stockUnit: {
      type: String,
      enum: ["pieces", "kg", "liters", "grams", "packs"],
      required: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    images: [
      {
        publicId: String,
        url: String,
        _id: false,
      },
    ],
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      // required: true,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "review",
      },
    ],
    discountedPrice: {
      type: Number,
    },
    discountPercentage: {
      type: Number,
    },
    averageRating: {
      type: Number,
    },
    ratingsSum: {
      type: Number,
    },
    locations: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "empty"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.discountedPrice && this.actualPrice) {
    this.discountPercentage = Math.round(
      ((this.actualPrice - this.discountedPrice) / this.actualPrice) * 100
    );
  } else {
    this.discountPercentage = null;
  }
  next();
});

export const productModel = model("product", productSchema);
