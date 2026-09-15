import { pgTable, serial, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  category: text("category").notNull(),
  monthlyLimit: integer("monthly_limit").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
