import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, bills } from "@workspace/db";
import { CreateBillBody, UpdateBillBody, UpdateBillParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bills", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const rows = await db
    .select()
    .from(bills)
    .where(eq(bills.userId, userId))
    .orderBy(bills.dueDate);

  const mapped = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
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

  const [row] = await db
    .insert(bills)
    .values({
      userId,
      name: parsed.data.name,
      amount: parsed.data.amount,
      dueDate: parsed.data.dueDate,
    })
    .returning();

  res.status(201).json({
    ...row,
    createdAt: row.createdAt.toISOString(),
  });
});

router.patch("/bills/:id", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateBillBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .update(bills)
    .set({
      isPaid: parsed.data.isPaid,
      updatedAt: new Date(),
    })
    .where(eq(bills.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }

  res.status(200).json({
    ...row,
    createdAt: row.createdAt.toISOString(),
  });
});

router.delete("/bills/:id", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId || "mock_user_id";
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [row] = await db
    .delete(bills)
    .where(eq(bills.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
