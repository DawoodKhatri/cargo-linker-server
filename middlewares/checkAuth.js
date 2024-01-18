import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants/userRoles.js";
import Company from "../models/company.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token)
      return res.status(403).json({
        success: false,
        message: "Please login first",
      });

    const { _id, role } = jwt.verify(token, process.env.JWT_SECRET);

    req.role = role;
    req._id = _id;

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const isCompany = async (req, res, next) => {
  try {
    if (req.role !== USER_ROLES.company)
      return res.json(403, {
        success: false,
        message: "Please login as company first",
      });

    const company = await Company.findById(req._id);
    if (!company)
      return res.json(403, {
        success: false,
        message: "Please login as company first",
      });

    req._id = undefined;
    req.company = company.toObject();

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
