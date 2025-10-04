import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../../products/products.module';
import { Product } from '../../products/product.entity';
import { ProductsService } from '../../products/products.service';

describe('ProductsModule (integración)', () => {
  let service: ProductsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'Prueb4',
          database: 'inventory_test',
          entities: [Product],
          synchronize: true,
        }),
        ProductsModule,
      ],
    }).compile();

    service = moduleRef.get<ProductsService>(ProductsService);
  });

  it('debería insertar y leer un producto', async () => {
    const product = await service.create({
      name: 'Monitor Dell',
      category: 'Electronics',
      price: 1200,
      stock: 20,
    });

    const found = await service.findOne(product.id);
    expect(found.name).toBe('Monitor Dell');
  });
});