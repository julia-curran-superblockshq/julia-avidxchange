import { Icon } from "@/components/ui/icon";

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string;
};

type TransactionRowProps = {
  transaction: Transaction;
};

const categoryIcons: Record<string, string> = {
  food: "utensils",
  bills: "receipt",
  entertainment: "gamepad-2",
  shopping: "shopping-bag",
  transport: "car",
  health: "heart-pulse",
  income: "wallet",
  savings: "piggy-bank",
};

export default function TransactionRow({ transaction }: TransactionRowProps) {
  const isIncome = transaction.type === "income";

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          isIncome ? "bg-emerald-50" : "bg-secondary"
        }`}>
          <Icon
            icon={categoryIcons[transaction.category] || "circle"}
            className={`w-4 h-4 ${isIncome ? "text-emerald-600" : "text-primary"}`}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{transaction.description}</p>
          <p className="text-xs text-muted-foreground capitalize">{transaction.category} · {transaction.date}</p>
        </div>
      </div>
      <span className={`text-sm font-bold ${
        isIncome ? "text-emerald-600" : "text-foreground"
      }`}>
        {isIncome ? "+" : "-"}${transaction.amount.toFixed(2)}
      </span>
    </div>
  );
}
