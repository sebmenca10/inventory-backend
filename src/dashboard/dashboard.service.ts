import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from '../products/product.entity'
import { User } from '../users/user.entity'

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async getStats() {
    const totalProducts = await this.productRepo.count()

    const { totalStock } = await this.productRepo
      .createQueryBuilder('p')
      .select('SUM(p.stock)', 'totalStock')
      .getRawOne()

    const totalUsers = await this.userRepo.count()

    return {
      products: totalProducts,
      stock: Number(totalStock) || 0,
      users: totalUsers,
    }
  }
}