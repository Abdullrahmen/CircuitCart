# CircuitCart API
**CircuitCart** is a scalable and extensible **MERN**-based multi-user e-commerce platform. This repository contains the backend API that powers the platform, handling user authentication, product management, order cycle, and more.
* **An overveiw and presentation video for the backend part is [here](https://www.youtube.com/watch?v=T15pZMhyl1k)**
* The API full documentation is in [postman](https://documenter.getpostman.com/view/39748539/2sAYJ6Cezo)

## Features
- Built using the **MERN stack** (MongoDB, Express, React, Node.js)
- **Strict TypeScript** for enhanced type safety
- **JWT authentication** for secure user login and registration
- Supports multiple user roles: **Buyer**, **Seller**, **Manager**
- Scalable and easy to extend as new features or user types are added
- Full **order cycle** management, from product selection to final delivery

## Installation
### Prerequisites
- Node.js 
- MongoDB (local or cloud-based, like MongoDB Atlas)
- Postman for testing API endpoints

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/abdullrahmen/circuitcart.git
   cd circuitcart/backend
   ```
2. Install Dependencies
   To install the required dependencies, run the following command in your project directory:
   ```bash
   npm install
   ```
   This will install all the required packages listed in package.json. Ensure that you have Node.js and npm installed on your machine before proceeding.

3. Set up environment variables:
   Create a .env file in the root directory and add the following environment variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongo_database_uri
   JWT_SECRET=your_jwt_secret
   TOKEN_EXPIRES_IN=30s
   TOKEN_HEADER_KEY=jwt_token
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
The application will now be running on your localhost:5000.

## Database Design:
![Databases2](https://github.com/user-attachments/assets/7489e507-3e52-4a1a-8cf9-8e87018361fb)

## Project Directory Structure
The project follows a clean and modular structure for scalability:
```
  circuitcart/backend/
  ├── controllers/        # Logic for handling requests
  ├── models/             # MongoDB models for users, products, orders
  ├── middlewares/        # Custom middleware for validation, authentication, etc.
  ├── routes/             # Routes defining the API endpoints
  ├── utils/              # Helper utilities and functions
  ├── .env                # Environment variables (secrets, salts, JWT secret)
  ├── server.ts           # Entry point for the application
  └── package.json        # Project dependencies and scripts
```

## Contributing
Feel free to fork the repository and submit pull requests. Contributions are welcome to improve the platform and add more features.

## License
See [LICENSE](LICENSE) file.

### Stay tuned for the frontend!
