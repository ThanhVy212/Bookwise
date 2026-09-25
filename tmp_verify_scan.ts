import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const BASE = "http://localhost:3000";
const RECORD = "555d910e-0a82-4d45-982a-3b7132423c03";
const EMAIL = "zz.scan.verify.test@example.com";
const PASS = "ScanVerify123!";

const cookies = new Map<string, string>();
const store = (res: Response) => {
  const set = res.headers.getSetCookie?.() ?? [];
  for (const c of set) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    cookies.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
};
const cookieHeader = () =>
  [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");

const run = async () => {
  const sql = neon(process.env.DATABASE_URL!);
  const hash = await bcrypt.hash(PASS, 10);
  await sql`
    insert into users (id, full_name, email, university_id, password, role, status, university_card, last_activity_date)
    values (gen_random_uuid(), 'ZZ Scan Verify', ${EMAIL}, 999001, ${hash}, 'ADMIN', 'VERIFIED', 'card-verify', current_date)
    on conflict (email) do nothing
  `;

  // 1. csrf
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  store(csrfRes);
  const csrfJson = (await csrfRes.json()) as { csrfToken: string };

  // 2. sign in
  const body = new URLSearchParams({
    csrfToken: csrfJson.csrfToken,
    email: EMAIL,
    password: PASS,
    callbackUrl: BASE,
    json: "true",
  });
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    redirect: "manual",
  });
  store(loginRes);
  console.log("login status:", loginRes.status);

  // 3. fetch scan page
  const pageRes = await fetch(`${BASE}/scan/${RECORD}`, {
    headers: { cookie: cookieHeader() },
    redirect: "manual",
  });
  store(pageRes);
  const html = await pageRes.text();
  console.log("page status:", pageRes.status, "loc:", pageRes.headers.get("location"));

  const img = html.match(/src="([^"]*Operating_System[^"]*)"/);
  console.log("IMG SRC:", img?.[1] ?? "NOT FOUND");
  const dark = html.match(/class="([^"]*bg-pattern[^"]*)"/);
  console.log("DARK WRAPPER:", dark?.[1] ?? "NOT FOUND");
  console.log("has 'Back to borrow requests':", html.includes("Back to borrow requests"));

  // cleanup
  await sql`delete from users where email = ${EMAIL}`;
  console.log("temp user cleaned");
};

run();
