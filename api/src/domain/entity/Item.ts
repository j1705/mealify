import { ValidationError } from "../error/DomainError";
import Calories from "../vo/Calories";
import Macronutrients, { MacronutrientsValues } from "../vo/Macronutrients";
import Name from "../vo/Name";
import Unit from "../vo/Unit";

export type ItemProps = MacronutrientsValues & {
  id?: number;
  name: string;
  unit: string;
  calories: number;
  createdAt: Date;
};

export type CreateItemProps = Omit<ItemProps, "id" | "createdAt">;

export default class Item {
  private id: number | undefined;
  private name: Name;
  private unit: Unit;
  private calories: Calories;
  private macronutrients: Macronutrients;
  private createdAt: Date;

  constructor({ id, name, unit, calories, carbohydrate, protein, fat, createdAt }: ItemProps) {
    this.id = id;
    this.name = new Name(name);
    this.unit = new Unit(unit);
    this.calories = new Calories(calories);
    this.macronutrients = new Macronutrients({ carbohydrate, protein, fat });
    this.createdAt = createdAt;
  }

  static create(props: CreateItemProps, createdAt: Date) {
    return new Item({ ...props, createdAt });
  }

  update(props: CreateItemProps) {
    if (this.id === undefined) throw new ValidationError("Item must be persisted before update");
    return new Item({ ...props, id: this.id, createdAt: this.createdAt });
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name.getValue();
  }

  getUnit() {
    return this.unit.getValue();
  }

  getUnitBase() {
    return this.unit.getBase();
  }

  getCalories() {
    return this.calories.getValue();
  }

  getMacronutrients() {
    return this.macronutrients.toValues();
  }

  getCreatedAt() {
    return this.createdAt;
  }
}
