import { useState } from "react";
import listStyles from "../ListPage.module.css";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import ItemsTable from "../../components/items/ItemsTable";
import { deleteItem } from "../../services/itemService";
import { MAX_SEARCH_LENGTH } from "../../utils/validation";
import type { Item } from "../../types/Item";
import PageHeader from "../../components/ui/PageHeader";
import Toolbar from "../../components/ui/Toolbar";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { ItemsIcon, PlusIcon, SearchIcon } from "../../components/ui/icons";
import { useItemList } from "../../hooks/useItemList";
import {
  ITEM_SORT_OPTIONS,
  apiSortFor,
  isItemSortOption,
  type ItemSortOption,
} from "./itemSortOptions";

const PAGE_SIZE = 8;

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ItemSortOption>("name-asc");
  const [page, setPage] = useState(1);

  const { items, total, totalPages, searchedTerm, error, reload } = useItemList({
    search,
    page,
    limit: PAGE_SIZE,
    sort: apiSortFor(sort),
  });
  const firstLoad = searchedTerm === null;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleSortChange(value: string) {
    if (!isItemSortOption(value)) return;
    setSort(value);
    setPage(1);
  }

  const deletion = useDeleteConfirmation<Item>({
    remove: (item) => deleteItem(item.id),
    successMessage: "Item excluído com sucesso.",
    fallbackErrorMessage: "Não foi possível excluir o item",
    onDeleted: () => {
      const deletedOnlyItemOfLaterPage = items.length === 1 && page > 1;
      if (deletedOnlyItemOfLaterPage) setPage(page - 1);
      else reload();
    },
  });

  const isBaseEmpty = searchedTerm === "" && total === 0;
  const hasResults = items.length > 0;

  return (
    <section>
      <PageHeader
        title="Itens"
        subtitle="Gerencie os alimentos e ingredientes da sua base."
        actions={
          <Button to="/items/new" leftIcon={<PlusIcon size={16} />}>
            Novo item
          </Button>
        }
      />

      {(!isBaseEmpty || search !== "") && (
        <Toolbar
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Buscar item..."
          searchMaxLength={MAX_SEARCH_LENGTH}
        >
          <Select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className={listStyles.sortSelect}
          >
            {ITEM_SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Toolbar>
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
            icon={<ItemsIcon size={26} />}
            title="Nenhum item cadastrado"
            description="Comece adicionando os alimentos e ingredientes que você usa nas refeições."
            action={
              <Button to="/items/new" leftIcon={<PlusIcon size={16} />}>
                Novo item
              </Button>
            }
          />
        )}

        {!firstLoad && !error && !isBaseEmpty && !hasResults && (
          <EmptyState
            icon={<SearchIcon size={26} />}
            title="Nenhum item encontrado"
            description="Tente ajustar a busca ou adicione um novo item."
            action={
              <Button variant="secondary" onClick={() => handleSearchChange("")}>
                Limpar busca
              </Button>
            }
          />
        )}

        {!firstLoad && !error && hasResults && (
          <>
            <ItemsTable items={items} onDelete={deletion.ask} />
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
        description="Essa ação não pode ser desfeita. O item deixará de estar disponível para novas refeições."
        loading={deletion.deleting}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </section>
  );
}
