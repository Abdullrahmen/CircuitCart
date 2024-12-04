/*
Packages:
- express (for server)
- mongoose (for MongoDB)
- dotenv (for environment variables)
- body-parser (for parsing request body)
- cors (for cross-origin requests)
- nodemon (for auto-restart server)
- bcryptjs (for password hashing)
- jsonwebtoken (for authentication)
- multer (for file upload)
- Jest (for testing)
*/
import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";

dotenv.config();
const app = express();

/* connect to MongoDB */
const DB_NAME = "CircuitCart_dev";
let URI: string = process.env.MONGO_URI || "";
URI = `${URI.split("/").slice(0, 3).join("/")}/${DB_NAME}${URI.split("/")[3]}`;
mongoose
  .connect(URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });
app.use(express.json());
app.use(cors());

/*productsRouter = require("./routers/products.route");*/
/*app.use("/api/products", productsRouter);*/
app.get("/", (req, res) => {
  res.json({ message: "Server is ready" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
