import { Icon } from "@/components/ui/icon";

type KpiCardProps = {
  label: string;
  value: string;
  icon: string;
  trend?: "positive" | "negative" | "neutral";
};

export default function KpiCard({ label, value, icon, trend = "neutral" }: KpiCardProps) {
  const trendColor = trend === "positive"
    ? "text-emerald-600"
    : trend === "negative"
    ? "text-red-600"
    : "text-foreground";

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
          <Icon icon={icon} className="w-4 h-4 text-primary" />
        </div>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${trendColor}`}>{value}</p>
    </div>
  );
}
