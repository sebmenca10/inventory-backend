import { Controller, Get, Query } from '@nestjs/common';
import { AuditingService } from './auditing.service';
import { Roles } from '../common/decorators/roles.decorator';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import { parseAsync } from 'json2csv';
@Controller('audit')
export class AuditingController {
    constructor(private readonly auditingService: AuditingService) { }

    @Roles('admin')
    @Get()
    async list(
        @Query()
        query: {
            userEmail?: string;
            entity?: string;
            action?: 'create' | 'update' | 'delete';
            from?: string;
            to?: string;
            page?: number;
            pageSize?: number;
        },
    ) {
        return this.auditingService.getFiltered(query);
    }

    @Roles('admin')
    @Get('export')
    async exportCsv(@Res() res: Response) {
        const logs = await this.auditingService.getAll();
        const fields = [
            'userEmail',
            'action',
            'entity',
            'entityId',
            'createdAt',
        ];

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');

        const csv = await parseAsync(logs, { fields });
        res.send(csv);
    }
}