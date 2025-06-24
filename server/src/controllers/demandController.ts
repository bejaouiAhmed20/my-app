import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Demand, DemandStatus, ProjectType, StackType } from '../models/Demand';
import { User, UserRole } from '../models/User';
import { Chat } from '../models/Chat';
import { AuthRequest } from '../middlewares/auth';
import { asyncHandler, createError } from '../middlewares/errorHandler';
import { createNotification } from '../services/notificationService';
import { sendEmail } from '../services/emailService';
import { NotificationType, NotificationPriority } from '../models/Notification';

// @desc    Create a new demand
// @route   POST /api/demands
// @access  Private (Client only)
export const createDemand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    title,
    description,
    projectType,
    stackType,
    preferredTechnologies,
    databasePreference,
    budget,
    deadline
  } = req.body;

  const clientId = req.user!.id;
  const demandRepository = AppDataSource.getRepository(Demand);
  const chatRepository = AppDataSource.getRepository(Chat);

  // Create demand
  const demand = demandRepository.create({
    title,
    description,
    projectType,
    stackType,
    preferredTechnologies,
    databasePreference,
    budget,
    deadline: new Date(deadline),
    clientId,
  });

  const savedDemand = await demandRepository.save(demand);

  // Create associated chat
  const chat = chatRepository.create({
    demandId: savedDemand.id,
  });
  await chatRepository.save(chat);

  // Get admin users for notification
  const userRepository = AppDataSource.getRepository(User);
  const admins = await userRepository.find({ where: { role: UserRole.ADMIN } });

  // Create notifications for all admins
  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      title: 'New Project Demand',
      message: `New ${projectType} project demand from ${req.user!.name}`,
      type: NotificationType.DEMAND_SUBMITTED,
      priority: NotificationPriority.HIGH,
      metadata: {
        demandId: savedDemand.id,
        clientId,
        projectType,
        budget,
      },
      actionUrl: `/admin/demands/${savedDemand.id}`,
    });

    // Send email notification to admin
    try {
      await sendEmail({
        to: admin.email,
        subject: 'New Project Demand Submitted',
        template: 'new-demand-notification',
        data: {
          clientName: req.user!.name,
          demandTitle: title,
          projectType,
          budget,
          deadline: new Date(deadline).toLocaleDateString(),
        },
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  // Fetch the complete demand with relations
  const completeDemand = await demandRepository.findOne({
    where: { id: savedDemand.id },
    relations: ['client', 'chat'],
  });

  res.status(201).json({
    success: true,
    data: completeDemand,
  });
});

// @desc    Get all demands (Admin only)
// @route   GET /api/demands
// @access  Private (Admin only)
export const getDemands = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, projectType, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

  const demandRepository = AppDataSource.getRepository(Demand);
  const queryBuilder = demandRepository.createQueryBuilder('demand')
    .leftJoinAndSelect('demand.client', 'client')
    .leftJoinAndSelect('demand.chat', 'chat');

  // Apply filters
  if (status) {
    queryBuilder.andWhere('demand.status = :status', { status });
  }
  if (projectType) {
    queryBuilder.andWhere('demand.projectType = :projectType', { projectType });
  }

  // Apply sorting
  queryBuilder.orderBy(`demand.${sortBy}`, sortOrder as 'ASC' | 'DESC');

  // Apply pagination
  const skip = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(skip).take(Number(limit));

  const [demands, total] = await queryBuilder.getManyAndCount();

  res.status(200).json({
    success: true,
    data: demands,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get client's own demands
// @route   GET /api/demands/my-demands
// @access  Private (Client only)
export const getMyDemands = asyncHandler(async (req: AuthRequest, res: Response) => {
  const clientId = req.user!.id;
  const { status, page = 1, limit = 10 } = req.query;

  const demandRepository = AppDataSource.getRepository(Demand);
  const queryBuilder = demandRepository.createQueryBuilder('demand')
    .leftJoinAndSelect('demand.chat', 'chat')
    .where('demand.clientId = :clientId', { clientId });

  if (status) {
    queryBuilder.andWhere('demand.status = :status', { status });
  }

  queryBuilder.orderBy('demand.createdAt', 'DESC');

  const skip = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(skip).take(Number(limit));

  const [demands, total] = await queryBuilder.getManyAndCount();

  res.status(200).json({
    success: true,
    data: demands,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get single demand by ID
// @route   GET /api/demands/:id
// @access  Private
export const getDemandById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const demandRepository = AppDataSource.getRepository(Demand);
  const demand = await demandRepository.findOne({
    where: { id },
    relations: ['client', 'chat'],
  });

  if (!demand) {
    throw createError('Demand not found', 404);
  }

  // Check authorization
  if (userRole === UserRole.CLIENT && demand.clientId !== userId) {
    throw createError('Not authorized to access this demand', 403);
  }

  res.status(200).json({
    success: true,
    data: demand,
  });
});

// @desc    Update demand
// @route   PUT /api/demands/:id
// @access  Private
export const updateDemand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const demandRepository = AppDataSource.getRepository(Demand);
  const demand = await demandRepository.findOne({ where: { id } });

  if (!demand) {
    throw createError('Demand not found', 404);
  }

  // Check authorization
  if (userRole === UserRole.CLIENT && demand.clientId !== userId) {
    throw createError('Not authorized to update this demand', 403);
  }

  // Clients can only update if status is pending or negotiating
  if (userRole === UserRole.CLIENT && !demand.canBeNegotiated()) {
    throw createError('Cannot update demand in current status', 400);
  }

  // Update allowed fields based on role
  const allowedFields = userRole === UserRole.ADMIN 
    ? ['title', 'description', 'projectType', 'stackType', 'preferredTechnologies', 'databasePreference', 'budget', 'deadline', 'adminNotes', 'negotiatedPrice']
    : ['title', 'description', 'projectType', 'stackType', 'preferredTechnologies', 'databasePreference', 'budget', 'deadline'];

  const updateData: Partial<Demand> = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field as keyof Demand] = req.body[field];
    }
  });

  if (updateData.deadline) {
    updateData.deadline = new Date(updateData.deadline as any);
  }

  await demandRepository.update(id, updateData);

  const updatedDemand = await demandRepository.findOne({
    where: { id },
    relations: ['client', 'chat'],
  });

  res.status(200).json({
    success: true,
    data: updatedDemand,
  });
});

