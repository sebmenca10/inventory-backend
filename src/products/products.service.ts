import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
  ) { }

  async findAll(query: {
    q?: string;
    category?: string;
    sort?: keyof Product;
    order?: 'ASC' | 'DESC';
    page?: number;
    pageSize?: number;
  }) {
    const qb = this.repo.createQueryBuilder('p');

    // búsqueda por texto libre
    if (query.q) {
      qb.where('p.name ILIKE :q OR p.category ILIKE :q', { q: `%${query.q}%` });
    }

    // filtro por categoría
    if (query.category) {
      qb.andWhere('p.category = :category', { category: query.category });
    }

    // ordenamiento
    const sort = query.sort || 'createdAt';
    const order = query.order || 'DESC';
    qb.orderBy(`p.${sort}`, order);

    // paginación
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return {
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
      items,
    };
  }

  async findOne(id: string) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    return product;
  }

  async create(data: Partial<Product>) {
    const product = this.repo.create(data);
    return this.repo.save(product);
  }

  async update(id: string, data: Partial<Product>, ifMatch?: number) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);

    // Validar versión para control de concurrencia
    if (ifMatch && product.version !== ifMatch) {
      throw new ConflictException(
        `El producto fue modificado por otro usuario (versión actual: ${product.version})`,
      );
    }

    Object.assign(product, data);
    return this.repo.save(product);
  }

  async delete(id: string) {
    const product = await this.findOne(id);
    await this.repo.remove(product);
    return { deleted: true };
  }

  async bulkInsert(products: Partial<Product>[]) {
    const valid = products.filter(
      (p) => p.name && p.category && typeof p.price === 'number' && typeof p.stock === 'number',
    );

    if (valid.length === 0) return { message: 'No hay productos válidos' };

    const saved = await this.repo.save(valid);
    return {
      inserted: saved.length,
      invalid: products.length - valid.length,
    };
  }

}