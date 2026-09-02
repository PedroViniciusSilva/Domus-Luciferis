import express from "express";
import { createServer } from "http";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databasePath = path.resolve(process.cwd(), "data", "donations.json");
const activityPath = path.resolve(process.cwd(), "data", "admin-activity.json");
const sqliteDatabasePath = path.resolve(process.cwd(), "data", "domus.db");
fsSync.mkdirSync(path.dirname(sqliteDatabasePath), { recursive: true });
const sqliteDb = new sqlite3.Database(sqliteDatabasePath);
const DEFAULT_ADMIN_TOKEN = "@Domus930324";
const LEGACY_ADMIN_TOKEN = "Domus@930324";
const rateLimitWindowMs = 60_000;
const rateLimitMaxRequests = 60;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function readEnvValue(key: string) {
  const possiblePaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "..", ".env"),
    path.resolve(__dirname, ".env"),
  ];

  for (const envPath of possiblePaths) {
    if (fsSync.existsSync(envPath)) {
      const content = fsSync.readFileSync(envPath, "utf8");
      const line = content
        .split(/\r?\n/)
        .find((l) => l.trim().startsWith(`${key}=`));

      if (line) {
        return line.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }

  return undefined;
}

const adminToken =
  process.env.ADMIN_TOKEN ||
  readEnvValue("ADMIN_TOKEN") ||
  DEFAULT_ADMIN_TOKEN;

function matchesAdminToken(token: string) {
  return Boolean(token) && (token === adminToken || token === LEGACY_ADMIN_TOKEN);
}

function getClientIp(req: express.Request) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  if (Array.isArray(forwarded)) {
    return forwarded[0]?.trim() || "unknown";
  }

  return req.socket?.remoteAddress || "unknown";
}

function applyRateLimit(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const clientIp = getClientIp(req);
  const now = Date.now();
  const current = rateLimitStore.get(clientIp) || {
    count: 0,
    resetAt: now + rateLimitWindowMs,
  };

  if (now >= current.resetAt) {
    current.count = 0;
    current.resetAt = now + rateLimitWindowMs;
  }

  current.count += 1;
  rateLimitStore.set(clientIp, current);

  if (current.count > rateLimitMaxRequests) {
    return res.status(429).json({
      message: "Muitas requisições recebidas. Tente novamente em alguns instantes.",
    });
  }

  return next();
}

function applySecurityHeaders(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const origin = req.headers.origin;
  const configuredOrigin = process.env.CORS_ORIGIN || undefined;
  const isLocalOrigin =
    typeof origin === "string" &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

  if (configuredOrigin) {
    res.setHeader("Access-Control-Allow-Origin", configuredOrigin);
  } else if (isLocalOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
}

type DonationRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phone: string;
  email: string;
  cpf: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
  };
};

type DonationPayload = {
  fullName: string;
  phone: string;
  email: string;
  cpf: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
  };
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

function formatCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (factor: number) => {
    const total = cpf
      .slice(0, factor - 1)
      .split("")
      .reduce((sum, digit, index) => sum + Number(digit) * (factor - index), 0);
    const result = (total * 10) % 11;

    return result === 10 ? 0 : result;
  };

  return calculateDigit(10) === Number(cpf[9]) && calculateDigit(11) === Number(cpf[10]);
}

function sanitizeText(value: unknown, maxLength = 160) {
  return String(value || "").trim().slice(0, maxLength);
}

function buildDonationRecord(body: Partial<DonationPayload>, existing?: DonationRecord) {
  const address: Partial<DonationPayload["address"]> = body.address || {};
  const now = new Date().toISOString();
  const donation: DonationRecord = {
    id: existing?.id || randomUUID(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    fullName: sanitizeText(body.fullName),
    phone: sanitizeText(body.phone, 32),
    email: sanitizeText(body.email, 120).toLowerCase(),
    cpf: formatCpf(sanitizeText(body.cpf, 20)),
    address: {
      street: sanitizeText(address.street),
      number: sanitizeText(address.number, 20),
      neighborhood: sanitizeText(address.neighborhood),
      city: sanitizeText(address.city),
    },
  };

  const invalidFields = [
    donation.fullName.split(/\s+/).length < 2 && "fullName",
    onlyDigits(donation.phone).length < 10 && "phone",
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donation.email) && "email",
    !isValidCpf(donation.cpf) && "cpf",
    !donation.address.street && "street",
    !donation.address.number && "number",
    !donation.address.neighborhood && "neighborhood",
    !donation.address.city && "city",
  ].filter(Boolean);

  return { donation, invalidFields };
}

