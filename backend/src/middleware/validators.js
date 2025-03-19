// middleware/validators.js
import { body } from 'express-validator';

export const validatePasswordResetRequest = [
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
];

export const validatePasswordReset = [
  body('token')
    .trim()
    .isJWT().withMessage('Invalid token format'),
  body('password')
    .isLength({ min: 8 }).withMessage('Minimum 8 characters required')
    .matches(/[A-Z]/).withMessage('At least one uppercase letter')
    .matches(/[a-z]/).withMessage('At least one lowercase letter')
    .matches(/[0-9]/).withMessage('At least one number'),
];