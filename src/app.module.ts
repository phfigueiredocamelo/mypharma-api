import { join } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/Product.entity';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/ProductsService';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      port: 27017,
      name: 'default',
      type: 'mongodb',
      host: 'localhost',
      database: 'bartodb',
      useNewUrlParser: true,
      autoLoadEntities: true,
      useUnifiedTopology: true,
      entities: [join(__dirname, '**/**.entity.ts')],
    }),
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class AppModule {}
