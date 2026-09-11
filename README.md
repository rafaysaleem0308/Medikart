# MediKart

MediKart is a full-stack pharmacy and healthcare e-commerce platform. It combines a React frontend with an Express + MongoDB backend and includes real-time chat using Socket.IO.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Guide](#setup-guide)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)

## Features

### Customer Features
- User signup, login, and profile management
- Browse products and filter by categories
- Shopping cart and checkout flow
- Order placement and tracking support
- Product and service review submission
- Voucher support for discounted purchases
- Contact and informational pages
- Real-time private chat with online status and message history

### Admin Features
- Admin dashboard and analytics view
- Product management
- User management
- Voucher management
- Admin-side chat visibility and communication tools

### Platform Capabilities
- JWT-based authentication and protected routes
- REST API for auth, products, orders, reviews, vouchers, contact, chat, and content data
- MongoDB-backed persistence using Mongoose models

## Tech Stack
- **Frontend:** React, React Router, Bootstrap, React Toastify
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Realtime:** Socket.IO
- **Authentication:** JWT

## Project Structure

```text
Medikart/
├── BackEnd/            # API routes, models, socket logic, server entry
├── public/             # Static frontend assets
├── src/                # React application source code
├── package.json        # Project dependencies and frontend scripts
└── README.md
```

## Setup Guide

### 1) Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB instance (local or cloud)

### 2) Clone and install
```bash
git clone <repository-url>
cd Medikart
npm install
```

### 3) Configure environment variables
Create this file:

`BackEnd/.env`

Add:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/pharmacy
JWT_SECRET=your_strong_jwt_secret
PORT=5000
```

### 4) Run the app
Run both processes from the project root in separate terminals:

1. **Frontend**
   ```bash
   npm start
   ```
   Frontend URL: `http://localhost:3000`

2. **Backend**
   ```bash
   node BackEnd/server.js
   ```
   Backend URL: `http://localhost:5000`

## Available Scripts
Run from the project root:

- `npm start` - Starts React development server
- `npm test` - Runs tests in watch mode
- `npm run build` - Builds production frontend bundle

## API Overview
Base backend URL: `http://localhost:5000`

Main route groups:
- `/api/auth` - Authentication
- `/api/products` - Product operations
- `/api/orders` - Order operations
- `/api/reviews` - Review operations
- `/api/contact` - Contact form operations
- `/api/about` - About page content operations
- `/api/chat` - Chat operations
- `/api/vouchers` - Voucher operations
- `/api` - User management operations
