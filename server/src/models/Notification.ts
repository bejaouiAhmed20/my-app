import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { User } from './User';

export enum NotificationType {
  DEMAND_SUBMITTED = 'demand_submitted',
  DEMAND_ACCEPTED = 'demand_accepted',
  DEMAND_REJECTED = 'demand_rejected',
  PRICE_NEGOTIATION = 'price_negotiation',
  NEW_MESSAGE = 'new_message',
  PROJECT_COMPLETED = 'project_completed',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  @IsEnum(NotificationType, { message: 'Invalid notification type' })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ type: 'boolean', default: false })
  emailSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt?: Date;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  actionUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.notifications, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  // Helper methods
  markAsRead() {
    this.isRead = true;
    this.readAt = new Date();
  }

  markEmailAsSent() {
    this.emailSent = true;
    this.emailSentAt = new Date();
  }

  isHighPriority(): boolean {
    return this.priority === NotificationPriority.HIGH || this.priority === NotificationPriority.URGENT;
  }

  shouldSendEmail(): boolean {
    return !this.emailSent && this.isHighPriority();
  }
}
