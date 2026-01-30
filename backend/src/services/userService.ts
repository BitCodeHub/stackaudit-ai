import { prisma } from '../utils/prisma';
import { User } from '@prisma/client';

interface CreateUserData {
  email: string;
  companyName?: string;
  companySize?: string;
}

export class UserService {
  /**
   * Create a new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return existingUser;
    }

    return prisma.user.create({
      data: {
        email: data.email,
        companyName: data.companyName,
        companySize: data.companySize
      }
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        audits: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }
}
