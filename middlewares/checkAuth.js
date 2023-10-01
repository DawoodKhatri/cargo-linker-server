import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants/userRoles";
import Company from "../models/company";
export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token)
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });

    const { _id, role } = jwt.verify(token, process.env.JWT_SECRET);
    switch (role) {
      case USER_ROLES.admin:
        break;

      case USER_ROLES.company:
        req.company = await Company.findById(_id);
        break;

      case USER_ROLES.client:
        break;

      default:
        break;
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
