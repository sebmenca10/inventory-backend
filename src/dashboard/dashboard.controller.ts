import { Controller, Get } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from '../products/product.entity'
import { User } from '../users/user.entity'
import { addDays, format } from 'date-fns'

@Controller('dashboard')
export class DashboardController {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) { }

    @Get()
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

    @Get('movements')
    async getMovements() {
        const today = new Date()
        const fakeMovements = Array.from({ length: 10 }).map((_, i) => {
            const date = addDays(today, -i)
            return {
                date: format(date, 'yyyy-MM-dd'),
                entries: Math.floor(Math.random() * 50),
                exits: Math.floor(Math.random() * 30),
            }
        })
        return fakeMovements.reverse()
    }
}