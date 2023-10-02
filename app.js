import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth";
import companyRoutes from "./routes/company";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "*" }));
app.use(express.static("public"));

app.use("/api", authRoutes);
app.use("/api", companyRoutes);

export default app;
