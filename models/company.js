import { Schema, model } from "mongoose";
import { SERVICE_TYPES } from "../constants/serviceType.js";
import { VERIFICATION_STATUS } from "../constants/company.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants/userRoles.js";

const { String, ObjectId } = Schema.Types;

const companySchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, select: false, required: true },
    name: { type: String },
    serviceType: { type: String, enum: SERVICE_TYPES },
    registrationNumber: { type: String },
    establishmentDate: { type: Date },
    license: { type: String },
    bankStatement: { type: String },
    verification: {
      status: {
        type: String,
        enum: Object.values(VERIFICATION_STATUS),
        default: VERIFICATION_STATUS.incomplete,
      },
      remark: { type: String },
    },
    containers: [{ type: ObjectId, ref: "Container" }],
  },
  { versionKey: false }
);

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
