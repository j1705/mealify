import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemForm from "../../components/items/ItemForm";
import { createItem } from "../../services/itemService";
import {
  EMPTY_ITEM_FORM_VALUES,
  toItemInput,
  type ItemFormValues,
} from "../../components/items/itemFormValues";
import SaveErrorAlert from "../../components/ui/SaveErrorAlert";
import { useSaveAction } from "../../hooks/useSaveAction";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

export default function ItemCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<ItemFormValues>(EMPTY_ITEM_FORM_VALUES);
  const { saving, error, submit } = useSaveAction({
    save: () => createItem(toItemInput(values)),
    successMessage: "Item criado com sucesso!",
    redirectTo: "/items",
  });

  return (
    <section>
      <PageHeader
        title="Novo item"
        subtitle="Adicione um novo alimento à sua base."
        backTo="/items"
      />

      <SaveErrorAlert error={error} />

      <Card>
        <ItemForm
          values={values}
          onChange={setValues}
          onSubmit={submit}
          submitLabel={saving ? "Salvando..." : "Criar"}
          disabled={saving}
          onCancel={() => navigate("/items")}
        />
      </Card>
    </section>
  );
}
