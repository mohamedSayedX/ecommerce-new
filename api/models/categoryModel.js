const mongoose = require("mongoose");

// 1- Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category required."],
      unique: [true, "Category must be unique,"],
      minlength: [3, "Too short category name."],
      maxlength: [32, "Too long category name."],
    },
    slug: {
      type: String,
      lowercase: true,
    },

    image: String,
  },
  {timestamps: true}
);

const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};

//findOne , findAll And update
categorySchema.post("init", (doc) => {
  // return set image base url

  setImageUrl(doc);
});

//create
categorySchema.post("save", (doc) => {
  // return set image base url

  setImageUrl(doc);
});

// 2- Create model

const CategoryModel = mongoose.model("categories", categorySchema);

module.exports = CategoryModel;
