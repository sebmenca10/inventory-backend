import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('idempotency_keys')
@Unique(['key'])
export class IdempotencyKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column()
  path: string;

  @Column()
  method: string;

  @Column({ type: 'jsonb', nullable: true })
  response: any;

  @Column({ type: 'int', nullable: true })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}