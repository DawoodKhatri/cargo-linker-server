import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import companyRoutes from "./routes/company.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "*" }));
app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);

export default app;
