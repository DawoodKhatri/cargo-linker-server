import { Router } from "express";
import { isAuthenticated } from "../middlewares/checkAuth.js";
import { getUser, logout } from "../controllers/auth.js";

const authRoutes = Router();

authRoutes.post("/logout", isAuthenticated, logout);
authRoutes.get("/details", isAuthenticated, getUser);

export default authRoutes;
