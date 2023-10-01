import { Router } from "express";
import { isAuthenticated } from "../middlewares/checkAuth";
import { logout } from "../controllers/auth";

const authRoutes = Router();

authRoutes.post("/auth/logout", isAuthenticated, logout);

export default authRoutes;
