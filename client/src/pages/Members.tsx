import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  Edit2,
  FileText,
  HandHeart,
  HeartHandshake,
  Home,
  Info,
  KeyRound,
  Lock,
  MapPin,
  MessageCircle,
  QrCode,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
  UserCheck,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

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

type StoredDonation = {
  id: string | number;
  fullName: string;
  phone: string;
  email: string;
  cpf: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  notes?: string;
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
  } | string;
  createdAt?: string;
};

const PIX_KEY = "cf8851df-7e0d-4af0-8247-6cf26cff3a98";
const BANK_DETAILS = {
  bank: "Banco Inter (077)",
  agency: "0001",
  account: "1234567-8",
  name: "Santuário Domus Luciferis",
  cnpj: "00.000.000/0001-00",
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

export default function Members() {
  const [, setLocation] = useLocation();

  const [viewMode, setViewMode] = useState<"menu" | "receber" | "fazer">("menu");
  const [donationMethod, setDonationMethod] = useState<"pix" | "banco" | "presencial">("pix");
  const [copiedPix, setCopiedPix] = useState(false);

  // Formulário do Usuário
  const [form, setForm] = useState<DonationForm>({
    fullName: "",
    phone: "",
    email: "",
    cpf: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "Brasília",
  });
  const [acceptedLgpd, setAcceptedLgpd] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Estado e Controle Admin
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem("domus_admin_token"));
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [donationsList, setDonationsList] = useState<StoredDonation[]>(() => {
    return [];
  });
  const [searchFilter, setSearchFilter] = useState("");
  const [loadingDonations, setLoadingDonations] = useState(false);

  // Modal de Edição do Administrador
  const [editingRecord, setEditingRecord] = useState<StoredDonation | null>(null);

  // Carrega e sincroniza cadastros
  const loadDonations = async () => {
    setLoadingDonations(true);
    let itemsFromApi: StoredDonation[] = [];

    try {
      const res = await fetch("/api/admin/donations", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("domus_admin_token") || ""}` },
      });
      if (res.ok) {
        const data = await res.json();
        itemsFromApi = Array.isArray(data.donations) ? data.donations : [];
      }
    } catch {
      // fallback
    }

    setDonationsList(itemsFromApi);
    setLoadingDonations(false);
  };

  useEffect(() => {
    if (isAdmin && viewMode === "receber") {
      loadDonations();
    }
  }, [isAdmin, viewMode]);

  const errors = useMemo(() => {
    return {
      fullName: form.fullName.trim().split(/\s+/).length < 2,
      phone: onlyDigits(form.phone).length < 10,
      email: form.email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
      cpf: !isValidCpf(form.cpf),
      street: form.street.trim().length < 3,
      number: form.number.trim().length < 1,
      neighborhood: form.neighborhood.trim().length < 2,
      city: form.city.trim().length < 2,
      lgpd: !acceptedLgpd,
    };
  }, [acceptedLgpd, form]);

  const isFormValid = !Object.values(errors).some(Boolean);

  async function handleLoginAdmin() {
    const input = adminPasswordInput.trim();
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: input }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      sessionStorage.setItem("domus_admin_token", data.token);
      setIsAdmin(true);
      setShowAuthModal(false);
      setAdminPasswordInput("");
      setAuthError("");
      loadDonations();
    } catch {
      setAuthError("Senha de administrador incorreta.");
    }
  }

  function handleLogoutAdmin() {
    setIsAdmin(false);
    sessionStorage.removeItem("domus_admin_token");
  }

  async function handleChangePassword() {
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordMessage("A confirmação da nova senha não confere.");
      return;
    }
    const response = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("domus_admin_token") || ""}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) { setPasswordMessage(data.message || "Não foi possível alterar a senha."); return; }
    sessionStorage.setItem("domus_admin_token", data.token);
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordMessage(data.message);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  }

  function updateField(field: keyof DonationForm, value: string) {
    const nextValue =
      field === "cpf" ? formatCpf(value) : field === "phone" ? formatPhone(value) : value;

    setForm((current) => ({ ...current, [field]: nextValue }));
    setSubmitted(false);
    setSubmitError("");
    setSubmitMessage("");
  }

  function handleOpenEditModal(record: StoredDonation) {
    let street = record.street || "";
    let number = record.number || "";
    let neighborhood = record.neighborhood || "";
    let city = record.city || "";

    if (typeof record.address === "object" && record.address !== null) {
      street = record.address.street || street;
      number = record.address.number || number;
      neighborhood = record.address.neighborhood || neighborhood;
      city = record.address.city || city;
    }

    setEditingRecord({
      ...record,
      street,
      number,
      neighborhood,
      city,
      notes: record.notes || "",
    });
  }

  async function handleSaveEditedRecord() {
    if (!editingRecord) return;

    const response = await fetch(`/api/admin/donations/${editingRecord.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("domus_admin_token") || ""}`,
      },
      body: JSON.stringify({
        fullName: editingRecord.fullName.trim(),
        phone: editingRecord.phone.trim(),
        email: (editingRecord.email || "").trim(),
        cpf: editingRecord.cpf.trim(),
        address: {
          street: (editingRecord.street || "").trim(),
          number: (editingRecord.number || "").trim(),
          neighborhood: (editingRecord.neighborhood || "").trim(),
          city: (editingRecord.city || "").trim(),
        },
        notes: (editingRecord.notes || "").trim(),
      }),
    });

    if (!response.ok) {
      setSubmitError("Não foi possível atualizar o cadastro.");
      return;
    }

    await loadDonations();
    setEditingRecord(null);
  }

  async function handleDeleteDonation(id: string | number) {
    if (!confirm("Deseja realmente remover este cadastro?")) return;

    const response = await fetch(`/api/admin/donations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${sessionStorage.getItem("domus_admin_token") || ""}` },
    });
    if (!response.ok) {
      setSubmitError("Não foi possível remover o cadastro.");
      return;
    }

    const updated = donationsList.filter((d) => d.id !== id);
    setDonationsList(updated);
  }

  function exportToExcel() {
    if (donationsList.length === 0) return;

    const headers = [
      "ID",
      "Data Cadastro",
      "Nome Completo",
      "Telefone",
      "E-mail",
      "CPF",
      "Endereço Completo",
      "Observacoes",
    ];

    const rows = donationsList.map((d) => {
      let addr = "";
      if (typeof d.address === "object" && d.address !== null) {
        addr = `${d.address.street || ""}, ${d.address.number || ""} - ${d.address.neighborhood || ""}, ${d.address.city || ""}`;
      } else if (typeof d.address === "string") {
        addr = d.address;
      } else {
        addr = `${d.street || ""} ${d.number || ""} ${d.neighborhood || ""} ${d.city || ""}`;
      }

      return [
        `"${d.id}"`,
        `"${d.createdAt || "N/A"}"`,
        `"${(d.fullName || "").replace(/"/g, '""')}"`,
        `"${d.phone || ""}"`,
        `"${d.email || ""}"`,
        `"${d.cpf || ""}"`,
        `"${addr.trim().replace(/"/g, '""')}"`,
        `"${(d.notes || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cadastros_cestas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFormValid) {
      setSubmitted(false);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
          acceptedLgpd,
        }),
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data.message || "Erro ao registrar cadastro.");
      }

      setSubmitted(true);
      setSubmitMessage(
        data.message ||
          "Cadastro realizado com sucesso. Você será avisado(a) para a data de retirada presencial em Brasília."
      );
      setForm({
        fullName: "",
        phone: "",
        email: "",
        cpf: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "Brasília",
      });
      setAcceptedLgpd(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível concluir o cadastro.");
    } finally {
      setSubmitting(false);
    }
  }

  function getWhatsAppHandDeliveryUrl() {
    const text = encodeURIComponent(
      "Saudações. Gostaria de agendar uma data para fazer uma doação presencial de alimentos / cestas no santuário em Brasília."
    );
    return `https://chat.whatsapp.com/HhpYGYoCqkdDSrTpayzUjc?text=${text}`;
  }

  const filteredDonations = donationsList.filter((d) => {
    const term = searchFilter.toLowerCase();
    const name = (d.fullName || "").toLowerCase();
    const cpf = (d.cpf || "").toLowerCase();
    const phone = (d.phone || "").toLowerCase();
    const notes = (d.notes || "").toLowerCase();
    return name.includes(term) || cpf.includes(term) || phone.includes(term) || notes.includes(term);
  });

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Topo de Navegação */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3">
          <Button
            onClick={() => {
              if (viewMode !== "menu") {
                setViewMode("menu");
                setSubmitted(false);
                setSubmitError("");
              } else {
                window.history.back();
              }
            }}
            variant="ghost"
            size="sm"
            className="border border-primary/20 text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {viewMode === "menu" ? "Voltar" : "Opções de Doação"}
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

        {viewMode === "receber" && (
          <div>
            {isAdmin ? (
              <div className="flex gap-2">
                <Button onClick={() => { setPasswordMessage(""); setShowPasswordModal(true); }} variant="outline" size="sm" className="border-primary/30 text-primary">
                  <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Alterar senha
                </Button>
                <Button onClick={handleLogoutAdmin} variant="outline" size="sm" className="border-primary/40 bg-primary/10 font-cinzel text-xs uppercase tracking-wider text-primary hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40">
                  <Unlock className="mr-1.5 h-3.5 w-3.5" /> Sair do Painel Admin
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setAuthError("");
                  setAdminPasswordInput("");
                  setShowAuthModal(true);
                }}
                variant="outline"
                size="sm"
                className="border-primary/20 font-cinzel text-xs uppercase tracking-wider text-zinc-400 hover:text-primary hover:bg-primary/10"
              >
                <Lock className="mr-1.5 h-3.5 w-3.5" /> Acesso Admin (Ver Cadastros)
              </Button>
            )}
          </div>
        )}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-primary/40 bg-zinc-950 p-6 text-zinc-200">
            <CardTitle className="mb-5 font-cinzel text-lg text-primary">Alterar senha</CardTitle>
            <div className="space-y-3">
              <Input type="password" placeholder="Senha atual" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <Input type="password" placeholder="Nova senha (mínimo 8 caracteres)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Input type="password" placeholder="Confirme a nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              {passwordMessage && <p className="text-xs text-primary">{passwordMessage}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
                <Button onClick={handleChangePassword} className="bg-primary text-black">Salvar nova senha</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Título Principal */}
      <section className="mx-auto mb-14 max-w-4xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary/60">
          Ação Social & Solidariedade do Santuário
        </p>
        <h1 className="font-cinzel text-4xl text-primary md:text-6xl">
          Portal de Doações
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          O Domus Luciferis atua no amparo à comunidade. Escolha abaixo como deseja participar de nossa corrente de apoio mútuo.
        </p>
      </section>

      {/* 1. MENU INICIAL */}
      {viewMode === "menu" && (
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <Card
            onClick={() => setViewMode("receber")}
            className="group cursor-pointer overflow-hidden border-primary/20 bg-zinc-950/80 backdrop-blur transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/95 flex items-center justify-center">
                <img
                  src="/images/rituals/amarracao.jpg"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover blur-md opacity-30 scale-110"
                />
                <img
                  src="/images/donation/doação.png"
                  alt="Receber Doação"
                  className="relative z-10 max-h-full max-w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 z-20 rounded bg-primary px-2.5 py-1 font-cinzel text-[11px] font-bold text-black uppercase tracking-wider">
                  Amparo Social (Brasília-DF)
                </span>
              </div>
              <CardHeader className="p-6 pb-3">
                <div className="flex items-center gap-2.5 text-primary">
                  <HandHeart className="h-6 w-6" />
                  <CardTitle className="font-cinzel text-2xl">
                    Receber Doação
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Inscrição para moradores do Distrito Federal. Retirada e entrega presenciais de cestas básicas no santuário.
                </p>
              </CardContent>
            </div>
            <div className="p-6 pt-0">
              <Button className="w-full bg-primary font-cinzel text-xs uppercase tracking-widest text-black hover:bg-white">
                Cadastrar para Receber Cesta
              </Button>
            </div>
          </Card>

          <Card
            onClick={() => setViewMode("fazer")}
            className="group cursor-pointer overflow-hidden border-primary/20 bg-zinc-950/80 backdrop-blur transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/95 flex items-center justify-center">
                <img
                  src="/images/rituals/prosperidade.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover blur-md opacity-30 scale-110"
                />
                <img
                  src="/images/donation/receber.png"
                  alt="Fazer Doação"
                  className="relative z-10 max-h-full max-w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 z-20 rounded bg-primary px-2.5 py-1 font-cinzel text-[11px] font-bold text-black uppercase tracking-wider">
                  Contribuição
                </span>
              </div>
              <CardHeader className="p-6 pb-3">
                <div className="flex items-center gap-2.5 text-primary">
                  <HeartHandshake className="h-6 w-6" />
                  <CardTitle className="font-cinzel text-2xl">
                    Fazer Doação
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Contribua via Pix, transferência bancária direta ou agende uma data para entregar cestas e alimentos em mãos no santuário.
                </p>
              </CardContent>
            </div>
            <div className="p-6 pt-0">
              <Button className="w-full bg-primary font-cinzel text-xs uppercase tracking-widest text-black hover:bg-white">
                Ver Opções de Doação
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 2. FAZER DOAÇÃO */}
      {viewMode === "fazer" && (
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center justify-center gap-2">
            <Button
              variant={donationMethod === "pix" ? "default" : "outline"}
              onClick={() => setDonationMethod("pix")}
              className={`font-cinzel text-xs uppercase tracking-wider ${
                donationMethod === "pix"
                  ? "bg-primary text-black font-bold"
                  : "border-primary/20 text-zinc-300 hover:text-primary"
              }`}
            >
              <QrCode className="mr-1.5 h-4 w-4" /> Pix
            </Button>
            <Button
              variant={donationMethod === "banco" ? "default" : "outline"}
              onClick={() => setDonationMethod("banco")}
              className={`font-cinzel text-xs uppercase tracking-wider ${
                donationMethod === "banco"
                  ? "bg-primary text-black font-bold"
                  : "border-primary/20 text-zinc-300 hover:text-primary"
              }`}
            >
              <Building2 className="mr-1.5 h-4 w-4" /> Transferência
            </Button>
            <Button
              variant={donationMethod === "presencial" ? "default" : "outline"}
              onClick={() => setDonationMethod("presencial")}
              className={`font-cinzel text-xs uppercase tracking-wider ${
                donationMethod === "presencial"
                  ? "bg-primary text-black font-bold"
                  : "border-primary/20 text-zinc-300 hover:text-primary"
              }`}
            >
              <Calendar className="mr-1.5 h-4 w-4" /> Entregar em Mãos
            </Button>
          </div>

          {donationMethod === "pix" && (
            <Card className="border-primary/30 bg-zinc-950/90 p-6 md:p-8 text-zinc-200">
              <div className="text-center mb-6">
                <QrCode className="h-10 w-10 text-primary mx-auto mb-2" />
                <h3 className="font-cinzel text-2xl text-primary">
                  Doação Instantânea via Pix
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Chave direta do santuário destinada à compra de cestas e ações de caridade.
                </p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-black/60 p-4 mb-6">
                <label className="block text-[11px] uppercase tracking-wider text-primary/70 mb-2 font-cinzel">
                  Chave Pix (E-mail):
                </label>
                <div className="flex items-center justify-between gap-3 bg-zinc-900/90 rounded border border-primary/20 px-3 py-2">
                  <span className="font-mono text-sm text-zinc-200 select-all truncate">
                    {PIX_KEY}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(PIX_KEY)}
                    className="bg-primary text-black font-cinzel text-xs shrink-0 hover:bg-white"
                  >
                    {copiedPix ? (
                      <>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar Chave
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-200 leading-relaxed">
                <strong className="font-semibold text-amber-300">Aviso: </strong>
                Após sua doação, você pode nos enviar o comprovante via WhatsApp para registrarmos sua contribuição nas firmezas do templo.
              </div>
            </Card>
          )}

          {donationMethod === "banco" && (
            <Card className="border-primary/30 bg-zinc-950/90 p-6 md:p-8 text-zinc-200">
              <div className="text-center mb-6">
                <Building2 className="h-10 w-10 text-primary mx-auto mb-2" />
                <h3 className="font-cinzel text-2xl text-primary">
                  Transferência Bancária (TED / DOC)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Dados da conta institucional do templo.
                </p>
              </div>

              <div className="space-y-3 rounded-lg border border-primary/20 bg-black/60 p-5 text-xs">
                <div className="flex justify-between border-b border-primary/10 pb-2">
                  <span className="text-zinc-400">Banco:</span>
                  <span className="font-semibold text-zinc-200">{BANK_DETAILS.bank}</span>
                </div>
                <div className="flex justify-between border-b border-primary/10 pb-2">
                  <span className="text-zinc-400">Agência:</span>
                  <span className="font-semibold text-zinc-200">{BANK_DETAILS.agency}</span>
                </div>
                <div className="flex justify-between border-b border-primary/10 pb-2">
                  <span className="text-zinc-400">Conta Corrente:</span>
                  <span className="font-semibold text-zinc-200">{BANK_DETAILS.account}</span>
                </div>
                <div className="flex justify-between border-b border-primary/10 pb-2">
                  <span className="text-zinc-400">Titular:</span>
                  <span className="font-semibold text-zinc-200">{BANK_DETAILS.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">CNPJ:</span>
                  <span className="font-semibold text-zinc-200">{BANK_DETAILS.cnpj}</span>
                </div>
              </div>
            </Card>
          )}

          {donationMethod === "presencial" && (
            <Card className="border-primary/30 bg-zinc-950/90 p-6 md:p-8 text-zinc-200 text-center">
              <Calendar className="h-10 w-10 text-primary mx-auto mb-2" />
              <h3 className="font-cinzel text-2xl text-primary">
                Agendar Entrega em Mãos
              </h3>
              <p className="text-xs text-zinc-400 max-w-lg mx-auto mt-2 leading-relaxed">
                Você pode entregar alimentos não perecíveis, cestas básicas e itens de higiene diretamente no santuário em Brasília.
              </p>

              <div className="mt-6 rounded-lg border border-primary/20 bg-black/60 p-4 text-xs text-zinc-300 max-w-md mx-auto space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <MapPin className="h-4 w-4" />
                  <span className="font-cinzel font-bold uppercase">Santuário Domus Luciferis</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Atendimento e recepção de doações mediante agendamento prévio.
                </p>
              </div>

              <div className="mt-8">
                <Button
                  asChild
                  className="bg-primary font-cinzel text-xs uppercase tracking-widest text-black hover:bg-white h-11 px-8"
                >
                  <a
                    href={getWhatsAppHandDeliveryUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> Agendar Entrega via WhatsApp
                  </a>
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 3. RECEBER DOAÇÃO */}
      {viewMode === "receber" && (
        <section className="mx-auto max-w-6xl">
          {isAdmin ? (
            <Card className="border-primary/30 bg-zinc-950/95 p-6 md:p-8 text-zinc-200 shadow-[0_0_40px_rgba(212,175,55,0.08)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-primary/20 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <UserCheck className="h-6 w-6" />
                    <h2 className="font-cinzel text-2xl">
                      Painel Administrativo de Cestas
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Gerencie, edite observações e acompanhe os cadastros recebidos.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    size="sm"
                    onClick={exportToExcel}
                    disabled={donationsList.length === 0}
                    className="bg-emerald-600 text-white hover:bg-emerald-500 font-cinzel text-xs flex items-center gap-1.5 w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4" /> Baixar Planilha (.CSV)
                  </Button>
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Pesquisar por nome, CPF, telefone ou observação..."
                  className="pl-9 bg-black/60 border-primary/20 text-xs h-10"
                />
              </div>

              {loadingDonations ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  Carregando cadastros...
                </div>
              ) : filteredDonations.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  {searchFilter
                    ? "Nenhum cadastro encontrado para esta busca."
                    : "Nenhum cadastro de cesta registrado no momento."}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDonations.map((item) => {
                    let addr = "";
                    if (typeof item.address === "object" && item.address !== null) {
                      addr = `${item.address.street || ""}, ${item.address.number || ""} - ${item.address.neighborhood || ""}, ${item.address.city || ""}`;
                    } else if (typeof item.address === "string") {
                      addr = item.address;
                    } else {
                      addr = `${item.street || ""} ${item.number || ""} - ${item.neighborhood || ""}, ${item.city || ""}`;
                    }

                    return (
                      <div
                        key={item.id}
                        className="rounded-lg border border-primary/15 bg-black/60 p-4 transition-all hover:border-primary/40 flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div className="space-y-1.5 text-xs flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-cinzel text-sm font-bold text-primary">
                              {item.fullName}
                            </span>
                            {item.createdAt && (
                              <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] text-zinc-400">
                                {item.createdAt}
                              </span>
                            )}
                          </div>
                          <div className="text-zinc-300 flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                            <span><strong>CPF:</strong> {item.cpf}</span>
                            <span><strong>Telefone:</strong> {item.phone}</span>
                            {item.email && <span><strong>E-mail:</strong> {item.email}</span>}
                          </div>
                          <p className="text-zinc-400 pt-0.5">
                            <strong>Endereço:</strong> {addr.trim() || "Não informado"}
                          </p>

                          {item.notes && item.notes.trim() !== "" && (
                            <div className="mt-2 rounded border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
                              <span className="font-semibold text-amber-300 flex items-center gap-1">
                                <FileText className="h-3 w-3" /> Observação do Admin:
                              </span>
                              <p className="mt-0.5 whitespace-pre-wrap text-zinc-300">{item.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditModal(item)}
                            className="border-primary/30 text-primary hover:bg-primary/20 h-8 px-2.5 text-xs"
                            title="Editar dados e adicionar observações"
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar / Observação
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDonation(item.id)}
                            className="text-zinc-400 hover:text-red-400 h-8 px-2"
                            title="Excluir cadastro"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Excluir
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
              <Card className="border-primary/10 bg-zinc-950/80">
                <CardHeader>
                  <CardTitle className="font-cinzel text-2xl text-primary">
                    Cadastro para Receber Cesta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4 text-xs text-zinc-200">
                    <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-cinzel font-bold text-primary uppercase tracking-wide">
                        Aviso Importante: Exclusivo para Brasília - DF
                      </p>
                      <p className="text-zinc-300 leading-relaxed">
                        O cadastro, a triagem e a entrega das cestas básicas são realizados <strong>exclusivamente de forma presencial</strong> no santuário e destinados apenas a moradores de <strong>Brasília - DF e Região Integrada (RIDE)</strong>. Não realizamos envios para outros estados.
                      </p>
                    </div>
                  </div>

                  <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome completo <span className="text-primary">*</span></Label>
                      <Input
                        id="fullName"
                        value={form.fullName}
                        onChange={(event) => updateField("fullName", event.target.value)}
                        placeholder="Nome e sobrenome"
                        aria-invalid={errors.fullName}
                        autoComplete="name"
                        className="h-11 border-primary/20 bg-black/30"
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-300">Informe nome e sobrenome.</p>
                      )}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone de contato <span className="text-primary">*</span></Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(event) => updateField("phone", event.target.value)}
                          placeholder="(61) 90000-0000"
                          inputMode="tel"
                          aria-invalid={errors.phone}
                          autoComplete="tel"
                          className="h-11 border-primary/20 bg-black/30"
                        />
                        {errors.phone && (
                          <p className="text-xs text-red-300">Informe um telefone válido.</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail (Opcional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(event) => updateField("email", event.target.value)}
                          placeholder="nome@email.com (opcional)"
                          aria-invalid={errors.email}
                          autoComplete="email"
                          className="h-11 border-primary/20 bg-black/30"
                        />
                        {errors.email && (
                          <p className="text-xs text-red-300">Informe um e-mail com formato válido.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF <span className="text-primary">*</span></Label>
                      <Input
                        id="cpf"
                        value={form.cpf}
                        onChange={(event) => updateField("cpf", event.target.value)}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        aria-invalid={errors.cpf}
                        autoComplete="off"
                        className="h-11 border-primary/20 bg-black/30"
                      />
                      {errors.cpf && (
                        <p className="text-xs text-red-300">
                          Informe um CPF válido com 11 dígitos.
                        </p>
                      )}
                    </div>

                    <div className="space-y-4 rounded-md border border-primary/10 bg-black/20 p-4">
                      <h3 className="font-cinzel text-sm uppercase tracking-[0.24em] text-primary">
                        Endereço de residência (DF / Entorno)
                      </h3>

                      <div className="grid gap-5 md:grid-cols-[1fr_120px]">
                        <div className="space-y-2">
                          <Label htmlFor="street">Logradouro / Quadra / Rua <span className="text-primary">*</span></Label>
                          <Input
                            id="street"
                            value={form.street}
                            onChange={(event) => updateField("street", event.target.value)}
                            placeholder="Ex: QNN 18 Conjunto B"
                            aria-invalid={errors.street}
                            autoComplete="address-line1"
                            className="h-11 border-primary/20 bg-black/30"
                          />
                          {errors.street && (
                            <p className="text-xs text-red-300">Informe o endereço.</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="number">Nº / Lote <span className="text-primary">*</span></Label>
                          <Input
                            id="number"
                            value={form.number}
                            onChange={(event) => updateField("number", event.target.value)}
                            placeholder="Lote 12"
                            aria-invalid={errors.number}
                            autoComplete="address-line2"
                            className="h-11 border-primary/20 bg-black/30"
                          />
                          {errors.number && (
                            <p className="text-xs text-red-300">Informe o número/lote.</p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="neighborhood">Bairro / Região Administrativa <span className="text-primary">*</span></Label>
                          <Input
                            id="neighborhood"
                            value={form.neighborhood}
                            onChange={(event) => updateField("neighborhood", event.target.value)}
                            placeholder="Ex: Ceilândia, Taguatinga, Samambaia..."
                            aria-invalid={errors.neighborhood}
                            className="h-11 border-primary/20 bg-black/30"
                          />
                          {errors.neighborhood && (
                            <p className="text-xs text-red-300">Informe a região administrativa/bairro.</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade / UF <span className="text-primary">*</span></Label>
                          <Input
                            id="city"
                            value={form.city}
                            onChange={(event) => updateField("city", event.target.value)}
                            placeholder="Brasília - DF"
                            aria-invalid={errors.city}
                            autoComplete="address-level2"
                            className="h-11 border-primary/20 bg-black/30"
                          />
                          {errors.city && (
                            <p className="text-xs text-red-300">Informe a cidade.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-primary/15 bg-primary/5 p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="lgpd"
                          checked={acceptedLgpd}
                          onCheckedChange={(checked) => setAcceptedLgpd(checked === true)}
                          aria-invalid={errors.lgpd}
                          className="mt-1"
                        />
                        <Label htmlFor="lgpd" className="block text-sm leading-6 text-zinc-300">
                          Autorizo o tratamento dos meus dados pessoais, incluindo CPF, somente
                          para identificação do cadastro, contato sobre a doação e cumprimento de
                          obrigações legais, conforme a LGPD.
                        </Label>
                      </div>
                      {errors.lgpd && (
                        <p className="mt-3 text-xs text-red-300">
                          O consentimento LGPD é obrigatório para enviar o cadastro.
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={!isFormValid || submitting}
                      className="h-12 w-full bg-primary font-cinzel text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Salvando cadastro..." : "Enviar cadastro"}
                    </Button>

                    {submitted && (
                      <div className="flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {submitMessage}
                      </div>
                    )}

                    {submitError && (
                      <div className="rounded-md border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
                        {submitError}
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>

              <aside className="space-y-5">
                <div className="border-l-2 border-primary bg-primary/5 p-6">
                  <ShieldCheck className="mb-4 h-8 w-8 text-primary" />
                  <h2 className="font-cinzel text-xl text-primary">Proteção de dados</h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    O CPF é solicitado apenas quando estritamente necessário para identificação,
                    registro e obrigações legais relacionadas à triagem e entrega da cesta básica.
                  </p>
                </div>

                <div className="border-l-2 border-primary/50 bg-black/40 p-6 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Info className="h-5 w-5" />
                    <h3 className="font-cinzel text-base">Atendimento no Templo</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    As entregas de cestas ocorrem em dias pré-determinados com aviso direto aos cadastrados via WhatsApp. Tenha em mãos um documento com foto no momento da retirada.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </section>
      )}

      {/* MODAL DE EDIÇÃO DO ADMINISTRADOR */}
      {isAdmin && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-primary/40 bg-zinc-950 p-6 text-zinc-200 shadow-[0_0_50px_rgba(212,175,55,0.15)]">
            <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
              <div className="flex items-center gap-2 text-primary">
                <Edit2 className="h-5 w-5" />
                <h3 className="font-cinzel text-lg font-bold">
                  Editar Cadastro & Observações
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <Label className="text-zinc-400">Nome Completo</Label>
                <Input
                  value={editingRecord.fullName || ""}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, fullName: e.target.value })
                  }
                  className="bg-black/60 border-primary/20 text-xs mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-zinc-400">CPF</Label>
                  <Input
                    value={editingRecord.cpf || ""}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, cpf: formatCpf(e.target.value) })
                    }
                    className="bg-black/60 border-primary/20 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400">Telefone</Label>
                  <Input
                    value={editingRecord.phone || ""}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, phone: formatPhone(e.target.value) })
                    }
                    className="bg-black/60 border-primary/20 text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-zinc-400">E-mail</Label>
                <Input
                  value={editingRecord.email || ""}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, email: e.target.value })
                  }
                  className="bg-black/60 border-primary/20 text-xs mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Label className="text-zinc-400">Logradouro / Rua</Label>
                  <Input
                    value={editingRecord.street || ""}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, street: e.target.value })
                    }
                    className="bg-black/60 border-primary/20 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400">Nº / Lote</Label>
                  <Input
                    value={editingRecord.number || ""}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, number: e.target.value })
                    }
                    className="bg-black/60 border-primary/20 text-xs mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-zinc-400">Bairro / Região</Label>
                  <Input
                    value={editingRecord.neighborhood || ""}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, neighborhood: e.target.value })
                    }
                    className="bg-black/60 border-primary/20 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400">Cidade / UF</Label>
                  <Input
                    value={editingRecord.city || ""}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, city: e.target.value })
                    }
                    className="bg-black/60 border-primary/20 text-xs mt-1"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-primary/10">
                <Label className="text-primary font-semibold flex items-center gap-1.5">
                  <FileText className="h-4 w-4" /> Observações do Administrador (Exportado no Excel)
                </Label>
                <Textarea
                  value={editingRecord.notes || ""}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, notes: e.target.value })
                  }
                  placeholder="Ex: Cesta entregue em 05/09; compareceu pessoalmente com documento; mora com 3 filhos..."
                  rows={4}
                  className="bg-black/70 border-primary/30 text-xs mt-1.5 text-zinc-200"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingRecord(null)}
                className="border-primary/20 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveEditedRecord}
                className="bg-primary text-black font-cinzel text-xs uppercase font-bold hover:bg-white"
              >
                Salvar Alterações
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Autenticação Admin */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm border-primary/40 bg-zinc-950 p-6 text-zinc-200">
            <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <h3 className="font-cinzel text-sm font-bold uppercase text-primary">
                  Autenticação Admin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Chave / Senha de Acesso:
                </label>
                <Input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLoginAdmin();
                  }}
                  placeholder="Digite a senha..."
                  className="bg-black/60 border-primary/20 text-xs"
                />
                {authError && (
                  <p className="mt-1.5 text-[11px] text-red-400">{authError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAuthModal(false)}
                  className="border-primary/20 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleLoginAdmin}
                  className="bg-primary text-black font-cinzel text-xs uppercase font-bold"
                >
                  Acessar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navegação Inferior */}
      <div className="mt-16 flex justify-center gap-3 border-t border-primary/10 pt-8">
        <Button
          onClick={() => {
            if (viewMode !== "menu") {
              setViewMode("menu");
              setSubmitted(false);
              setSubmitError("");
            } else {
              window.history.back();
            }
          }}
          variant="ghost"
          size="sm"
          className="border border-primary/20 text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {viewMode === "menu" ? "Voltar" : "Opções de Doação"}
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
    </div>
  );
}