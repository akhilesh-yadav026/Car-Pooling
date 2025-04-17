
const Razorpay = require("razorpay")
const bodyParser = require("body-parser");


// Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_fiznZwAdVHPiRo",
  key_secret: "O8vhKBbVJwkDF00tWsqvSGKw",
});

// API to create an order
const create_order =async (req, res) => {
  const { amount, currency, receipt } = req.body;
  
  const options = {
    amount: amount *100 , // Razorpay expects the amount in paise
    currency: currency,
    receipt: receipt,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order); // Returns the order details, including order_id
  } catch (error) {
    console.log(error)
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// API to verify the payment signature (optional for backend verification)
const crypto = require("crypto");

const verify_order = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_SECRET || "O8vhKBbVJwkDF00tWsqvSGKw"; // Store in env ideally

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("Expected Hash:", generated_signature);
    console.log("Provided Signature:", razorpay_signature);

    if (generated_signature === razorpay_signature) {
      return res.json({ status: "success" });
    } else {
      return res.status(400).json({ status: "failure", message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ status: "failure", message: "Internal server error" });
  }
};


module.exports = {
    create_order,
    verify_order,
}