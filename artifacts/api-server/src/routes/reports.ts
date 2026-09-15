import { Router, type IRouter } from "express";
import { db, transactionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/reports/history", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const period = req.query.period as string || "weekly"; // weekly, monthly, yearly

  // We group transactions by date to build the report
  const rows = await db
    .select({
      date: transactionsTable.date,
      isIncome: transactionsTable.isIncome,
      amount: transactionsTable.amount,
    })
    .from(transactionsTable);

  // Aggregate by date
  const agg: Record<string, { income: number; expense: number }> = {};

  for (const r of rows) {
    const d = r.date.split("T")[0]; // YYYY-MM-DD
    if (!agg[d]) {
      agg[d] = { income: 0, expense: 0 };
    }
    const amt = parseFloat(r.amount);
    if (r.isIncome) {
      agg[d].income += amt;
    } else {
      agg[d].expense += amt;
    }
  }

  // Sort dates
  const sortedDates = Object.keys(agg).sort();
  
  const data = sortedDates.map((date) => ({
    date,
    income: agg[date].income,
    expense: agg[date].expense,
  }));

  res.json(data);
});

export default router;
