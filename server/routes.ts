import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { models, shirts, combinedImages } from "@db/schema";
import { eq } from "drizzle-orm";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup multer
const multer = (await import("multer")).default;

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    return next();
  }
  res.status(403).send("Admin access required");
};

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Models API
  app.get("/api/models", async (req, res) => {
    const allModels = await db.select().from(models);
    res.json(allModels);
  });

  //
  app.post("/api/models", upload.single("image"), async (req, res) => {
    const { name, gender, metadata } = req.body;
    const imageUrl = `/uploads/${req.file?.filename}`;

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
  });

  // Shirts API
  app.get("/api/shirts", async (req, res) => {
    const allShirts = await db.select().from(shirts);
    res.json(allShirts);
  });

  app.post("/api/shirts", upload.single("image"), async (req, res) => {
    const { name, metadata } = req.body;
    const imageUrl = `/uploads/${req.file?.filename}`;

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
