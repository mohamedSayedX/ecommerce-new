const express = require("express");
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUser,
} = require("../services/userService");

const {
  createUserValidator,
  changePasswordValidator,
  deleteUserValidator,
  updateUserValidator,
  getUserValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");
const {protect, allowedTo} = require("../services/authService");

const router = express.Router();
router.use(protect);
// req.user --> req.params.id
router.get("/getMe", getLoggedUserData, getUser);
router.put("/changeMyPassword", getLoggedUserData, updateLoggedUserPassword);
router.put(
  "/updateMe",
  protect,
  updateLoggedUserValidator,
  updateLoggedUserData
);

router.delete("/deleteMe", deleteLoggedUser)

router.use(allowedTo("admin", "manager"));

router.put("/changePassword/:id", changePasswordValidator, changeUserPassword);
router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
