import table from "../ui/Table.module.css";
import type { MealItem } from "../../types/Meal";
import { formatGrams, formatKcal, unitLabel } from "../../utils/nutrition";

type MealCompositionTableProps = {
  items: MealItem[];
};

const COLUMN = {
  item: "Item",
  quantity: "Quantidade",
  calories: "Kcal",
  macros: "P / C / G",
} as const;

export default function MealCompositionTable({ items }: MealCompositionTableProps) {
  return (
    <div className={table.wrap}>
      <table className={[table.table, table.stacked].join(" ")}>
        <thead>
          <tr>
            <th>{COLUMN.item}</th>
            <th>{COLUMN.quantity}</th>
            <th className={table.numeric}>{COLUMN.calories}</th>
            <th className={table.numeric}>{COLUMN.macros}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.itemId}>
              <td data-label={COLUMN.item}>{row.name}</td>
              <td data-label={COLUMN.quantity}>
                {row.quantity} {unitLabel(row.unit)}
              </td>
              <td className={table.numeric} data-label={COLUMN.calories}>
                {formatKcal(row.calories)}
              </td>
              <td className={table.numeric} data-label={COLUMN.macros}>
                {formatGrams(row.macronutrients.protein)} /{" "}
                {formatGrams(row.macronutrients.carbohydrate)} /{" "}
                {formatGrams(row.macronutrients.fat)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
