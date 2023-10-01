import express from "express";
import cookieParser from "cookie-parser";
import companyRoutes from "./routes/company";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'))

app.use("/api", companyRoutes);

export default app;