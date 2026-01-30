import { Router } from 'express';
import { createUser, getUser } from '../controllers/userController';

const router = Router();

/**
 * POST /api/users
 * Create a new user
 */
router.post('/', createUser);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', getUser);

export default router;
