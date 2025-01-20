import { db } from "@db";
import {
  combinedImages,
  Model,
  models,
  Shirt,
  shirts,
  users,
} from "@db/schema";
import { eq } from "drizzle-orm";
import type { Express } from "express";
import express from "express";
import fs from "fs";
import { createServer, type Server } from "http";
import { nanoid } from "nanoid";
import { dirname, join } from "path";
import shell from "shelljs";
import { fileURLToPath } from "url";
import { setupAuth } from "./auth";

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const publicDir = join(__dirname, "..", "public");
const uploadsDir = join(publicDir, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup multer
const multer = (await import("multer")).default;

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      console.log({ req, file });
      // Clean the original filename and add timestamp
      const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
      cb(
        null,
        `${
          req.url.endsWith("models") ? "model_doc" : "shirt"
        }_${Date.now()}_${cleanName}`
      );
    },
  }),
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  // Models API
  app.get("/api/models", async (req, res) => {
    const allModels = await db.select().from(models);
    res.json(allModels);
  });

  app.post("/api/models", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No image file uploaded");
      }

      console.log("Our body when uploading models", { body: req.body });

      const documentUrl = `/uploads/${req.file.filename}`;
      const resultFileName = `model_img_${nanoid(8)}.jpg`;

      // TODO We need to check for the result of the bash execution and make sure to fail the request if unsuccessful
      const bash = shell.exec(
        `scripts/runGetImageFromPSFile.sh -f ${resultFileName} -m ${documentUrl}`
      );

      console.log("Upload model document", { bash });

      const imageUrl = `/uploads/${resultFileName}`;
      const metadata = { ...req.body, name: undefined, image_url: undefined };
      const [newModel] = await db
        .insert(models)
        .values({
          name: req.body.name,
          imageUrl,
          documentUrl,
          metadata: metadata,
        })
        .returning();

      res.json(newModel);
    } catch (error) {
      console.error("Error uploading model:", error);
      res.status(500).send("Error uploading model");
    }
  });

  app.delete("/api/models/:id", async (req, res) => {
    try {
      // Get the model to find the image path
      const [model] = await db
        .select()
        .from(models)
        .where(eq(models.id, parseInt(req.params.id)))
        .limit(1);

      if (!model) {
        return res.status(404).send("Model not found");
      }

      // Delete the physical file
      const filePath = join(
        __dirname,
        "..",
        "public",
        model.imageUrl.replace(/^\/uploads\//, "")
      );
      console.log(
        "Deleting model file",
        filePath,
        join(__dirname, "..", "public", model.imageUrl)
      );
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error("Error deleting file:", err);
        // Continue even if file deletion fails
      }

      // Delete from database
      await db.delete(models).where(eq(models.id, parseInt(req.params.id)));

      res.json({ message: "Model deleted successfully" });
    } catch (error) {
      console.error("Error deleting model:", error);
      res.status(500).send("Error deleting model");
    }
  });

  // Shirts API
  app.get("/api/shirts", async (req, res) => {
    const allShirts = await db.select().from(shirts);
    res.json(allShirts);
  });

  app.post("/api/shirts", upload.single("image"), async (req, res) => {
    try {
      const { name } = req.body;
      if (!req.file) {
        return res.status(400).send("No image file uploaded");
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      const metadata = { ...req.body, name: undefined, image_url: undefined };

      const [newShirt] = await db
        .insert(shirts)
        .values({
          name,
          imageUrl,
          metadata,
        })
        .returning();

      res.json(newShirt);
    } catch (error) {
      console.error("Error creating shirt:", error);
      res.status(500).send("Error creating shirt");
    }
  });

  app.delete("/api/shirts/:id", async (req, res) => {
    try {
      // Get the shirt to find the image path
      const [shirt] = await db
        .select()
        .from(shirts)
        .where(eq(shirts.id, parseInt(req.params.id)))
        .limit(1);

      if (!shirt) {
        return res.status(404).send("Shirt not found");
      }

      // Delete the physical file
      const filePath = join(
        __dirname,
        "..",
        "public",
        shirt.imageUrl.replace(/^\/uploads\//, "")
      );
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error("Error deleting file:", err);
        // Continue even if file deletion fails
      }

      // Delete from database
      await db.delete(shirts).where(eq(shirts.id, parseInt(req.params.id)));

      res.json({ message: "Shirt deleted successfully" });
    } catch (error) {
      console.error("Error deleting shirt:", error);
      res.status(500).send("Error deleting shirt");
    }
  });

  // Combined Images API
  app.get("/api/combined", async (req, res) => {
    const results = await db.select().from(combinedImages);
    // TODO Double check if we need any model information on the combined image later.
    // .leftJoin(models, eq(combinedImages.modelId, models.id))
    // .leftJoin(shirts, eq(combinedImages.shirtId, shirts.id));
    res.json(results);
  });

  app.post("/api/combined", async (req, res) => {
    try {
      const { model, shirt }: { model: Model; shirt: Shirt } = req.body;
      console.log("request params", {
        model,
        shirt,
        body: req.body,
      });
      const resultFileName = `result_${model.id}_${shirt.id}_${nanoid(8)}.jpg`;

      const bash = shell.exec(
        `scripts/runTriggerMerchMadnessAction.sh -f ${resultFileName} -m ${model.documentUrl} -s ${shirt.imageUrl}`
      );

      const [newCombined] = await db
        .insert(combinedImages)
        .values({
          modelId: model.id,
          shirtId: shirt.id,
          imageUrl: `/uploads/${resultFileName}`,
        })
        .returning();

      res.json(newCombined);
    } catch (error) {
      console.error("Error creating combined image:", error);
      res.status(500).send("Error creating combined image");
    }
  });

  app.delete("/api/combined/:id", async (req, res) => {
    try {
      // Get the combined image to find the image path
      const [combined] = await db
        .select()
        .from(combinedImages)
        .where(eq(combinedImages.id, parseInt(req.params.id)))
        .limit(1);

      if (!combined) {
        return res.status(404).send("Combined image not found");
      }

      // Delete the physical file
      const filePath = join(
        __dirname,
        "..",
        "public",
        combined.imageUrl.replace(/^\/uploads\//, "")
      );
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error("Error deleting file:", err);
        // Continue even if file deletion fails
      }

      // Delete from database
      await db
        .delete(combinedImages)
        .where(eq(combinedImages.id, parseInt(req.params.id)));

      res.json({ message: "Combined image deleted successfully" });
    } catch (error) {
      console.error("Error deleting combined image:", error);
      res.status(500).send("Error deleting combined image");
    }
  });

  // Users API
  app.post("/api/users/:id", async (req, res) => {
    const { id, isAdmin, username, password } = req.body;
    const [user] = await db
      .update(users)
      .set({ id, isAdmin, username, password })
      .where(eq(users.id, parseInt(req.params.id)))
      .returning();
    res.json(user);
  });

  app.get("/api/users", async (req, res) => {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  });

  app.delete("/api/users/:id", async (req, res) => {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, parseInt(req.params.id)))
      .returning();
    res.json(user);
  });

  const httpServer = createServer(app);

  return httpServer;
}
