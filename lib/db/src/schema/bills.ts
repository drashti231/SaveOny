import { pgTable, serial, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  dueDate: text("due_date").notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
