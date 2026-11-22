import { Link } from "react-router-dom";
import table from "../ui/Table.module.css";
import type { Item } from "../../types/Item";
import { unitLabel } from "../../utils/nutrition";
import { EditIcon, TrashIcon } from "../ui/icons";

type ItemsTableProps = {
  items: Item[];
  onDelete: (item: Item) => void;
};

export default function ItemsTable({ items, onDelete }: ItemsTableProps) {
  return (
    <div className={table.wrap}>
      <table className={[table.table, table.list, table.stacked].join(" ")}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Unidade</th>
            <th className={table.numeric}>Kcal</th>
            <th className={table.numeric}>Proteínas</th>
            <th className={table.numeric}>Carboidratos</th>
            <th className={table.numeric}>Gorduras</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className={table.name} data-label="Nome">
                {item.name}
              </td>
              <td data-label="Unidade">{unitLabel(item.unit)}</td>
              <td className={table.numeric} data-label="Kcal">
                {item.calories}
              </td>
              <td className={table.numeric} data-label="Proteínas">
                {item.macronutrients.protein}g
              </td>
              <td className={table.numeric} data-label="Carboidratos">
                {item.macronutrients.carbohydrate}g
              </td>
              <td className={table.numeric} data-label="Gorduras">
                {item.macronutrients.fat}g
              </td>
              <td className={table.actionsCell}>
                <Link
                  to={`/items/${item.id}/edit`}
                  className={table.actionButton}
                  aria-label={`Editar ${item.name}`}
                  title="Editar"
                >
                  <EditIcon size={16} />
                </Link>
                <button
                  type="button"
                  className={[table.actionButton, table.deleteButton].join(" ")}
                  onClick={() => onDelete(item)}
                  aria-label={`Excluir ${item.name}`}
                  title="Excluir"
                >
                  <TrashIcon size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
