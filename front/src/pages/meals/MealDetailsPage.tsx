import { useNavigate } from "react-router-dom";
import styles from "./MealDetailsPage.module.css";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import { useMeal } from "../../hooks/useMeal";
import { useNumericParam } from "../../hooks/useNumericParam";
import { deleteMeal } from "../../services/mealService";
import type { Meal } from "../../types/Meal";
import PageHeader from "../../components/ui/PageHeader";
import Card, { CardHeader } from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { SkeletonRows } from "../../components/ui/Skeleton";
import MacroDonut from "../../components/meals/MacroDonut";
import MacroStatCards from "../../components/meals/MacroStatCards";
import MealCompositionTable from "../../components/meals/MealCompositionTable";
import { macroPercentages, macroSegments, toMacroTotals } from "../../utils/nutrition";
import { formatFullDateBR } from "../../utils/date";
import { EditIcon, TrashIcon } from "../../components/ui/icons";

export default function MealDetailsPage() {
  const mealId = useNumericParam("mealId");
  const navigate = useNavigate();
  const { data: meal, loading, error, reload } = useMeal(mealId);
  const deletion = useDeleteConfirmation<Meal>({
    remove: (target) => deleteMeal(target.id),
    successMessage: "Refeição excluída com sucesso.",
    fallbackErrorMessage: "Não foi possível excluir a refeição",
    onDeleted: () => navigate("/meals"),
  });

  if (loading) {
    return (
      <section>
        <PageHeader title="Refeição" backTo="/meals" />
        <Card>
          <SkeletonRows rows={6} height={30} />
        </Card>
      </section>
    );
  }

  if (error || !meal) {
    return (
      <section>
        <PageHeader title="Refeição" backTo="/meals" />
        <Card>
          <Alert
            variant="error"
            title="Não foi possível carregar a refeição"
            actions={
              <Button size="sm" variant="secondary" onClick={reload}>
                Tentar novamente
              </Button>
            }
          >
            {error ?? "Refeição não encontrada."}
          </Alert>
        </Card>
      </section>
    );
  }

  const totals = toMacroTotals(meal);
  const percentages = macroPercentages(totals);

  return (
    <section>
      <PageHeader
        title={meal.name}
        subtitle={formatFullDateBR(meal.date)}
        backTo="/meals"
        actions={
          <>
            <Button
              variant="secondary"
              to={`/meals/${meal.id}/edit`}
              leftIcon={<EditIcon size={16} />}
            >
              Editar
            </Button>
            <Button
              variant="dangerSolid"
              leftIcon={<TrashIcon size={16} />}
              onClick={() => deletion.ask(meal)}
            >
              Excluir
            </Button>
          </>
        }
      />

      {meal.description && <p className={styles.description}>{meal.description}</p>}

      <div className={styles.statsGrid}>
        <MacroStatCards totals={totals} caloriesLabel="Calorias totais" />
      </div>

      <div className={styles.sections}>
        <Card>
          <CardHeader title="Composição da refeição" />
          <MealCompositionTable items={meal.items} />
        </Card>

        {totals.calories > 0 && (
          <Card>
            <CardHeader title="Distribuição dos macros" />
            <MacroDonut
              centerValue={String(Math.round(totals.calories))}
              centerLabel="kcal"
              segments={macroSegments(percentages)}
            />
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={deletion.target !== null}
        title={`Excluir "${meal.name}"?`}
        description="Essa ação não pode ser desfeita."
        loading={deletion.deleting}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </section>
  );
}
