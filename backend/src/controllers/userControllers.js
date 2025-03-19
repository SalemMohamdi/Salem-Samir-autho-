import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma , config} from '../config/index.js';
import { StatusCodes } from 'http-status-codes';
import { fileTypeFromBuffer } from 'file-type';
import { validationResult } from 'express-validator';
import ms from 'ms'; 


const handleAuthError = (error, res) => {
    if (error instanceof prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          const target = error.meta?.target?.[0];
          return res.status(StatusCodes.CONFLICT).json({
            error: `${target} is already in use`
          });
        case 'P2025':
          return res.status(StatusCodes.NOT_FOUND).json({
            error: 'Resource not found'
          });
        default:
          return res.status(StatusCodes.BAD_REQUEST).json({
            error: 'Database operation failed'
          });
      }
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'An unexpected error occurred'
    });
  };

/**
 * Update Profile Endpoint
 *
 * This endpoint allows an authenticated user to update their profile data.
 * It sanitizes input, validates expert-specific fields if the user is an expert,
 * and checks for unique constraints (email and username) if those fields are updated.
 */
export const updateProfilefull = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }

  const { name, surname, username, email, numero, affiliation, certificate, niv_expertise } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });

    let updateData = {};
    const sanitizedEmail = email?.toLowerCase().trim();
    const sanitizedUsername = username?.trim();

    // Common fields
    if (name) updateData.name = name.trim();
    if (surname) updateData.surname = surname.trim();
    if (sanitizedUsername) updateData.username = sanitizedUsername;
    if (sanitizedEmail) updateData.email = sanitizedEmail;
    if (numero) updateData.numero = numero.trim();

    // Expert-specific fields
    if (EXPERT_ROLES.includes(user.role)) {
      if (affiliation) updateData.affiliation = affiliation.trim();
      if (niv_expertise) updateData.niv_expertise = niv_expertise.trim();
      
      if (certificate) {
        const pdfBuffer = Buffer.from(certificate, 'base64');
        
        // Validate PDF
        const header = pdfBuffer.subarray(0, 4).toString('hex');
        if (header !== '25504446') {
          return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid PDF file' });
        }

        if (pdfBuffer.length > 5 * 1024 * 1024) {
          return res.status(StatusCodes.PAYLOAD_TOO_LARGE).json({ error: 'PDF exceeds 5MB limit' });
        }

        const fileType = await fileTypeFromBuffer(pdfBuffer);
        if (fileType?.mime !== 'application/pdf') {
          return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid file type' });
        }

        updateData.certificate = pdfBuffer;
      }
    }else{
      // For normal users or admin, ignore expert-specific fields even if provided.
      updateData.affiliation = undefined;
      updateData.certificate = undefined;
      updateData.niv_expertise = undefined;

    }

    // Check unique constraints
    if (updateData.email && updateData.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: updateData.email } });
      if (existing) return res.status(StatusCodes.CONFLICT).json({ error: 'Email already exists' });
    }

    if (updateData.username && updateData.username !== user.username) {
      const existing = await prisma.user.findUnique({ where: { username: updateData.username } });
      if (existing) return res.status(StatusCodes.CONFLICT).json({ error: 'Username taken' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.status(StatusCodes.OK).json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    handleAuthError(error, res);
  }
};

/* to later ask the teacher if there is another data to be modified 
for instance i made a version modifying only the email and username and phone number */
export const updateProfile = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }

  const { username, email, numero } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });

    const updateData = {};
    const sanitizedEmail = email?.toLowerCase().trim();
    const sanitizedUsername = username?.trim();

    // Validate allowed fields
    if (sanitizedEmail) {
      updateData.email = sanitizedEmail;
      if (sanitizedEmail !== user.email) {
        const existing = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
        if (existing) return res.status(StatusCodes.CONFLICT).json({ error: 'Email exists' });
      }
    }

    if (sanitizedUsername) {
      updateData.username = sanitizedUsername;
      if (sanitizedUsername !== user.username) {
        const existing = await prisma.user.findUnique({ where: { username: sanitizedUsername } });
        if (existing) return res.status(StatusCodes.CONFLICT).json({ error: 'Username taken' });
      }
    }

    if (numero) updateData.numero = numero.trim();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.status(StatusCodes.OK).json({ 
      user: {
        email: updatedUser.email,
        username: updatedUser.username,
        numero: updatedUser.numero
      }
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};


/**
 * Change Password Endpoint
 *
 * This endpoint allows an authenticated user to change their password.
 * The user must provide their current password and a new password.
 * The endpoint verifies that the provided current password matches the one
 * in the database before updating.
 */
export const changePassword = async (req, res) => {
  // Ensure the user is authenticated (assumes middleware already sets req.user)
  const userId = req.user?.id;
  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
  }

  // Validate incoming request using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }

  // Destructure current and new password from the request body
  const { previousPassword:previousPassword, newPassword:newPassword } = req.body;

  if (!previousPassword || !newPassword) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Both previousPassword and newPassword are required"
    });
  }

  try {
    // Retrieve the current user from the database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
    }

    // Verify that the provided previous password matches the stored hash
    const isMatch = await bcrypt.compare(previousPassword, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Incorrect previous password" });
    }

    // Optionally, you could add additional validation here (e.g., new password length, complexity, etc.)

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.status(StatusCodes.OK).json({
      message: "Password updated successfully"
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};

export const upgradeToExpert = async (req, res) => {
  // Assume authentication middleware has attached req.user with id and role
  const { id: userId, role: currentRole } = req.user || {};
  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
  }

  const { role, affiliation, certificate, niv_expertise } = req.body;

  // Validate that the requested new role is one of the expert roles
  if (!EXPERT_ROLES.includes(role)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: `Invalid role. Allowed expert roles are: ${EXPERT_ROLES.join(', ')}`
    });
  }

  // Ensure all required expert fields are provided
  const missingFields = EXPERT_REQUIRED_FIELDS.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: `Missing required fields for expert: ${missingFields.join(', ')}`
    });
  }

  // Ensure that only a normal user (role: "user") can upgrade to expert
  if (currentRole !== 'user') {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: "Only a normal user can upgrade to an expert role"
    });
  }

  try {
    // Update the user role and add expert-specific details
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role, // new expert role
        affiliation: affiliation.trim(),
        certificate, // assumed to be in proper format (e.g., Base64 string or binary data)
        niv_expertise: niv_expertise.trim(),
        is_validated: false // Experts typically require further validation
      }
    });

    res.status(StatusCodes.OK).json({
      message: "Successfully upgraded to expert",
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};

// Add these to your existing user controller

export const getUser = async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
      }
  
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          // Add certificate to the select fields
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
          chercheure: true
        }
      });
  
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
      }
  
    // Convert binary data to base64 URLs
    const profileImage = user.profile_picture && user.profile_mime
    ? `data:${user.profile_mime};base64,${Buffer.from(user.profile_picture).toString('base64')}`
    : null;

    // Handle PDF certificate
    const certificate = user.certificate
    ? `data:application/pdf;base64,${Buffer.from(user.certificate).toString('base64')}`
    : null;

      res.status(StatusCodes.OK).json({
        ...user,
        profile_image: profileImage,
        certificate // Include the PDF data URL
      });
    } catch (error) {
      handleAuthError(error, res);
    }
  };
  
  export const updateProfileImage = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    }
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
  
    try {
      const { image: base64Image } = req.body;
      
      if (!base64Image) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Image data required' });
      }
  
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Image, 'base64');
      
      // Validate image
      const fileType = await fileTypeFromBuffer(imageBuffer);
      if (!fileType?.mime.startsWith('image/')) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid image format' });
      }
  
      if (imageBuffer.length > 2 * 1024 * 1024) { // 2MB limit
        return res.status(StatusCodes.PAYLOAD_TOO_LARGE).json({ 
          error: 'Image exceeds 2MB size limit' 
        });
      }
  
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profile_picture: imageBuffer,
          profile_mime: fileType.mime
        },
        select: {
          id: true,
          profile_picture: true,
          profile_mime: true
        }
      });
  
      const profileImage = `data:${updatedUser.profile_mime};base64,${updatedUser.profile_picture.toString('base64')}`;
  
      res.status(StatusCodes.OK).json({
        message: 'Profile image updated successfully',
        profile_image: profileImage
      });
    } catch (error) {
      handleAuthError(error, res);
    }
  };
  export const deleteProfileImage = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    }
  
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profile_picture: null,
          profile_mime: null
        },
        select: {
          id: true,
          name: true,
          email: true,
          profile_picture: true,
          profile_mime: true
        }
      });
  
      res.status(StatusCodes.OK).json({
        message: 'Profile image removed successfully',
        user: {
          ...updatedUser,
          profile_image: null
        }
      });
    } catch (error) {
      handleAuthError(error, res);
    }
  };