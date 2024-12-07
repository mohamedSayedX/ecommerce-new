const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: [3, "Too short Product title"],
      maxlength: [100, "Too long product title"],
      required: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "product description is required"],
      minlength: [20, "Too short product description"],
    },
    quantity: {
      type: Number,
      required: [true, "product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "product price is required"],
      trim: true,
      max: [200000, "Too mutch product price"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],
    imageCover: {
      type: String,
      required: [true, "Product Image cover is required"],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "categories",
      required: [true, "Product must be bolong to category"],
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subcategories",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "brands",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "rating must be greater than or equal to 1"],
      max: [5, "rating must be less than or equal to 5"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },

  {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}}
);

// Mongoose querey middleware
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name",
  });

  next();
});

const setImageUrl = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc?.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      imagesList.push(imageUrl);
    });

    doc.images = imagesList;
  }
};

productSchema.virtual("reviews", {
  ref: "reviews",
  localField: "_id",
  foreignField: "product",
  // justOne: false,
});

//findOne , findAll And update
productSchema.post("init", (doc) => {
  // return set image base url

  setImageUrl(doc);
});

//create
productSchema.post("save", (doc) => {
  // return set image base url

  setImageUrl(doc);
});

const PorductModel = mongoose.model("products", productSchema);

module.exports = PorductModel;
