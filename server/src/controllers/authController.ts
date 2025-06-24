import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { asyncHandler, createError } from '../middlewares/errorHandler';
import { sendEmail } from '../services/emailService';
import crypto from 'crypto';

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Send token response
const sendTokenResponse = (user: User, statusCode: number, res: Response) => {
  const token = generateToken(user.id);

  // Update last login
  user.lastLoginAt = new Date();
  AppDataSource.getRepository(User).save(user);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toJSON(),
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, role, phone, company } = req.body;

  const userRepository = AppDataSource.getRepository(User);

  // Check if user already exists
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw createError('User with this email already exists', 400);
  }

  // Create user
  const user = userRepository.create({
    name,
    email,
    password,
    role: role || UserRole.CLIENT,
    phone,
    company,
  });

  await userRepository.save(user);

  // Send welcome email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to ProjectDemandHub',
      template: 'welcome',
      data: {
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const userRepository = AppDataSource.getRepository(User);

  // Check for user
  const user = await userRepository.findOne({ 
    where: { email },
    select: ['id', 'name', 'email', 'password', 'role', 'isActive', 'lastLoginAt', 'createdAt', 'updatedAt']
  });

  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw createError('Account is deactivated. Please contact support.', 401);
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw createError('Invalid credentials', 401);
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  res.status(200).json({
    success: true,
    user: user.toJSON(),
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone, company } = req.body;
  const userId = req.user!.id;

  const userRepository = AppDataSource.getRepository(User);

  const fieldsToUpdate: Partial<User> = {};
  if (name) fieldsToUpdate.name = name;
  if (phone !== undefined) fieldsToUpdate.phone = phone;
  if (company !== undefined) fieldsToUpdate.company = company;

  await userRepository.update(userId, fieldsToUpdate);

  const updatedUser = await userRepository.findOne({
    where: { id: userId },
    select: ['id', 'name', 'email', 'role', 'phone', 'company', 'isActive', 'lastLoginAt', 'createdAt', 'updatedAt']
  });

  res.status(200).json({
    success: true,
    user: updatedUser,
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  const userRepository = AppDataSource.getRepository(User);

  // Get user with password
  const user = await userRepository.findOne({
    where: { id: userId },
    select: ['id', 'password']
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw createError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await userRepository.save(user);

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { email } });

  if (!user) {
    throw createError('No user found with that email', 404);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save to user (you might want to add these fields to User model)
  // For now, we'll use a simple approach with JWT
  const resetJWT = jwt.sign(
    { id: user.id, purpose: 'password-reset' },
    process.env.JWT_SECRET!,
    { expiresIn: '10m' }
  );

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        name: user.name,
        resetUrl: `${process.env.CLIENT_URL}/reset-password?token=${resetJWT}`,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw createError('Email could not be sent', 500);
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, password } = req.body;

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.purpose !== 'password-reset') {
      throw createError('Invalid reset token', 400);
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.id } });

    if (!user) {
      throw createError('Invalid reset token', 400);
    }

    // Set new password
    user.password = password;
    await userRepository.save(user);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    throw createError('Invalid reset token', 400);
  }
});
