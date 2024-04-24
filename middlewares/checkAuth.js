import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants/userRoles.js";
import Company from "../models/company.js";
import Admin from "../models/admin.js";
import { errorResponse } from "../utils/response.js";
import Trader from "../models/trader.js";
import crypto from "crypto";

export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token)
      return errorResponse({ res, status: 403, message: "Please login first" });

    const { _id, role } = jwt.verify(token, process.env.JWT_SECRET);

    req.role = role;
    req._id = _id;

    next();
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (req.role !== USER_ROLES.admin)
      return errorResponse({
        res,
        status: 403,
        message: "Please login as admin first",
      });

    const admin = await Admin.findById(req._id);
    if (!admin)
      return errorResponse({
        res,
        status: 403,
        message: "Please login as admin first",
      });

    req._id = undefined;
    req.admin = admin;

    next();
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const isCompany = async (req, res, next) => {
  try {
    if (req.role !== USER_ROLES.company)
      return errorResponse({
        res,
        status: 403,
        message: "Please login as company first",
      });

    const company = await Company.findById(req._id);
    if (!company)
      return errorResponse({
        res,
        status: 403,
        message: "Please login as company first",
      });

    req._id = undefined;
    req.company = company.toObject();

    next();
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const isTrader = async (req, res, next) => {
  try {
    if (req.role !== USER_ROLES.trader)
      return errorResponse({
        res,
        status: 403,
        message: "Please login as trader first",
      });

    const trader = await Trader.findById(req._id);
    if (!trader)
      return errorResponse({
        res,
        status: 403,
        message: "Please login as trader first",
      });

    req._id = undefined;
    req.trader = trader.toObject();

    next();
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const isRazorpayAuthenticated = async (req, res, next) => {
  try {
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const webhookBody = JSON.stringify(req.body);

    const hmac = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_WEBHOOK_SECRET
    );
    hmac.update(webhookBody);
    const calculatedSignature = hmac.digest("hex");

    if (calculatedSignature != razorpaySignature) {
      return res.status(400).json({ message: "Invalid Signature" });
    }

    next();
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};
