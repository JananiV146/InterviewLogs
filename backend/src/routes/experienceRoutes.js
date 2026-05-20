import express from 'express';
import { 
  createExperience, 
  listExperiences, 
  getExperienceDetail, 
  listTags,
  listMyExperiences,
  updateExperience,
  deleteExperience
} from '../controllers/experienceController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', listExperiences);
router.get('/tags', listTags);
router.get('/mine', verifyToken, listMyExperiences);
router.get('/:id', getExperienceDetail);
router.post('/', verifyToken, createExperience);
router.put('/:id', verifyToken, updateExperience);
router.delete('/:id', verifyToken, deleteExperience);

export default router;
