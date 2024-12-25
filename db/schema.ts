import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shirts = pgTable("shirts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const combinedImages = pgTable("combined_images", {
  id: serial("id").primaryKey(),
  modelId: serial("model_id").references(() => models.id),
  shirtId: serial("shirt_id").references(() => shirts.id),
  resultUrl: text("result_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const combinedImagesRelations = relations(combinedImages, ({ one }) => ({
  model: one(models, {
    fields: [combinedImages.modelId],
    references: [models.id],
  }),
  shirt: one(shirts, {
    fields: [combinedImages.shirtId],
    references: [shirts.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertModelSchema = createInsertSchema(models);
export const selectModelSchema = createSelectSchema(models);
export const insertShirtSchema = createInsertSchema(shirts);
export const selectShirtSchema = createSelectSchema(shirts);
export const insertCombinedImageSchema = createInsertSchema(combinedImages);
export const selectCombinedImageSchema = createSelectSchema(combinedImages);

export type User = typeof users.$inferSelect;
export type Model = typeof models.$inferSelect;
export type Shirt = typeof shirts.$inferSelect;
export type CombinedImage = typeof combinedImages.$inferSelect;
