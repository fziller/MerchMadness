import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { models, shirts, combinedImages } from "@db/schema";
import { eq } from "drizzle-orm";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import express from "express";

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
      // Clean the original filename and add timestamp
      const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      cb(null, `${Date.now()}-${cleanName}`);
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
      const { name, gender, metadata } = req.body;
      if (!req.file) {
        return res.status(400).send("No image file uploaded");
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      console.log("api/models route", {
        body: req.body,
        name,
        gender,
        metadata,
        imageUrl,
        file: req.file,
      });

      const [newModel] = await db
        .insert(models)
        .values({
          name,
          gender,
          imageUrl,
          metadata: metadata ? JSON.parse(metadata) : null,
        })
        .returning();

      res.json(newModel);
    } catch (error) {
      console.error("Error uploading model:", error);
      res.status(500).send("Error uploading model");
    }
  });

  // Shirts API
  app.get("/api/shirts", async (req, res) => {
    const allShirts = await db.select().from(shirts);
    res.json(allShirts);
  });

  app.post("/api/shirts", upload.single("image"), async (req, res) => {
    const { name, metadata } = req.body;
    const imageUrl = `${req.file?.filename}`;

    const [newShirt] = await db
      .insert(shirts)
      .values({
        name,
        imageUrl,
        metadata: metadata ? JSON.parse(metadata) : null,
      })
      .returning();

    res.json(newShirt);
  });

  // Combined Images API
  app.get("/api/combined", async (req, res) => {
    const results = await db
      .select()
      .from(combinedImages)
      .leftJoin(models, eq(combinedImages.modelId, models.id))
      .leftJoin(shirts, eq(combinedImages.shirtId, shirts.id));
    res.json(results);
  });

  app.post("/api/combined", async (req, res) => {
    const { modelId, shirtId, resultUrl } = req.body;

    const [newCombined] = await db
      .insert(combinedImages)
      .values({
        modelId,
        shirtId,
        resultUrl,
      })
      .returning();

    res.json(newCombined);
  });

  const httpServer = createServer(app);

  return httpServer;
}
