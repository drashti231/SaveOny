import { Router, type IRouter } from "express";
import { SavingsGoalModel } from "@workspace/db";
import {
  CreateSavingsGoalBody,
  UpdateSavingsGoalParams,
  UpdateSavingsGoalBody,
  DeleteSavingsGoalParams,
  ListSavingsGoalsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const mapGoal = (r: any) => ({
  id: r.id,
  name: r.name,
  targetAmount: r.targetAmount,
  currentAmount: r.currentAmount,
  createdAt: r.createdAt.toISOString(),
});

router.get("/savings-goals", async (_req, res): Promise<void> => {
  const rows = await SavingsGoalModel.find().sort({ createdAt: 1 });
  res.json(ListSavingsGoalsResponse.parse(rows.map(mapGoal)));
});

router.post("/savings-goals", async (req, res): Promise<void> => {
  const parsed = CreateSavingsGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const row = await SavingsGoalModel.create({
    name: parsed.data.name,
    targetAmount: parsed.data.targetAmount,
    currentAmount: parsed.data.currentAmount,
  });

  res.status(201).json(mapGoal(row));
});

router.patch("/savings-goals/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateSavingsGoalParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSavingsGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, any> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.targetAmount !== undefined) updates.targetAmount = parsed.data.targetAmount;
  if (parsed.data.currentAmount !== undefined) updates.currentAmount = parsed.data.currentAmount;

  const row = await SavingsGoalModel.findByIdAndUpdate(params.data.id, updates, { new: true });

  if (!row) {
    res.status(404).json({ error: "Savings goal not found" });
    return;
  }

  res.json(mapGoal(row));
});

router.delete("/savings-goals/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteSavingsGoalParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const row = await SavingsGoalModel.findByIdAndDelete(params.data.id);

  if (!row) {
    res.status(404).json({ error: "Savings goal not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
