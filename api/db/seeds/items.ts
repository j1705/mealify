import Clock from "../../src/application/clock/Clock";
import ItemRepository from "../../src/application/repository/ItemRepository";
import Item, { CreateItemProps } from "../../src/domain/entity/Item";
import { ItemAlreadyRegisteredError } from "../../src/domain/error/DomainError";
import { readDatabaseConfig } from "../../src/infra/database/DatabaseConfig";
import { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import SystemClock from "../../src/infra/clock/SystemClock";
import ItemRepositoryDatabase from "../../src/infra/repositoryDatabase/item/ItemRepositoryDatabase";

type SeedItem = [
  name: string,
  unit: string,
  calories: number,
  protein: number,
  carbohydrate: number,
  fat: number,
  source: string,
];

export const ITEMS: SeedItem[] = [
  ["Arroz branco cozido", "g", 128, 2.5, 28.1, 0.2, "TACO #3"],
  ["Arroz integral cozido", "g", 124, 2.6, 25.8, 1.0, "TACO #1"],
  ["Feijão carioca cozido", "g", 76, 4.8, 13.6, 0.5, "TACO #561"],
  ["Feijão preto cozido", "g", 77, 4.5, 14.0, 0.5, "TACO #567"],
  ["Macarrão de trigo cru", "g", 371, 10.0, 77.9, 1.3, "TACO #40"],
  ["Batata inglesa cozida", "g", 52, 1.2, 11.9, 0.0, "TACO #91"],
  ["Batata doce cozida", "g", 77, 0.6, 18.4, 0.1, "TACO #88"],
  ["Mandioca cozida", "g", 125, 0.6, 30.1, 0.3, "TACO #129"],
  ["Peito de frango sem pele grelhado", "g", 159, 32.0, 0.0, 2.5, "TACO #410"],
  ["Patinho bovino grelhado", "g", 219, 35.9, 0.0, 7.3, "TACO #377"],
  ["Carne moída (acém) cozida", "g", 212, 26.7, 0.0, 10.9, "TACO #326"],
  ["Atum em conserva em óleo", "g", 166, 26.2, 0.0, 6.0, "TACO #277"],
  ["Ovo de galinha grande", "unit", 72, 6.3, 0.4, 4.8, "manual entry, not from TACO"],
  ["Leite integral", "ml", 65, 2.35, 7.16, 3.04, "TBCA BRC0044G"],
  ["Leite desnatado", "ml", 37, 3.12, 5.14, 0.4, "TBCA BRC0036G"],
  ["Iogurte natural", "g", 51, 4.1, 1.9, 3.0, "TACO #448"],
  ["Queijo minas frescal", "g", 264, 17.4, 3.2, 20.2, "TACO #461"],
  ["Queijo muçarela", "g", 330, 22.6, 3.0, 25.2, "TACO #463"],
  ["Requeijão cremoso", "g", 257, 9.6, 2.4, 23.4, "TACO #468"],
  ["Pão francês", "g", 300, 8.0, 58.6, 3.1, "TACO #53"],
  ["Pão de forma integral", "g", 253, 9.4, 49.9, 3.7, "TACO #52"],
  ["Aveia em flocos", "g", 394, 13.9, 66.6, 8.5, "TACO #7"],
  ["Banana prata", "g", 98, 1.3, 26.0, 0.1, "TACO #182"],
  ["Maçã fuji com casca", "g", 56, 0.3, 15.2, 0.0, "TACO #222"],
  ["Laranja pera", "g", 37, 1.0, 8.9, 0.1, "TACO #214"],
  ["Mamão papaia", "g", 40, 0.5, 10.4, 0.1, "TACO #226"],
  ["Abacate", "g", 96, 1.2, 6.0, 8.4, "TACO #163"],
  ["Alface crespa crua", "g", 11, 1.3, 1.7, 0.2, "TACO #78"],
  ["Tomate cru", "g", 15, 1.1, 3.1, 0.2, "TACO #157"],
  ["Cenoura crua", "g", 34, 1.3, 7.7, 0.2, "TACO #110"],
  ["Brócolis cozido", "g", 25, 2.1, 4.4, 0.5, "TACO #100"],
  ["Azeite de oliva extra virgem", "g", 884, 0.0, 0.0, 100.0, "TACO #260"],
  ["Manteiga com sal", "g", 726, 0.4, 0.1, 82.4, "TACO #261"],
  ["Amendoim torrado salgado", "g", 606, 22.5, 18.7, 54.0, "TACO #558"],
  ["Café coado sem açúcar", "ml", 9, 0.7, 1.5, 0.1, "TACO #471"],
];

export function toCreateItemProps([
  name,
  unit,
  calories,
  protein,
  carbohydrate,
  fat,
]: SeedItem): CreateItemProps {
  return { name, unit, calories, protein, carbohydrate, fat };
}

export async function seedItems(
  repository: ItemRepository,
  clock: Clock,
): Promise<{ created: string[]; skipped: string[] }> {
  const created: string[] = [];
  const skipped: string[] = [];
  for (const seedItem of ITEMS) {
    const item = Item.create(toCreateItemProps(seedItem), clock.now());
    try {
      await repository.saveItem(item);
      created.push(item.getName());
    } catch (error) {
      if (!(error instanceof ItemAlreadyRegisteredError)) throw error;
      skipped.push(item.getName());
    }
  }
  return { created, skipped };
}

async function main() {
  const connection = new PgPromiseAdapter(readDatabaseConfig());
  try {
    const { created, skipped } = await seedItems(
      new ItemRepositoryDatabase(connection),
      new SystemClock(),
    );
    for (const name of created) console.log(`created: ${name}`);
    console.log(`\n${created.length} created, ${skipped.length} already registered.`);
  } finally {
    await connection.close();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
