import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit.entity';

@Injectable()
export class AuditingService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly repo: Repository<AuditLog>,
    ) { }

    async getFiltered(query: {
        userEmail?: string;
        entity?: string;
        action?: 'create' | 'update' | 'delete';
        from?: string;
        to?: string;
        page?: number;
        pageSize?: number;
    }) {
        const qb = this.repo.createQueryBuilder('a');

        if (query.userEmail) {
            qb.andWhere('a.userEmail ILIKE :email', { email: `%${query.userEmail}%` });
        }

        if (query.entity) {
            qb.andWhere('a.entity ILIKE :entity', { entity: `%${query.entity}%` });
        }

        if (query.action) {
            qb.andWhere('a.action = :action', { action: query.action });
        }

        if (query.from) {
            qb.andWhere('a.createdAt >= :from', { from: new Date(query.from) });
        }

        if (query.to) {
            qb.andWhere('a.createdAt <= :to', { to: new Date(query.to) });
        }

        // Paginación
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const pageSize = Number(query.pageSize) > 0 ? Number(query.pageSize) : 20;

        qb.orderBy('a.createdAt', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize);

        const [items, total] = await qb.getManyAndCount();

        return {
            total,
            page,
            pageSize,
            pages: Math.ceil(total / pageSize),
            items,
        };
    }

    async getAll() {
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }
}