import { Router, type IRouter } from "express";
import { BillModel } from "@workspace/db";
import { CreateBillBody, UpdateBillBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bills", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const rows = await BillModel.find({ userId }).sort({ dueDate: 1 });

  const mapped = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    amount: r.amount,
    dueDate: r.dueDate,
    isPaid: r.isPaid,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  res.json(mapped);
});

router.post("/bills", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const parsed = CreateBillBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const row = await BillModel.create({
    userId,
    name: parsed.data.name,
    amount: parsed.data.amount,
    dueDate: parsed.data.dueDate,
  });

  res.status(201).json({
    id: row.id,
    userId: row.userId,
    name: row.name,
    amount: row.amount,
    dueDate: row.dueDate,
    isPaid: row.isPaid,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

router.patch("/bills/:id", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const parsed = UpdateBillBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const row = await BillModel.findOneAndUpdate(
    { _id: raw, userId },
    {
      isPaid: parsed.data.isPaid,
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (!row) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }

  res.status(200).json({
    id: row.id,
    userId: row.userId,
    name: row.name,
    amount: row.amount,
    dueDate: row.dueDate,
    isPaid: row.isPaid,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

router.delete("/bills/:id", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const row = await BillModel.findOneAndDelete({ _id: raw, userId });

  if (!row) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
