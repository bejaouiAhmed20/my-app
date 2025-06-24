import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { User } from './User';
import { Chat } from './Chat';

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
  PRICE_NEGOTIATION = 'price_negotiation',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Message content is required' })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  proposedPrice?: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.sentMessages, { eager: true })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({ type: 'uuid' })
  senderId: string;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column({ type: 'uuid' })
  chatId: string;

  // Helper methods
  markAsRead() {
    this.isRead = true;
    this.readAt = new Date();
  }

  isFromAdmin(): boolean {
    return this.sender.role === 'admin';
  }

  isFromClient(): boolean {
    return this.sender.role === 'client';
  }
}
