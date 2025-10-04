import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    userEmail: string;

    @Column()
    action: 'create' | 'update' | 'delete';

    @Column()
    entity: string;

    @Column()
    entityId: string;

    @Column({ type: 'jsonb', nullable: true })
    before: any;

    @Column({ type: 'jsonb', nullable: true })
    after: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}