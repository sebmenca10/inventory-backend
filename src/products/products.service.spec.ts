import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('debería crear un producto correctamente', async () => {
    const dto = { name: 'Laptop', category: 'Electronics', price: 1000, stock: 10 };
    const entity = { id: 'uuid', ...dto };

    mockRepo.create.mockReturnValue(entity);
    mockRepo.save.mockResolvedValue(entity);

    const result = await service.create(dto);
    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    expect(mockRepo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('debería lanzar NotFoundException si no encuentra producto', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('fake')).rejects.toThrow();
  });
});