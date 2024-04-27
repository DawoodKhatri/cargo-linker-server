import { Router } from "express";
import {
  companyGetVerificationMail,
  companyListContainer,
  companyLogin,
  companySignup,
  getCompanyBookings,
  getCompanyListedContainers,
  getCompanyVerificationStatus,
  submitCompanyVerificationDetails,
} from "../controllers/company.js";
import multer from "../middlewares/multer.js";
import { isAuthenticated, isCompany } from "../middlewares/checkAuth.js";

const companyRoutes = Router();

companyRoutes.post("/auth/verification", companyGetVerificationMail);
companyRoutes.post("/auth/signup", companySignup);
companyRoutes.post("/auth/login", companyLogin);
companyRoutes.get(
  "/auth/verificationStatus",
  isAuthenticated,
  isCompany,
  getCompanyVerificationStatus
);
companyRoutes.post(
  "/auth/submitVerificationDetails",
  isAuthenticated,
  isCompany,
  multer.any(),
  submitCompanyVerificationDetails
);

companyRoutes.get(
  "/containers",
  isAuthenticated,
  isCompany,
  getCompanyListedContainers
);

companyRoutes.post(
  "/containers",
  isAuthenticated,
  isCompany,
  companyListContainer
);

companyRoutes.get("/bookings", isAuthenticated, isCompany, getCompanyBookings);

export default companyRoutes;
