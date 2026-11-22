import { ValidationError } from "../error/DomainError";
import { Nutrients } from "../service/calculateNutrients";
import Calories from "../vo/Calories";
import Description from "../vo/Description";
import Macronutrients from "../vo/Macronutrients";
import MealDate from "../vo/MealDate";
import Name from "../vo/Name";
import MealItem from "./MealItem";

export type MealProps = Nutrients & {
  id?: number;
  name: string;
  description: string | null;
  date: string;
  items: MealItem[];
  createdAt: Date;
};

export type CreateMealProps = Pick<MealProps, "name" | "date" | "items"> & {
  description?: string | null | undefined;
};

export default class Meal {
  private id: number | undefined;
  private name: Name;
  private description: Description | null;
  private date: MealDate;
  private items: MealItem[];
  private calories: Calories;
  private macronutrients: Macronutrients;
  private createdAt: Date;

  constructor({
    id,
    name,
    description,
    date,
    items,
    calories,
    carbohydrate,
    protein,
    fat,
    createdAt,
  }: MealProps) {
    this.id = id;
    this.name = new Name(name);
    this.description = description ? new Description(description) : null;
    this.date = new MealDate(date);
    this.items = items;
    this.calories = new Calories(calories);
    this.macronutrients = new Macronutrients({ carbohydrate, protein, fat });
    this.createdAt = createdAt;
  }

  static create(props: CreateMealProps, createdAt: Date) {
    return Meal.build({ ...props, createdAt });
  }

  update(props: CreateMealProps) {
    if (this.id === undefined) throw new ValidationError("Meal must be persisted before update");
    return Meal.build({ ...props, id: this.id, createdAt: this.createdAt });
  }

  private static build({
    items,
    description,
    ...props
  }: CreateMealProps & Pick<MealProps, "id" | "createdAt">) {
    if (items.length === 0) throw new ValidationError("Meal must have at least one item");
    const total = (getValue: (item: MealItem) => number) =>
      items.reduce((sum, item) => sum + getValue(item), 0);
    return new Meal({
      ...props,
      description: description ?? null,
      items,
      calories: total((item) => item.getCalories()),
      carbohydrate: total((item) => item.getMacronutrients().carbohydrate),
      protein: total((item) => item.getMacronutrients().protein),
      fat: total((item) => item.getMacronutrients().fat),
    });
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name.getValue();
  }

  getDescription() {
    return this.description?.getValue() ?? null;
  }

  getDate() {
    return this.date.getValue();
  }

  getItems() {
    return this.items;
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
