import { Schema, model } from "mongoose";

const { ObjectId } = Schema.Types;

const bookingSchema = new Schema(
  {
    container: { type: ObjectId, ref: "Container", required: true },
    company: { type: ObjectId, ref: "Company", required: true },
    trader: { type: ObjectId, ref: "Trader", required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentDisbursed: { type: Boolean, default: false },
  },
  { versionKey: false }
);

const Booking = model("Booking", bookingSchema);

export default Booking;
