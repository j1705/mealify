import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MealForm from "../../components/meals/MealForm";
import { useMeal } from "../../hooks/useMeal";
import { useNumericParam } from "../../hooks/useNumericParam";
import { updateMeal } from "../../services/mealService";
import {
  toMealFormValues,
  toMealInput,
  type MealFormValues,
} from "../../components/meals/mealFormValues";
import SaveErrorAlert from "../../components/ui/SaveErrorAlert";
import { useSaveAction } from "../../hooks/useSaveAction";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import { SkeletonRows } from "../../components/ui/Skeleton";

export default function MealEditPage() {
  const mealId = useNumericParam("mealId");
  const { data: meal, loading, error, reload } = useMeal(mealId);

  return (
    <section>
      <PageHeader
        title="Editar refeição"
        subtitle="Atualize os itens e informações desta refeição."
        backTo="/meals"
      />

      {loading && (
        <Card>
          <SkeletonRows rows={6} height={40} />
        </Card>
      )}

      {!loading && error && (
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
            {error}
          </Alert>
        </Card>
      )}

      {!loading && meal && (
        <MealEditForm key={meal.id} mealId={meal.id} initial={toMealFormValues(meal)} />
      )}
    </section>
  );
}

function MealEditForm({ mealId, initial }: { mealId: number; initial: MealFormValues }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const { saving, error, submit } = useSaveAction({
    save: () => updateMeal(mealId, toMealInput(values)),
    successMessage: "Refeição atualizada com sucesso!",
    redirectTo: "/meals",
  });

  return (
    <>
      <SaveErrorAlert error={error} />
      <Card>
        <MealForm
          values={values}
          onChange={setValues}
          onSubmit={submit}
          submitLabel={saving ? "Salvando..." : "Salvar"}
          disabled={saving}
          onCancel={() => navigate("/meals")}
        />
      </Card>
    </>
  );
}
