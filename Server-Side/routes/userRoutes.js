const express = require("express");
const authController = require("./../controllers/authController");
const router = express.Router();

// router.post("/signup", authController.signup);
router.get("/login", authController.login);

router.route("/callback").get(authController.callback);

module.exports = router;