type DonationRow = {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phone: string;
  email: string;
  cpf: string;
  address: string | null;
};

function runSql<T>(sql: string, params: Array<string | number | null> = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    sqliteDb.all<T>(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows || []);
    });
  });
}

function runSqlWrite(sql: string, params: Array<string | number | null> = []): Promise<void> {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (error) {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function initializeDatabase() {
  await fs.mkdir(path.dirname(sqliteDatabasePath), { recursive: true });

  await runSqlWrite(`
    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      fullName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      cpf TEXT NOT NULL,
      address TEXT NOT NULL
    );
  `);

  await runSqlWrite(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      recordId TEXT,
      label TEXT NOT NULL,
      occurredAt TEXT NOT NULL
    );
  `);

  const currentRows = await runSql<DonationRow>("SELECT * FROM donations");
  if (currentRows.length === 0) {
    const legacyDonations = await readLegacyDonations();
    if (legacyDonations.length > 0) {
      await writeDbDonations(legacyDonations);
    }
  }

  const currentActivity = await runSql<Record<string, string | null>>("SELECT * FROM activity_log");
  if (currentActivity.length === 0) {
    const legacyActivity = await readLegacyActivityLog();
    if (legacyActivity.length > 0) {
      await writeDbActivityLog(legacyActivity);
    }
  }
}

async function readLegacyDonations() {
  try {
    const content = await fs.readFile(databasePath, "utf8");
    const parsed = JSON.parse(content) as Array<Partial<DonationRecord>>;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((donation) => ({
      id: donation.id || randomUUID(),
      createdAt: donation.createdAt || new Date().toISOString(),
      updatedAt: donation.updatedAt || donation.createdAt || new Date().toISOString(),
      fullName: donation.fullName || "",
      phone: donation.phone || "",
      email: donation.email || "",
      cpf: donation.cpf || "",
      address: {
        street: donation.address?.street || "",
        number: donation.address?.number || "",
        neighborhood: donation.address?.neighborhood || "",
        city: donation.address?.city || "",
      },
    }));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ENOENT") {
      return [];
    }

    console.warn("[DATA] Não foi possível ler o arquivo de doações. Iniciando com lista vazia.");
    return [];
  }
}

async function writeLegacyDonations(donations: DonationRecord[]) {
  await fs.mkdir(path.dirname(databasePath), { recursive: true });
  await fs.writeFile(databasePath, JSON.stringify(donations, null, 2), "utf8");
}

async function readDonations() {
  try {
    await initializeDatabase();
    const rows = await runSql<DonationRow>("SELECT * FROM donations ORDER BY createdAt DESC");

    if (rows.length > 0) {
      return rows.map((donation) => {
        const parsedAddress = donation.address ? JSON.parse(donation.address) : {};
        return {
          id: donation.id,
          createdAt: donation.createdAt,
          updatedAt: donation.updatedAt || donation.createdAt,
          fullName: donation.fullName,
          phone: donation.phone,
          email: donation.email,
          cpf: donation.cpf,
          address: {
            street: parsedAddress.street || "",
            number: parsedAddress.number || "",
            neighborhood: parsedAddress.neighborhood || "",
            city: parsedAddress.city || "",
          },
        };
      });
    }

    const legacy = await readLegacyDonations();
    if (legacy.length > 0) {
      await writeDonations(legacy);
      return legacy;
    }

    return [];
  } catch (error) {
    console.warn("[DB] Falha ao ler doações do SQLite; usando fallback do JSON.", error);
    return readLegacyDonations();
  }
}

async function writeDbDonations(donations: DonationRecord[]) {
  await new Promise<void>((resolve, reject) => {
    sqliteDb.serialize(() => {
      sqliteDb.run("BEGIN IMMEDIATE");
      sqliteDb.run("DELETE FROM donations");

      const stmt = sqliteDb.prepare(
        "INSERT INTO donations (id, createdAt, updatedAt, fullName, phone, email, cpf, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      );

      donations.forEach((donation) => {
        stmt.run(
          donation.id,
          donation.createdAt,
          donation.updatedAt || donation.createdAt,
          donation.fullName,
          donation.phone,
          donation.email,
          donation.cpf,
          JSON.stringify(donation.address)
        );
      });

      stmt.finalize((error) => {
        if (error) {
          sqliteDb.run("ROLLBACK");
          reject(error);
          return;
        }

        sqliteDb.run("COMMIT", (commitError) => {
          if (commitError) {
            reject(commitError);
            return;
          }

          resolve();
        });
      });
    });
  });
}

async function writeDonations(donations: DonationRecord[]) {
  try {
    await initializeDatabase();
    await writeDbDonations(donations);
    await writeLegacyDonations(donations);
  } catch (error) {
    console.warn("[DB] Falha ao gravar no SQLite; usando fallback do JSON.", error);
    await writeLegacyDonations(donations);
  }
}

async function readLegacyActivityLog() {
  try {
    const content = await fs.readFile(activityPath, "utf8");
    const parsed = JSON.parse(content) as Array<Record<string, unknown>>;
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return [];
    }

    console.warn("[DATA] Não foi possível ler o log de movimentações do admin.");
    return [];
  }
}

async function writeLegacyActivityLog(entries: Array<Record<string, unknown>>) {
  await fs.mkdir(path.dirname(activityPath), { recursive: true });
  await fs.writeFile(activityPath, JSON.stringify(entries, null, 2), "utf8");
}

async function readActivityLog() {
  try {
    await initializeDatabase();
    const rows = await runSql<Record<string, string | null | undefined>>(
      "SELECT id, type, recordId, label, occurredAt FROM activity_log ORDER BY occurredAt DESC"
    );

    if (rows.length > 0) {
      return rows.map((row) => ({
        id: row.id || randomUUID(),
        type: row.type || "update",
        recordId: row.recordId || null,
        label: row.label || "Movimentação administrativa",
        occurredAt: row.occurredAt || new Date().toISOString(),
      }));
    }

    const legacy = await readLegacyActivityLog();
    if (legacy.length > 0) {
      await writeActivityLog(legacy);
      return legacy;
    }

    return [];
  } catch (error) {
    console.warn("[DB] Falha ao ler o log de movimentações do SQLite; usando fallback do JSON.", error);
    return readLegacyActivityLog();
  }
}

async function writeDbActivityLog(entries: Array<Record<string, unknown>>) {
  await new Promise<void>((resolve, reject) => {
    sqliteDb.serialize(() => {
      sqliteDb.run("BEGIN IMMEDIATE");
      sqliteDb.run("DELETE FROM activity_log");

      const stmt = sqliteDb.prepare(
        "INSERT INTO activity_log (id, type, recordId, label, occurredAt) VALUES (?, ?, ?, ?, ?)"
      );

      entries.forEach((entry) => {
        stmt.run(
          String(entry.id || randomUUID()),
          String(entry.type || "update"),
          entry.recordId ? String(entry.recordId) : null,
          String(entry.label || "Movimentação administrativa"),
          String(entry.occurredAt || new Date().toISOString())
        );
      });

      stmt.finalize((error) => {
        if (error) {
          sqliteDb.run("ROLLBACK");
          reject(error);
          return;
        }

        sqliteDb.run("COMMIT", (commitError) => {
          if (commitError) {
            reject(commitError);
            return;
          }

          resolve();
        });
      });
    });
  });
}

async function writeActivityLog(entries: Array<Record<string, unknown>>) {
  try {
    await initializeDatabase();
    await writeDbActivityLog(entries);
    await writeLegacyActivityLog(entries);
  } catch (error) {
    console.warn("[DB] Falha ao gravar log no SQLite; usando fallback do JSON.", error);
    await writeLegacyActivityLog(entries);
  }
}

async function recordActivity(type: "entry" | "exit" | "update", recordId?: string, label?: string) {
  const entries = await readActivityLog();
  const nextEntry = {
    id: randomUUID(),
    type,
    recordId: recordId || null,
    label: label || "Movimentação administrativa",
    occurredAt: new Date().toISOString(),
  };

  entries.push(nextEntry);
  await writeActivityLog(entries);
  return nextEntry;
}

function buildMovementSummary(movements: Array<Record<string, unknown>>) {
  const daily = new Map<string, { date: string; entry: number; exit: number; update: number }>();
  const monthly = new Map<string, { month: string; entry: number; exit: number; update: number }>();
  const yearly = new Map<string, { year: string; entry: number; exit: number; update: number }>();

  for (const movement of movements) {
    const timestamp = typeof movement.occurredAt === "string" ? movement.occurredAt : new Date().toISOString();
    const date = new Date(timestamp);
    const dayKey = date.toISOString().slice(0, 10);
    const monthKey = date.toISOString().slice(0, 7);
    const yearKey = date.getFullYear().toString();
    const type = String(movement.type || "update");

    const dailyEntry = daily.get(dayKey) || { date: dayKey, entry: 0, exit: 0, update: 0 };
    if (type === "entry") dailyEntry.entry += 1;
    if (type === "exit") dailyEntry.exit += 1;
    if (type === "update") dailyEntry.update += 1;
    daily.set(dayKey, dailyEntry);

    const monthlyEntry = monthly.get(monthKey) || { month: monthKey, entry: 0, exit: 0, update: 0 };
    if (type === "entry") monthlyEntry.entry += 1;
    if (type === "exit") monthlyEntry.exit += 1;
    if (type === "update") monthlyEntry.update += 1;
    monthly.set(monthKey, monthlyEntry);

    const yearlyEntry = yearly.get(yearKey) || { year: yearKey, entry: 0, exit: 0, update: 0 };
    if (type === "entry") yearlyEntry.entry += 1;
    if (type === "exit") yearlyEntry.exit += 1;
    if (type === "update") yearlyEntry.update += 1;
    yearly.set(yearKey, yearlyEntry);
  }

  return {
    daily: Array.from(daily.values()).sort((a, b) => a.date.localeCompare(b.date)),
    monthly: Array.from(monthly.values()).sort((a, b) => a.month.localeCompare(b.month)),
    yearly: Array.from(yearly.values()).sort((a, b) => a.year.localeCompare(b.year)),
  };
}

function isAdminRequest(req: express.Request) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  return matchesAdminToken(token);
}

function csvValue(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function toCsv(donations: DonationRecord[]) {
  const headers = [
    "Data de cadastro",
    "Atualizado em",
    "Nome completo",
    "Telefone",
    "Email",
    "CPF",
    "Rua",
    "Numero",
    "Bairro",
    "Cidade",
  ];
  const rows = donations.map((donation) => [
    donation.createdAt,
    donation.updatedAt || donation.createdAt,
    donation.fullName,
    donation.phone,
    donation.email,
    donation.cpf,
    donation.address.street,
    donation.address.number,
    donation.address.neighborhood,
    donation.address.city,
  ]);

  return [
    headers.map(csvValue).join(";"),
    ...rows.map((row) => row.map(csvValue).join(";")),
  ].join("\n");
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.disable("x-powered-by");
  app.use((req, res, next) => applySecurityHeaders(req, res, next));
  app.use((req, res, next) => applyRateLimit(req, res, next));
  app.use(express.json({ limit: "64kb" }));

  app.post("/api/donations", async (req, res) => {
    const body = req.body || {};
    const { donation, invalidFields } = buildDonationRecord(body);

    if (body.acceptedLgpd !== true) {
      invalidFields.push("acceptedLgpd");
    }

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: "Verifique os dados do cadastro.",
        fields: invalidFields,
      });
    }

    const donations = await readDonations();

    // Verificação de duplicidades
    const normalize = (str: string) => (str || "").trim().toLowerCase();

    const isDuplicate = donations.some((d) => {
      const sameCpf = onlyDigits(d.cpf) === onlyDigits(donation.cpf);
      const sameEmail = normalize(d.email) === normalize(donation.email);
      const samePhone = onlyDigits(d.phone) === onlyDigits(donation.phone);
      const sameName = normalize(d.fullName) === normalize(donation.fullName);

      const sameAddress =
        normalize(d.address.street) === normalize(donation.address.street) &&
        normalize(d.address.number) === normalize(donation.address.number) &&
        normalize(d.address.neighborhood) === normalize(donation.address.neighborhood) &&
        normalize(d.address.city) === normalize(donation.address.city);

      return sameCpf || sameEmail || samePhone || sameName || sameAddress;
    });

    if (isDuplicate) {
      return res.status(409).json({
        message: "Dados já cadastrados. Já existe um registro com este CPF, e-mail, telefone, nome ou endereço.",
      });
    }

    donations.push(donation);
    await writeDonations(donations);
    await recordActivity("entry", donation.id, donation.fullName);

    return res.status(201).json({
      message:
        "Cadastro feito com sucesso. Você será avisada para qual dia buscar a cesta.",
      id: donation.id,
    });
  });

  app.patch("/api/admin/donations/:id", async (req, res) => {
    if (!isAdminRequest(req)) {
      return res.status(401).json({ message: "Acesso administrativo não autorizado." });
    }

    const donations = await readDonations();
    const index = donations.findIndex((donation) => donation.id === req.params.id);

    if (index < 0) {
      return res.status(404).json({ message: "Cadastro não encontrado." });
    }

    const { donation, invalidFields } = buildDonationRecord(req.body || {}, donations[index]);

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: "Verifique os dados do cadastro.",
        fields: invalidFields,
      });
    }

    donations[index] = {
      ...donations[index],
      ...donation,
      createdAt: donations[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    await writeDonations(donations);
    await recordActivity("update", donations[index].id, donations[index].fullName);

    return res.json({
      message: "Cadastro atualizado com sucesso.",
      donation: donations[index],
    });
  });

  app.delete("/api/admin/donations/:id", async (req, res) => {
    if (!isAdminRequest(req)) {
      return res.status(401).json({ message: "Acesso administrativo não autorizado." });
    }

    const donations = await readDonations();
    const nextDonations = donations.filter((donation) => donation.id !== req.params.id);

    if (nextDonations.length === donations.length) {
      return res.status(404).json({ message: "Cadastro não encontrado." });
    }

    await writeDonations(nextDonations);
    await recordActivity("exit", req.params.id, "Cadastro removido");

    return res.json({ message: "Cadastro removido com sucesso." });
  });

  app.get("/api/admin/donations", async (req, res) => {
    if (!isAdminRequest(req)) {
      return res.status(401).json({ message: "Acesso administrativo não autorizado." });
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 25)));
    const donations = await readDonations();
    const movements = await readActivityLog();
    const summary = buildMovementSummary(movements);
    const total = donations.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * limit;
    const paginatedDonations = donations.toReversed().slice(startIndex, startIndex + limit);

    return res.json({
      donations: paginatedDonations,
      movements: movements.toReversed().slice(0, 30),
      summary,
      pagination: {
        page: currentPage,
        limit,
        total,
        totalPages,
      },
    });
  });

  app.get("/api/admin/donations/export", async (req, res) => {
    if (!isAdminRequest(req)) {
      return res.status(401).json({ message: "Acesso administrativo não autorizado." });
    }

    const donations = await readDonations();
    const csv = toCsv(donations);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="cadastros-doacoes.csv"');
    return res.send(`\uFEFF${csv}`);
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = Number(process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 3001));

  server.listen(port, () => {
    const tokenStatus =
      process.env.ADMIN_TOKEN || readEnvValue("ADMIN_TOKEN")
        ? "configurado via variável de ambiente"
        : "usando token padrão local";

    console.log(`[AUTH] Token administrativo ${tokenStatus}.`);
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);