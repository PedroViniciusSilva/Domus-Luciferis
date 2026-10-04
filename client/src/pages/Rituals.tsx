import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  ArrowLeft,
  Edit2,
  Home,
  KeyRound,
  Loader2,
  Lock,
  MessageCircle,
  Play,
  Plus,
  Trash2,
  Unlock,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";



export type RitualItem = {
  id: string;
  title: string;
  categoryLabel: string;
  price: string;
  shortDescription: string;
  mediaType: "image" | "video";
  mediaUrl: string;
};

const RITUALS_DATA: RitualItem[] = [
  {
    id: "magnetismo-forca pessoal",
    title: "Magnetismo e Força Pessoal",
    categoryLabel: "Poder & Influência",
    price: "R$ 700,00",
    shortDescription:
      "Trabalho focado no poder pessoal, magnetismo e influência, promovendo autoconfiança, carisma e presença magnética.",
    mediaType: "image",
    mediaUrl: "/images/rituals/lilith.png",
  },
  {
    id: "amarracao-amorosa",
    title: "Amarração & Dominação Amorosa",
    categoryLabel: "Amor & União",
    price: "R$ 3.000,00",
    shortDescription:
      "Atuação direta na mente, desejo carnal e atração magnética para reconciliação ou consolidação de relacionamento.",
    mediaType: "image",
    mediaUrl: "/images/rituals/amarracao.jpg",
  },
  {
    id: "banimento-corte-laços",
    title: "Banimento & Quebra de Demandas",
    categoryLabel: "Proteção & Limpeza",
    price: "R$ 800,00",
    shortDescription:
      "Desintegração total de feitiços contrários, magia nociva, inveja destrutiva e obsessores espirituais.",
    mediaType: "image",
    mediaUrl: "/images/rituals/demanda.png",
  },
  {
    id: "Prosperidade & Abertura de Caminhos",
    title: "A bertura de Caminhos & Prosperidade",
    categoryLabel: "Sucesso & Abundância",
    price: "R$ 2.000,00",
    shortDescription:
      "Trabalho de abertura de caminhos e promoção da prosperidade, ajudando a atrair oportunidades e sucesso em todas as áreas da vida.  ",
    mediaType: "image",
    mediaUrl: "/images/rituals/prosperidade.png",
  },
  {
    id: "pacto-iniciacao-lucifer",
    title: "Iniciação & Pactuação Luciferiana",
    categoryLabel: "Alta Magia",
    price: "R$ 3.500,00",
    shortDescription:
      "Ritual de aliança e despertar da centelha divina, soberania pessoal e proteção vitalícia.",
    mediaType: "image",
    mediaUrl: "/images/rituals/seere.png",
  },
];

