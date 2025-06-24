import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return next(createError('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Get user from database
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.id },
        select: ['id', 'name', 'email', 'role', 'isActive', 'lastLoginAt', 'createdAt', 'updatedAt']
      });

      if (!user) {
        return next(createError('No user found with this token', 401));
      }

      if (!user.isActive) {
        return next(createError('User account is deactivated', 401));
      }

      req.user = user;
      next();
    } catch (err) {
      return next(createError('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Not authorized to access this route', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        createError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, continue without user
    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Get user from database
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.id },
        select: ['id', 'name', 'email', 'role', 'isActive', 'lastLoginAt', 'createdAt', 'updatedAt']
      });

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (err) {
      // Invalid token, but continue without user
    }

    next();
  } catch (error) {
    next(error);
  }
};
