import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const models = sqliteTable("models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  direction: text("direction").notNull(), // front or back
  type: text("type").notNull(), // longsleeve or shortsleeve
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  documentUrl: text("document_url").notNull(),
  automationUrl: text("automation_url"),
  automationName: text("automation_name"),
  color: text("color").notNull(),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const shirts = sqliteTable("shirts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  color: text("color").notNull(),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const combinedImages = sqliteTable("combined_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelId: integer("model_id").references(() => models.id),
  shirtId: integer("shirt_id").references(() => shirts.id),
  imageUrl: text("image_url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
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
