import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import companyRoutes from "./routes/company.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://cargo-linker.vercel.app"],
  })
);
app.use(express.static("public"));

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("*", (req, res) => {
  return res.status(404).json({ success: false, message: "Invalid Request" });
});

export default app;
