import { Router } from "express";
import {
  acceptCompany,
  adminLogin,
  getAnalytics,
  getCompanyDetails,
  getPendingVerificationCompanies,
  rejectCompany,
} from "../controllers/admin.js";
import { isAuthenticated, isAdmin } from "../middlewares/checkAuth.js";

const adminRoutes = Router();

adminRoutes.post("/login", adminLogin);
adminRoutes.get(
  "/pendingVerificationCompanies",
  isAuthenticated,
  isAdmin,
  getPendingVerificationCompanies
);

adminRoutes.get(
  "/company/:companyId",
  isAuthenticated,
  isAdmin,
  getCompanyDetails
);

adminRoutes.post(
  "/company/:companyId/accept",
  isAuthenticated,
  isAdmin,
  acceptCompany
);

adminRoutes.post(
  "/company/:companyId/reject",
  isAuthenticated,
  isAdmin,
  rejectCompany
);

adminRoutes.get("/analytics", isAuthenticated, isAdmin, getAnalytics);

export default adminRoutes;
