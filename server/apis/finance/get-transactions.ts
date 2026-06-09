import { api, z, bigquery } from "@superblocksteam/sdk-api";

const BIGQUERY_ID = "2089585e-cc58-4b5c-9084-610b1705c8ff";

const TransactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.coerce.number(),
  type: z.string(),
  category: z.string(),
  date: z.string(),
});

export default api({
  name: "GetTransactions",
  description: "Fetches transactions with optional category filter and search",

  integrations: {
    bq: bigquery(BIGQUERY_ID),
  },

  input: z.object({
    category: z.string().nullable(),
    search: z.string().nullable(),
  }),

  output: z.object({
    transactions: z.array(TransactionSchema),
  }),

  async run(ctx, { category, search }) {
    let query = "SELECT id, description, amount, type, category, CAST(date AS STRING) as date FROM `personal_finance.transactions` WHERE 1=1";
    const params: (string | null)[] = [];

    if (category) {
      params.push(category);
      query += " AND category = ?";
    }

    if (search) {
      params.push(`%${search}%`);
      query += " AND LOWER(description) LIKE LOWER(?)";
    }

    query += " ORDER BY date DESC LIMIT 100";

    const transactions = await ctx.integrations.bq.query(
      query,
      TransactionSchema,
      params,
      { label: "Fetch filtered transactions" }
    );

    return { transactions };
  },
});
