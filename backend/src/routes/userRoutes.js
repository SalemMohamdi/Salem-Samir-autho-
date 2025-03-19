import express from 'express';
import { body } from 'express-validator';
import {
    updateProfile,
    changePassword,
    upgradeToExpert,
    getUser,
    updateProfileImage,
    deleteProfileImage
  } from '../controllers/userControllers.js';
import { authenticateUser } from '../middleware/auth.js';
import corsMiddleware from '../middleware/cors.js';
import { StatusCodes } from 'http-status-codes';
import rateLimit from 'express-rate-limit';

const router = express.Router();
router.use(corsMiddleware);

router.post('/updateprofile',
  authenticateUser,
  updateProfile
);
router.post('/changepassword',
  authenticateUser,
  changePassword
);
// Route to upgrade a normal user to an expert role
router.post('/upgradetoexpert',
    authenticateUser,
    upgradeToExpert
  );
  
  // Route to get user details
  router.get('/getuser',
    authenticateUser,
    getUser
  );
  
  // Route to update the profile image
  router.post('/updateprofileimage',
    authenticateUser,
    updateProfileImage
  );

  router.delete('/deleteProfileImage',
    authenticateUser,
    deleteProfileImage
  );
  
  export default router;