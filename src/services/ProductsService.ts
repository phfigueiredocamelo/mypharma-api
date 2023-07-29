import { Injectable } from '@nestjs/common';
import { Product } from 'src/entities/Product.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(private dataSource: DataSource) {}

  async find(dto: FindProductsDTO): Promise<Array<Product>> {
    const findParams = [];

    if (dto.name != '') {
      findParams.push({ commercialName: new RegExp(dto.name) });
    }

    if (dto.categories) {
      findParams.push({ category: { $in: dto.categories ?? [] } });
    }

    let orderParams: any = {};

    if (dto.orderBy == 'name' && dto.order) {
      orderParams = {
        commercialName: dto.order,
      };
    }

    if (dto.orderBy == 'amount' && dto.order) {
      orderParams = {
        amount: dto.order,
      };
    }

    return await this.dataSource.getMongoRepository<Product>('product').find({
      where: { $and: findParams },
      order: orderParams,
    });
  }

  async create(): Promise<Product> {
    const p: Product = {
      commercialName: 'Test',
      category: 'MEDICAMENTO',
      amount: 39.7,
      quantity: {
        type: 'comprimido',
        value: 30,
      },
      listType: {
        description: 'D1',
        requireRecipe: true,
      },
      ingredients: [
        {
          name: 'Test',
          concentration: {
            unit: 'mg',
            value: 100,
          },
        },
      ],
    };

    return await this.dataSource.getMongoRepository<Product>('product').save(p);
  }
}

export class FindProductsDTO {
  name: string;
  categories: string[];
  orderBy: string;
  order: string;
}
