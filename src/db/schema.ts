import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  price: text("price").notNull(),
  categoryOrder: integer("category_order").default(0).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  serviceName: text("service_name").notNull(),
  bookingDate: text("booking_date").notNull(),
  bookingTime: text("booking_time").notNull(),
  notes: text("notes"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  username: text("username").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
