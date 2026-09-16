import { Router, type IRouter } from "express";
import { TransactionModel, SavingsGoalModel, InvestmentModel } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [transactions, goals, investments] = await Promise.all([
    TransactionModel.find(),
    SavingsGoalModel.find(),
    InvestmentModel.find(),
  ]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTxns = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTxns
    .filter((t) => t.isIncome)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const monthlyExpenses = monthlyTxns
    .filter((t) => !t.isIncome)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const savingsRate = monthlyIncome > 0
    ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
    : 0;

  const portfolioValue = investments.reduce((s, i) => s + (i.value || 0), 0);

  // Simple YTD return: average of dayChangePercent as placeholder
  const portfolioReturnPercent =
    investments.length > 0
      ? parseFloat(
          (
            investments.reduce((s, i) => s + (i.dayChangePercent || 0), 0) /
            investments.length
          ).toFixed(2)
        )
      : 0;

  const totalSaved = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);

  // Net worth = portfolio + savings
  const netWorth = portfolioValue + totalSaved;

  res.json({
    netWorth,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    portfolioValue,
    portfolioReturnPercent,
    totalSaved,
  });
});

router.get("/expenses/breakdown", async (_req, res): Promise<void> => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const transactions = await TransactionModel.find();

  const expenses = transactions.filter((t) => {
    if (t.isIncome) return false;
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalExpenses = expenses.reduce((s, t) => s + (t.amount || 0), 0);

  const categoryMap: Record<string, number> = {};
  for (const t of expenses) {
    categoryMap[t.category] = (categoryMap[t.category] ?? 0) + (t.amount || 0);
  }

  const breakdown = Object.entries(categoryMap)
    .map(([category, total]) => ({
      category,
      total,
      percent: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  res.json(breakdown);
});

export default router;
