/** @type {import("express").RequestHandler} */

import { VERIFICATION_STATUS } from "../constants/verificationStatus.js";
import Admin from "../models/admin.js";
import Company from "../models/company.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { getFileUrl } from "../utils/storage.js";

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return errorResponse({
        res,
        status: 400,
        message: "Please fill all the fields",
      });

    const admin = await Admin.findOne({ username }).select("password");
    if (!admin)
      return errorResponse({ res, status: 404, message: "Account not found" });

    const isPasswordMatch = await admin.matchPassword(password);
    if (!isPasswordMatch)
      return errorResponse({
        res,
        status: 401,
        message: "Invalid credentials",
      });

    let options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    const token = await admin.generateToken();

    return successResponse({
      res: res.cookie("token", token, options),
      message: "Login Successfull",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const getPendingVerificationCompanies = async (req, res) => {
  try {
    const companies = await Company.find({
      "verification.status": VERIFICATION_STATUS.underVerification,
    }).select("name email establishmentDate serviceType");

    return successResponse({
      res,
      message: "Pending Verifications",
      data: { companies },
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const getCompanyDetails = async (req, res) => {
  try {
    const { companyId } = req.params;
    let company = await Company.findById(companyId);
    if (!company)
      return errorResponse({ res, status: 404, message: "Company not found" });

    company = company.toObject();
    company.license = await getFileUrl(company.license);
    company.bankStatement = await getFileUrl(company.bankStatement);

    return successResponse({
      res,
      message: "Company Details",
      data: { company },
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const acceptCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company)
      return errorResponse({ res, status: 404, message: "Company not found" });

    company.verification.status = VERIFICATION_STATUS.verified;
    await company.save();

    return successResponse({
      res,
      message: "Company Accepted",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const rejectCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { remark } = req.body;
    if (!remark)
      return errorResponse({ res, status: 400, message: "Remark Required" });

    const company = await Company.findById(companyId);
    if (!company)
      return errorResponse({ res, status: 404, message: "Company not found" });

    company.verification.status = VERIFICATION_STATUS.rejected;
    company.verification.remark = remark;
    await company.save();

    return successResponse({
      res,
      message: "Company Rejected",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};
