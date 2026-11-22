import { useMemo, useState } from "react";
import styles from "./MealItemsEditor.module.css";
import table from "../ui/Table.module.css";
import type { Item } from "../../types/Item";
import { isValidQuantityText, toMealItemInput, type MealItemDraft } from "./mealFormValues";
import { decimalInputProps } from "../ui/decimalInputProps";
import SearchInput from "../ui/SearchInput";
import { TrashIcon } from "../ui/icons";
import EmptyState from "../ui/EmptyState";
import {
  calculateMealBreakdown,
  formatGrams,
  formatKcal,
  nutritionBasis,
  unitBase,
  unitLabel,
} from "../../utils/nutrition";
import { compareByName } from "../../utils/text";
import { useItemList } from "../../hooks/useItemList";
import { MAX_SEARCH_LENGTH } from "../../utils/validation";
import { formatDecimal } from "../../utils/decimal";

const SUGGESTIONS_LIMIT = 20;

const COLUMN = {
  item: "Item",
  quantity: "Quantidade",
  calories: "Kcal",
  macros: "P / C / G",
} as const;

type MealItemsEditorProps = {
  itemsById: Map<number, Item>;
  missingIds: Set<number>;
  onItemPicked: (item: Item) => void;
  value: MealItemDraft[];
  onChange: (items: MealItemDraft[]) => void;
  highlightInvalidQuantities?: boolean;
};

export default function MealItemsEditor({
  itemsById,
  missingIds,
  onItemPicked,
  value,
  onChange,
  highlightInvalidQuantities = false,
}: MealItemsEditorProps) {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {
    items: results,
    searchedTerm,
    loading,
    error,
  } = useItemList({ search, page: 1, limit: SUGGESTIONS_LIMIT });

  const addedIds = useMemo(() => new Set(value.map((entry) => entry.itemId)), [value]);

  const suggestions = useMemo(
    () => results.filter((item) => !addedIds.has(item.id)).sort(compareByName),
    [results, addedIds],
  );

  const breakdown = useMemo(
    () => calculateMealBreakdown(value.map(toMealItemInput), itemsById),
    [value, itemsById],
  );

  function itemName(itemId: number, item: Item | undefined): string {
    if (item) return item.name;
    return missingIds.has(itemId) ? "Item removido" : "Carregando...";
  }

  function addItem(item: Item) {
    onItemPicked(item);
    onChange([...value, { itemId: item.id, quantity: formatDecimal(unitBase(item.unit)) }]);
    setSearch("");
    setDropdownOpen(false);
  }

  function updateQuantity(itemId: number, quantity: string) {
    onChange(value.map((entry) => (entry.itemId === itemId ? { ...entry, quantity } : entry)));
  }

  function removeItem(itemId: number) {
    onChange(value.filter((entry) => entry.itemId !== itemId));
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.searchWrap}>
        <SearchInput
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
          placeholder="Buscar item..."
          maxLength={MAX_SEARCH_LENGTH}
        />
        {dropdownOpen && (
          <div className={styles.dropdown}>
            {error && <div className={styles.dropdownEmpty}>{error}</div>}
            {!error && suggestions.length === 0 && (
              <div className={styles.dropdownEmpty}>
                {loading
                  ? "Buscando..."
                  : searchedTerm === "" && results.length === 0
                    ? "Nenhum item cadastrado ainda."
                    : "Nenhum item encontrado."}
              </div>
            )}
            {suggestions.map((item) => (
              <button
                type="button"
                key={item.id}
                className={styles.dropdownItem}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addItem(item)}
              >
                <span>{item.name}</span>
                <span className={styles.dropdownItemMeta}>
                  {item.calories} kcal / {nutritionBasis(item.unit)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {breakdown.length === 0 ? (
        <EmptyState
          title="Nenhum item adicionado"
          description="Busque acima e adicione os itens desta refeição."
        />
      ) : (
        <div className={[table.wrap, styles.tableFrame].join(" ")}>
          <table className={[table.table, table.stacked].join(" ")}>
            <thead>
              <tr>
                <th>{COLUMN.item}</th>
                <th>{COLUMN.quantity}</th>
                <th className={table.numeric}>{COLUMN.calories}</th>
                <th className={table.numeric}>{COLUMN.macros}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row, index) => (
                <tr key={row.itemId}>
                  <td className={table.name} data-label={COLUMN.item}>
                    {itemName(row.itemId, row.item)}
                  </td>
                  <td data-label={COLUMN.quantity}>
                    <div className={styles.quantityCell}>
                      <QuantityInput
                        text={value[index].quantity}
                        itemName={row.item?.name ?? "item"}
                        highlightInvalid={highlightInvalidQuantities}
                        onChange={(text) => updateQuantity(row.itemId, text)}
                      />
                      <span className={styles.unitLabel}>
                        {row.item ? unitLabel(row.item.unit) : ""}
                      </span>
                    </div>
                  </td>
                  <td className={table.numeric} data-label={COLUMN.calories}>
                    {formatKcal(row.calories)}
                  </td>
                  <td className={table.numeric} data-label={COLUMN.macros}>
                    {formatGrams(row.protein)} / {formatGrams(row.carbohydrate)} /{" "}
                    {formatGrams(row.fat)}
                  </td>
                  <td className={table.actionsCell}>
                    <button
                      type="button"
                      className={[table.actionButton, table.deleteButton].join(" ")}
                      onClick={() => removeItem(row.itemId)}
                      aria-label={`Remover ${row.item?.name ?? "item"}`}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type QuantityInputProps = {
  text: string;
  itemName: string;
  highlightInvalid: boolean;
  onChange: (text: string) => void;
};

function QuantityInput({ text, itemName, highlightInvalid, onChange }: QuantityInputProps) {
  const invalid = highlightInvalid && !isValidQuantityText(text);
  return (
    <input
      className={[styles.quantityInput, invalid ? styles.quantityInputInvalid : ""].join(" ")}
      aria-invalid={invalid}
      aria-label={`Quantidade de ${itemName}`}
      {...decimalInputProps(text, onChange)}
    />
  );
}
