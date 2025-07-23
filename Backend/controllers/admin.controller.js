// admin.controller.js
const asyncHandler = require("express-async-handler");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const rideModel = require("../models/ride.model");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secret = "secret";

// Admin login
module.exports.loginAdmin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email, password } = req.body;

  // Hardcoded admin credentials (in production, use environment variables)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email !== adminEmail) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, await bcrypt.hash(adminPassword, 10));
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ email, role: "admin" }, secret, { expiresIn: "1d" });
  res.json({ message: "Logged in successfully", token });
});

// Get all users
module.exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await userModel.find().select("-password");
  res.json(users);
});

// Get all captains
module.exports.getAllCaptains = asyncHandler(async (req, res) => {
  const captains = await captainModel.find().select("-password");
  res.json(captains);
});

// Get all rides
module.exports.getAllRides = asyncHandler(async (req, res) => {
  const rides = await rideModel.find()
    .populate("user", "fullname email phone")
    .populate("captain", "fullname email phone vehicle");
  res.json(rides);
});

// Get dashboard statistics
module.exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalCaptains, totalRides, completedRides, activeRides] = await Promise.all([
    userModel.countDocuments(),
    captainModel.countDocuments(),
    rideModel.countDocuments(),
    rideModel.countDocuments({ status: "completed" }),
    rideModel.countDocuments({ status: { $in: ["confirmed", "started"] } })
  ]);

  // Get recent 5 rides
  const recentRides = await rideModel.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "fullname")
    .populate("captain", "fullname");

  // Get earnings data (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const earningsData = await rideModel.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalEarnings: { $sum: "$fare" },
        rideCount: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  res.json({
    totalUsers,
    totalCaptains,
    totalRides,
    completedRides,
    activeRides,
    recentRides,
    earningsData
  });
});

// Block/Unblock user
module.exports.toggleUserBlock = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await userModel.findById(userId);
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({ 
    message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    user
  });
});

// Block/Unblock captain
module.exports.toggleCaptainBlock = asyncHandler(async (req, res) => {
  const { captainId } = req.params;
  const captain = await captainModel.findById(captainId);
  
  if (!captain) {
    return res.status(404).json({ message: "Captain not found" });
  }

  captain.isBlocked = !captain.isBlocked;
  await captain.save();

  res.json({ 
    message: `Captain ${captain.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    captain
  });
});

// View ride details
module.exports.getRideDetails = asyncHandler(async (req, res) => {
  const { rideId } = req.params;
  const ride = await rideModel.findById(rideId)
    .populate("user", "fullname email phone")
    .populate("captain", "fullname email phone vehicle");

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  res.json(ride);
});