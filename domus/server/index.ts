import express from "express";
import { createServer } from "http";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databasePath = path.resolve(process.cwd(), "data", "donations.json");

function readEnvValue(key: string) {
  const envPath = path.resolve(process.cwd(), ".env");

  if (!fsSync.existsSync(envPath)) {
    return undefined;
  }

  const content = fsSync.readFileSync(envPath, "utf8");
  const line = content
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith(`${key}=`));

  return line?.slice(key.length + 1).trim().replace(/^["']|["']$/g, "");
}

const adminToken = process.env.ADMIN_TOKEN || readEnvValue("ADMIN_TOKEN");

type DonationRecord = {
  id: string;
  createdAt: string;
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

async function readDonations() {
  try {
    const content = await fs.readFile(databasePath, "utf8");
    return JSON.parse(content) as DonationRecord[];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeDonations(donations: DonationRecord[]) {
  await fs.mkdir(path.dirname(databasePath), { recursive: true });
  await fs.writeFile(databasePath, JSON.stringify(donations, null, 2), "utf8");
}

function isAdminRequest(req: express.Request) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  return Boolean(adminToken) && token === adminToken;
}

function csvValue(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function toCsv(donations: DonationRecord[]) {
  const headers = [
    "Data de cadastro",
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

  app.use(express.json({ limit: "64kb" }));

  app.post("/api/donations", async (req, res) => {
    const body = req.body || {};
    const address = body.address || {};
    const donation: DonationRecord = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
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
      body.acceptedLgpd !== true && "acceptedLgpd",
    ].filter(Boolean);

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: "Verifique os dados do cadastro.",
        fields: invalidFields,
      });
    }

    const donations = await readDonations();
    donations.push(donation);
    await writeDonations(donations);

    return res.status(201).json({
      message:
        "Cadastro feito com sucesso. Você será avisada para qual dia buscar a cesta.",
      id: donation.id,
    });
  });

  app.get("/api/admin/donations", async (req, res) => {
    if (!isAdminRequest(req)) {
      return res.status(401).json({ message: "Acesso administrativo não autorizado." });
    }

    const donations = await readDonations();
    return res.json({ donations: donations.toReversed() });
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

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
