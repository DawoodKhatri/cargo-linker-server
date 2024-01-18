import { Router } from "express";
import {
  companyGetVerificationMail,
  companyLogin,
  companySignup,
  submitCompanyVerificationDetails,
} from "../controllers/company.js";
import multer from "../middlewares/multer.js";
import { isAuthenticated, isCompany } from "../middlewares/checkAuth.js";

const companyRoutes = Router();

companyRoutes.post("/auth/verification", companyGetVerificationMail);
companyRoutes.post("/auth/signup", companySignup);
companyRoutes.post("/auth/login", companyLogin);
companyRoutes.post(
  "/auth/submitVerificationDetails",
  isAuthenticated,
  isCompany,
  multer.any(),
  submitCompanyVerificationDetails
);

export default companyRoutes;
