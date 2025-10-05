import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    Headers,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Product } from './product.entity';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import { parseAsync } from 'json2csv';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { IdempotencyInterceptor } from '../idempotency/idempotency.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as fastcsv from 'fast-csv';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @ApiOperation({ summary: 'Listar productos' })
    @ApiResponse({ status: 200, description: 'Lista de productos retornada correctamente' })
    @Roles('admin', 'operator', 'viewer')
    @Get()
    list(
        @Query()
        query: {
            q?: string;
            category?: string;
            sort?: string;
            order?: 'ASC' | 'DESC';
            page?: number;
            pageSize?: number;
        },
    ) {
        return this.productsService.findAll({
            ...query,
            sort: query.sort as keyof Product,
        });
    }

    @ApiOperation({ summary: 'Crear producto' })
    @ApiResponse({ status: 201, description: 'Producto creado con éxito' })
    @Roles('admin', 'operator')
    @Post()
    @UseInterceptors(IdempotencyInterceptor)
    create(
        @Body()
        body: { name: string; category: string; price: number; stock: number },
    ) {
        return this.productsService.create(body);
    }

    @ApiOperation({ summary: 'Crear producto' })
    @ApiResponse({ status: 201, description: 'Producto creado con éxito' })
    @Roles('admin', 'operator')
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() body: any,
        @Headers('if-match') ifMatch: string,
    ) {
        const version = ifMatch ? parseInt(ifMatch, 10) : undefined;
        return this.productsService.update(id, body, version);
    }

    @Roles('admin')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.delete(id);
    }

    @Roles('admin', 'operator', 'viewer')
    @Get('export')
    async exportCsv(@Res() res: Response) {
        const products = await this.productsService.findAll({});
        const data = products.items;

        const fields = ['id', 'name', 'category', 'price', 'stock', 'createdAt', 'updatedAt'];

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');

        const csv = await parseAsync(data, { fields });
        res.send(csv);
    }

    @Roles('admin', 'operator')
    @Post('import')
    @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
    async importCsv(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('No se subió ningún archivo');

        const products: any[] = [];
        const errors: any[] = [];

        return new Promise((resolve, reject) => {
            let lineNumber = 1;

            fs.createReadStream(file.path)
                .pipe(fastcsv.parse({ headers: true }))
                .on('error', (err) => reject(err))
                .on('data', (row) => {
                    lineNumber++;

                    const missingFields: string[] = [];
                    if (!row.name) missingFields.push('name');
                    if (!row.category) missingFields.push('category');
                    if (!row.price) missingFields.push('price');
                    if (!row.stock) missingFields.push('stock');

                    if (missingFields.length > 0) {
                        errors.push({
                            line: lineNumber,
                            error: `Campos faltantes: ${missingFields.join(', ')}`,
                            row,
                        });
                        return;
                    }

                    const price = parseFloat(row.price);
                    const stock = parseInt(row.stock, 10);

                    if (isNaN(price) || isNaN(stock)) {
                        errors.push({
                            line: lineNumber,
                            error: 'Valores numéricos inválidos (price o stock)',
                            row,
                        });
                        return;
                    }

                    products.push({ name: row.name, category: row.category, price, stock });
                })
                .on('end', async () => {
                    const result = await this.productsService.bulkInsert(products);
                    fs.unlinkSync(file.path);

                    resolve({
                        totalRows: lineNumber - 1,
                        inserted: result.inserted || 0,
                        invalid: (result.invalid || 0) + errors.length,
                        invalidDetails: errors,
                        message:
                            (result.inserted ?? 0) > 0
                                ? 'Importación completada parcialmente o totalmente con éxito'
                                : 'No se pudo importar ningún producto válido',
                    });
                });
        });
    }

    @Roles('admin', 'operator', 'viewer')
    @Get('categories')
    async getCategories() {
        return ['Electronics', 'Accessories', 'Office', 'Home', 'Storage']
    }

    @Roles('admin', 'operator', 'viewer')
    @Get(':id')
    async getOne(@Param('id') id: string, @Res() res: Response) {
        const product = await this.productsService.findOne(id);
        res.setHeader('ETag', product.version.toString());
        return res.json(product);
    }

}