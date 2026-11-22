import { ValidationError } from "../error/DomainError";
import { isNonNegativeNumber } from "./validators";

export type MacronutrientsValues = {
  carbohydrate: number;
  protein: number;
  fat: number;
};

export default class Macronutrients {
  private carbohydrate: number;
  private protein: number;
  private fat: number;

  constructor({ carbohydrate, protein, fat }: MacronutrientsValues) {
    if (!isNonNegativeNumber(carbohydrate)) throw new ValidationError("Invalid Carbohydrate");
    if (!isNonNegativeNumber(protein)) throw new ValidationError("Invalid Protein");
    if (!isNonNegativeNumber(fat)) throw new ValidationError("Invalid Fat");
    this.carbohydrate = carbohydrate;
    this.protein = protein;
    this.fat = fat;
  }

  getCarbohydrate() {
    return this.carbohydrate;
  }

  getProtein() {
    return this.protein;
  }

  getFat() {
    return this.fat;
  }

  toValues(): MacronutrientsValues {
    return { carbohydrate: this.carbohydrate, protein: this.protein, fat: this.fat };
  }
}
