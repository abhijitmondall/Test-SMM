const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const router = express.Router();

// router.post("/signup", authController.signup);
router.get("/login", authController.login);
router.get("/me", authController.protected, userController.getMe);
router.post(
  "/pageInsights",
  authController.protected,
  userController.getPageInsights
);

router.route("/callback").get(authController.callback);

module.exports = router;
