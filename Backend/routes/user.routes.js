const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { body } = require("express-validator");
const { authUser } = require("../middlewares/auth.middleware");

router.post("/register",
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    body("fullname.firstname").isLength({min:2}).withMessage("First name must be at least 2 characters long"),
    userController.registerUser
);

router.post("/login", 
    body("email").isEmail().withMessage("Invalid Email"),
    userController.loginUser
);

router.post("/update", authUser,
    body("fullname.firstname").isLength({min:2}).withMessage("First name must be at least 2 characters long"),
    body("fullname.lastname").isLength({min:2}).withMessage("Last name must be at least 2 characters long"),
    userController.updateUserProfile
);

router.get("/profile", authUser, userController.userProfile);

    
router.get("/logout", authUser, userController.logoutUser);
router.post("/forgotpassword",userController.forgotPassword)
router.post("/resetpassword",userController.resetpassword)
// Add these routes
router.post("/rides/rate", 
    body("rideId").notEmpty(),
    body("rating").isInt({ min: 1, max: 5 }),
    body("feedback").optional().isString().isLength({ max: 500 }),
    authUser, // Your authentication middleware
    userController.submitRating
  );
  
 // user.routes.js (add this route)
router.post("/rides/:rideId/rate", 
  authUser,
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  userController.submitRating
);

module.exports = router;
