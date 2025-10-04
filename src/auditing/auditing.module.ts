import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit.entity';
import { AuditingService } from './auditing.service';
import { AuditingController } from './auditing.controller';
import { AuditSubscriber } from './audit.subscribers';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditingController],
  providers: [AuditingService, AuditSubscriber],
  exports: [AuditingService],
})
export class AuditingModule {}
