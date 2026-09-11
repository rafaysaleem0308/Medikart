# MediKart

MediKart is a full-stack pharmacy and healthcare e-commerce platform built with React, Node.js, Express, MongoDB, and Socket.IO. It provides product browsing, cart and checkout flows, authentication, reviews, voucher support, and real-time user chat, along with an admin panel for operational management.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Contributing](#contributing)

## Features

### User Features
- User authentication and profile management
- Browse and filter products by category
- Add to cart and complete checkout flow
- Submit and view product/service reviews
- Contact form and informational pages
- Real-time private chat with Socket.IO
- Voucher support during purchase flow

### Admin Features
- Admin dashboard and analytics page
- Product management tools
- User management tools
- Voucher management interface

## Tech Stack
- **Frontend:** React, React Router, Bootstrap, React Toastify
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Real-time Communication:** Socket.IO
- **Authentication:** JWT

## Project Structure

```text
Medikart/
├── BackEnd/            # Express API, routes, models, socket server
├── public/             # Static React assets
├── src/                # React application source code
├── package.json        # Frontend + backend dependency and script config
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm
- MongoDB (local or cloud URI)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Run the Application
Open two terminals from the project root:

1. **Start frontend (React):**
   ```bash
   npm start
   ```
   Runs on `http://localhost:3000`.

2. **Start backend (Express + Socket.IO):**
   ```bash
   node BackEnd/server.js
   ```
   Runs on `http://localhost:5000` by default.

## Environment Variables
Create a `.env` file inside the `BackEnd` directory with:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/pharmacy
JWT_SECRET=your_strong_jwt_secret
PORT=5000
```

## Available Scripts
From the project root:

- `npm start` - Runs the React development server
- `npm test` - Runs tests in interactive watch mode
- `npm run build` - Builds the app for production

## API Overview
Base backend URL: `http://localhost:5000`

Main route groups:
- `/api/auth` - Authentication
- `/api/products` - Product operations
- `/api/orders` - Order operations
- `/api/reviews` - Review operations
- `/api/contact` - Contact form operations
- `/api/about` - About page content operations
- `/api/chat` - Chat-related endpoints
- `/api/vouchers` - Voucher operations
- `/api` - User management endpoints

## Contributing
Contributions are welcome. Please open an issue to discuss major changes before submitting a pull request.
