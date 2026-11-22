import styles from "./ItemForm.module.css";
import Field from "../ui/Field";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { useFormValidation, type FieldErrors } from "../../hooks/useFormValidation";
import { isUnit, nutritionBasisLabel } from "../../utils/nutrition";
import { NAME_MAX_LENGTH, validateName } from "../../utils/validation";
import { DECIMAL_MAX_FRACTION_DIGITS, isDecimal } from "../../utils/decimal";
import { decimalInputProps } from "../ui/decimalInputProps";
import { NUTRIENT_FIELDS, type ItemFormValues } from "./itemFormValues";

type ItemFormProps = {
  values: ItemFormValues;
  onChange: (values: ItemFormValues) => void;
  onSubmit: () => void;
  submitLabel: string;
  disabled?: boolean;
  onCancel?: () => void;
};

const EMPTY_NUTRIENT_MESSAGE = "Informe um valor.";
const INVALID_NUTRIENT_MESSAGE = `Informe um número com até ${DECIMAL_MAX_FRACTION_DIGITS} casas decimais.`;

function validateNutrient(text: string): string | undefined {
  if (text === "") return EMPTY_NUTRIENT_MESSAGE;
  if (!isDecimal(text)) return INVALID_NUTRIENT_MESSAGE;
  return undefined;
}

function validate(values: ItemFormValues): FieldErrors<ItemFormValues> {
  const errors: FieldErrors<ItemFormValues> = {};

  const nameError = validateName(values.name);
  if (nameError) errors.name = nameError;

  if (!values.unit) {
    errors.unit = "Selecione uma unidade.";
  }

  NUTRIENT_FIELDS.forEach((field) => {
    const nutrientError = validateNutrient(values[field]);
    if (nutrientError) errors[field] = nutrientError;
  });

  return errors;
}

export default function ItemForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  disabled,
  onCancel,
}: ItemFormProps) {
  const { errors, update, handleSubmit } = useFormValidation({
    values,
    onChange,
    validate,
    onSubmit,
  });

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Informações básicas</span>

        <Field label="Nome" htmlFor="item-name" required error={errors.name}>
          <Input
            id="item-name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ex: Frango grelhado"
            invalid={!!errors.name}
            maxLength={NAME_MAX_LENGTH}
          />
        </Field>

        <Field
          label="Unidade"
          htmlFor="item-unit"
          required
          hint="Base para o cálculo nutricional"
          error={errors.unit}
        >
          <Select
            id="item-unit"
            value={values.unit}
            onChange={(e) => {
              if (isUnit(e.target.value)) update("unit", e.target.value);
            }}
            invalid={!!errors.unit}
          >
            <option value="g">Gramas (g)</option>
            <option value="ml">Mililitros (ml)</option>
            <option value="unit">Unidade</option>
          </Select>
        </Field>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>
          Informações nutricionais
          <span className={styles.sectionHint}>{nutritionBasisLabel(values.unit)}</span>
        </span>

        <div className={styles.grid2}>
          <Field label="Calorias" htmlFor="item-calories" required error={errors.calories}>
            <Input
              id="item-calories"
              {...decimalInputProps(values.calories, (text) => update("calories", text))}
              placeholder="Ex: 165"
              adornment="kcal"
              invalid={!!errors.calories}
            />
          </Field>

          <Field label="Proteínas" htmlFor="item-protein" required error={errors.protein}>
            <Input
              id="item-protein"
              {...decimalInputProps(values.protein, (text) => update("protein", text))}
              placeholder="Ex: 31"
              adornment="g"
              invalid={!!errors.protein}
            />
          </Field>

          <Field
            label="Carboidratos"
            htmlFor="item-carbohydrate"
            required
            error={errors.carbohydrate}
          >
            <Input
              id="item-carbohydrate"
              {...decimalInputProps(values.carbohydrate, (text) => update("carbohydrate", text))}
              placeholder="Ex: 0"
              adornment="g"
              invalid={!!errors.carbohydrate}
            />
          </Field>

          <Field label="Gorduras" htmlFor="item-fat" required error={errors.fat}>
            <Input
              id="item-fat"
              {...decimalInputProps(values.fat, (text) => update("fat", text))}
              placeholder="Ex: 3,6"
              adornment="g"
              invalid={!!errors.fat}
            />
          </Field>
        </div>
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
