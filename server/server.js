import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { initializeScheduler, triggerScheduler } from './utils/scheduler.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import vendorRoutes from './routes/vendors.js';
import adminRoutes from './routes/admin.js';

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:3000',
      'https://localhost:3000'
    ].filter(Boolean); 
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Scheduler health check endpoint
app.get('/health/scheduler', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Scheduler health check',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    scheduler: 'active'
  });
});

// Manual trigger endpoint for testing scheduler (only in development)
if (process.env.NODE_ENV === 'development') {
  app.post('/api/test/scheduler', async (req, res) => {
    try {
      await triggerScheduler();
      res.status(200).json({
        status: 'success',
        message: 'Scheduler triggered manually',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Manual scheduler trigger failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to trigger scheduler',
        error: error.message
      });
    }
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce API is running...',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  
  // Initialize scheduler after server is ready
  initializeScheduler().catch(error => {
    console.error('Failed to initialize scheduler:', error);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app; 