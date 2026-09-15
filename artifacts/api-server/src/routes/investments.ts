import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, investmentsTable } from "@workspace/db";
import {
  CreateInvestmentBody,
  UpdateInvestmentParams,
  UpdateInvestmentBody,
  DeleteInvestmentParams,
  ListInvestmentsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const mapInvestment = (r: typeof investmentsTable.$inferSelect) => ({
  id: r.id,
  ticker: r.ticker,
  name: r.name,
  value: parseFloat(r.value),
  allocationPercent: parseFloat(r.allocationPercent),
  dayChangePercent: parseFloat(r.dayChangePercent),
  createdAt: r.createdAt.toISOString(),
});

router.get("/investments", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(investmentsTable)
    .orderBy(investmentsTable.createdAt);

  res.json(ListInvestmentsResponse.parse(rows.map(mapInvestment)));
});

router.post("/investments", async (req, res): Promise<void> => {
  const parsed = CreateInvestmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(investmentsTable)
    .values({
      ticker: parsed.data.ticker,
      name: parsed.data.name,
      value: String(parsed.data.value),
      allocationPercent: String(parsed.data.allocationPercent),
      dayChangePercent: String(parsed.data.dayChangePercent),
    })
    .returning();

  res.status(201).json(mapInvestment(row));
});

router.patch("/investments/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateInvestmentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInvestmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, string> = {};
  if (parsed.data.ticker !== undefined) updates.ticker = parsed.data.ticker;
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.value !== undefined) updates.value = String(parsed.data.value);
  if (parsed.data.allocationPercent !== undefined) updates.allocationPercent = String(parsed.data.allocationPercent);
  if (parsed.data.dayChangePercent !== undefined) updates.dayChangePercent = String(parsed.data.dayChangePercent);

  const [row] = await db
    .update(investmentsTable)
    .set(updates)
    .where(eq(investmentsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Investment not found" });
    return;
  }

  res.json(mapInvestment(row));
});

router.delete("/investments/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteInvestmentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(investmentsTable)
    .where(eq(investmentsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Investment not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
