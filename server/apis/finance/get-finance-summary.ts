import { api, z, bigquery } from "@superblocksteam/sdk-api";

const BIGQUERY_ID = "2089585e-cc58-4b5c-9084-610b1705c8ff";

const BudgetSchema = z.object({
  category: z.string(),
  budgeted_amount: z.coerce.number(),
  spent_amount: z.coerce.number(),
});

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  bg_color: z.string(),
});

const SpendingByCategorySchema = z.object({
  category: z.string(),
  total_spent: z.coerce.number(),
  transaction_count: z.coerce.number(),
});

export default api({
  name: "GetFinanceSummary",
  description: "Fetches budget data, categories, and spending breakdown from BigQuery",

  integrations: {
    bq: bigquery(BIGQUERY_ID),
  },

  input: z.object({}),

  output: z.object({
    budgets: z.array(BudgetSchema),
    categories: z.array(CategorySchema),
    spendingByCategory: z.array(SpendingByCategorySchema),
    totalSpent: z.number(),
    totalBudget: z.number(),
    remaining: z.number(),
  }),

  async run(ctx) {
    const [budgets, categories, spendingByCategory] = await Promise.all([
      ctx.integrations.bq.query(
        "SELECT category, budgeted_amount, spent_amount FROM `personal_finance.budgets`",
        BudgetSchema,
        [],
        { label: "Fetch budgets" }
      ),
      ctx.integrations.bq.query(
        "SELECT id, name, icon, color, bg_color FROM `personal_finance.categories`",
        CategorySchema,
        [],
        { label: "Fetch categories" }
      ),
      ctx.integrations.bq.query(
        `SELECT category, SUM(amount) as total_spent, COUNT(*) as transaction_count
         FROM \`personal_finance.transactions\`
         WHERE type = 'expense'
         GROUP BY category`,
        SpendingByCategorySchema,
        [],
        { label: "Fetch spending by category" }
      ),
    ]);

    const totalSpent = budgets.reduce((sum, b) => sum + b.spent_amount, 0);
    const totalBudget = budgets.reduce((sum, b) => sum + b.budgeted_amount, 0);

    return {
      budgets,
      categories,
      spendingByCategory,
      totalSpent,
      totalBudget,
      remaining: totalBudget - totalSpent,
    };
  },
});
