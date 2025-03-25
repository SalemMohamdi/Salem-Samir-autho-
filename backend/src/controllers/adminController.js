import { prisma } from '../config/index.js';
import { StatusCodes } from 'http-status-codes';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import bcrypt from 'bcryptjs';



const sanitizeUser = (user) => {
  const { password, refreshTokens,certificate, ...sanitized } = user;
  return sanitized;
};



export const getPendingUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['architecte', 'archeologue', 'historien', 'user'] },
        is_validated: false
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        affiliation: true,
        certificate: true,
        niv_expertise: true
      }
    });

    res.status(StatusCodes.OK).json({ users });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch pending users'
    });
  }
};

export const validateUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Use a variable to track if we've handled the response inside the transaction
    let responseHandled = false;
    
    await prisma.$transaction(async (tx) => {
      // First get the user with current status
      const user = await tx.user.findUnique({
        where: { id: Number(id) },
        select: { is_validated: true, role: true }
      });

      if (!user) {
        responseHandled = true;
        res.status(StatusCodes.NOT_FOUND).json({
          error: 'User not found'
        });
        return; // Return early from transaction callback
      }

      if (user.role === 'admin') {
        responseHandled = true;
        res.status(StatusCodes.FORBIDDEN).json({
          error: 'Cannot validate admin users'
        });
        return; // Return early from transaction callback
      }

      if (user.is_validated) {
        responseHandled = true;
        res.status(StatusCodes.CONFLICT).json({
          error: 'User is already validated'
        });
        return; // Return early from transaction callback
      }

      // Proceed with validation
      const updatedUser = await tx.user.update({
        where: { id: Number(id) },
        data: { is_validated: true },
        select: { id: true, email: true }
      });

      await tx.notification.create({
        data: {
          type: 'ACCOUNT_VALIDATION',
          user_id: updatedUser.id,
          message: 'Your account has been approved by administrators'
        }
      });
    });

    // Only send a success response if we haven't already sent a response
    if (!responseHandled) {
      res.status(StatusCodes.OK).json({ message: 'User validated successfully' });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'User validation failed: ' + error.message
    });
  }
};

export const getUserDetails = async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
        select: {
          id: true,
          name: true,
          surname: true,
          username: true,
          email: true,
          numero: true,
          role: true,
          affiliation: true,
          profile_picture: true,
          profile_mime: true,
          certificate: true, // Include certificate
          niv_expertise: true,
          is_validated: true,
          chercheure: true,
        }
      });
  
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'user not found'
        });
      }
      
      // Convert binary data to base64 URLs
      const profileImage = user.profile_picture && user.profile_mime
        ? `data:${user.profile_mime};base64,${Buffer.from(user.profile_picture).toString('base64')}`
        : null;

      // Handle PDF certificate
      const certificate = user.certificate
        ? `data:application/pdf;base64,${Buffer.from(user.certificate).toString('base64')}`
        : null;
        
      // Remove the binary data from the response
      const { profile_picture, profile_mime, ...userWithoutBinary } = user;
  
      res.status(StatusCodes.OK).json({ 
        user: {
          ...userWithoutBinary,
          profile_image: profileImage,
          certificate
        } 
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch user details'
      });
    }
  };
  export const revokeValidationStatus = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Use a variable to track if we've handled the response inside the transaction
      let responseHandled = false;
      
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: Number(id) },
          select: { is_validated: true, role: true }
        });
  
        if (!user) {
          responseHandled = true;
          res.status(StatusCodes.NOT_FOUND).json({
            error: 'User not found'
          });
          return; // Return early from transaction callback
        }
  
        if (user.role === 'admin') {
          responseHandled = true;
          res.status(StatusCodes.FORBIDDEN).json({
            error: 'Cannot revoke admin users'
          });
          return; // Return early from transaction callback
        }
  
        if (!user.is_validated) {
          responseHandled = true;
          res.status(StatusCodes.CONFLICT).json({
            error: 'User is not currently validated'
          });
          return; // Return early from transaction callback
        }
  
        // Proceed with revocation
        await tx.user.update({
          where: { id: Number(id) },
          data: { is_validated: false }
        });
  
        await tx.notification.create({
          data: {
            type: 'ACCOUNT_REVOKED',
            user_id: Number(id),  // Fixed from userId to user_id
            message: 'Your account status has been revoked by administrators'
          }
        });
  
        await tx.refreshToken.deleteMany({
          where: { user_id: Number(id) }
        });
      });
  
      // Only send a success response if we haven't already sent a response
      if (!responseHandled) {
        res.status(StatusCodes.OK).json({
          message: 'User status revoked successfully'
        });
      }
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to revoke user status: ' + error.message
      });
    }
  };

  export const createAdmin = async (req, res) => {
    // Validate incoming request
    //const errors = validationResult(req);
    //if (!errors.isEmpty()) {
    //  return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    //}
  
    // Destructure and sanitize user input
    const {
      password,
      name,
      surname,
      username,
      email,
      numero
    } = req.body;
  
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedUsername = username.trim();
    const sanitizedName = name.trim();
    const sanitizedSurname = surname.trim();
    const sanitizedNumero = numero ? numero.trim() : null;
  
    // Prepare admin user data
    const adminData = {
      name: sanitizedName,
      surname: sanitizedSurname,
      username: sanitizedUsername,
      email: sanitizedEmail,
      numero: sanitizedNumero,
      role: 'admin',
      chercheure: false,
      is_validated: true  // Admins created by existing admins are auto-validated
    };
  
    try {
      // Check for existing credentials
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
  
      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 12);
      const adminUser = await prisma.user.create({
        data: {
          ...adminData,
          password: hashedPassword
        }
      });
  
      // Return created admin without sensitive data
      res.status(StatusCodes.CREATED).json(sanitizeUser(adminUser));
  
    } catch (error) {
      // Handle duplicate entries
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target;
        if (Array.isArray(target)) {
          if (target.includes('email')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Email is already registered" });
          }
          if (target.includes('username')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Username is already taken" });
          }
        }
      }
      // Handle other errors
      console.error("Admin creation error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Admin creation failed: ' + (error.message || 'Unknown error')
      });
    }
  };