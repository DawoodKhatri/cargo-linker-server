import mongoose from "mongoose";

const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, { dbName: "Development" })
    .then(({ connection: { host } }) =>
      console.log(`Database Connected: ${host}`)
    )
    .catch((error) => console.log(error));
};

export default connectDB;
