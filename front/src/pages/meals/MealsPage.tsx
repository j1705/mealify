import { useState } from "react";
import listStyles from "../ListPage.module.css";
import MealsTable from "../../components/meals/MealsTable";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import { usePagedSearch } from "../../hooks/usePagedSearch";
import { deleteMeal, listMeals } from "../../services/mealService";
import type { Meal } from "../../types/Meal";
import { MAX_SEARCH_LENGTH } from "../../utils/validation";
import PageHeader from "../../components/ui/PageHeader";
import Toolbar from "../../components/ui/Toolbar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { MealsIcon, PlusIcon, SearchIcon } from "../../components/ui/icons";

const PAGE_SIZE = 8;

export default function MealsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const {
    items: meals,
    total,
    totalPages,
    searchedTerm,
    error,
    reload,
  } = usePagedSearch(listMeals, { search, page, limit: PAGE_SIZE });
  const firstLoad = searchedTerm === null;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const deletion = useDeleteConfirmation<Meal>({
    remove: (meal) => deleteMeal(meal.id),
    successMessage: "Refeição excluída com sucesso.",
    fallbackErrorMessage: "Não foi possível excluir a refeição",
    onDeleted: () => {
      const deletedOnlyMealOfLaterPage = meals.length === 1 && page > 1;
      if (deletedOnlyMealOfLaterPage) setPage(page - 1);
      else reload();
    },
  });

  const isBaseEmpty = searchedTerm === "" && total === 0;
  const hasResults = meals.length > 0;

  return (
    <section>
      <PageHeader
        title="Refeições"
        subtitle="Gerencie suas refeições e acompanhe sua nutrição."
        actions={
          <Button to="/meals/new" leftIcon={<PlusIcon size={16} />}>
            Nova refeição
          </Button>
        }
      />

      {(!isBaseEmpty || search !== "") && (
        <Toolbar
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Buscar refeição..."
          searchMaxLength={MAX_SEARCH_LENGTH}
        />
      )}

      <Card padded={false}>
        {firstLoad && <SkeletonRows rows={5} height={20} padded />}

        {!firstLoad && error && (
          <div className={listStyles.cardMessage}>
            <Alert
              variant="error"
              title="Algo deu errado"
              actions={
                <Button size="sm" variant="secondary" onClick={reload}>
                  Tentar novamente
                </Button>
              }
            >
              {error}
            </Alert>
          </div>
        )}

        {!firstLoad && !error && isBaseEmpty && (
          <EmptyState
            icon={<MealsIcon size={26} />}
            title="Nenhuma refeição cadastrada"
            description="Registre sua primeira refeição para acompanhar as calorias e macros do dia."
            action={
              <Button to="/meals/new" leftIcon={<PlusIcon size={16} />}>
                Nova refeição
              </Button>
            }
          />
        )}

        {!firstLoad && !error && !isBaseEmpty && !hasResults && (
          <EmptyState
            icon={<SearchIcon size={26} />}
            title="Nenhuma refeição encontrada"
            description="Tente ajustar a busca ou registre uma nova refeição."
            action={
              <Button variant="secondary" onClick={() => handleSearchChange("")}>
                Limpar busca
              </Button>
            }
          />
        )}

        {!firstLoad && !error && hasResults && (
          <>
            <MealsTable meals={meals} onDelete={deletion.ask} />
            <div className={listStyles.cardFooter}>
              <Pagination
                page={page}
                pageCount={totalPages}
                totalItems={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={deletion.target !== null}
        title={`Excluir "${deletion.target?.name}"?`}
        description="Essa ação não pode ser desfeita."
        loading={deletion.deleting}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </section>
  );
}
