type BudgetProgressProps = {
  category: string;
  categoryName: string;
  spent: number;
  budgeted: number;
};

export default function BudgetProgress({ category, categoryName, spent, budgeted }: BudgetProgressProps) {
  const percentage = Math.min((spent / budgeted) * 100, 100);
  const isOverBudget = spent > budgeted;
  const isNearBudget = percentage >= 80 && !isOverBudget;

  const barColor = isOverBudget
    ? "bg-red-500"
    : isNearBudget
    ? "bg-amber-500"
    : "bg-primary";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground truncate">{categoryName}</span>
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          ${spent.toFixed(0)} / ${budgeted.toFixed(0)}
        </span>
      </div>
      <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${
          isOverBudget ? "text-red-600" : isNearBudget ? "text-amber-600" : "text-muted-foreground"
        }`}>
          {isOverBudget ? "Over budget!" : `${percentage.toFixed(0)}% used`}
        </span>
        <span className="text-xs text-muted-foreground">
          ${(budgeted - spent).toFixed(0)} remaining
        </span>
      </div>
    </div>
  );
}
