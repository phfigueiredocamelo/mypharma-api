import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { Ingredient, ListType, Quantity } from '.';

@Entity()
export class Product {
  @ObjectIdColumn()
  id?: ObjectID;

  @Column()
  commercialName: string;

  @Column()
  ingredients: Ingredient[];

  @Column()
  quantity: Quantity;

  @Column()
  amount: number;

  @Column()
  category: string;

  @Column()
  listType: ListType;
}
