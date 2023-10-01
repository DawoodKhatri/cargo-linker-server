import { Router } from "express";
import {
  companyGetVerificationMail,
  companyLogin,
  companySignup,
} from "../controllers/company";

const companyRoutes = Router();

companyRoutes.post("/company/auth/verification", companyGetVerificationMail);
companyRoutes.post("/company/auth/signup", companySignup);
companyRoutes.post("/company/auth/login", companyLogin);

export default companyRoutes;
