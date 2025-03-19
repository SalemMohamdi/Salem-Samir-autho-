import express from 'express';
import cookieParser from 'cookie-parser';
import { securityMiddleware } from './middleware/security.js';
import authRouter from './routes/authRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import { prisma } from './config/index.js';

const app = express();

// Middleware
app.use(cookieParser());
app.use(...securityMiddleware);

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Prisma connection
const startServer = async () => {
  try {
    await prisma.$connect();
    app.listen(3000, () => {
      console.log('Server running on port 3000');
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

startServer();