import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemForm from "../../components/items/ItemForm";
import { useItem } from "../../hooks/useItem";
import { useNumericParam } from "../../hooks/useNumericParam";
import { updateItem } from "../../services/itemService";
import {
  toItemFormValues,
  toItemInput,
  type ItemFormValues,
} from "../../components/items/itemFormValues";
import SaveErrorAlert from "../../components/ui/SaveErrorAlert";
import { useSaveAction } from "../../hooks/useSaveAction";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import { SkeletonRows } from "../../components/ui/Skeleton";

export default function ItemEditPage() {
  const itemId = useNumericParam("itemId");
  const { data: item, loading, error, reload } = useItem(itemId);

  return (
    <section>
      <PageHeader
        title="Editar item"
        subtitle="Atualize as informações deste alimento."
        backTo="/items"
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
            title="Não foi possível carregar o item"
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

      {!loading && item && (
        <ItemEditForm key={item.id} itemId={item.id} initial={toItemFormValues(item)} />
      )}
    </section>
  );
}

function ItemEditForm({ itemId, initial }: { itemId: number; initial: ItemFormValues }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const { saving, error, submit } = useSaveAction({
    save: () => updateItem(itemId, toItemInput(values)),
    successMessage: "Item atualizado com sucesso!",
    redirectTo: "/items",
  });

  return (
    <>
      <SaveErrorAlert error={error} />
      <Card>
        <ItemForm
          values={values}
          onChange={setValues}
          onSubmit={submit}
          submitLabel={saving ? "Salvando..." : "Salvar"}
          disabled={saving}
          onCancel={() => navigate("/items")}
        />
      </Card>
    </>
  );
}
