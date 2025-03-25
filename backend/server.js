import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from './src/config/index.js';
import { securityMiddleware } from './src/middleware/security.js';
import authRouter from './src/routes/authRoutes.js';
import adminRouter from './src/routes/adminRoutes.js';
import userRouter from './src/routes/userRoutes.js';
import { prisma } from './src/config/index.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import cors from 'cors';

const app = express();
 
// =======================
// Middleware Stack
// =======================
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Apply CORS before security middleware to avoid conflicts
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply security middleware
app.use(...securityMiddleware);

// =======================
// Routes
// =======================
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/user', userRouter);

// =======================
// Health Check Endpoint
// =======================
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// =======================
// Error Handling
// =======================
app.use(notFoundHandler);
app.use(errorHandler);

// =======================
// Database Connection & Server Startup
// =======================
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connection established');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Docs: http://localhost:${PORT}/api/v1/docs`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

// =======================
// Graceful Shutdown
// =======================
const shutdown = async () => {
  console.log('\nShutting down server...');
  
  try {
    await prisma.$disconnect();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// =======================
// Start Application
// =======================
startServer();