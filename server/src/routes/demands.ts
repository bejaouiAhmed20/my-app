import { Router } from 'express';
import {
  createDemand,
  getDemands,
  getDemandById,
  updateDemand,
  deleteDemand,
  acceptDemand,
  rejectDemand,
  negotiatePrice,
  getMyDemands,
  getDemandStats,
  updateDemandStatus
} from '../controllers/demandController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateDemand } from '../middlewares/validation';
import { UserRole } from '../models/User';

const router = Router();

// Client routes
router.post('/', authenticate, authorize(UserRole.CLIENT), validateDemand, createDemand);
router.get('/my-demands', authenticate, authorize(UserRole.CLIENT), getMyDemands);

// Admin routes
router.get('/', authenticate, authorize(UserRole.ADMIN), getDemands);
router.get('/stats', authenticate, authorize(UserRole.ADMIN), getDemandStats);
router.put('/:id/accept', authenticate, authorize(UserRole.ADMIN), acceptDemand);
router.put('/:id/reject', authenticate, authorize(UserRole.ADMIN), rejectDemand);
router.put('/:id/negotiate', authenticate, authorize(UserRole.ADMIN), negotiatePrice);
router.put('/:id/status', authenticate, authorize(UserRole.ADMIN), updateDemandStatus);

// Shared routes (both client and admin can access)
router.get('/:id', authenticate, getDemandById);
router.put('/:id', authenticate, updateDemand);
router.delete('/:id', authenticate, deleteDemand);

export default router;
