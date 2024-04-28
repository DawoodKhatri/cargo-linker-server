import { Schema, model } from "mongoose";
import { SERVICE_TYPES } from "../constants/serviceType.js";
import { VERIFICATION_STATUS } from "../constants/company.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants/userRoles.js";

const { String, ObjectId } = Schema.Types;

const traderSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, select: false, required: true },
    name: { type: String },
    bookings: [{ type: ObjectId, ref: "Booking" }],
  },
  { versionKey: false , timestamps: true }
);

traderSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

traderSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

traderSchema.methods.generateToken = function () {
  return jwt.sign(
    { _id: this._id, role: USER_ROLES.trader },
    process.env.JWT_SECRET
  );
};

const Trader = model("Trader", traderSchema);

export default Trader;
