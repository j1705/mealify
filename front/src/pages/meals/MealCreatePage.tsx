import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MealForm from "../../components/meals/MealForm";
import { createMeal } from "../../services/mealService";
import { toMealInput, type MealFormValues } from "../../components/meals/mealFormValues";
import SaveErrorAlert from "../../components/ui/SaveErrorAlert";
import { useSaveAction } from "../../hooks/useSaveAction";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import { todayISODate } from "../../utils/date";

function emptyMeal(): MealFormValues {
  return { name: "", description: "", date: todayISODate(), items: [] };
}

export default function MealCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<MealFormValues>(emptyMeal());
  const { saving, error, submit } = useSaveAction({
    save: () => createMeal(toMealInput(values)),
    successMessage: "Refeição criada com sucesso!",
    redirectTo: "/meals",
  });

  return (
    <section>
      <PageHeader
        title="Nova refeição"
        subtitle="Monte sua refeição e veja o valor nutricional."
        backTo="/meals"
      />

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
    </section>
  );
}
