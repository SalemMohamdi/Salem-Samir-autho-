import express from 'express';
import {
  getPendingExperts,
  validateExpert,
  getExpertDetails,
  revokeExpertStatus
} from '../controllers/adminController.js';

import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import corsMiddleware from '../middleware/cors.js';

const router = express.Router();
//router.use(corsMiddleware);
// Admin middleware stack
router.use(authenticateUser, authorizeRoles('admin'));

router.get('/experts/pending', getPendingExperts);
router.get('/experts/:id', getExpertDetails);
router.put('/experts/:id/validate', validateExpert);
router.delete('/experts/:id/revoke', revokeExpertStatus);

export default router;