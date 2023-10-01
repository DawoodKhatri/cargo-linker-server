import { Schema, model } from "mongoose";
import { SERVICE_TYPES } from "../constants/serviceType";
import { VERIFICATION_STATUS } from "../constants/verificationStatus";

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

const Company = model("Company", companySchema);

export default Company;
