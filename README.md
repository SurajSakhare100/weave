# Weave - Multi-Vendor Ecommerce Platform

A modern, scalable multi-vendor ecommerce platform built with Next.js, Express.js, and MongoDB.

## 🚀 Features

- **Multi-vendor marketplace** with vendor management
- **User authentication** and role-based access control
- **Product management** with categories and variants
- **Shopping cart** and checkout system
- **Order management** with tracking
- **Review and rating** system
- **Payment integration** (Razorpay)
- **PWA support** for mobile experience
- **Responsive design** with Tailwind CSS

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **React 19** with Redux Toolkit
- **Tailwind CSS** for styling
- **Radix UI** components
- **PWA** support with next-pwa

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** authentication
- **Cloudinary** for image storage
- **Razorpay** for payments
- **ShipRocket** for shipping

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB
- npm or yarn

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Backend Setup
```bash
cd server
npm install
npm run dev
```

## 🔧 Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/weave

# JWT
JWT_SECRET=your_jwt_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# ShipRocket
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASS=your_shiprocket_password

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set the root directory to `client`
3. Set environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```
4. Deploy automatically on push to main branch

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set the root directory to `server`
3. Set environment variables in Render dashboard:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=https://your-frontend.vercel.app
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_SECRET=your_razorpay_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   SHIPROCKET_EMAIL=your_shiprocket_email
   SHIPROCKET_PASS=your_shiprocket_password
   ```
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Deploy automatically on push to main branch

## 📁 Project Structure

```
weave/
├── client/                 # Next.js frontend (deployed on Vercel)
│   ├── components/         # React components
│   ├── pages/             # Next.js pages
│   ├── services/          # API services
│   ├── store/             # Redux store
│   └── types/             # TypeScript types
├── server/                # Express.js backend (deployed on Render)
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── utils/            # Utility functions
└── README.md
```

## 🔒 Security Features

- JWT authentication
- Role-based access control
- Input validation
- Rate limiting
- CORS protection
- XSS protection
- MongoDB injection protection

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/vendor/register` - Vendor registration
- `POST /api/auth/vendor/login` - Vendor login

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (vendor only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status

## 🚀 Quick Deployment Steps

### 1. Frontend (Vercel)
```bash
# In Vercel dashboard:
# 1. Import your GitHub repository
# 2. Set Root Directory: client
# 3. Set Environment Variables:
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
# 4. Deploy
```

### 2. Backend (Render)
```bash
# In Render dashboard:
# 1. Create new Web Service
# 2. Connect your GitHub repository
# 3. Set Root Directory: server
# 4. Set Environment Variables (see above)
# 5. Set Build Command: npm install
# 6. Set Start Command: npm start
# 7. Deploy
```

### 3. Database (MongoDB Atlas)
```bash
# 1. Create MongoDB Atlas cluster
# 2. Get connection string
# 3. Add to Render environment variables
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@weave.com or create an issue in the repository.
