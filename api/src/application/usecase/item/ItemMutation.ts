export type ItemInput = {
  name: string;
  unit: string;
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
};

export type ItemMutationOutput = {
  message: string;
  itemId: number;
};
