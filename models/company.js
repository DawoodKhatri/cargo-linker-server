import { Schema, model } from "mongoose";
import { SERVICE_TYPES } from "../constants/serviceType";
import { VERIFICATION_STATUS } from "../constants/verificationStatus";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants/userRoles";

const { String, ObjectId } = Schema.Types;

const companySchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, select: false, required: true },
  registrationNumber: { type: String },
  serviceType: { type: String, enum: SERVICE_TYPES },
  verification: {
    status: {
      type: String,
      enum: VERIFICATION_STATUS,
      default: VERIFICATION_STATUS[0],
    },
    remark: { type: String },
  },
  documents: [{ type: ObjectId, ref: "Document" }],
});

companySchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

companySchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

companySchema.methods.generateToken = function () {
  return jwt.sign(
    { _id: this._id, role: USER_ROLES.company },
    process.env.JWT_SECRET
  );
};

const Company = model("Company", companySchema);

export default Company;
