import { Router } from "express";
import {
  traderGetVerificationMail,
  traderLogin,
  traderSignup,
} from "../controllers/trader.js";

const traderRoutes = Router();

traderRoutes.post("/auth/verification", traderGetVerificationMail);
traderRoutes.post("/auth/signup", traderSignup);
traderRoutes.post("/auth/login", traderLogin);

export default traderRoutes;
