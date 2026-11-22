import { useMemo } from "react";
import styles from "./MealForm.module.css";
import { isValidQuantityText, toMealItemInput, type MealFormValues } from "./mealFormValues";
import Field from "../ui/Field";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import MealItemsEditor from "./MealItemsEditor";
import MealSummary from "./MealSummary";
import { calculateMealBreakdown, sumTotals } from "../../utils/nutrition";
import { useFormValidation, type FieldErrors } from "../../hooks/useFormValidation";
import { useItemsById } from "../../hooks/useItemsById";
import {
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  validateDescription,
  validateName,
} from "../../utils/validation";

type MealFormProps = {
  values: MealFormValues;
  onChange: (values: MealFormValues) => void;
  onSubmit: () => void;
  submitLabel: string;
  disabled?: boolean;
  onCancel?: () => void;
};

function validate(values: MealFormValues): FieldErrors<MealFormValues> {
  const errors: FieldErrors<MealFormValues> = {};
  const nameError = validateName(values.name);
  if (nameError) errors.name = nameError;
  const descriptionError = validateDescription(values.description);
  if (descriptionError) errors.description = descriptionError;
  if (!values.date) {
    errors.date = "Selecione a data.";
  }
  if (!values.items || values.items.length === 0) {
    errors.items = "Adicione pelo menos um item.";
  } else if (values.items.some(({ quantity }) => !isValidQuantityText(quantity))) {
    errors.items = "A quantidade de cada item deve ser maior que 0.";
  }
  return errors;
}

export default function MealForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  disabled,
  onCancel,
}: MealFormProps) {
  const { errors, submitted, update, handleSubmit } = useFormValidation({
    values,
    onChange,
    validate,
    onSubmit,
  });
  const itemIds = useMemo(() => values.items.map(({ itemId }) => itemId), [values.items]);
  const { itemsById, missingIds, remember } = useItemsById(itemIds);

  const totals = useMemo(
    () => sumTotals(calculateMealBreakdown(values.items.map(toMealItemInput), itemsById)),
    [values.items, itemsById],
  );

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.section}>
        <div className={styles.grid2}>
          <Field label="Nome da refeição" htmlFor="meal-name" required error={errors.name}>
            <Input
              id="meal-name"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ex: Almoço"
              invalid={!!errors.name}
              maxLength={NAME_MAX_LENGTH}
            />
          </Field>

          <Field label="Data" htmlFor="meal-date" required error={errors.date}>
            <Input
              id="meal-date"
              type="date"
              value={values.date}
              onChange={(e) => update("date", e.target.value)}
              invalid={!!errors.date}
            />
          </Field>
        </div>

        <Field
          label="Descrição"
          htmlFor="meal-description"
          hint="Opcional"
          error={errors.description}
        >
          <Textarea
            id="meal-description"
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Ex: Refeição pós-treino"
            invalid={!!errors.description}
            maxLength={DESCRIPTION_MAX_LENGTH}
            rows={3}
          />
        </Field>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>Itens da refeição</span>

        <MealItemsEditor
          itemsById={itemsById}
          missingIds={missingIds}
          onItemPicked={remember}
          value={values.items}
          onChange={(items) => update("items", items)}
          highlightInvalidQuantities={submitted}
        />
        {errors.items && <Alert variant="warning">{errors.items}</Alert>}
        <MealSummary totals={totals} />
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={disabled}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={disabled}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
