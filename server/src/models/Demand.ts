import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { IsNotEmpty, IsEnum, IsNumber, IsDateString, Min } from 'class-validator';
import { User } from './User';
import { Chat } from './Chat';

export enum ProjectType {
  WEB = 'web',
  MOBILE = 'mobile',
  LOGO = 'logo',
  OTHER = 'other',
}

export enum StackType {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  FULLSTACK = 'fullstack',
}

export enum DemandStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  NEGOTIATING = 'negotiating',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('demands')
export class Demand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectType,
  })
  @IsEnum(ProjectType, { message: 'Invalid project type' })
  projectType: ProjectType;

  @Column({
    type: 'enum',
    enum: StackType,
  })
  @IsEnum(StackType, { message: 'Invalid stack type' })
  stackType: StackType;

  @Column({ type: 'simple-array', nullable: true })
  preferredTechnologies?: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  databasePreference?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber({}, { message: 'Budget must be a valid number' })
  @Min(0, { message: 'Budget must be positive' })
  budget: number;

  @Column({ type: 'date' })
  @IsDateString({}, { message: 'Please provide a valid deadline date' })
  deadline: Date;

  @Column({
    type: 'enum',
    enum: DemandStatus,
    default: DemandStatus.PENDING,
  })
  status: DemandStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  negotiatedPrice?: number;

  @Column({ type: 'text', nullable: true })
  adminNotes?: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.demands, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: User;

  @Column({ type: 'uuid' })
  clientId: string;

  @OneToOne(() => Chat, (chat) => chat.demand, { cascade: true })
  chat?: Chat;

  // Helper methods
  canBeAccepted(): boolean {
    return this.status === DemandStatus.PENDING || this.status === DemandStatus.NEGOTIATING;
  }

  canBeNegotiated(): boolean {
    return this.status === DemandStatus.PENDING || this.status === DemandStatus.NEGOTIATING;
  }

  canBeRejected(): boolean {
    return this.status === DemandStatus.PENDING || this.status === DemandStatus.NEGOTIATING;
  }
}
