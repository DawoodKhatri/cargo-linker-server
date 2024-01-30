import { Router } from "express";
import { adminLogin } from "../controllers/admin.js";

const adminRoutes = Router();

adminRoutes.post("/login", adminLogin);

export default adminRoutes;