// @desc    Delete demand
// @route   DELETE /api/demands/:id
// @access  Private
export const deleteDemand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const demandRepository = AppDataSource.getRepository(Demand);
  const demand = await demandRepository.findOne({ where: { id } });

  if (!demand) {
    throw createError('Demand not found', 404);
  }

  // Check authorization
  if (userRole === UserRole.CLIENT && demand.clientId !== userId) {
    throw createError('Not authorized to delete this demand', 403);
  }

  // Only allow deletion if status is pending or rejected
  if (![DemandStatus.PENDING, DemandStatus.REJECTED, DemandStatus.CANCELLED].includes(demand.status)) {
    throw createError('Cannot delete demand in current status', 400);
  }

  await demandRepository.remove(demand);

  res.status(200).json({
    success: true,
    message: 'Demand deleted successfully',
  });
});

// @desc    Accept demand (Admin only)
// @route   PUT /api/demands/:id/accept
// @access  Private (Admin only)
export const acceptDemand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { finalPrice, message } = req.body;

  const demandRepository = AppDataSource.getRepository(Demand);
  const demand = await demandRepository.findOne({
    where: { id },
    relations: ['client'],
  });

  if (!demand) {
    throw createError('Demand not found', 404);
  }

  if (!demand.canBeAccepted()) {
    throw createError('Demand cannot be accepted in current status', 400);
  }

  // Update demand
  demand.status = DemandStatus.ACCEPTED;
  demand.negotiatedPrice = finalPrice || demand.budget;
  demand.acceptedAt = new Date();
  if (message) {
    demand.adminNotes = message;
  }

  await demandRepository.save(demand);

  // Create notification for client
  await createNotification({
    userId: demand.clientId,
    title: 'Demand Accepted',
    message: `Your project "${demand.title}" has been accepted!`,
    type: NotificationType.DEMAND_ACCEPTED,
    priority: NotificationPriority.HIGH,
    metadata: {
      demandId: id,
      finalPrice: demand.negotiatedPrice,
    },
    actionUrl: `/dashboard/demands/${id}`,
  });

  // Send email notification
  try {
    await sendEmail({
      to: demand.client.email,
      subject: 'Project Demand Accepted',
      template: 'demand-status-update',
      data: {
        clientName: demand.client.name,
        demandTitle: demand.title,
        status: 'Accepted',
        negotiatedPrice: demand.negotiatedPrice,
        message,
      },
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }

  res.status(200).json({
    success: true,
    data: demand,
  });
});

// @desc    Reject demand (Admin only)
// @route   PUT /api/demands/:id/reject
// @access  Private (Admin only)
export const rejectDemand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw createError('Rejection reason is required', 400);
  }

  const demandRepository = AppDataSource.getRepository(Demand);
  const demand = await demandRepository.findOne({
    where: { id },
    relations: ['client'],
  });

  if (!demand) {
    throw createError('Demand not found', 404);
  }

  if (!demand.canBeRejected()) {
    throw createError('Demand cannot be rejected in current status', 400);
  }

  // Update demand
  demand.status = DemandStatus.REJECTED;
  demand.rejectionReason = reason;

  await demandRepository.save(demand);

  // Create notification for client
  await createNotification({
    userId: demand.clientId,
    title: 'Demand Rejected',
    message: `Your project "${demand.title}" has been rejected.`,
    type: NotificationType.DEMAND_REJECTED,
    priority: NotificationPriority.HIGH,
    metadata: {
      demandId: id,
      reason,
    },
    actionUrl: `/dashboard/demands/${id}`,
  });

  // Send email notification
  try {
    await sendEmail({
      to: demand.client.email,
      subject: 'Project Demand Rejected',
      template: 'demand-status-update',
      data: {
        clientName: demand.client.name,
        demandTitle: demand.title,
        status: 'Rejected',
        message: reason,
      },
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }

  res.status(200).json({
    success: true,
    data: demand,
  });
});

