import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { Product } from '../src/entities/Product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ProductsController } from '../src/controllers/products.controller';
import { ProductsService } from '../src/services/ProductsService';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('ProductsController (e2e)', () => {
  async function createApp(): Promise<[MongoMemoryServer, INestApplication]> {
    const memDbServer = await MongoMemoryServer.create();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          port: memDbServer.instanceInfo.port,
          name: 'default',
          type: 'mongodb',
          host: memDbServer.instanceInfo.ip,
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
    }).compile();

    const app = moduleFixture.createNestApplication();

    await app.init();

    return Promise.all([memDbServer, app]);
  }

  function createProduct(
    name = 'TEST',
    category = 'TEST',
    amount = 1,
  ): Product {
    const id: any = '98ha81..';
    return {
      id: id,
      commercialName: name,
      ingredients: [
        {
          name: name,
          concentration: {
            unit: 'mg',
            value: 100,
          },
        },
      ],
      quantity: {
        type: 'cp',
        value: 30,
      },
      amount: amount,
      category: category,
      listType: {
        description: 'D1',
        requireRecipe: true,
      },
    };
  }

  it('(GET) [without content]', async () => {
    const [memDbServer, app] = await createApp();

    request(app.getHttpServer()).get('/products').expect(200);

    await app.close();
    await memDbServer.stop();
  });

  it('(GET)', async () => {
    const [memDbServer, app] = await createApp();

    const response1 = await request(app.getHttpServer()).get('/products');

    expect(response1.body).toEqual([]);

    const product: Product = createProduct();

    const ds: DataSource = await app.resolve(DataSource);
    ds.getMongoRepository<Product>('product').save(product);

    const response2 = await request(app.getHttpServer()).get('/products');

    expect(JSON.stringify(response2.body)).toEqual(JSON.stringify([product]));

    await app.close();
    await memDbServer.stop();
  });

  it('(GET) ?name=', async () => {
    const [memDbServer, app] = await createApp();

    const response1 = await request(app.getHttpServer()).get(
      '/products?name=Test',
    );

    expect(response1.body).toEqual([]);

    const product: Product = createProduct('Teste');

    const ds: DataSource = await app.resolve(DataSource);
    ds.getMongoRepository<Product>('product').save(product);

    const response2 = await request(app.getHttpServer()).get(
      '/products?name=Test',
    );

    expect(JSON.stringify(response2.body)).toEqual(JSON.stringify([product]));

    await app.close();
    await memDbServer.stop();
  });

  it('(GET) ?categories[]=', async () => {
    const [memDbServer, app] = await createApp();

    const product1: Product = createProduct('Teste', 'OUTRO_TESTE');

    const ds: DataSource = await app.resolve(DataSource);
    ds.getMongoRepository<Product>('product').save(product1);

    const response1 = await request(app.getHttpServer()).get(
      '/products?categories[]=TESTE',
    );

    expect(response1.body).toEqual([]);

    const product2: Product = createProduct('Teste', 'TESTE');
    ds.getMongoRepository<Product>('product').save(product2);

    const response2 = await request(app.getHttpServer()).get(
      '/products?categories[]=TESTE',
    );

    expect(JSON.stringify(response2.body)).toEqual(JSON.stringify([product2]));

    await app.close();
    await memDbServer.stop();
  });

  it('(GET) ?categories[]= &name=', async () => {
    const [memDbServer, app] = await createApp();

    const product1: Product = createProduct('Teste Um', 'TESTE1');

    const ds: DataSource = await app.resolve(DataSource);
    ds.getMongoRepository<Product>('product').save(product1);

    const response1 = await request(app.getHttpServer()).get(
      '/products?categories[]=TESTE2&name=Um',
    );

    expect(response1.body).toEqual([]);

    const product2: Product = createProduct('Teste Um', 'TESTE2');
    ds.getMongoRepository<Product>('product').save(product2);

    const response2 = await request(app.getHttpServer()).get(
      '/products?categories[]=TESTE2&name=Um',
    );

    expect(JSON.stringify(response2.body)).toEqual(JSON.stringify([product2]));

    await app.close();
    await memDbServer.stop();
  });

  it('(GET) ?orderBy=name&order=ASC/DESC', async () => {
    const [memDbServer, app] = await createApp();

    const product1: Product = createProduct('A');
    const product2: Product = createProduct('B');
    const product3: Product = createProduct('C');

    const ds: DataSource = await app.resolve(DataSource);
    await ds.getMongoRepository<Product>('product').save(product1);
    await ds.getMongoRepository<Product>('product').save(product2);
    await ds.getMongoRepository<Product>('product').save(product3);

    const response1 = await request(app.getHttpServer()).get(
      '/products?orderBy=name&order=ASC',
    );

    expect(JSON.stringify(response1.body)).toEqual(
      JSON.stringify([product1, product2, product3]),
    );

    const response2 = await request(app.getHttpServer()).get(
      '/products?orderBy=name&order=DESC',
    );

    expect(JSON.stringify(response2.body)).toEqual(
      JSON.stringify([product3, product2, product1]),
    );

    await app.close();
    await memDbServer.stop();
  });

  it('(GET) ?orderBy=amount&order=ASC/DESC', async () => {
    const [memDbServer, app] = await createApp();

    const product1: Product = createProduct('Teste', 'TESTE', 1);
    const product2: Product = createProduct('Teste', 'TESTE', 2);
    const product3: Product = createProduct('Teste', 'TESTE', 3);

    const ds: DataSource = await app.resolve(DataSource);
    await ds.getMongoRepository<Product>('product').save(product1);
    await ds.getMongoRepository<Product>('product').save(product2);
    await ds.getMongoRepository<Product>('product').save(product3);

    const response1 = await request(app.getHttpServer()).get(
      '/products?orderBy=amount&order=ASC',
    );

    expect(JSON.stringify(response1.body)).toEqual(
      JSON.stringify([product1, product2, product3]),
    );

    const response2 = await request(app.getHttpServer()).get(
      '/products?orderBy=amount&order=DESC',
    );

    expect(JSON.stringify(response2.body)).toEqual(
      JSON.stringify([product3, product2, product1]),
    );

    await app.close();
    await memDbServer.stop();
  });
});
