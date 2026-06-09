import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useApiData } from "@/hooks/useApiData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import KpiCard from "@/components/KpiCard";
import BudgetProgress from "@/components/BudgetProgress";
import SpendingBar from "@/components/SpendingBar";
import TransactionRow from "@/components/TransactionRow";

const CATEGORY_COLORS = [
  "bg-primary",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-blue-500",
  "bg-teal-500",
];

const PAGE_SIZE = 10;

export default function Page1Component() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(value || null);
      setPage(0);
    }, 300);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const { data: summary, loading: summaryLoading, fetching: summaryFetching } = useApiData("GetFinanceSummary", {});
  const { data: txData, loading: txLoading, fetching: txFetching } = useApiData("GetTransactions", {
    category: categoryFilter,
    search: debouncedSearch,
  });

  const categoryNames = useMemo(() => {
    if (!summary) return {};
    const map: Record<string, string> = {};
    summary.categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [summary]);

  const paginatedTransactions = useMemo(() => {
    if (!txData) return [];
    return txData.transactions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }, [txData, page]);

  const totalPages = useMemo(() => {
    if (!txData) return 0;
    return Math.ceil(txData.transactions.length / PAGE_SIZE);
  }, [txData]);

  const maxSpending = useMemo(() => {
    if (!summary) return 0;
    return Math.max(...summary.spendingByCategory.map((s) => s.total_spent));
  }, [summary]);

  if (summaryLoading) {
    return (
      <div className="min-h-screen bg-background p-8 overflow-auto">
        <div className="max-w-[1200px] mx-auto space-y-8">
          <Skeleton className="h-10 w-72" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 overflow-auto">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{ letterSpacing: "-0.03em" }}>
              Personal Finance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Track your spending, budgets, and transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Icon icon="wallet" className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${summaryFetching ? "opacity-70" : ""}`}>
          <KpiCard
            label="Total Budget"
            value={`$${summary!.totalBudget.toLocaleString()}`}
            icon="target"
          />
          <KpiCard
            label="Total Spent"
            value={`$${summary!.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon="credit-card"
            trend="negative"
          />
          <KpiCard
            label="Remaining"
            value={`$${summary!.remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon="piggy-bank"
            trend={summary!.remaining > 0 ? "positive" : "negative"}
          />
          <KpiCard
            label="Categories"
            value={`${summary!.budgets.length}`}
            icon="grid-2x2"
          />
        </div>

        {/* Budget Progress + Spending Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Progress */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-5">Budget Progress</h2>
            <div className="space-y-5">
              {summary!.budgets.map((b) => (
                <BudgetProgress
                  key={b.category}
                  category={b.category}
                  categoryName={categoryNames[b.category] || b.category}
                  spent={b.spent_amount}
                  budgeted={b.budgeted_amount}
                />
              ))}
            </div>
          </div>

          {/* Spending by Category */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-5">Spending by Category</h2>
            <div className="space-y-4">
              {summary!.spendingByCategory.map((s, i) => (
                <SpendingBar
                  key={s.category}
                  categoryName={categoryNames[s.category] || s.category}
                  amount={s.total_spent}
                  maxAmount={maxSpending}
                  color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <h2 className="text-lg font-bold text-foreground">Recent Transactions</h2>
            <div className="flex items-center gap-3">
              <Input
                value={search}
                onChange={handleSearch}
                placeholder="Search transactions..."
                className="w-52 text-sm"
              />
              <Select
                value={categoryFilter ?? "all"}
                onValueChange={(v) => {
                  setCategoryFilter(v === "all" ? null : v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-40 text-sm">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {summary!.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {txLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {txFetching && (
                <div className="text-xs text-muted-foreground mb-2">Updating…</div>
              )}
              <div className={txFetching ? "opacity-70" : ""}>
                {paginatedTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon icon="search" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No transactions found</p>
                  </div>
                ) : (
                  <div>
                    {paginatedTransactions.map((tx) => (
                      <TransactionRow key={tx.id} transaction={tx} />
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Page {page + 1} of {totalPages} ({txData!.transactions.length} transactions)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <Icon icon="chevron-left" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      <Icon icon="chevron-right" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
