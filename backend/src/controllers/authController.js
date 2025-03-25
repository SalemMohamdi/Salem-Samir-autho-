import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma , config} from '../config/index.js';
import {sendPasswordResetEmail} from '../config/email.js';
import { StatusCodes } from 'http-status-codes';
import { validationResult } from 'express-validator';
import { fileTypeFromBuffer } from 'file-type';
import ms from 'ms'; 
import crypto from 'crypto';

const EXPERT_ROLES = ['architecte', 'archeologue', 'historien'];
const EXPERT_REQUIRED_FIELDS = ['affiliation', 'certificate', 'niv_expertise'];
// Allowed roles include admin, user and the expert roles
const ALLOWED_ROLES = ['admin', 'user', ...EXPERT_ROLES];

export const register = async (req, res) => {
  // Validate incoming request using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }

  // Destructure fields from the request body
  const {
    role,
    password,
    name,
    surname,
    username,
    email,
    numero,
    affiliation,
    certificate,
    niv_expertise
  } = req.body;

  // Check that the provided role is valid
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: `Invalid role provided. Allowed roles are: ${ALLOWED_ROLES.join(', ')}`
    });
  }

  // Basic input sanitization: trim string inputs and normalize email
  const sanitizedEmail = email.toLowerCase().trim();
  const sanitizedUsername = username.trim();
  const sanitizedName = name.trim();
  const sanitizedSurname = surname.trim();
  const sanitizedNumero = numero ? numero.trim() : null;

  // Prepare the base user data object
  let userData = {
    name: sanitizedName,
    surname: sanitizedSurname,
    username: sanitizedUsername,
    email: sanitizedEmail,
    numero: sanitizedNumero,
    role, // already validated against ALLOWED_ROLES
    chercheure: false // default value, adjust if needed
  };

  // If the user is registering as an expert, check for required fields
  if (EXPERT_ROLES.includes(role)) {
    const missingFields = EXPERT_REQUIRED_FIELDS.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: `Missing required fields for expert: ${missingFields.join(', ')}`
    });
  }

  // Convert base64 to buffer
  const pdfBuffer = Buffer.from(certificate, 'base64');

  // Verify PDF magic numbers
  const header = pdfBuffer.subarray(0, 4).toString('hex');
  if (header !== '25504446') { // %PDF in hex
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Invalid PDF file'
    });
  }

  // Check file size (5MB example)
  if (pdfBuffer.length > 5 * 1024 * 1024) {
    return res.status(StatusCodes.PAYLOAD_TOO_LARGE).json({
      error: 'PDF must be smaller than 5MB'
    });
  }

  // Verify MIME type using file-type
  const type = await fileTypeFromBuffer(pdfBuffer);
  if (type?.mime !== 'application/pdf') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Invalid file type'
    });
  }

  userData = {
    ...userData,
    affiliation: affiliation.trim(),
    certificate: pdfBuffer, // Store validated buffer
    niv_expertise: niv_expertise.trim(),
    is_validated: false
  };
  } else if (role === 'user'){
    // For admin and normal users, ignore expert-specific fields and set as validated
    userData.is_validated = false;
  }else{
    userData.is_validated = true;
  }

  try {
    // Check if email or username already exists
    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: sanitizedEmail } }),
      prisma.user.findUnique({ where: { username: sanitizedUsername } })
    ]);

    if (existingEmail) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Email is already registered"
      });
    }
    if (existingUsername) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Username is already taken"
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new user record in the database
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });

    // Generate authentication tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    // Set auth cookies on the response
    setAuthCookies(res, accessToken, refreshToken);

    res.status(StatusCodes.CREATED).json({
      ...sanitizeUser(user),
      accessToken
    });
  } catch (error) {
    // Handle unique constraint violations from Prisma
    if (
      error instanceof prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = error.meta?.target;
      if (Array.isArray(target)) {
        if (target.includes('email')) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            error: "Email is already registered"
          });
        }
        if (target.includes('username')) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            error: "Username is already taken"
          });
        }
      }
    }
    // General error handler for other types of errors
    handleAuthError(error, res);
  }
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
    maxAge: ms(config.ACCESS_TOKEN_EXPIRY)// 15m
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: 'lax', // Allows cross-tab sharing
    maxAge: ms(config.REFRESH_TOKEN_EXPIRY)// 7d
  });
};

