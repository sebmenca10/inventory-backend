import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyKey } from './idempotency.entity';

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly repo: Repository<IdempotencyKey>,
  ) {}

  async find(key: string) {
    return this.repo.findOne({ where: { key } });
  }

  async saveRecord(key: string, path: string, method: string, response: any, status: number) {
    const record = this.repo.create({ key, path, method, response, status });
    return this.repo.save(record);
  }
}