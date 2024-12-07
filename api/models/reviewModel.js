const mongoose = require("mongoose");
const PorductModel = require("./productModel");
const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "rating must be greater than or equal to 1"],
      max: [5, "rating must be less than or equal to 5"],
      required: [true, "review ratings required"],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "products",
      required: [true, "Review must belong to product"],
    },
  },
  {timestamps: true}
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({path: "user", select: "name email"});
  next();
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId
) {
  const result = await this.aggregate([
    //Statge 1: get all reviews in specific product
    {$match: {product: productId}},

    // Stage 2: grouping reviews based on product_id calculate average rating and quantity of reviews
    {
      $group: {
        _id: "$product",
        averageRatings: {$avg: "$ratings"},
        ratingsQuantity: {$sum: 1},
      },
    },
  ]);
  console.log(result);

  if (result.length > 0) {
    // update product data for ratingsAvg and ratingsQuantity
    await PorductModel.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].averageRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await PorductModel.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

// when save or create a new review
reviewSchema.post("save", async function (next) {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.pre("findOneAndDelete", async function (next) {
  this.docToDelete = await this.model.findOne(this.getFilter());
  next();
});
reviewSchema.post("findOneAndDelete", async function () {
  if (this.docToDelete) {
    await this.docToDelete.constructor.calcAverageRatingsAndQuantity(
      this.docToDelete.product
    );
  }
});

const RevModel = mongoose.model("reviews", reviewSchema);

module.exports = RevModel;
