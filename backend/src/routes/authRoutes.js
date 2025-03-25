import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refreshToken,
  logout,
  testauth,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController.js';
import {
  validatePasswordResetRequest,
  validatePasswordReset,
} from '../middleware/validators.js';
import { authenticateUser,validateResetToken } from '../middleware/auth.js';
import corsMiddleware from '../middleware/cors.js';
import { StatusCodes } from 'http-status-codes';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();
router.use(corsMiddleware);

router.post('/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 12 })
      .withMessage('Password must be at least 12 characters')
      .matches(/[0-9]/)
      .withMessage('Password must contain a number')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter'),
    body('role').isIn(['user', 'architecte', 'archeologue', 'historien'])
  ],
  register
);

router.post('/refresh-token',
  refreshToken
);
router.post('/login',
  authLimiter,
  login
);
router.post('/logout',
  authenticateUser,
  logout
);

// authRoutes.js
router.get('/testauth',
  authenticateUser, // Your JWT validation middleware
  testauth
);
router.post(
  '/password-reset/request',
  authLimiter, // Adding rate limiting to password reset requests
  validatePasswordResetRequest,
  requestPasswordReset
);

router.post(
  '/password-reset/confirm',
  authLimiter, // Adding rate limiting to password reset confirmations
  validatePasswordReset,
  validateResetToken,
  resetPassword
);


export default router;