export default function Rituals() {
  const [, setLocation] = useLocation();
  const [rituals, setRituals] = useState<RitualItem[]>(() => {
    const saved = localStorage.getItem("domus_rituals");
    if (!saved) return RITUALS_DATA;

    try {
      const parsed: RitualItem[] = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : RITUALS_DATA;
    } catch {
      return RITUALS_DATA;
    }
  });
  const [expandedMedia, setExpandedMedia] = useState<RitualItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => Boolean(sessionStorage.getItem("domus_admin_token")));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showRitualModal, setShowRitualModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [ritualForm, setRitualForm] = useState<Partial<RitualItem>>({
    title: "",
    categoryLabel: "",
    price: "",
    shortDescription: "",
    mediaType: "image",
    mediaUrl: "",
  });

  useEffect(() => {
    localStorage.setItem("domus_rituals", JSON.stringify(rituals));
  }, [rituals]);

  async function handleLoginAdmin() {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: adminPasswordInput.trim() }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      sessionStorage.setItem("domus_admin_token", data.token);
      setIsAdmin(true);
      setShowAuthModal(false);
      setAdminPasswordInput("");
      setAuthError("");
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("domus_admin_token") || ""}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) {
      setPasswordMessage(data.message || "Não foi possível alterar a senha.");
      return;
    }

    sessionStorage.setItem("domus_admin_token", data.token);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage(data.message);
  }

  function openNewRitual() {
    setEditingId(null);
    setFormError("");
    setRitualForm({
      title: "",
      categoryLabel: "",
      price: "",
      shortDescription: "",
      mediaType: "image",
      mediaUrl: "",
    });
    setShowRitualModal(true);
  }

  function openEditRitual(ritual: RitualItem) {
    setEditingId(ritual.id);
    setFormError("");
    setRitualForm(ritual);
    setShowRitualModal(true);
  }

  function handleMediaUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError("");
    const mediaType = file.type.startsWith("video/") ? "video" : "image";
    if (mediaType === "video") {
      setRitualForm((previous) => ({
        ...previous,
        mediaType,
        mediaUrl: URL.createObjectURL(file),
      }));
      setIsUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRitualForm((previous) => ({
        ...previous,
        mediaType,
        mediaUrl: typeof reader.result === "string" ? reader.result : "",
      }));
      setIsUploading(false);
    };
    reader.onerror = () => {
      setFormError("Não foi possível carregar a imagem.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function saveRitual() {
    const title = ritualForm.title?.trim() || "";
    const categoryLabel = ritualForm.categoryLabel?.trim() || "";
    const price = ritualForm.price?.trim() || "";
    const shortDescription = ritualForm.shortDescription?.trim() || "";
    const mediaUrl = ritualForm.mediaUrl?.trim() || "";

    if (!title || !categoryLabel || !price || !shortDescription || !mediaUrl) {
      setFormError("Preencha título, categoria, valor, descrição e mídia.");
      return;
    }

    const nextRitual: RitualItem = {
      id: editingId || `ritual-${Date.now()}`,
      title,
      categoryLabel,
      price,
      shortDescription,
      mediaType: ritualForm.mediaType === "video" ? "video" : "image",
      mediaUrl,
    };

    setRituals((current) =>
      editingId
        ? current.map((ritual) => (ritual.id === editingId ? nextRitual : ritual))
        : [nextRitual, ...current]
    );
    setShowRitualModal(false);
    setEditingId(null);
  }

  function deleteRitual(ritual: RitualItem) {
    if (!confirm(`Deseja excluir o ritual "${ritual.title}"?`)) return;
    setRituals((current) => current.filter((item) => item.id !== ritual.id));
    if (expandedMedia?.id === ritual.id) setExpandedMedia(null);
  }

  function getWhatsAppUrl(ritualTitle: string) {
    const text = encodeURIComponent(
      `Saudações. Gostaria de agendar uma consulta ao oráculo sobre o ritual: ${ritualTitle}.`
    );
    return `https://wa.me/556196023210?text=${text}`;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Barra de navegação superior: Voltar e Home */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
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

        {isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={openNewRitual}
              size="sm"
              className="bg-primary text-black font-cinzel text-xs uppercase"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Novo ritual
            </Button>
            <Button
              onClick={() => {
                setPasswordMessage("");
                setShowPasswordModal(true);
              }}
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary"
            >
              <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Alterar senha
            </Button>
            <Button
              onClick={handleLogoutAdmin}
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400"
            >
              <Unlock className="mr-1.5 h-3.5 w-3.5" /> Sair
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
            className="border-primary/20 text-zinc-400 hover:text-primary"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" /> Acesso Admin
          </Button>
        )}
      </div>

      {/* Cabeçalho da página */}
      <section className="mx-auto mb-12 max-w-4xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary/60">
          Alta Magia & Trabalhos Cerimoniais
        </p>
        <h1 className="font-cinzel text-4xl text-primary md:text-6xl">
          Catálogo de Rituais
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Conheça as operações espirituais executadas sob a egrégora do Domus Luciferis. Cada
          trabalho é firmado individualmente no santuário com registro para o consulente.
        </p>
      </section>

      {/* Aviso Geral de Consulta ao Oráculo */}
      <div className="mx-auto mb-12 max-w-3xl rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <p className="text-xs leading-relaxed">
            <strong className="font-semibold text-amber-300 uppercase tracking-wider">Aviso Importante: </strong> 
            Nenhum trabalho espiritual ou ritual é executado sem a consulta prévia ao Oráculo. A confirmação oracular é mandatória para avaliar o alinhamento e a viabilidade de cada caso.
          </p>
        </div>
      </div>

      {/* Grid de Rituais */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rituals.map((ritual) => (
          <Card
            key={ritual.id}
            className="relative flex flex-col justify-between overflow-hidden border-primary/20 bg-zinc-950/80 backdrop-blur transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          >
            <div>
              {isAdmin && (
                <div className="absolute right-2 top-2 z-30 flex gap-1 rounded bg-black/80 p-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditRitual(ritual)}
                    className="h-7 w-7 text-zinc-300 hover:text-primary"
                    title="Editar ritual"
                    aria-label="Editar ritual"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteRitual(ritual)}
                    className="h-7 w-7 text-zinc-300 hover:text-red-400"
                    title="Excluir ritual"
                    aria-label="Excluir ritual"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              {/* Quadrante da Imagem clicável para expandir */}
              <div
                onClick={() => setExpandedMedia(ritual)}
                className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-black/95 flex items-center justify-center group"
                title="Clique para expandir a imagem"
              >
                {ritual.mediaType === "video" ? (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                    <Play className="h-12 w-12 text-primary/80" />
                  </div>
                ) : (
                  <>
                    <img
                      src={ritual.mediaUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover blur-md opacity-30 scale-110"
                    />
                    <img
                      src={ritual.mediaUrl}
                      alt={ritual.title}
                      className="relative z-10 max-h-full max-w-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                    />
                  </>
                )}
                <span className="absolute bottom-3 right-3 z-20 rounded bg-black/80 px-2 py-1 text-[11px] text-zinc-300 backdrop-blur">
                  {ritual.categoryLabel}
                </span>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-cinzel text-base font-bold text-primary">
                    {ritual.price}
                  </span>
                </div>
                <CardTitle className="font-cinzel text-xl text-primary leading-tight mt-1">
                  {ritual.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="line-clamp-3 text-xs leading-relaxed text-zinc-400">
                  {ritual.shortDescription}
                </p>
              </CardContent>
            </div>

            <CardFooter className="pt-0">
              <Button
                type="button"
                asChild
                className="w-full bg-primary text-xs font-cinzel uppercase tracking-wider text-black hover:bg-white"
              >
                <a
                  href={getWhatsAppUrl(ritual.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Consultar Oráculo
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Modal / Lightbox de Expansão da Imagem */}
      {expandedMedia && (
        <div
          onClick={() => setExpandedMedia(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg border border-primary/30 bg-zinc-950 p-2 shadow-[0_0_50px_rgba(0,0,0,0.8)] cursor-default"
          >
            <button
              onClick={() => setExpandedMedia(null)}
              className="absolute top-4 right-4 z-30 rounded-full bg-black/70 p-2 text-zinc-300 hover:bg-primary hover:text-black transition-colors"
              title="Fechar"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex flex-col items-center">
              {expandedMedia.mediaType === "video" ? (
                <video
                  src={expandedMedia.mediaUrl}
                  controls
                  autoPlay
                  className="max-h-[75vh] max-w-full rounded object-contain"
                />
              ) : (
                <img
                  src={expandedMedia.mediaUrl}
                  alt={expandedMedia.title}
                  className="max-h-[75vh] max-w-full rounded object-contain"
                />
              )}

              <div className="w-full pt-3 text-center">
                <h3 className="font-cinzel text-lg text-primary">
                  {expandedMedia.title}
                </h3>
                <p className="text-xs text-zinc-400">
                  {expandedMedia.categoryLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm border-primary/40 bg-zinc-950 p-6 text-zinc-200">
            <div className="mb-4 flex items-center justify-between border-b border-primary/20 pb-3">
              <h3 className="font-cinzel text-sm font-bold uppercase text-primary">
                Acesso Admin dos Rituais
              </h3>
              <button type="button" onClick={() => setShowAuthModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Input
              type="password"
              value={adminPasswordInput}
              onChange={(event) => setAdminPasswordInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleLoginAdmin();
              }}
              placeholder="Senha de administrador"
              className="bg-black/60 border-primary/20"
            />
            {authError && <p className="mt-2 text-xs text-red-400">{authError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAuthModal(false)}>Cancelar</Button>
              <Button onClick={handleLoginAdmin} className="bg-primary text-black">Entrar</Button>
            </div>
          </Card>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-primary/40 bg-zinc-950 p-6 text-zinc-200">
            <h3 className="mb-5 font-cinzel text-lg text-primary">Alterar senha</h3>
            <div className="space-y-3">
              <Input type="password" placeholder="Senha atual" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
              <Input type="password" placeholder="Nova senha (mínimo 8 caracteres)" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              <Input type="password" placeholder="Confirme a nova senha" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              {passwordMessage && <p className="text-xs text-primary">{passwordMessage}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
                <Button onClick={handleChangePassword} className="bg-primary text-black">Salvar nova senha</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showRitualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto border-primary/40 bg-zinc-950 p-6 text-zinc-200">
            <div className="mb-4 flex items-center justify-between border-b border-primary/20 pb-3">
              <h3 className="font-cinzel text-lg text-primary">
                {editingId ? "Editar ritual" : "Novo ritual"}
              </h3>
              <button type="button" onClick={() => setShowRitualModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {formError && <p className="mb-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">{formError}</p>}
            <div className="space-y-3">
              <Input placeholder="Nome do ritual *" value={ritualForm.title || ""} onChange={(event) => setRitualForm({ ...ritualForm, title: event.target.value })} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input placeholder="Categoria *" value={ritualForm.categoryLabel || ""} onChange={(event) => setRitualForm({ ...ritualForm, categoryLabel: event.target.value })} />
                <Input placeholder="Valor (ex.: R$ 700,00) *" value={ritualForm.price || ""} onChange={(event) => setRitualForm({ ...ritualForm, price: event.target.value })} />
              </div>
              <textarea
                placeholder="Descrição curta *"
                value={ritualForm.shortDescription || ""}
                onChange={(event) => setRitualForm({ ...ritualForm, shortDescription: event.target.value })}
                className="min-h-24 w-full rounded-md border border-primary/20 bg-black/60 p-2 text-sm text-zinc-200 outline-none focus:border-primary"
              />
              <select
                value={ritualForm.mediaType || "image"}
                onChange={(event) => setRitualForm({ ...ritualForm, mediaType: event.target.value as RitualItem["mediaType"] })}
                className="h-10 w-full rounded-md border border-primary/20 bg-black/60 px-3 text-sm text-zinc-200"
              >
                <option value="image">Imagem</option>
                <option value="video">Vídeo</option>
              </select>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-cinzel uppercase text-primary hover:bg-primary/20">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isUploading ? "Carregando..." : "Escolher imagem ou vídeo"}
                <input type="file" accept={ritualForm.mediaType === "video" ? "video/*" : "image/*"} onChange={handleMediaUpload} className="hidden" disabled={isUploading} />
              </label>
              <Input
                placeholder={ritualForm.mediaType === "video" ? "Ou cole a URL do vídeo" : "Ou cole a URL da imagem"}
                value={ritualForm.mediaUrl || ""}
                onChange={(event) => setRitualForm({ ...ritualForm, mediaUrl: event.target.value })}
              />
              {ritualForm.mediaUrl && (
                <div className="overflow-hidden rounded border border-primary/20 bg-black p-2">
                  {ritualForm.mediaType === "video" ? (
                    <video src={ritualForm.mediaUrl} controls className="max-h-56 w-full object-contain" />
                  ) : (
                    <img src={ritualForm.mediaUrl} alt="Prévia do ritual" className="max-h-56 w-full object-contain" />
                  )}
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRitualModal(false)}>Cancelar</Button>
              <Button onClick={saveRitual} disabled={isUploading} className="bg-primary text-black">
                {editingId ? "Salvar alterações" : "Adicionar ritual"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Navegação inferior */}
      <div className="mt-16 flex justify-center gap-3 border-t border-primary/10 pt-8">
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
    </div>
  );
}