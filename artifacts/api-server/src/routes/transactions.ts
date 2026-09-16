import { Router, type IRouter } from "express";
import { TransactionModel } from "@workspace/db";
import {
  CreateTransactionBody,
  DeleteTransactionParams,
  ListTransactionsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/transactions", async (req, res): Promise<void> => {
  const rows = await TransactionModel.find().sort({ createdAt: 1 });

  const mapped = rows.map((r) => ({
    id: r.id,
    merchant: r.merchant,
    category: r.category,
    amount: r.amount,
    date: r.date,
    isIncome: r.isIncome,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(ListTransactionsResponse.parse(mapped));
});

router.post("/transactions", async (req, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const row = await TransactionModel.create({
    merchant: parsed.data.merchant,
    category: parsed.data.category,
    amount: parsed.data.amount,
    date: parsed.data.date,
    isIncome: parsed.data.isIncome,
    notes: parsed.data.notes ?? null,
  });

  res.status(201).json({
    id: row.id,
    merchant: row.merchant,
    category: row.category,
    amount: row.amount,
    date: row.date,
    isIncome: row.isIncome,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  });
});

router.delete("/transactions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  
  const params = DeleteTransactionParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const row = await TransactionModel.findByIdAndDelete(params.data.id);

  if (!row) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
