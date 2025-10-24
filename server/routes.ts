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
import multer from "multer";
import { nanoid } from "nanoid";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { setupAuth } from "./auth";
import { runGetImageFromPSFile } from "./scripts/runGetImageFromPSFile";
import { runTriggerMerchMadnessAction } from "./scripts/runTriggerMerchMadnessAction";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // ES modules compatibility
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // The structure is different when we run it directly from the repository.
  const publicDir =
    app.get("env") === "production"
      ? join(__dirname, "public")
      : join(__dirname, "..", "public");
  const uploadsDir = join(publicDir, "uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const upload = multer({
    storage: multer.diskStorage({
      destination: uploadsDir,
      filename: (req, file, cb) => {
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

  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  // Models API
  app.get("/api/models", async (req, res) => {
    const allModels = await db.select().from(models);
    res.json(allModels);
  });

  app.post(
    "/api/models",
    upload.fields([{ name: "modelFile" }, { name: "automationFile" }]),
    async (req, res) => {
      try {
        if (!req.files) {
          return res.status(400).send("No image file uploaded");
        }

        const { resultName, direction, color, type } = req.body;

        const documentUrl = `/uploads/${req.files.modelFile[0].filename}`;
        const resultFileName = `model_img_${resultName}.jpg`;
        const imageUrl = `/uploads/${resultFileName}`;

        try {
          await runGetImageFromPSFile({ resultFileName, documentUrl });
        } catch (e) {
          console.error("Script execution error:", e);
          return res.status(500).send("Error processing image");
        }

        const [newModel] = await db
          .insert(models)
          .values({
            name: req.body.name,
            imageUrl,
            documentUrl,
            color,
            direction,
            type,
            automationUrl: `/uploads/${req.files?.automationFile?.[0].filename}`,
            automationName:
              req.files?.automationFile?.[0].originalname.split(".")[0],
          })
          .returning();
        res.json(newModel);
      } catch (error) {
        console.error("Error uploading model:", error);
        res.status(500).send("Error uploading model");
      }
    }
  );

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

      // Delete the image file
      try {
        console.log("Deleting image url", model.imageUrl);
        await fs.promises.unlink(join(__dirname, "public", model.imageUrl));
      } catch (err) {
        console.error("Error deleting file:", err);
        // Continue even if file deletion fails
      }

      // Delete the document file
      try {
        console.log("Deleting document url", model.documentUrl);
        await fs.promises.unlink(join(__dirname, "public", model.documentUrl));
      } catch (err) {
        console.error("Error deleting file:", err);
        // Continue even if file deletion fails
      }

      // Delete the automation file
      try {
        console.log("Deleting automation url", model.automationUrl);
        model.automationUrl &&
          (await fs.promises.unlink(
            join(__dirname, "public", model.automationUrl)
          ));
      } catch (err) {
        console.error("Error deleting file:", err);
        // Continue even if file deletion fails
      }

      // Delete any image from combined image database
      await db
        .delete(combinedImages)
        .where(eq(combinedImages.modelId, parseInt(req.params.id)));

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
      const { name, color } = req.body;
      console.log("req.body", req.body);
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
          color,
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

      await db
        .delete(combinedImages)
        .where(eq(combinedImages.shirtId, parseInt(req.params.id)));

      // Delete the physical file
      try {
        await fs.promises.unlink(join(__dirname, "public", shirt.imageUrl));
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
      const resultFileName = `result_${model.id}_${shirt.id}_${nanoid(8)}.jpg`;

      // const actionName = shirt.imageUrl.includes("_front")
      //   ? "250402_Impericon_Frontprint_FarbbereichSchwarz"
      //   : "250402_Impericon_Backprint_FarbbereichSchwarz";

      try {
        await runTriggerMerchMadnessAction({
          actionUrl: model.automationUrl,
          resultFileName,
          modelDocumentUrl: model.documentUrl,
          shirtFileUrl: shirt.imageUrl,
          actionName: model.automationName,
          layerName: "Longsleeve", // <- vormals Bug via getenv
          actionSetName: "Standardaktionen", // Will be added to the action name
        });
      } catch (e) {
        console.error("Script execution error:", e);
      }

      const [newCombined] = await db
        .insert(combinedImages)
        .values({
          modelId: model.id,
          shirtId: shirt.id,
          imageUrl: `/uploads/${resultFileName}`,
        })
        .returning();

      res.json(newCombined);
    } catch (err) {
      console.error("Error creating combined image:", err);
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
      try {
        await fs.promises.unlink(join(__dirname, "public", combined.imageUrl));
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
