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
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express, { NextFunction } from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import AppError from './utils/appError';
import httpStatusText from './utils/httpStatusText';

dotenv.config();
const app = express();

/* connect to MongoDB */
const DB_NAME = 'CircuitCart_dev';
let URI: string = process.env.MONGO_URI || '';
URI = `${URI.split('/').slice(0, 3).join('/')}/${DB_NAME}${URI.split('/')[3]}`;
mongoose
  .connect(URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log(error);
  });
app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
  res.json({ status: 'success', message: 'Welcome to CircuitCart API' });
});

import sellersRouter from './routes/sellers.route';
app.use('/api/users/sellers', sellersRouter);

import buyersRouter from './routes/buyers.route';
app.use('/api/users/buyers', buyersRouter);

import managersRouter from './routes/managers.route';
app.use('/api/users/managers', managersRouter);

import categoriesRouter from './routes/categories.route';
app.use('/api/categories', categoriesRouter);

import productsRouter from './routes/products.route';
app.use('/api/products', productsRouter);

// global middleware for not found router
app.all('*', (_req: Request, res: Response) => {
  res.status(404).json({
    status: httpStatusText.ERROR,
    message: 'Not found',
    data: null,
  });
});

// global error handler
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (error: AppError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(error.statusCode || 500).json({
      status: error.statusText || httpStatusText.ERROR,
      message: error.message,
      code: error.statusCode || 500,
      data: null,
    });
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
