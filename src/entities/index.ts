export interface Ingredient {
  readonly name: string;
  readonly concentration: Concentration;
}

export interface Concentration {
  readonly unit: string;
  readonly value: number;
}

export interface Quantity {
  readonly type: string;
  readonly value: number;
}

export interface ListType {
  readonly description: string;
  requireRecipe: boolean;
}
