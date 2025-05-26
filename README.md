# Lushkart E-commerce Platform

A full-featured e-commerce platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring a user-friendly frontend, an admin dashboard, and a robust backend API.

## Live Demo

- Frontend (Customer): [https://lushkar.onrender.com]
- Admin Dashboard: [https://lushkar-admin.onrender.com]
- Backend API: [https://lushkart-server.onrender.com]

## Features

### Customer Features

- 🛍️ Browse and search products with filtering options
- 🛒 Shopping cart functionality
- 💖 Wishlist management
- 👤 User authentication and profile management
- 📦 Order tracking and history
- 🏠 Multiple address management
- 💳 Secure checkout process
- 🌙 Dark/Light mode support
- 📱 Responsive design for all devices
- ⭐ Product ratings and reviews

### Admin Features

- 📊 Dashboard with sales analytics
- 📦 Product management (CRUD operations)
- 🗂️ Category management
- 📋 Order management
- 👥 Customer management
- 📈 Sales reports and analytics
- 🏷️ Discount and promotion management

### Technical Features

- ⚡ Built with Vite for optimal performance
- 🎨 Styled with Tailwind CSS
- 🔐 JWT authentication
- 📧 Email notifications
- 🖼️ Cloudinary integration for image management
- 🔄 Redux state management
- 📱 Responsive design with mobile-first approach

## Tech Stack

### Frontend

- React.js with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests
- React-toastify for notifications

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image storage
- Nodemailer for email services
- Express-validator for validation

### Admin Dashboard

- React.js with Vite
- Redux Toolkit
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests
- React Table for data management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/Inayat-hasan/e-commerce-website.git
cd e-commerce-app
```

2. Install dependencies for all services

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install admin dashboard dependencies
cd ../admin
npm install
```

3. Set up environment variables
   Create .env files in backend, frontend, and admin directories with necessary configurations:

Backend (.env):

```
MONGODB_URI=
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=30d
PORT=3000
GMAIL_USER=
GMAIL_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESET_TOKEN_SECRET=
RESET_TOKEN_EXPIRY=1h
TEMP_DIR=./public/temp
CASHFREE_URL=https://sandbox.cashfree.com/pg
CASHFREE_CLIENT_ID=
CASHFREE_CLIENT_SECRET=

```

Frontend (.env):

```
VITE_SERVER_URL=your_backend_url
```

Admin (.env):

```
VITE_SERVER_URL=your_backend_url
```

4. Run the development servers

```bash
# Run backend
cd backend
npm run dev

# Run frontend
cd frontend
npm run dev

# Run admin dashboard
cd admin
npm run dev
```

## Project Structure

```
├── backend/          # Backend API server
│   ├── controllers/  # Request handlers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── utils/        # Helper functions
├── frontend/         # Customer-facing website
│   ├── src/
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   └── redux/        # State management
└── admin/           # Admin dashboard
    ├── src/
    ├── components/   # Admin components
    ├── pages/        # Admin pages
    └── redux/        # Admin state management
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who helped with the project
- Icons provided by Lucide Icons and Font Awesome
- UI components inspired by Tailwind CSS
