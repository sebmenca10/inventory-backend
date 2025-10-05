import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { Product } from '../products/product.entity'
import { User } from '../users/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Product, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}