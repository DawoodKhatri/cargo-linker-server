import { Router } from "express";
import {
  getContainerDetails,
  searchContainers,
  traderGetVerificationMail,
  traderLogin,
  traderSignup,
  startBooking,
  completeBooking,
  getTraderBookings,
} from "../controllers/trader.js";
import {
  isAuthenticated,
  isRazorpayAuthenticated,
  isTrader,
} from "../middlewares/checkAuth.js";

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
traderRoutes.post(
  "/container/:containerId/startBooking",
  isAuthenticated,
  isTrader,
  startBooking
);
traderRoutes.post("/completeBooking", isRazorpayAuthenticated, completeBooking);
traderRoutes.get("/bookings", isAuthenticated, isTrader, getTraderBookings);

export default traderRoutes;
