import express from 'express';
import { listPendingExperiences, approveExperience, rejectExperience } from '../controllers/adminController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get('/pending', listPendingExperiences);
router.post('/experiences/:id/approve', approveExperience);
router.post('/experiences/:id/reject', rejectExperience);

export default router;
