const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Find and delete the document
    const document = await Model.findByIdAndDelete(id);

    // If the document doesn't exist, trigger the error handler
    if (!document) {
      return next(new ApiError(`No document found with ID: ${id}`, 404));
    }

    // Optional: Trigger events or additional logic based on model type
    console.log(`Deleted document of model: ${Model.modelName}`);

    // Example: Additional response for specific models
    if (Model.modelName.toLowerCase() === "reviews") {
      return res.status(204).send(); // No Content response for reviews
    }

    // Standard response for other models
    res.status(204).json({
      status: "success",
      message: `Document with ID: ${id} deleted successfully`,
    });
  });
exports.updateOne = (Model) =>
  expressAsyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      // res.status(404).json({message: `No brand for this id ${id}`});
      next(new ApiError(`No document for this id ${req.params.id}`, 404));
      return;
    }

    //Trigger "save" when update document is updated
    document.save();
    res.status(200).json({data: document});
  });

exports.createOne = (Model) =>
  expressAsyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    res.status(201).json({data: document});
  });

exports.getOne = (Model, populationOpt) =>
  expressAsyncHandler(async (req, res, next) => {
    const {id} = req.params;
    // 1) build query
    let query = Model.findById(id);
    if (populationOpt) {
      query.populate(populationOpt);
    }
    //2) exec query
    const document = await query;
    if (!document) {
      // res.status(404).json({message: `No document for this id ${id}`});
      next(new ApiError(`No document for this id ${id}`, 404));
      return;
    }
    res.status(200).json({data: document});
  });

exports.getAll = (Model, ModelName = "") =>
  expressAsyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    const docCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(docCounts)
      .filter()
      .search(ModelName)
      .limitFields()
      .sort();

    const {mongooseQuery, paginateResult} = apiFeatures;

    const document = await mongooseQuery;
    res.status(200).json({
      results: document.length,
      pagination: paginateResult,
      data: document,
    });
  });
