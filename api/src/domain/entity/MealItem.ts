import { ValidationError } from "../error/DomainError";
import calculateNutrients, { Nutrients } from "../service/calculateNutrients";
import Calories from "../vo/Calories";
import Macronutrients from "../vo/Macronutrients";
import Name from "../vo/Name";
import Quantity from "../vo/Quantity";
import Unit from "../vo/Unit";
import Item from "./Item";

export type MealItemProps = Nutrients & {
  itemId: number;
  name: string;
  unit: string;
  quantity: number;
};

export default class MealItem {
  private itemId: number;
  private name: Name;
  private unit: Unit;
  private quantity: Quantity;
  private calories: Calories;
  private macronutrients: Macronutrients;

  constructor({
    itemId,
    name,
    unit,
    quantity,
    calories,
    carbohydrate,
    protein,
    fat,
  }: MealItemProps) {
    this.itemId = itemId;
    this.name = new Name(name);
    this.unit = new Unit(unit);
    this.quantity = new Quantity(quantity);
    this.calories = new Calories(calories);
    this.macronutrients = new Macronutrients({ carbohydrate, protein, fat });
  }

  static create(item: Item, quantity: number) {
    const itemId = item.getId();
    if (itemId === undefined) throw new ValidationError("Item must be persisted before use");
    const validQuantity = new Quantity(quantity).getValue();
    return new MealItem({
      itemId,
      name: item.getName(),
      unit: item.getUnit(),
      quantity: validQuantity,
      ...calculateNutrients(item, validQuantity),
    });
  }

  getItemId() {
    return this.itemId;
  }

  getName() {
    return this.name.getValue();
  }

  getUnit() {
    return this.unit.getValue();
  }

  getQuantity() {
    return this.quantity.getValue();
  }

  getCalories() {
    return this.calories.getValue();
  }

  getMacronutrients() {
    return this.macronutrients.toValues();
  }
}
