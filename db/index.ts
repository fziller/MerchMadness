// import { drizzle } from "drizzle-orm/neon-serverless";
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// TODO make sure this works for replit and during deployment!!

export const db = drizzle({ connection: process.env.DATABASE_URL });

// export const db = drizzle({
//   connection: process.env.DATABASE_URL,
//   schema,
//   ws: ws,
// });
