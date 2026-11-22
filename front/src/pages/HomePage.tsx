import { useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";
import { useHomeSummary } from "../hooks/useHomeSummary";
import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Alert from "../components/ui/Alert";
import { Skeleton } from "../components/ui/Skeleton";
import MacroDonut from "../components/meals/MacroDonut";
import MacroStatCards from "../components/meals/MacroStatCards";
import { macroPercentages, macroSegments } from "../utils/nutrition";
import { formatDateBR, formatTodayLongBR } from "../utils/date";
import {
  ChevronRightIcon,
  ClockIcon,
  FlameIcon,
  ItemsIcon,
  MealsIcon,
  PlusIcon,
} from "../components/ui/icons";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia!";
  if (hour < 18) return "Boa tarde!";
  return "Boa noite!";
}

export default function HomePage() {
  const {
    todayMealCount,
    todayTotals,
    recentMeals,
    mostUsedItems,
    itemCount,
    loading: isLoading,
    error,
  } = useHomeSummary();

  const percentages = useMemo(() => macroPercentages(todayTotals), [todayTotals]);

  const hasAnyMeal = recentMeals.length > 0;
  const hasTodayMeals = todayMealCount > 0;

  return (
    <section>
      <div className={styles.header}>
        <PageHeader
          title={greeting()}
          subtitle={`Aqui está um resumo da sua alimentação de hoje · ${formatTodayLongBR()}`}
        />
      </div>

      {error && (
        <div className={styles.loadError}>
          <Alert variant="error" title="Não foi possível carregar seus dados">
            {error}
          </Alert>
        </div>
      )}

      {isLoading ? (
        <div className={styles.statsGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <Skeleton height={48} />
            </Card>
          ))}
        </div>
      ) : (
        <div className={styles.statsGrid}>
          <MacroStatCards
            totals={todayTotals}
            caloriesLabel="Total de calorias"
            caloriesHint={hasTodayMeals ? undefined : "Nenhuma refeição hoje"}
          />
        </div>
      )}

      <div className={styles.grid2}>
        <Card>
          <CardHeader title="Distribuição dos macros" />
          {!isLoading && hasTodayMeals && todayTotals.calories > 0 ? (
            <MacroDonut
              centerValue={String(Math.round(todayTotals.calories))}
              centerLabel="kcal"
              segments={macroSegments(percentages)}
            />
          ) : (
            <EmptyState
              icon={<FlameIcon size={24} />}
              title="Sem dados para hoje"
              description="Registre uma refeição para ver a distribuição de macros do dia."
            />
          )}
        </Card>

        <Card>
          <CardHeader
            title="Refeições recentes"
            action={
              hasAnyMeal ? (
                <Link to="/meals" className={styles.viewAll}>
                  Ver todas <ChevronRightIcon size={14} />
                </Link>
              ) : undefined
            }
          />
          {!isLoading && hasAnyMeal ? (
            <div className={styles.mealsList}>
              {recentMeals.map((meal) => {
                return (
                  <Link key={meal.id} to={`/meals/${meal.id}`} className={styles.mealRow}>
                    <div className={styles.mealInfo}>
                      <span className={styles.mealName}>{meal.name}</span>
                      <span className={styles.mealMeta}>
                        <ClockIcon size={12} />
                        {formatDateBR(meal.date)}
                      </span>
                    </div>
                    <span className={styles.mealKcal}>{Math.round(meal.calories)} kcal</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            !isLoading && (
              <EmptyState
                icon={<MealsIcon size={24} />}
                title="Nenhuma refeição registrada"
                description="Registre sua primeira refeição para começar a acompanhar sua nutrição."
                action={
                  <Button to="/meals/new" size="sm" leftIcon={<PlusIcon size={14} />}>
                    Nova refeição
                  </Button>
                }
              />
            )
          )}
        </Card>
      </div>

      <div className={styles.grid2}>
        <Card>
          <CardHeader title="Itens mais utilizados" />
          {mostUsedItems.length > 0 ? (
            <div className={styles.usedItems}>
              {mostUsedItems.map(({ id, name, mealCount }) => (
                <div key={id} className={styles.usedItemRow}>
                  <span className={styles.usedItemName}>{name}</span>
                  <span className={styles.mealMeta}>{mealCount}x</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ItemsIcon size={24} />}
              title="Ainda sem histórico"
              description="Os itens mais usados aparecerão aqui conforme você registra refeições."
            />
          )}
        </Card>

        <Card>
          <CardHeader title="Ações rápidas" />
          <div className={styles.quickActions}>
            <Button to="/meals/new" fullWidth leftIcon={<PlusIcon size={16} />}>
              Nova refeição
            </Button>
            <Button to="/items/new" variant="secondary" fullWidth leftIcon={<PlusIcon size={16} />}>
              Novo item
            </Button>
          </div>
        </Card>
      </div>

      {!isLoading && itemCount === 0 && (
        <Alert variant="info" title="Sua base de itens está vazia">
          Cadastre alimentos e ingredientes em Itens antes de montar suas refeições.
        </Alert>
      )}
    </section>
  );
}
