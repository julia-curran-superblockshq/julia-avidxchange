/**
 * API Registry - Central export for all APIs.
 */
import GetFinanceSummary from './finance/get-finance-summary.js';
import GetTransactions from './finance/get-transactions.js';

const apis = { GetFinanceSummary, GetTransactions } as const;

export default apis;

/** Type for useApi inference - exported for client type-only imports */
export type ApiRegistry = typeof apis;
