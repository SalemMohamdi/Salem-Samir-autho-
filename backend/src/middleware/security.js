import helmet from 'helmet';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

// Define a more comprehensive CSP configuration
const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"], // Removed unsafe-inline for better security
    styleSrc: ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline if possible
    imgSrc: ["'self'", "data:", "blob:"],
    connectSrc: ["'self'", process.env.CLIENT_URL || "http://localhost:3001"], // Allow API connections
    fontSrc: ["'self'", "data:"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: []
  }
};

// Set up rate limiter
const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW * 60 * 1000,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later'
});

// Export the combined security middleware
export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: cspOptions,
    crossOriginEmbedderPolicy: false, // May need to disable this if using certain iframes or resources
    crossOriginResourcePolicy: { policy: "cross-origin" } // Adjust based on your needs
  }),
  apiLimiter,
  // Add CORS protection (though you appear to handle this elsewhere)
  (req, res, next) => {
    // Add some custom security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  }
];

// Export a stricter rate limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: 'Too many authentication attempts, please try again later'
});