import helmet from 'helmet';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
// Add to securityMiddleware
helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  });
export const securityMiddleware = [
  helmet(),
  rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW * 60 * 1000,
    max: config.RATE_LIMIT_MAX,
    message: 'Too many requests from this IP, please try again later'
  })
];