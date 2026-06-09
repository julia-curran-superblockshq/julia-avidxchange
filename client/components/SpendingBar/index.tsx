type SpendingBarProps = {
  categoryName: string;
  amount: number;
  maxAmount: number;
  color: string;
};

export default function SpendingBar({ categoryName, amount, maxAmount, color }: SpendingBarProps) {
  const percentage = (amount / maxAmount) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-foreground w-28 shrink-0">{categoryName}</span>
      <div className="flex-1 h-6 bg-secondary rounded-lg overflow-hidden relative">
        <div
          className={`h-full rounded-lg transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-foreground w-16 text-right">${amount.toFixed(0)}</span>
    </div>
  );
}
