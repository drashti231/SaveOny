import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, savingsGoalsTable } from "@workspace/db";
import {
  CreateSavingsGoalBody,
  UpdateSavingsGoalParams,
  UpdateSavingsGoalBody,
  DeleteSavingsGoalParams,
  ListSavingsGoalsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const mapGoal = (r: typeof savingsGoalsTable.$inferSelect) => ({
  id: r.id,
  name: r.name,
  targetAmount: parseFloat(r.targetAmount),
  currentAmount: parseFloat(r.currentAmount),
  createdAt: r.createdAt.toISOString(),
});

router.get("/savings-goals", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(savingsGoalsTable)
    .orderBy(savingsGoalsTable.createdAt);

  res.json(ListSavingsGoalsResponse.parse(rows.map(mapGoal)));
});

router.post("/savings-goals", async (req, res): Promise<void> => {
  const parsed = CreateSavingsGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(savingsGoalsTable)
    .values({
      name: parsed.data.name,
      targetAmount: String(parsed.data.targetAmount),
      currentAmount: String(parsed.data.currentAmount),
    })
    .returning();

  res.status(201).json(mapGoal(row));
});

router.patch("/savings-goals/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateSavingsGoalParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSavingsGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, string> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.targetAmount !== undefined) updates.targetAmount = String(parsed.data.targetAmount);
  if (parsed.data.currentAmount !== undefined) updates.currentAmount = String(parsed.data.currentAmount);

  const [row] = await db
    .update(savingsGoalsTable)
    .set(updates)
    .where(eq(savingsGoalsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Savings goal not found" });
    return;
  }

  res.json(mapGoal(row));
});

router.delete("/savings-goals/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteSavingsGoalParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(savingsGoalsTable)
    .where(eq(savingsGoalsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Savings goal not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
