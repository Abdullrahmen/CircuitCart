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
import mongoose, { mongo } from "mongoose";
import express from "express";
import cors from "cors";

dotenv.config();
const app = express();
const URI = process.env.MONGO_URI;
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

app.get("/", (req, res) => {
  res.send("Server is ready");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
