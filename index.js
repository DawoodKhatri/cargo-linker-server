import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/database";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Listening on port ${PORT}`);
});
