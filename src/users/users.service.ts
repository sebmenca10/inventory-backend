import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private usersRepo: Repository<User>) { }

    findAll() {
        return this.usersRepo.find();
    }

    findByEmail(email: string) {
        return this.usersRepo.findOne({ where: { email } });
    }

    async create(email: string, password: string, role: UserRole): Promise<User> {
        const hash = await bcrypt.hash(password, 10);
        const user = this.usersRepo.create({
            email,
            passwordHash: hash,
            role,
        });
        return this.usersRepo.save(user);
    }
}