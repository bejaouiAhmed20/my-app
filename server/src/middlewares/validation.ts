import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { createError } from './errorHandler';

// DTO Classes for validation
export class RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  company?: string;
}

export class LoginDTO {
  email: string;
  password: string;
}

export class DemandDTO {
  title: string;
  description: string;
  projectType: string;
  stackType: string;
  preferredTechnologies?: string[];
  databasePreference?: string;
  budget: number;
  deadline: string;
}

// Validation middleware factory
const validateDTO = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(dtoClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ');
        
        return next(createError(`Validation failed: ${errorMessages}`, 400));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Custom validation functions
export const validateRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  // Check required fields
  if (!name || !email || !password) {
    return next(createError('Please provide name, email, and password', 400));
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(createError('Please provide a valid email address', 400));
  }

  // Validate password strength
  if (password.length < 6) {
    return next(createError('Password must be at least 6 characters long', 400));
  }

  // Validate role if provided
  if (role && !['client', 'admin'].includes(role)) {
    return next(createError('Role must be either client or admin', 400));
  }

  // Validate name length
  if (name.length < 2 || name.length > 100) {
    return next(createError('Name must be between 2 and 100 characters', 400));
  }

  next();
};

export const validateLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    return next(createError('Please provide email and password', 400));
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(createError('Please provide a valid email address', 400));
  }

  next();
};

export const validateDemand = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, projectType, stackType, budget, deadline } = req.body;

  // Check required fields
  if (!title || !description || !projectType || !stackType || !budget || !deadline) {
    return next(createError('Please provide all required fields', 400));
  }

  // Validate title length
  if (title.length < 5 || title.length > 200) {
    return next(createError('Title must be between 5 and 200 characters', 400));
  }

  // Validate description length
  if (description.length < 20) {
    return next(createError('Description must be at least 20 characters long', 400));
  }

  // Validate project type
  const validProjectTypes = ['web', 'mobile', 'logo', 'other'];
  if (!validProjectTypes.includes(projectType)) {
    return next(createError('Invalid project type', 400));
  }

  // Validate stack type
  const validStackTypes = ['frontend', 'backend', 'fullstack'];
  if (!validStackTypes.includes(stackType)) {
    return next(createError('Invalid stack type', 400));
  }

  // Validate budget
  if (isNaN(budget) || budget <= 0) {
    return next(createError('Budget must be a positive number', 400));
  }

  // Validate deadline
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(deadlineDate.getTime()) || deadlineDate < today) {
    return next(createError('Deadline must be a valid future date', 400));
  }

  next();
};

export const validatePasswordChange = async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(createError('Please provide current password and new password', 400));
  }

  if (newPassword.length < 6) {
    return next(createError('New password must be at least 6 characters long', 400));
  }

  if (currentPassword === newPassword) {
    return next(createError('New password must be different from current password', 400));
  }

  next();
};

export const validateEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    return next(createError('Please provide an email address', 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(createError('Please provide a valid email address', 400));
  }

  next();
};

export const validateResetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(createError('Please provide token and new password', 400));
  }

  if (password.length < 6) {
    return next(createError('Password must be at least 6 characters long', 400));
  }

  next();
};
