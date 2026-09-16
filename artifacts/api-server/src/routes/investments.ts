import { Router, type IRouter } from "express";
import { InvestmentModel } from "@workspace/db";
import {
  CreateInvestmentBody,
  UpdateInvestmentParams,
  UpdateInvestmentBody,
  DeleteInvestmentParams,
  ListInvestmentsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const mapInvestment = (r: any) => ({
  id: r.id,
  ticker: r.ticker,
  name: r.name,
  value: r.value,
  allocationPercent: r.allocationPercent,
  dayChangePercent: r.dayChangePercent,
  createdAt: r.createdAt.toISOString(),
});

router.get("/investments", async (_req, res): Promise<void> => {
  const rows = await InvestmentModel.find().sort({ createdAt: 1 });
  res.json(ListInvestmentsResponse.parse(rows.map(mapInvestment)));
});

router.post("/investments", async (req, res): Promise<void> => {
  const parsed = CreateInvestmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const row = await InvestmentModel.create({
    ticker: parsed.data.ticker,
    name: parsed.data.name,
    value: parsed.data.value,
    allocationPercent: parsed.data.allocationPercent,
    dayChangePercent: parsed.data.dayChangePercent,
  });

  res.status(201).json(mapInvestment(row));
});

router.patch("/investments/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateInvestmentParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInvestmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, any> = {};
  if (parsed.data.ticker !== undefined) updates.ticker = parsed.data.ticker;
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.value !== undefined) updates.value = parsed.data.value;
  if (parsed.data.allocationPercent !== undefined) updates.allocationPercent = parsed.data.allocationPercent;
  if (parsed.data.dayChangePercent !== undefined) updates.dayChangePercent = parsed.data.dayChangePercent;

  const row = await InvestmentModel.findByIdAndUpdate(params.data.id, updates, { new: true });

  if (!row) {
    res.status(404).json({ error: "Investment not found" });
    return;
  }

  res.json(mapInvestment(row));
});

router.delete("/investments/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteInvestmentParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const row = await InvestmentModel.findByIdAndDelete(params.data.id);

  if (!row) {
    res.status(404).json({ error: "Investment not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
