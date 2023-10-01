import { Router } from "express";
import { isAuthenticated } from "../middlewares/checkAuth";
import { getUser, logout } from "../controllers/auth";

const authRoutes = Router();

authRoutes.post("/auth/logout", isAuthenticated, logout);
authRoutes.get("/auth/details", isAuthenticated, getUser);

export default authRoutes;
