import { Router } from "express";
import { getVerificationMail } from "../controllers/company";

const companyRoutes = Router()

companyRoutes.post("/company/auth/verification", getVerificationMail)

export default companyRoutes