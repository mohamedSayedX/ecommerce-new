const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "SubCategory must be unique."],
      minlength: [2, "Too short SubCategory name."],
      maxlength: [32, "Too long SubCategory name."],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "categories",
      required: [true, "SubCategory must be belong to parent category"],
    },
  },
  {timestamps: true}
);

const SubCategoryModel= mongoose.model("subcategories", subCategorySchema);

module.exports = SubCategoryModel;

