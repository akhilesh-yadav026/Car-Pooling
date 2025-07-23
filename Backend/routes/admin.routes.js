// admin.routes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { validateAdminLogin } = require("../validator/admin.validator");
const  {authenticateAdmin}  = require("../middlewares/admin.middleware");

// Authentication
router.post("/login", validateAdminLogin, adminController.loginAdmin);

// Dashboard
router.get("/dashboard", authenticateAdmin, adminController.getDashboardStats);

// Users
router.get("/users", authenticateAdmin, adminController.getAllUsers);
router.put("/users/:userId/toggle-block", authenticateAdmin, adminController.toggleUserBlock);

// Captains
router.get("/captains", authenticateAdmin, adminController.getAllCaptains);
router.put("/captains/:captainId/toggle-block", authenticateAdmin, adminController.toggleCaptainBlock);

// Rides
router.get("/rides", authenticateAdmin, adminController.getAllRides);
router.get("/rides/:rideId", authenticateAdmin, adminController.getRideDetails);

module.exports = router;