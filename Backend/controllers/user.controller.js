const asyncHandler = require("express-async-handler");
const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");
const rideModel = require("../models/ride.model");
const captainModel = require("../models/captain.model");
const mailUtil = require("../util/MailUtil");
const jwt = require("jsonwebtoken");
const secret = "secret";
const bcrypt  = require("bcrypt")

module.exports.registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname, email, password } = req.body;

  const alreadyExists = await userModel.findOne({ email });

  if (alreadyExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await userService.createUser(
    fullname.firstname,
    fullname.lastname,
    email,
    password
  );

  const token = user.generateAuthToken();
  res
    .status(201)
    .json({ message: "User registered successfully", token, user });
});

module.exports.loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    res.status(404).json({ message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(404).json({ message: "Invalid email or password" });
  }

  const token = user.generateAuthToken();
  res.cookie("token", token);
  res.json({ message: "Logged in successfully", token, user });
});

module.exports.userProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { userData } = req.body;
  console.log(req.body);
  const updatedUserData = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    userData,
    { new: true }
  );

  res
    .status(200)
    .json({ message: "Profile updated successfully", user: updatedUserData });
});

module.exports.logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.token;

  await blacklistTokenModel.create({ token });

  res.status(200).json({ message: "Logged out successfully" });
});

module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;
  const foundUser = await userModel.findOne({ email: email });

  if (foundUser) {
    const token = jwt.sign(foundUser.toObject(), secret);
    console.log(token);
    const url = `http://localhost:5173/resetpassword/${token}`;
    const mailContent = `<html>
                          <a href ="${url}">rest password</a>
                          </html>`;
    //email...
    await mailUtil.sendingMail(foundUser.email, "reset password", mailContent);
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

  const userFromToken = jwt.verify(token, secret);
  //object -->email,id..
  //password encrypt...
  const salt = bcrypt.genSaltSync(10);
  const hashedPasseord = bcrypt.hashSync(newPassword,salt);

  const updatedUser = await userModel.findByIdAndUpdate(userFromToken._id, {
    password: hashedPasseord,
  });
  res.json({
    message: "password updated successfully..",
  });
};

// Add these methods to your user controller

// Submit a rating for a completed ride
module.exports.submitRating = asyncHandler(async (req, res) => {
  const { rideId, rating, feedback } = req.body;
  
  // Validate input
  if (!rideId || !rating) {
    return res.status(400).json({ message: "Ride ID and rating are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  // Find the ride
  const ride = await rideModel.findOne({
    _id: rideId,
    user: req.user._id,
    status: 'completed'
  });

  if (!ride) {
    return res.status(404).json({ message: "Completed ride not found" });
  }

  // Check if already rated
  if (ride.rating) {
    return res.status(400).json({ message: "You've already rated this ride" });
  }

  // Update the ride with rating
  const updatedRide = await rideModel.findByIdAndUpdate(
    rideId,
    {
      rating,
      ratingComment: feedback || '',
      ratedAt: new Date()
    },
    { new: true }
  ).populate('captain', 'fullname');

  // Update captain's average rating
  await updateCaptainRating(ride.captain);

  res.json({ 
    message: "Rating submitted successfully",
    ride: updatedRide
  });
});

// Helper function to update captain's average rating
async function updateCaptainRating(captainId) {
  const result = await rideModel.aggregate([
    {
      $match: {
        captain: captainId,
        rating: { $exists: true }
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    await captainModel.findByIdAndUpdate(captainId, {
      rating: result[0].averageRating,
      ratingCount: result[0].ratingCount
    });
  }
}

// Get all ratings given by a user
module.exports.getUserRatings = asyncHandler(async (req, res) => {
  const ratings = await rideModel.find({
    user: req.user._id,
    rating: { $exists: true }
  })
  .populate('captain', 'fullname vehicle')
  .sort({ ratedAt: -1 });

  res.json(ratings);
});