const sanitizeUser = (user) => {
  const { password, refreshTokens,certificate, ...sanitized } = user;
  return sanitized;
};

const handleAuthError = (error, res) => {
  if (error.code === 'P2002') {
    return res.status(StatusCodes.CONFLICT).json({
      error: 'User already exists with this email or username'
    });
  }
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: 'Registration failed'
  });
};
// Enhanced login controller
export const login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { 
          id: true,
          name: true,
          surname: true,
          username: true,
          password: true, 
          role: true,
          email : true, 
          is_validated: true,
          profile_picture: true,
          profile_mime: true
      }});
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Invalid credentials'
        });
      }
  
      // Generate new tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = await generateRefreshToken(user.id);
      setAuthCookies(res, accessToken, refreshToken);
  
      // Convert binary data to base64 URLs if profile picture exists
      const profileImage = user.profile_picture && user.profile_mime
        ? `data:${user.profile_mime};base64,${Buffer.from(user.profile_picture).toString('base64')}`
        : null;
        
      // Remove binary data from the response
      const { profile_picture, profile_mime, ...userWithoutBinary } = user;
  
      res.status(StatusCodes.OK).json({
        user: {
          ...sanitizeUser(userWithoutBinary),
          profile_image: profileImage
        },
        accessToken
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Login failed'
      });
    }
  };
  
  export const refreshToken = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
  
    if (!refreshToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Refresh token required please log in'
      });
    }
    
    try {
      // Verify and rotate tokens
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
      
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { User: true }
      });
      
      if (!storedToken || storedToken.user_id !== decoded.userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Invalid refresh token'
        });
      }
      
      // Delete old refresh token
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      
      // Generate new tokens
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
     
      const newAccessToken = generateAccessToken(user);
      
      const newRefreshToken = await generateRefreshToken(user.id);
  
      setAuthCookies(res, newAccessToken, newRefreshToken);
  
      res.status(StatusCodes.OK).json({ user ,accessToken: newAccessToken });
    } catch (error) {
      res.status(StatusCodes.FORBIDDEN).json({
        error: 'Invalid refresh token'
      });
    }
  };
  
  export const logout = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
  
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }
  
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
  };
  export const testauth = async (req, res) => {
    // Ensure the middleware has set req.user
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized: No user data found'
      });
    }

    try {
      // Get fresh user data from the database
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          role: true,
          is_validated : true 
        }
      });

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent caching of sensitive data
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(StatusCodes.OK).json({
        success: true,
        user,
        message: 'Access granted'
      });

    } catch (error) {
      // Log error details on the server (do not expose sensitive details to client)
      console.error('Error in testauth:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authentication check failed'
        // Optionally, include error details in development only
        // error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  // Generate secure reset token
  const generateResetToken = async (userId) => {
    // Generate JWT with short expiration
    const token = jwt.sign(
      { sub: userId },
      process.env.JWT_RESET_SECRET,
      { expiresIn: '1h' }
    );
  
    // Store hashed token in DB
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  
    await prisma.passwordResetToken.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 3600 * 1000), // 1 hour
      },
    });
  
    return token;
  };
  
  // Request password reset
  export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
  
    try {
      // Always return same response to prevent email enumeration
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(StatusCodes.OK).json({
          message: 'If an account exists with this email, a reset link will be sent.',
        });
      }
  
      // Delete any existing reset tokens
      await prisma.passwordResetToken.deleteMany({
        where: { user_id: user.id },
      });
  
      // Generate and send token
      const resetToken = await generateResetToken(user.id);
      await sendPasswordResetEmail(user.email, resetToken);
  
      return res.status(StatusCodes.OK).json({
        message: 'Password reset email sent if account exists',
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Could not process password reset request',
      });
    }
  };

  export const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { userId } = req;
  
    try {
      // Atomic transaction
      await prisma.$transaction([
        // Update password
        prisma.user.update({
          where: { id: userId },
          data: { password: await bcrypt.hash(password, 12) },
        }),
  
        // Delete reset tokens
        prisma.passwordResetToken.deleteMany({
          where: { user_id: userId },
        }),
  
        // Invalidate all sessions
        prisma.refreshToken.deleteMany({
          where: { user_id: userId },
        }),
      ]);
  
      return res.status(StatusCodes.OK).json({
        message: 'Password reset successfully. Please login with your new credentials.',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to reset password',
      });
    }
  };