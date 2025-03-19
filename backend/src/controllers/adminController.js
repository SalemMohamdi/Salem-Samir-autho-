import { prisma } from '../config/index.js';
import { StatusCodes } from 'http-status-codes';

export const getPendingExperts = async (req, res) => {
  try {
    const experts = await prisma.user.findMany({
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

    res.status(StatusCodes.OK).json({ experts });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch pending experts'
    });
  }
};

export const validateExpert = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      // First get the user with current status
      const user = await tx.user.findUnique({
        where: { id: Number(id) },
        select: { is_validated: true, role: true }
      });

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'User not found'
        });
      }

      if (user.role === 'admin') {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Cannot validate admin users'
        });
      }

      if (user.is_validated) {
        return res.status(StatusCodes.CONFLICT).json({
          error: 'User is already validated'
        });
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
          message: 'Your expert account has been approved by administrators'
        }
      });
    });

    res.status(StatusCodes.OK).json({ message: 'Expert validated successfully' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Expert validation failed: ' + error.message
    });
  }
};

export const getExpertDetails = async (req, res) => {
    try {
      const expert = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          affiliation: true,
          niv_expertise: true,
          certificate: true,
          createdAt: true,
          is_validated: true,
          sections: {
            select: {
              id: true,
              title: true,
              createdAt: true
            }
          }
        }
      });
  
      if (!expert) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Expert not found'
        });
      }
  
      res.status(StatusCodes.OK).json({ expert });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch expert details'
      });
    }
  };
  export const revokeExpertStatus = async (req, res) => {
    const { id } = req.params;
  
    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: Number(id) },
          select: { is_validated: true, role: true }
        });
  
        if (!user) {
          return res.status(StatusCodes.NOT_FOUND).json({
            error: 'User not found'
          });
        }
  
        if (user.role === 'admin') {
          return res.status(StatusCodes.FORBIDDEN).json({
            error: 'Cannot revoke admin users'
          });
        }
  
        if (!user.is_validated) {
          return res.status(StatusCodes.CONFLICT).json({
            error: 'User is not currently validated'
          });
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
            message: 'Your expert status has been revoked by administrators'
          }
        });
  
        await tx.refreshToken.deleteMany({
          where: { userId: Number(id) }
        });
      });
  
      res.status(StatusCodes.OK).json({
        message: 'Expert status revoked successfully'
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to revoke expert status: ' + error.message
      });
    }
  };