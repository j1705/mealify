import StatCard from "../ui/StatCard";
import { CarbIcon, FatIcon, FlameIcon, ProteinIcon } from "../ui/icons";
import { formatNumber, type MacroTotals } from "../../utils/nutrition";

type MacroStatCardsProps = {
  totals: MacroTotals;
  caloriesLabel: string;
  caloriesHint?: string;
};

export default function MacroStatCards({
  totals,
  caloriesLabel,
  caloriesHint,
}: MacroStatCardsProps) {
  return (
    <>
      <StatCard
        icon={<FlameIcon size={20} />}
        iconColor="var(--color-calories)"
        iconBg="var(--color-calories-bg)"
        label={caloriesLabel}
        value={String(Math.round(totals.calories))}
        unit="kcal"
        hint={caloriesHint}
      />
      <StatCard
        icon={<ProteinIcon size={20} />}
        iconColor="var(--color-protein)"
        iconBg="var(--color-protein-bg)"
        label="Proteínas"
        value={formatNumber(totals.protein)}
        unit="g"
      />
      <StatCard
        icon={<CarbIcon size={20} />}
        iconColor="var(--color-carb)"
        iconBg="var(--color-carb-bg)"
        label="Carboidratos"
        value={formatNumber(totals.carbohydrate)}
        unit="g"
      />
      <StatCard
        icon={<FatIcon size={20} />}
        iconColor="var(--color-fat)"
        iconBg="var(--color-fat-bg)"
        label="Gorduras"
        value={formatNumber(totals.fat)}
        unit="g"
      />
    </>
  );
}
