import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';

const userService = new UserService();

/**
 * Create a new user
 * POST /api/users
 */
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, companyName, companySize } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await userService.createUser({
      email,
      companyName,
      companySize
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
