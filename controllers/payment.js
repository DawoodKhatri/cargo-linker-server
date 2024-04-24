import razorpay from "../config/razorpay";

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body;

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes,
    });

    return successResponse({
      res,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};
