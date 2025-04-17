const express = require("express");
const router = express.Router();
const { create_order, verify_order } = require("../controllers/RazorPay.controller");

router.post("/create-order", create_order);
router.post("/verify-order", verify_order);

module.exports = router;  
