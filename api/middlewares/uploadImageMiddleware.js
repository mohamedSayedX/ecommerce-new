const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerOptions = () => {
  //1- DiskStorage engine
  // const multerStorage = multer.diskStorage({
  //   destination: function (req, res, cb) {
  //     cb(null, "uploads/categories");
  //   },
  //   filename: function (req, file, cb) {
  //     //category-${id}-Date.now().jpeg
  //     const ext = file.mimetype.split("/")[1];
  //     const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
  //     cb(null, filename);
  //   },
  // });

  //2- memoryStorage engine
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only images allowed", 400), false);
    }
  };

  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });

  return upload;
};

//for uploading only one single file
exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

//for uploading multiple files
exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
