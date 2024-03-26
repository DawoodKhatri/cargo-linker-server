import { Router } from "express";
import {
  getContainerDetails,
  getPickupLocations,
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
  "/getPickupLocations",
  isAuthenticated,
  isTrader,
  getPickupLocations
);
traderRoutes.get(
  "/container/:containerId",
  isAuthenticated,
  isTrader,
  getContainerDetails
);

export default traderRoutes;
