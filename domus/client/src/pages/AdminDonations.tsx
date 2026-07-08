import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Download, Home, LockKeyhole, RefreshCw } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";

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

const adminTokenKey = "domus-admin-token";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

async function readJsonResponse<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {
      message:
        "A API administrativa não respondeu em JSON. Verifique se o servidor backend está rodando.",
    } as T;
  }
}

export default function AdminDonations() {
  const [, setLocation] = useLocation();
  const [adminToken, setAdminToken] = useState(
    () => sessionStorage.getItem(adminTokenKey) || ""
  );
  const [tokenInput, setTokenInput] = useState(adminToken);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAuthenticated = adminToken.length > 0;

  async function loadDonations(token = adminToken) {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/donations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await readJsonResponse<{
        donations?: DonationRecord[];
        message?: string;
      }>(response);

      if (!response.ok) {
        throw new Error(data.message || "Acesso administrativo não autorizado.");
      }

      setDonations(data.donations || []);
    } catch (error) {
      setDonations([]);
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os cadastros."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = tokenInput.trim();
    sessionStorage.setItem(adminTokenKey, token);
    setAdminToken(token);
    loadDonations(token);
  }

  function handleLogout() {
    sessionStorage.removeItem(adminTokenKey);
    setAdminToken("");
    setTokenInput("");
    setDonations([]);
    setError("");
  }

  async function exportCsv() {
    setError("");

    try {
      const response = await fetch("/api/admin/donations/export", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        const data = await readJsonResponse<{ message?: string }>(response);
        throw new Error(data.message || "Não foi possível exportar a lista.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cadastros-doacoes.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Não foi possível exportar a lista."
      );
    }
  }

  useEffect(() => {
    if (adminToken) {
      loadDonations(adminToken);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8 flex gap-3">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          size="sm"
          className="border border-primary/20 text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={() => setLocation("/")}
          variant="ghost"
          size="sm"
          className="border border-primary/20 text-primary hover:bg-primary/10"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>

      <section className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary/60">
            Área restrita
          </p>
          <h1 className="font-cinzel text-4xl text-primary md:text-5xl">
            Cadastros de doações
          </h1>
        </div>

        {!isAuthenticated ? (
          <Card className="mx-auto max-w-md border-primary/10 bg-zinc-950/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cinzel text-2xl text-primary">
                <LockKeyhole className="h-5 w-5" />
                Acesso admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="adminToken">Chave de administrador</Label>
                  <Input
                    id="adminToken"
                    type="password"
                    value={tokenInput}
                    onChange={(event) => setTokenInput(event.target.value)}
                    placeholder="Digite a chave admin"
                    className="h-11 border-primary/20 bg-black/30"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full bg-primary font-cinzel text-black hover:bg-white"
                >
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/10 bg-zinc-950/80">
            <CardHeader className="gap-4 md:flex md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="font-cinzel text-2xl text-primary">
                  Lista de cadastrados
                </CardTitle>
                <p className="mt-2 text-sm text-zinc-400">
                  {donations.length} cadastro(s) encontrado(s).
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => loadDonations()}
                  disabled={loading}
                  className="border-primary/30 text-primary hover:bg-primary hover:text-black"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
                <Button
                  type="button"
                  onClick={exportCsv}
                  className="bg-primary font-cinzel text-black hover:bg-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Excel
                </Button>
                <Button type="button" variant="ghost" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 rounded-md border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Endereço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{formatDate(donation.createdAt)}</TableCell>
                      <TableCell>{donation.fullName}</TableCell>
                      <TableCell>{donation.phone}</TableCell>
                      <TableCell>{donation.email}</TableCell>
                      <TableCell>{donation.cpf}</TableCell>
                      <TableCell>
                        {donation.address.street}, {donation.address.number} -{" "}
                        {donation.address.neighborhood}, {donation.address.city}
                      </TableCell>
                    </TableRow>
                  ))}

                  {!loading && donations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-zinc-500">
                        Nenhum cadastro salvo ainda.
                      </TableCell>
                    </TableRow>
                  )}

                  {loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-zinc-500">
                        Carregando cadastros...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
