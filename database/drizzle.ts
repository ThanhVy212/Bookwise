import { drizzle } from "drizzle-orm/neon-http";
import config from "@/lib/config";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/database/schema";

const dbUrl = config.env.databaseUrl || process.env.DATABASE_URL || "";
const sql = neon(dbUrl);

export const db = drizzle({ client: sql, schema });

