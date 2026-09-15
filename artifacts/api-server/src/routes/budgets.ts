import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, budgets } from "@workspace/db";
import { CreateBudgetBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/budgets", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const rows = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .orderBy(budgets.createdAt);

  const mapped = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
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

  const [row] = await db
    .insert(budgets)
    .values({
      userId,
      category: parsed.data.category,
      monthlyLimit: parsed.data.monthlyLimit,
    })
    .returning();

  res.status(201).json({
    ...row,
    createdAt: row.createdAt.toISOString(),
  });
});

router.delete("/budgets/:id", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [row] = await db
    .delete(budgets)
    .where(eq(budgets.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
