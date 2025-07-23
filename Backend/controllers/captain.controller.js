const asyncHandler = require("express-async-handler");
const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");
const rideModel = require("../models/ride.model");
const mailUtil = require("../util/MailUtil");
const jwt = require("jsonwebtoken");
const secret = "secret";
const bcrypt  = require("bcrypt")

module.exports.registerCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname, email, password, phone, vehicle } = req.body;

  const alreadyExists = await captainModel.findOne({ email });

  if (alreadyExists) {
    return res.status(400).json({ message: "Captain already exists" });
  }

  const captain = await captainService.createCaptain(
    fullname.firstname,
    fullname.lastname,
    email,
    password,
    phone,
    vehicle.color,
    vehicle.number,
    vehicle.capacity,
    vehicle.type
  );

  const token = captain.generateAuthToken();
  res
    .status(201)
    .json({ message: "Captain registered successfully", token, captain });
});

module.exports.loginCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select("+password");
  if (!captain) {
    res.status(404).json({ message: "Invalid email or password" });
  }

  const isMatch = await captain.comparePassword(password);

  if (!isMatch) {
    return res.status(404).json({ message: "Invalid email or password" });
  }

  const token = captain.generateAuthToken();
  res.cookie("token", token);
  res.json({ message: "Logged in successfully", token, captain });
});

module.exports.captainProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ captain: req.captain });
});

module.exports.updateCaptainProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { captainData } = req.body;
  const updatedCaptainData = await captainModel.findOneAndUpdate(
    { email: req.captain.email },
    captainData,
    { new: true }
  );

  res.status(200).json({
    message: "Profile updated successfully",
    user: updatedCaptainData,
  });
});

module.exports.logoutCaptain = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.token;

  await blacklistTokenModel.create({ token });

  res.status(200).json({ message: "Logged out successfully" });
});

// module.exports.captainStats = asyncHandler(async (req, res) => {
//   // You'll need to implement these queries based on your database structure
//   const todayRides = await rideModel.countDocuments({ 
//     captain: req.captain._id, 
//     createdAt: { 
//       $gte: new Date().setHours(0, 0, 0, 0) 
//     } 
//   });
  
//   const todayEarnings = await rideModel.aggregate([
//     { 
//       $match: { 
//         captain: req.captain._id,
//         createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
//         status: 'completed'
//       }
//     },
//     { $group: { _id: null, total: { $sum: "$fare" } } }
//   ]);
  
//   const recentRides = await rideModel.find({ captain: req.captain._id })
//     .sort({ createdAt: -1 })
//     .limit(5)
//     .lean();
    
//   // Calculate rating (assuming you have this field)
//   const rating = req.captain.rating || 0;
  
//   res.json({
//     todayRides,
//     todayEarnings: todayEarnings[0]?.total || 0,
//     recentRides,
//     rating,
//     // These would require more complex queries for changes
//     rideChange: 0, // % change from yesterday
//     earningsChange: 0, // % change from yesterday
//     ratingChange: 0, // % change from last week
//     activeHours: 0, // Today's active hours
//     hoursChange: 0 // % change from yesterday
//   });
// });
// captain.controller.js
// Update the captainStats function to include better rating calculations
module.exports.captainStats = asyncHandler(async (req, res) => {
  try {
    // Today's rides count
    const todayRides = await rideModel.countDocuments({ 
      captain: req.captain._id, 
      createdAt: { 
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      },
      status: 'completed'
    });

    // Today's earnings
    const todayEarningsAgg = await rideModel.aggregate([
      { 
        $match: { 
          captain: req.captain._id,
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: "$fare" } } }
    ]);
    const todayEarnings = todayEarningsAgg[0]?.total || 0;

    // Recent rides
    const recentRides = await rideModel.find({ 
      captain: req.captain._id,
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    // Calculate rating change (last 7 days vs previous 7 days)
    const now = new Date();
    const last7DaysStart = new Date(now.setDate(now.getDate() - 7));
    const last7DaysEnd = new Date();
    const prev7DaysStart = new Date(now.setDate(now.getDate() - 7));
    const prev7DaysEnd = last7DaysStart;

    const last7DaysRating = await rideModel.aggregate([
      {
        $match: {
          captain: req.captain._id,
          ratedAt: { $gte: last7DaysStart, $lt: last7DaysEnd },
          rating: { $exists: true }
        }
      },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);

    const prev7DaysRating = await rideModel.aggregate([
      {
        $match: {
          captain: req.captain._id,
          ratedAt: { $gte: prev7DaysStart, $lt: prev7DaysEnd },
          rating: { $exists: true }
        }
      },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);

    const currentRating = last7DaysRating[0]?.avg || req.captain.rating || 0;
    const previousRating = prev7DaysRating[0]?.avg || currentRating;
    const ratingChange = previousRating > 0 
      ? ((currentRating - previousRating) / previousRating * 100).toFixed(1)
      : 0;

    res.json({
      todayRides,
      todayEarnings,
      recentRides,
      rating: currentRating,
      rideChange: 0, // % change from yesterday
      earningsChange: 0, // % change from yesterday
      ratingChange: Number(ratingChange),
      activeHours: 0, // Today's active hours
      hoursChange: 0 // % change from yesterday
    });
  } catch (error) {
    console.error('Error in captainStats:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;
  const foundCaptain = await captainModel.findOne({ email: email });

  if (foundCaptain) {
    const token = jwt.sign(foundCaptain.toObject(), secret);
    console.log(token);
    const url = `http://localhost:5173/captain/resetpassword/${token}`;
    const mailContent = `<html>
                          <a href ="${url}">rest password</a>
                          </html>`;
    //email...
    await mailUtil.sendingMail(foundCaptain.email, "reset password", mailContent);
    res.json({
      message: "reset password link sent to mail.",
    });
  } else {
    res.json({
      message: "user not found register first..",
    });
  }
};

module.exports.resetpassword = async (req, res) => {
  const token = req.body.token; //decode --> email | id
  const newPassword = req.body.password;

  const captainFromToken = jwt.verify(token, secret);
  //object -->email,id..
  //password encrypt...
  const salt = bcrypt.genSaltSync(10);
  const hashedPasseord = bcrypt.hashSync(newPassword,salt);

  const updatedCaptain= await captainModel.findByIdAndUpdate(captainFromToken._id, {
    password: hashedPasseord,
  });
  res.json({
    message: "password updated successfully..",
  });
};

// Add these methods to your captain controller

