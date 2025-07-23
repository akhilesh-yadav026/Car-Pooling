const express = require("express");
const mongoose = require("mongoose");
const Ride = require("../models/ride.model.js");
const { authUser } = require("../middlewares/auth.middleware.js");

const router = express.Router();

// Submit rating
router.post("/submit", authUser, async (req, res) => {
  try {
    const { rideId, rating, comment } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if ride exists and is completed
    const ride = await Ride.findOne({
      _id: rideId,
      status: "completed",
      user: userId,
    }).populate("captain", "rating ratingCount");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found or not completed" });
    }

    // Check if rating already exists
    if (ride.rating) {
      return res.status(400).json({ message: "Rating already submitted" });
    }

    // Update ride with rating
    ride.rating = rating;
    ride.ratingComment = comment;
    ride.ratedAt = new Date();
    await ride.save();

    // Update captain's rating if captain exists
    if (ride.captain) {
      await updateCaptainRating(ride.captain._id, rating);
    }

    res.status(200).json({ 
      message: "Rating submitted successfully",
      captainRating: ride.captain?.rating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to update captain's rating
async function updateCaptainRating(captainId, newRating) {
  const Captain = mongoose.model("Captain");
  const captain = await Captain.findById(captainId);
  
  if (!captain) return;

  const currentTotal = captain.rating * captain.ratingCount;
  const newCount = captain.ratingCount + 1;
  const newAverage = (currentTotal + newRating) / newCount;

  captain.rating = parseFloat(newAverage.toFixed(1));
  captain.ratingCount = newCount;
  
  await captain.save();
}

module.exports = router;