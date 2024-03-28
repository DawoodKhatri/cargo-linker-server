import { Router } from "express";
import {
  getContainerDetails,
  searchContainers,
  traderGetVerificationMail,
  traderLogin,
  traderSignup,
} from "../controllers/trader.js";
import { isAuthenticated, isTrader } from "../middlewares/checkAuth.js";

const traderRoutes = Router();

traderRoutes.post("/auth/verification", traderGetVerificationMail);
traderRoutes.post("/auth/signup", traderSignup);
traderRoutes.post("/auth/login", traderLogin);
traderRoutes.get(
  "/searchContainers",
  isAuthenticated,
  isTrader,
  searchContainers
);
traderRoutes.get(
  "/container/:containerId",
  isAuthenticated,
  isTrader,
  getContainerDetails
);

export default traderRoutes;
