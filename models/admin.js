import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants/userRoles.js";

const { String } = Schema.Types;

const adminSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, select: false, required: true },
  },
  { versionKey: false }
);

adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

adminSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateToken = function () {
  return jwt.sign(
    { _id: this._id, role: USER_ROLES.admin },
    process.env.JWT_SECRET
  );
};

const Admin = model("Admin", adminSchema);

export default Admin;
