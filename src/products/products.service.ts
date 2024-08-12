import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly loger = new Logger(ProductsService.name);

  onModuleInit() {
    this.$connect();
    this.loger.log('Prisma DB connected');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.product.count({ where: { available: true } });

    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true }
      }),
      meta: {
        total,
        page,
        lastPage
      }
    };
  }

  async findOne(id: number) {

    const product = await this.product.findFirst({ 
      where: { id, available: true },
     })

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { name, price } = updateProductDto;
    if (!name || !price) {
      throw new NotFoundException('No data to update');
    }

    const {id: __, ...data} = updateProductDto;

    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: data
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    //return this.product.delete({ where: { id } })
    return this.product.update({
      where: { id },
      data: { available: false }
    });
  }
}
