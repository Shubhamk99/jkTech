import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ingestions')
export class Ingestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: string; // e.g., pending, running, completed, failed

  @Column({ nullable: true })
  documentId: string;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
