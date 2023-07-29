import { Controller, Get, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProductsService, FindProductsDTO } from '../services/ProductsService';
import { Product } from '../entities/Product.entity';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  public async all(
    @Query() query: FindProductsDTO,
    @Res() response: Response,
  ): Promise<Response<Array<Product>>> {
    try {
      const products = await this.productsService.find(query);
      return response.status(HttpStatus.OK).json(products);
    } catch (error) {
      return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: {
          message: error.message,
        },
      });
    }
  }

  @Post()
  public async create(@Res() response: Response): Promise<Response<Product>> {
    try {
      const product = await this.productsService.create();
      return response.status(HttpStatus.CREATED).json(product);
    } catch (error) {
      return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: {
          message: error.message,
        },
      });
    }
  }
}
