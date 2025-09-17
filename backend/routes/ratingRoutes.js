import express from 'express';
import { 
  createRating, 
  getAllRatings,
  getUserRatings,
  getRatingById,
  updateRating,
  deleteRating 
} from '../controllers/ratingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createRating);
router.get('/', verifyToken, getAllRatings);
router.get('/user/:userId?', verifyToken, getUserRatings);
router.get('/:ratingId', verifyToken, getRatingById);
router.put('/:ratingId', verifyToken, updateRating);
router.delete('/:ratingId', verifyToken, deleteRating);

export default router;