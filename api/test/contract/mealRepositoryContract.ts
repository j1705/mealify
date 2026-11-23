import MealRepository from "../../src/application/repository/MealRepository";
import { steppingCreationTimes } from "../doubles/steppingCreationTimes";
import Item from "../../src/domain/entity/Item";
import Meal, { CreateMealProps } from "../../src/domain/entity/Meal";
import MealItem from "../../src/domain/entity/MealItem";
import { MealNotFoundError } from "../../src/domain/error/DomainError";

export type MealRepositoryHarness = {
  repository: MealRepository;
  persistedItem: Item;
  createUser(): Promise<number>;
  dispose(createdMealIds: number[]): Promise<void>;
};

const UNKNOWN_MEAL_ID = 2_000_000_000;
const DAY_WITHOUT_REAL_MEALS = "2997-06-15";
const DATE_LISTED_BEFORE_ANY_REAL_MEAL = "2999-12-31";
const DAY_FOR_TOTALS = "2997-07-20";
const EMPTY_DAY = "2997-07-21";
const DAY_FOR_OTHER_USER = "2997-08-10";

export function describeMealRepositoryContract(
  createHarness: () => Promise<MealRepositoryHarness>,
) {
  describe("MealRepository contract", () => {
    let harness: MealRepositoryHarness;
    let repository: MealRepository;
    let ownerId: number;
    let otherUserId: number;
    const createdMealIds: number[] = [];

    beforeAll(async () => {
      harness = await createHarness();
      repository = harness.repository;
      ownerId = await harness.createUser();
      otherUserId = await harness.createUser();
    });

    afterAll(async () => {
      await harness.dispose(createdMealIds);
    });

    const nextCreatedAt = steppingCreationTimes();
    const runTag = `M${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

    function mealProps(overrides: Partial<CreateMealProps> = {}): CreateMealProps {
      return {
        userId: ownerId,
        name: "Lunch",
        description: "Rice",
        date: "2026-11-06",
        items: [MealItem.create(harness.persistedItem, 150)],
        ...overrides,
      };
    }

    let lastCreatedAt: Date | undefined;

    async function save(overrides: Partial<CreateMealProps> = {}) {
      const createdAt = nextCreatedAt();
      const { mealId } = await repository.saveMeal(Meal.create(mealProps(overrides), createdAt));
      createdMealIds.push(mealId);
      lastCreatedAt = createdAt;
      return mealId;
    }

    test("Should save a meal with its items and read it back by id", async () => {
      const mealId = await save();

      const meal = await repository.getMealById(ownerId, mealId);

      expect(meal).toBeInstanceOf(Meal);
      expect(meal?.getId()).toBe(mealId);
      expect(meal?.getUserId()).toBe(ownerId);
      expect(meal?.getName()).toBe("Lunch");
      expect(meal?.getDescription()).toBe("Rice");
      expect(meal?.getDate()).toBe("2026-11-06");
      expect(meal?.getCreatedAt()).toEqual(lastCreatedAt);
      expect(meal?.getCalories()).toBeCloseTo(195);
      expect(meal?.getItems()).toHaveLength(1);
      expect(meal?.getItems()[0]?.getItemId()).toBe(harness.persistedItem.getId());
      expect(meal?.getItems()[0]?.getName()).toBe(harness.persistedItem.getName());
      expect(meal?.getItems()[0]?.getUnit()).toBe("g");
      expect(meal?.getItems()[0]?.getQuantity()).toBe(150);
      expect(meal?.getItems()[0]?.getMacronutrients().protein).toBeCloseTo(4.05);
    });

    test("Should return null for an unknown id", async () => {
      expect(await repository.getMealById(ownerId, UNKNOWN_MEAL_ID)).toBeNull();
    });

    test("Should update a meal replacing its items and keeping its creation date", async () => {
      const mealId = await save();
      const saved = (await repository.getMealById(ownerId, mealId))!;
      const item = harness.persistedItem;

      const result = await repository.updateMeal(
        saved.update(
          mealProps({
            name: "Brunch",
            description: "Bigger",
            date: "2026-10-31",
            items: [MealItem.create(item, 100), MealItem.create(item, 20)],
          }),
        ),
      );

      expect(result).toEqual({ mealId });
      const updated = await repository.getMealById(ownerId, mealId);
      expect(updated?.getName()).toBe("Brunch");
      expect(updated?.getDescription()).toBe("Bigger");
      expect(updated?.getDate()).toBe("2026-10-31");
      expect(updated?.getCreatedAt()).toEqual(saved.getCreatedAt());
      expect(updated?.getItems().map((mealItem) => mealItem.getQuantity())).toEqual([100, 20]);
      expect(updated?.getCalories()).toBeCloseTo(156);
    });

    test("Should throw MealNotFoundError when updating an unknown meal", async () => {
      const mealId = await save();
      const saved = (await repository.getMealById(ownerId, mealId))!;
      await repository.deleteMeal(ownerId, mealId);

      await expect(repository.updateMeal(saved.update(mealProps()))).rejects.toThrow(
        MealNotFoundError,
      );
      expect(await repository.getMealById(ownerId, mealId)).toBeNull();
    });

    test("Should delete a meal", async () => {
      const mealId = await save();

      await repository.deleteMeal(ownerId, mealId);

      expect(await repository.getMealById(ownerId, mealId)).toBeNull();
    });

    test("Should list meals by most recent date, newest first, with the total", async () => {
      const before = await repository.getMeals(ownerId, { page: 1, limit: 1 });
      const first = await save({ date: DATE_LISTED_BEFORE_ANY_REAL_MEAL });
      const second = await save({ date: DATE_LISTED_BEFORE_ANY_REAL_MEAL });

      const page1 = await repository.getMeals(ownerId, { page: 1, limit: 2 });
      const page2 = await repository.getMeals(ownerId, { page: 2, limit: 1 });

      expect(page1.meals.map((meal) => meal.getId())).toEqual([second, first]);
      expect(page2.meals.map((meal) => meal.getId())).toEqual([first]);
      expect(page1.total).toBe(before.total + 2);
      expect(page1.meals[0]?.getItems()).toHaveLength(1);
    });

    test("Should list each meal with only its own items, in insertion order", async () => {
      const item = harness.persistedItem;
      const single = await save({
        date: DATE_LISTED_BEFORE_ANY_REAL_MEAL,
        items: [MealItem.create(item, 150)],
      });
      const double = await save({
        date: DATE_LISTED_BEFORE_ANY_REAL_MEAL,
        items: [MealItem.create(item, 100), MealItem.create(item, 20)],
      });

      const { meals } = await repository.getMeals(ownerId, { page: 1, limit: 2 });
      const quantitiesByMealId = new Map(
        meals.map((meal) => [meal.getId(), meal.getItems().map((i) => i.getQuantity())]),
      );

      expect(quantitiesByMealId.get(single)).toEqual([150]);
      expect(quantitiesByMealId.get(double)).toEqual([100, 20]);
    });

    test("Should search by part of the name ignoring case and accents, counting only matches", async () => {
      const lunch = await save({ name: `${runTag} Jalapeño lunch`, date: "2026-11-01" });
      const breakfast = await save({ name: `${runTag} jalapeno breakfast`, date: "2026-11-02" });
      await save({ name: `${runTag} Dinner`, date: "2026-11-03" });

      const { meals, total } = await repository.getMeals(ownerId, {
        page: 1,
        limit: 10,
        search: `${runTag} JALAPEÑO`,
      });

      expect(meals.map((meal) => meal.getId())).toEqual([breakfast, lunch]);
      expect(total).toBe(2);
    });

    test("Should paginate the search results", async () => {
      const first = await save({ name: `${runTag} Snack 1`, date: "2026-10-01" });
      await save({ name: `${runTag} Snack 2`, date: "2026-10-02" });

      const page2 = await repository.getMeals(ownerId, {
        page: 2,
        limit: 1,
        search: `${runTag} snack`,
      });

      expect(page2.meals.map((meal) => meal.getId())).toEqual([first]);
      expect(page2.total).toBe(2);
    });

    test("Should filter by date", async () => {
      const onTheDay = await save({ name: `${runTag} On the day`, date: DAY_WITHOUT_REAL_MEALS });
      const dayBefore = await save({ name: `${runTag} Day before`, date: "2997-06-14" });

      const { meals, total } = await repository.getMeals(ownerId, {
        page: 1,
        limit: 100,
        date: DAY_WITHOUT_REAL_MEALS,
      });

      const ids = meals.map((meal) => meal.getId());
      expect(ids).toContain(onTheDay);
      expect(ids).not.toContain(dayBefore);
      expect(meals.every((meal) => meal.getDate() === DAY_WITHOUT_REAL_MEALS)).toBe(true);
      expect(total).toBe(meals.length);
    });

    test("Should sum the meals of a day, however many there are", async () => {
      const item = harness.persistedItem;
      await save({ date: DAY_FOR_TOTALS, items: [MealItem.create(item, 150)] });
      await save({ date: DAY_FOR_TOTALS, items: [MealItem.create(item, 50)] });
      await save({ date: "2997-07-19", items: [MealItem.create(item, 100)] });

      const totals = await repository.getDailyTotals(ownerId, DAY_FOR_TOTALS);

      const perGram = (value: number) => (value / item.getUnitBase()) * 200;
      const { carbohydrate, protein, fat } = item.getMacronutrients();
      expect(totals.mealCount).toBe(2);
      expect(totals.calories).toBeCloseTo(perGram(item.getCalories()));
      expect(totals.carbohydrate).toBeCloseTo(perGram(carbohydrate));
      expect(totals.protein).toBeCloseTo(perGram(protein));
      expect(totals.fat).toBeCloseTo(perGram(fat));
    });

    test("Should answer zero totals for a day without meals", async () => {
      expect(await repository.getDailyTotals(ownerId, EMPTY_DAY)).toEqual({
        mealCount: 0,
        calories: 0,
        carbohydrate: 0,
        protein: 0,
        fat: 0,
      });
    });

    test("Should treat %, _ and \\ in the search term literally", async () => {
      const literal = await save({ name: `${runTag} 100% oat_meal\\` });
      await save({ name: `${runTag} 1000 oatXmeal` });

      const { meals } = await repository.getMeals(ownerId, {
        page: 1,
        limit: 10,
        search: `${runTag} 100% oat_meal\\`,
      });

      expect(meals.map((meal) => meal.getId())).toEqual([literal]);
    });

    describe("owned by another user", () => {
      let othersMealId: number;

      beforeAll(async () => {
        othersMealId = await save({ userId: otherUserId, date: DAY_FOR_OTHER_USER });
      });

      test("Should not find a meal of another user by id", async () => {
        expect(await repository.getMealById(ownerId, othersMealId)).toBeNull();
        expect((await repository.getMealById(otherUserId, othersMealId))?.getId()).toBe(
          othersMealId,
        );
      });

      test("Should not list nor count the meals of another user", async () => {
        const { meals, total } = await repository.getMeals(ownerId, {
          page: 1,
          limit: 100,
          date: DAY_FOR_OTHER_USER,
        });

        expect(meals).toEqual([]);
        expect(total).toBe(0);
      });

      test("Should not sum the meals of another user", async () => {
        expect((await repository.getDailyTotals(ownerId, DAY_FOR_OTHER_USER)).mealCount).toBe(0);
        expect((await repository.getDailyTotals(otherUserId, DAY_FOR_OTHER_USER)).mealCount).toBe(
          1,
        );
      });

      test("Should refuse to update a meal of another user", async () => {
        const impostor = ownedBy(
          ownerId,
          (await repository.getMealById(otherUserId, othersMealId))!,
        );

        await expect(
          repository.updateMeal(impostor.update(mealProps({ name: "Stolen" }))),
        ).rejects.toThrow(MealNotFoundError);
        expect((await repository.getMealById(otherUserId, othersMealId))?.getName()).toBe("Lunch");
      });

      test("Should not delete a meal of another user", async () => {
        await repository.deleteMeal(ownerId, othersMealId);

        expect(await repository.getMealById(otherUserId, othersMealId)).not.toBeNull();
      });
    });
  });
}

function ownedBy(userId: number, meal: Meal): Meal {
  return new Meal({
    id: meal.getId()!,
    userId,
    name: meal.getName(),
    description: meal.getDescription(),
    date: meal.getDate(),
    items: meal.getItems(),
    calories: meal.getCalories(),
    ...meal.getMacronutrients(),
    createdAt: meal.getCreatedAt(),
  });
}
