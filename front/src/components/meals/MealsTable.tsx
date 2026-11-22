import { Link } from "react-router-dom";
import table from "../ui/Table.module.css";
import styles from "./MealsTable.module.css";
import type { Meal } from "../../types/Meal";
import { formatGrams } from "../../utils/nutrition";
import { formatDateBR } from "../../utils/date";
import { EditIcon, TrashIcon } from "../ui/icons";

type MealsTableProps = {
  meals: Meal[];
  onDelete: (meal: Meal) => void;
};

export default function MealsTable({ meals, onDelete }: MealsTableProps) {
  return (
    <div className={table.wrap}>
      <table className={[table.table, table.list, table.stacked].join(" ")}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Data</th>
            <th className={table.numeric}>Calorias</th>
            <th className={table.numeric}>Proteínas</th>
            <th className={table.numeric}>Carb.</th>
            <th className={table.numeric}>Gord.</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {meals.map((meal) => {
            const { protein, carbohydrate, fat } = meal.macronutrients;
            return (
              <tr key={meal.id}>
                <td className={table.name} data-label="Nome">
                  <Link to={`/meals/${meal.id}`} className={styles.rowLink}>
                    {meal.name}
                  </Link>
                </td>
                <td data-label="Data">{formatDateBR(meal.date)}</td>
                <td className={table.numeric} data-label="Calorias">
                  {Math.round(meal.calories)} kcal
                </td>
                <td className={table.numeric} data-label="Proteínas">
                  {formatGrams(protein)}
                </td>
                <td className={table.numeric} data-label="Carb.">
                  {formatGrams(carbohydrate)}
                </td>
                <td className={table.numeric} data-label="Gord.">
                  {formatGrams(fat)}
                </td>
                <td className={table.actionsCell}>
                  <Link
                    to={`/meals/${meal.id}/edit`}
                    className={table.actionButton}
                    aria-label={`Editar ${meal.name}`}
                    title="Editar"
                  >
                    <EditIcon size={16} />
                  </Link>
                  <button
                    type="button"
                    className={[table.actionButton, table.deleteButton].join(" ")}
                    onClick={() => onDelete(meal)}
                    aria-label={`Excluir ${meal.name}`}
                    title="Excluir"
                  >
                    <TrashIcon size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
