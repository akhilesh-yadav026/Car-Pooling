// admin.validator.js
const { body } = require("express-validator");

exports.validateAdminLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];