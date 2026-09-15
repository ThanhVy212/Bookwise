import { drizzle } from "drizzle-orm/neon-http";
import config from "@/lib/config";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/database/schema";

const sql = neon(config.env.databaseUrl!);

export const db = drizzle({ client: sql, schema });