// @desc    Negotiate price (Admin only)
// @route   PUT /api/demands/:id/negotiate
// @access  Private (Admin only)
export const negotiatePrice = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { proposedPrice, message } = req.body;

  if (!proposedPrice || !message) {
    throw createError('Proposed price and message are required', 400);
  }

  const demandRepository = AppDataSource.getRepository(Demand);
  const demand = await demandRepository.findOne({
    where: { id },
    relations: ['client'],
  });

  if (!demand) {
    throw createError('Demand not found', 404);
  }

  if (!demand.canBeNegotiated()) {
    throw createError('Demand cannot be negotiated in current status', 400);
  }

  // Update demand
  demand.status = DemandStatus.NEGOTIATING;
  demand.negotiatedPrice = proposedPrice;
  demand.adminNotes = message;

  await demandRepository.save(demand);

  // Create notification for client
  await createNotification({
    userId: demand.clientId,
    title: 'Price Negotiation',
    message: `New price proposal for "${demand.title}": $${proposedPrice}`,
    type: NotificationType.PRICE_NEGOTIATION,
    priority: NotificationPriority.HIGH,
    metadata: {
      demandId: id,
      proposedPrice,
      originalBudget: demand.budget,
    },
    actionUrl: `/dashboard/demands/${id}`,
  });

  // Send email notification
  try {
    await sendEmail({
      to: demand.client.email,
      subject: 'Price Negotiation for Your Project',
      template: 'demand-status-update',
      data: {
        clientName: demand.client.name,
        demandTitle: demand.title,
        status: 'Under Negotiation',
        negotiatedPrice: proposedPrice,
        message,
      },
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }

  res.status(200).json({
    success: true,
    data: demand,
  });
});

// @desc    Update demand status (Admin only)
// @route   PUT /api/demands/:id/status
// @access  Private (Admin only)
export const updateDemandStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!Object.values(DemandStatus).includes(status)) {
    throw createError('Invalid status', 400);
  }

  const demandRepository = AppDataSource.getRepository(Demand);
  const demand = await demandRepository.findOne({
    where: { id },
    relations: ['client'],
  });

  if (!demand) {
    throw createError('Demand not found', 404);
  }

  const oldStatus = demand.status;
  demand.status = status;

  if (notes) {
    demand.adminNotes = notes;
  }

  if (status === DemandStatus.COMPLETED) {
    demand.completedAt = new Date();
  }

  await demandRepository.save(demand);

  // Create notification for client if status changed
  if (oldStatus !== status) {
    await createNotification({
      userId: demand.clientId,
      title: 'Project Status Updated',
      message: `Your project "${demand.title}" status changed to ${status}`,
      type: status === DemandStatus.COMPLETED ? NotificationType.PROJECT_COMPLETED : NotificationType.SYSTEM,
      priority: NotificationPriority.MEDIUM,
      metadata: {
        demandId: id,
        oldStatus,
        newStatus: status,
      },
      actionUrl: `/dashboard/demands/${id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: demand,
  });
});

// @desc    Get demand statistics (Admin only)
// @route   GET /api/demands/stats
// @access  Private (Admin only)
export const getDemandStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const demandRepository = AppDataSource.getRepository(Demand);

  // Get counts by status
  const statusStats = await demandRepository
    .createQueryBuilder('demand')
    .select('demand.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .groupBy('demand.status')
    .getRawMany();

  // Get counts by project type
  const projectTypeStats = await demandRepository
    .createQueryBuilder('demand')
    .select('demand.projectType', 'projectType')
    .addSelect('COUNT(*)', 'count')
    .groupBy('demand.projectType')
    .getRawMany();

  // Get total revenue (accepted demands)
  const revenueResult = await demandRepository
    .createQueryBuilder('demand')
    .select('SUM(demand.negotiatedPrice)', 'totalRevenue')
    .addSelect('COUNT(*)', 'acceptedCount')
    .where('demand.status = :status', { status: DemandStatus.ACCEPTED })
    .getRawOne();

  // Get recent demands
  const recentDemands = await demandRepository.find({
    relations: ['client'],
    order: { createdAt: 'DESC' },
    take: 5,
  });

  res.status(200).json({
    success: true,
    data: {
      statusStats,
      projectTypeStats,
      revenue: {
        total: parseFloat(revenueResult.totalRevenue) || 0,
        acceptedCount: parseInt(revenueResult.acceptedCount) || 0,
      },
      recentDemands,
    },
  });
});
