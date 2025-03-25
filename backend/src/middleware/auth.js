import jwt from 'jsonwebtoken';
import { prisma , config} from '../config/index.js';
import { StatusCodes } from 'http-status-codes';
import ms from 'ms';
import crypto from 'crypto';

// Enhanced authentication middleware with token refresh
export const authenticateUser = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  const refreshToken = req.cookies?.refreshToken;

  try {
    if (!accessToken) throw new Error('No access token');

    // Verify access token
    const decoded = jwt.verify(accessToken, config.JWT_ACCESS_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true,  role: true, is_validated: true }
    });

    if (!user) throw new Error('Invalid user');
    
    req.user = user;
    setAuthCookies(res, accessToken, refreshToken);
    return next();
  } catch (error) {
    // Handle expired or invalid access token
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError || !accessToken) {
      return handleTokenRefresh(req, res, next, refreshToken);
    }
    
    // Clear invalid tokens
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(StatusCodes.UNAUTHORIZED).json({ 
      error: 'Authentication required' 
    });
  }
};

// Token refresh handler
const handleTokenRefresh = async (req, res, next, refreshToken) => {
  try {
    if (!refreshToken) throw new Error('No refresh token');

    // Verify refresh token
    const decodedRefresh = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    
    // Database validation
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { User: true }
    });

    if (!storedToken || storedToken.user_id !== decodedRefresh.userId) {
      throw new Error('Invalid refresh token');
    }

    // Generate tokens
    const newAccessToken = generateAccessToken(storedToken.User);
    const newRefreshToken = await generateRefreshToken(storedToken.User.id);
    // Token rotation

    // Update tokens in database - use deleteMany instead of delete to avoid errors when token doesn't exist
    try {
      await prisma.$transaction([
        prisma.refreshToken.delete({ where: { token: refreshToken } })
      ]);
    } catch (txError) {
      console.warn('Error during token rotation transaction:', txError.message);
    }

    // Set new tokens
    setAuthCookies(res, newAccessToken, newRefreshToken);
    
    // Attach user to request
    req.user = storedToken.User;
    
    // Continue with request
    return next();
  } catch (refreshError) {
    // Cleanup invalid tokens
    if (refreshToken) {
        try {
            await prisma.refreshToken.delete({ where: { token: refreshToken } });
        } catch (prismaError) {
            if (prismaError.code === 'P2025') {
                console.warn('Attempted to delete a non-existent refresh token.');
            } else {
                console.error('Unexpected error while deleting refresh token:', prismaError);
            }
        }
    }
    
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Session expired. Please login again.'
    });
  }
};
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: `Role ${req.user.role} is not allowed to access this resource`
    });
  }
  next();
};

export const checkExpertValidation = (req, res, next) => {
  const expertRoles = ['architecte', 'archeologue', 'historien'];
  if (expertRoles.includes(req.user.role) && !req.user.is_validated) {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: 'Expert account requires admin validation'
    });
  }
  next();
};
export const checkValidation = (req, res, next) => {
  if (!req.user.is_validated) {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: 'account requires admin validation'
    });
  }
  next();
};
// Helper functions
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role, is_validated: user.is_validated },
    config.JWT_ACCESS_SECRET,
    { expiresIn: config.ACCESS_TOKEN_EXPIRY }
  );
};

const generateRefreshToken = async (userId) => {
    try {
      const token = jwt.sign(
        { userId },
        config.JWT_REFRESH_SECRET,
        { expiresIn: config.REFRESH_TOKEN_EXPIRY }
      );
  
      const expiresInMs = ms(config.REFRESH_TOKEN_EXPIRY);
      const expiresAt = new Date(Date.now() + expiresInMs);
  
      await prisma.refreshToken.create({
        data: {
          token,
          user_id: userId,
          expires_at: expiresAt,
        },
      });
  
      return token;
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw error; // Or handle as needed
    }
  };
  const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      sameSite: 'Strict',
      maxAge: ms(config.ACCESS_TOKEN_EXPIRY) // 15m
    });
    
  
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      sameSite: 'lax', // Allows cross-tab sharing
      maxAge: ms(config.REFRESH_TOKEN_EXPIRY) // 7d
    });
  };

  // Validate reset token middleware
export const validateResetToken = async (req, res, next) => {
  const  token  = req.body.token;
  console.log(token);
  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    console.log(decoded);
    // Get hashed token
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
      console.log(tokenHash);
    // Check database
    const validToken = await prisma.passwordResetToken.findFirst({
      where: {
        token_hash: tokenHash,
        user_id: decoded.sub,
      },
    });

    if (!validToken) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid or expired reset token',
      });
    }

    req.userId = decoded.sub;
    next();
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Invalid reset token',
    });
  }
};
