import express from 'express';
import {
  getPendingUsers,
  validateUser,
  getUserDetails,
  revokeValidationStatus,
  createAdmin
} from '../controllers/adminController.js';

import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import corsMiddleware from '../middleware/cors.js';

const router = express.Router();
//router.use(corsMiddleware);
// Admin middleware stack
router.use(authenticateUser, authorizeRoles('admin'));

router.get('/users/pending', getPendingUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/validate', validateUser);
router.delete('/users/:id/revoke', revokeValidationStatus);
router.post('/create',createAdmin);

export default router;