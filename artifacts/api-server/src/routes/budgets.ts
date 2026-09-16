import { Router, type IRouter } from "express";
import { BudgetModel } from "@workspace/db";
import { CreateBudgetBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/budgets", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const rows = await BudgetModel.find({ userId }).sort({ createdAt: 1 });

  const mapped = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    category: r.category,
    monthlyLimit: r.monthlyLimit,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  res.json(mapped);
});

router.post("/budgets", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const parsed = CreateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const row = await BudgetModel.create({
    userId,
    category: parsed.data.category,
    monthlyLimit: parsed.data.monthlyLimit,
  });

  res.status(201).json({
    id: row.id,
    userId: row.userId,
    category: row.category,
    monthlyLimit: row.monthlyLimit,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

router.delete("/budgets/:id", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const row = await BudgetModel.findOneAndDelete({ _id: raw, userId });

  if (!row) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
