import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Demand } from './Demand';
import { Message } from './Message';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt?: Date;

  @Column({ type: 'int', default: 0 })
  unreadCount: number;

  @Column({ type: 'uuid', nullable: true })
  lastMessageBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => Demand, (demand) => demand.chat)
  @JoinColumn({ name: 'demandId' })
  demand: Demand;

  @Column({ type: 'uuid', unique: true })
  demandId: string;

  @OneToMany(() => Message, (message) => message.chat, { cascade: true })
  messages: Message[];

  // Helper methods
  updateLastMessage(messageDate: Date, senderId: string) {
    this.lastMessageAt = messageDate;
    this.lastMessageBy = senderId;
    this.updatedAt = new Date();
  }

  incrementUnreadCount() {
    this.unreadCount += 1;
  }

  resetUnreadCount() {
    this.unreadCount = 0;
  }
}
