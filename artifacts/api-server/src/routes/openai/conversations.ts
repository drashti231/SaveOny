import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages, transactionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
} from "@workspace/api-zod";

const router = Router();

const FINANCIAL_SYSTEM_PROMPT = `You are SAVEONY AI, a personal financial advisor for Indian users. You analyze the user's financial data including transactions, savings goals, and investments to provide actionable advice in Indian Rupees (₹).

Your capabilities:
- Analyze spending patterns and detect overspending by category
- Give personalized savings suggestions based on income and expenses
- Provide monthly spending summaries with key insights
- Recommend smart budget allocations (50/30/20 rule adapted for India)
- Predict future expenses based on historical trends
- Suggest investment strategies suited for Indian markets
- Identify areas to cut costs

Tone: Professional yet friendly, concise, and actionable. Always use ₹ for amounts and Indian number formatting (lakhs, crores). Keep responses focused and practical. Use bullet points and headers for clarity. When you don't have specific financial data in context, ask the user to share relevant details.`;

// GET /openai/conversations — list all
router.get("/openai/conversations", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt));
    res.json(rows.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err, "Failed to list conversations");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /openai/conversations — create
router.post("/openai/conversations", async (req, res) => {
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  try {
    const [row] = await db
      .insert(conversations)
      .values({ title: parsed.data.title })
      .returning();
    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err, "Failed to create conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /openai/conversations/:id — get with messages
router.get("/openai/conversations/:id", async (req, res) => {
  const params = GetOpenaiConversationParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [convo] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, params.data.id));
    if (!convo) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, params.data.id))
      .orderBy(messages.createdAt);

    res.json({
      ...convo,
      createdAt: convo.createdAt.toISOString(),
      messages: msgs.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err, "Failed to get conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /openai/conversations/:id
router.delete("/openai/conversations/:id", async (req, res) => {
  const params = DeleteOpenaiConversationParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const deleted = await db
      .delete(conversations)
      .where(eq(conversations.id, params.data.id))
      .returning();
    if (!deleted.length) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error(err, "Failed to delete conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /openai/conversations/:id/messages
router.get("/openai/conversations/:id/messages", async (req, res) => {
  const params = ListOpenaiMessagesParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, params.data.id))
      .orderBy(messages.createdAt);
    res.json(msgs.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err, "Failed to list messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /openai/conversations/:id/messages — streaming
router.post("/openai/conversations/:id/messages", async (req, res) => {
  const params = SendOpenaiMessageParams.safeParse({ id: req.params.id });
  const body = SendOpenaiMessageBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const conversationId = params.data.id;
  const userContent = body.data.content;

  try {
    // Verify conversation exists
    const [convo] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));
    if (!convo) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // Save user message
    await db.insert(messages).values({
      conversationId,
      role: "user",
      content: userContent,
    });

    // Load conversation history for context
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    // Fetch all transactions to give the AI context
    const allTxns = await db
      .select()
      .from(transactionsTable)
      .orderBy(desc(transactionsTable.date));
      
    let totalIncome = 0;
    let totalExpense = 0;
    
    // Create a simplified list of transactions for the prompt
    const txnsContext = allTxns.map(t => {
      const amt = parseFloat(t.amount);
      if (t.isIncome) totalIncome += amt;
      else totalExpense += amt;
      return `${t.date}: ${t.merchant} (${t.category}) - ₹${amt} [${t.isIncome ? 'INCOME' : 'EXPENSE'}]`;
    }).join("\n");
    
    const netWorth = totalIncome - totalExpense;

    const dynamicSystemPrompt = `${FINANCIAL_SYSTEM_PROMPT}
    
=== USER'S ACTUAL FINANCIAL DATA ===
Total Net Worth: ₹${netWorth}
Total Income: ₹${totalIncome}
Total Expense: ₹${totalExpense}

Recent Transactions:
${txnsContext || "No transactions yet."}
====================================
Use this exact data to provide personalized, highly specific advice. If they ask about overspending, look at the transactions above and point out specific merchants or categories.`;

    const chatMessages = [
      { role: "system" as const, content: dynamicSystemPrompt },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Stream response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Persist assistant reply
    await db.insert(messages).values({
      conversationId,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error(err, "Failed to send message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

export default router;
