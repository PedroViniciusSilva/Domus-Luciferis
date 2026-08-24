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
import {
  ArrowLeft,
  Download,
  Edit3,
  HelpCircle,
  Home,
  LockKeyhole,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type DonationRecord = {
  id: string;
  createdAt: string;
  updatedAt?: string;
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

type DonationForm = {
  fullName: string;
  phone: string;
  email: string;
  cpf: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
};

const adminTokenKey = "domus-admin-token";

const emptyForm: DonationForm = {
  fullName: "",
  phone: "",
  email: "",
  cpf: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

function formatCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
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
  const [tokenInput, setTokenInput] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DonationForm>(emptyForm);
  const [formError, setFormError] = useState("");

  const isAuthenticated = adminToken.trim().length > 0;
  const editingDonation = useMemo(
    () => donations.find((donation) => donation.id === editingId) || null,
    [donations, editingId]
  );

  const editErrors = useMemo(() => {
    return {
      fullName: form.fullName.trim().split(/\s+/).length < 2,
      phone: onlyDigits(form.phone).length < 10,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
      cpf: !isValidCpf(form.cpf),
      street: form.street.trim().length < 3,
      number: form.number.trim().length < 1,
      neighborhood: form.neighborhood.trim().length < 2,
      city: form.city.trim().length < 2,
    };
  }, [form]);

  const isEditValid = !Object.values(editErrors).some(Boolean);

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
      const msg =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os cadastros.";
      setError(msg);
      setLoginError("Sessão expirada ou chave incorreta. Digite novamente.");
      sessionStorage.removeItem(adminTokenKey);
      setAdminToken("");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    const token = tokenInput.trim();
    if (!token) {
      setLoginError("Digite a chave de administrador.");
      return;
    }

    setAuthenticating(true);

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
        throw new Error(data.message || "Chave de administrador incorreta.");
      }

      sessionStorage.setItem(adminTokenKey, token);
      setAdminToken(token);
      setDonations(data.donations || []);
      setLoginError("");
    } catch (error) {
      sessionStorage.removeItem(adminTokenKey);
      setAdminToken("");
      setDonations([]);
      setLoginError(
        error instanceof Error
          ? error.message
          : "Chave de administrador incorreta ou acesso não autorizado."
      );
    } finally {
      setAuthenticating(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(adminTokenKey);
    setAdminToken("");
    setTokenInput("");
    setDonations([]);
    setError("");
    setLoginError("");
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  }

  function startEditing(donation: DonationRecord) {
    setEditingId(donation.id);
    setForm({
      fullName: donation.fullName,
      phone: donation.phone,
      email: donation.email,
      cpf: donation.cpf,
      street: donation.address.street,
      number: donation.address.number,
      neighborhood: donation.address.neighborhood,
      city: donation.address.city,
    });
    setFormError("");
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  }

  function updateField(field: keyof DonationForm, value: string) {
    const nextValue =
      field === "cpf" ? formatCpf(value) : field === "phone" ? formatPhone(value) : value;

    setForm((current) => ({ ...current, [field]: nextValue }));
    setFormError("");
    setError("");
  }

  async function saveDonation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId || !isEditValid) {
      setFormError("Verifique os campos do cadastro antes de salvar.");
      return;
    }

    setSaving(true);
    setFormError("");
    setError("");

    try {
      const response = await fetch(`/api/admin/donations/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          cpf: form.cpf,
          address: {
            street: form.street,
            number: form.number,
            neighborhood: form.neighborhood,
            city: form.city,
          },
        }),
      });
      const data = await readJsonResponse<{ message?: string }>(response);

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível atualizar o cadastro.");
      }

      cancelEditing();
      await loadDonations(adminToken);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Não foi possível atualizar o cadastro."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteDonation(donation: DonationRecord) {
    const confirmed = window.confirm(
      `Excluir o cadastro de ${donation.fullName}? Esta ação não pode ser desfeita.`
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`/api/admin/donations/${donation.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await readJsonResponse<{ message?: string }>(response);

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível excluir o cadastro.");
      }

      if (editingId === donation.id) {
        cancelEditing();
      }

      await loadDonations(adminToken);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Não foi possível excluir o cadastro."
      );
    }
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
  }, [adminToken]);

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
          <div className="relative mx-auto max-w-md">
            <Card className="border-primary/10 bg-zinc-950/80">
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

                  {loginError && (
                    <div className="rounded-md border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-300">
                      {loginError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={authenticating}
                    className="h-11 w-full bg-primary font-cinzel text-black hover:bg-white disabled:opacity-50"
                  >
                    {authenticating ? "Verificando..." : "Entrar"}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-primary/60 hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                      Esqueci minha chave de acesso
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {showForgotModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <Card className="w-full max-w-md border-primary/30 bg-zinc-950 p-6 relative">
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-3 text-primary mb-4">
                    <HelpCircle className="h-6 w-6" />
                    <h3 className="font-cinzel text-lg uppercase">Recuperar Acesso</h3>
                  </div>
                  <div className="space-y-3 text-sm text-zinc-300">
                    <p>
                      A chave administrativa é configurada nas variáveis de ambiente do servidor do Templo.
                    </p>
                    <div className="bg-black/60 p-3 rounded border border-primary/10 font-mono text-xs text-primary/80">
                      Variável: ADMIN_TOKEN no arquivo .env
                    </div>
                    <p className="text-xs text-zinc-400">
                      Caso não tenha acesso direto ao servidor, contate o administrador técnico do Domus Luciferis para gerar uma nova chave.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowForgotModal(false)}
                    className="mt-6 w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  >
                    Entendido
                  </Button>
                </Card>
              </div>
            )}
          </div>
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

              {editingDonation && (
                <Card className="mb-6 border-primary/10 bg-black/20">
                  <CardHeader className="gap-4 md:flex md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="font-cinzel text-xl text-primary">
                        Editar cadastro
                      </CardTitle>
                      <p className="mt-2 text-sm text-zinc-400">
                        Alterando: {editingDonation.fullName}
                      </p>
                    </div>
                    <Button type="button" variant="ghost" onClick={cancelEditing}>
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-5" onSubmit={saveDonation} noValidate>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome completo</Label>
                        <Input
                          id="fullName"
                          value={form.fullName}
                          onChange={(event) => updateField("fullName", event.target.value)}
                          className="h-11 border-primary/20 bg-black/30"
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={form.phone}
                            onChange={(event) => updateField("phone", event.target.value)}
                            className="h-11 border-primary/20 bg-black/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail</Label>
                          <Input
                            id="email"
                            value={form.email}
                            onChange={(event) => updateField("email", event.target.value)}
                            className="h-11 border-primary/20 bg-black/30"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            value={form.cpf}
                            onChange={(event) => updateField("cpf", event.target.value)}
                            className="h-11 border-primary/20 bg-black/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="number">Número</Label>
                          <Input
                            id="number"
                            value={form.number}
                            onChange={(event) => updateField("number", event.target.value)}
                            className="h-11 border-primary/20 bg-black/30"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="street">Rua</Label>
                        <Input
                          id="street"
                          value={form.street}
                          onChange={(event) => updateField("street", event.target.value)}
                          className="h-11 border-primary/20 bg-black/30"
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="neighborhood">Bairro</Label>
                          <Input
                            id="neighborhood"
                            value={form.neighborhood}
                            onChange={(event) => updateField("neighborhood", event.target.value)}
                            className="h-11 border-primary/20 bg-black/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            value={form.city}
                            onChange={(event) => updateField("city", event.target.value)}
                            className="h-11 border-primary/20 bg-black/30"
                          />
                        </div>
                      </div>

                      {formError && (
                        <div className="rounded-md border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
                          {formError}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="submit"
                          disabled={saving || !isEditValid}
                          className="bg-primary font-cinzel text-black hover:bg-white"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {saving ? "Salvando..." : "Salvar alterações"}
                        </Button>
                        <Button type="button" variant="outline" onClick={cancelEditing}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Atualização</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{formatDate(donation.createdAt)}</TableCell>
                      <TableCell>{formatDate(donation.updatedAt || donation.createdAt)}</TableCell>
                      <TableCell>{donation.fullName}</TableCell>
                      <TableCell>{donation.phone}</TableCell>
                      <TableCell>{donation.email}</TableCell>
                      <TableCell>{donation.cpf}</TableCell>
                      <TableCell>
                        {donation.address.street}, {donation.address.number} -{" "}
                        {donation.address.neighborhood}, {donation.address.city}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(donation)}
                            className="border-primary/30 text-primary hover:bg-primary hover:text-black"
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteDonation(donation)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!loading && donations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-zinc-500">
                        Nenhum cadastro salvo ainda.
                      </TableCell>
                    </TableRow>
                  )}

                  {loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-zinc-500">
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