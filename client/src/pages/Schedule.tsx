import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar as CalendarIcon,
  Edit2,
  Home,
  KeyRound,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Moon,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Unlock,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type GalleryItem = {
  id: string;
  title: string;
  date: string;
  description: string;
  mediaType: "image" | "video";
  mediaUrl: string;
};

type EventItem = {
  id: string;
  title: string;
  date: string; // Formato YYYY-MM-DD para validação precisa
  displayDate: string; // Exibição formatada: '15 de Setembro de 2026'
  time: string;
  location: string;
  type: "Presencial" | "Online / Egrégora" | "Híbrido";
  period: "semana" | "mes";
  description: string;
  imageUrl?: string;
};

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: "cal-1",
    title: "Rito da Lua Negra & Despertar com Hécate",
    date: "2026-09-15",
    displayDate: "15 de Setembro de 2026",
    time: "21:00",
    location: "Santuário Principal & Transmissão para Iniciados",
    type: "Híbrido",
    period: "semana",
    description: "Consagração aos mistérios noturnos, intuição profunda e banimento de energias estagnadas.",
    imageUrl: "/images/rituals/amarracao.jpg",
  },
  {
    id: "cal-2",
    title: "Firmeza Coletiva de Abundância com Mammon",
    date: "2026-10-03",
    displayDate: "03 de Outubro de 2026",
    time: "20:00",
    location: "Altar Solar do Templo",
    type: "Presencial",
    period: "mes",
    description: "Cerimônia focada na atração material e crescimento patrimonial dos membros.",
    imageUrl: "/images/rituals/prosperidade.png",
  },
  {
    id: "cal-3",
    title: "Grande Sabá & Honra aos Guardiões",
    date: "2026-10-31",
    displayDate: "31 de Outubro de 2026",
    time: "22:00",
    location: "Santuário Domus Luciferis",
    type: "Presencial",
    period: "mes",
    description: "O maior rito anual de comunhão com a egrégora luciferiana e os Deuses Prévios.",
    imageUrl: "/images/rituals/seere.png",
  },
];

const DEFAULT_VIDEOS: GalleryItem[] = [
  {
    id: "video-1",
    title: "Fundamentos da Corrente Luciferiana & O Templo",
    date: "2026",
    description: "Uma introdução aos princípios filosóficos, magia cerimonial e o caminho da iluminação.",
    mediaType: "video",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: "video-2",
    title: "Gravação de Firmeza no Santuário",
    date: "2026",
    description: "Bastidores e registro de uma operação cerimonial conduzida pelo sacerdote.",
    mediaType: "video",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
];

const DEFAULT_PHOTOS: GalleryItem[] = [
  {
    id: "photo-1",
    title: "Noite de Lúcifer & Vigília do Solstício",
    date: "Junho de 2026",
    description: "Cerimônia solene de consagração e despertar da chama interna.",
    mediaType: "image",
    mediaUrl: "/images/rituals/amarracao.jpg",
  },
  {
    id: "photo-2",
    title: "Consagração dos Altares",
    date: "Maio de 2026",
    description: "Firmeza cerimonial e abertura dos portais elementares no templo físico.",
    mediaType: "image",
    mediaUrl: "/images/rituals/lilith.png",
  },
  {
    id: "photo-3",
    title: "Aliança com Mammon & Prosperidade Coletiva",
    date: "Abril de 2026",
    description: "Carga energética conjunta para desbloqueio financeiro.",
    mediaType: "image",
    mediaUrl: "/images/rituals/prosperidade.png",
  },
  {
    id: "photo-4",
    title: "Círculo de Retribuição & Quebra de Demandas",
    date: "Março de 2026",
    description: "Operação telúrica profunda para purificação de caminhos.",
    mediaType: "image",
    mediaUrl: "/images/rituals/demanda.png",
  },
];

// Formata 'YYYY-MM-DD' para 'DD de Mês de AAAA'
function formatToDisplayDate(dateString: string): string {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;

  const [year, month, day] = parts;
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const monthName = months[parseInt(month, 10) - 1] || month;
  return `${day} de ${monthName} de ${year}`;
}

// Retorna a data mínima de hoje no formato YYYY-MM-DD
function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Schedule() {
  const [, setLocation] = useLocation();

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem("domus_events");
    return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
  });

  const [videos, setVideos] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem("domus_videos");
    return saved ? JSON.parse(saved) : DEFAULT_VIDEOS;
  });

  const [photos, setPhotos] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem("domus_photos");
    return saved ? JSON.parse(saved) : DEFAULT_PHOTOS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("domus_events", JSON.stringify(events));
    } catch (e) {
      console.warn("Storage quota exceeded for events");
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem("domus_videos", JSON.stringify(videos));
    } catch (e) {
      console.warn("Storage quota exceeded for videos");
    }
  }, [videos]);

  useEffect(() => {
    try {
      localStorage.setItem("domus_photos", JSON.stringify(photos));
    } catch (e) {
      console.warn("Storage quota exceeded for photos");
    }
  }, [photos]);

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

  const [filterPeriod, setFilterPeriod] = useState<"todos" | "semana" | "mes">("todos");
  const [expandedMedia, setExpandedMedia] = useState<GalleryItem | null>(null);

  const [activeModal, setActiveModal] = useState<"event" | "video" | "photo" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValidationMsg, setFormValidationMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [eventForm, setEventForm] = useState<Partial<EventItem>>({
    title: "",
    date: getTodayIsoDate(),
    time: "20:00",
    location: "Santuário Domus Luciferis",
    type: "Presencial",
    period: "semana",
    description: "",
    imageUrl: "",
  });

  const [mediaForm, setMediaForm] = useState<Partial<GalleryItem>>({
    title: "",
    date: "",
    description: "",
    mediaUrl: "",
  });

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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("domus_admin_token") || ""}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) { setPasswordMessage(data.message || "Não foi possível alterar a senha."); return; }
    sessionStorage.setItem("domus_admin_token", data.token);
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordMessage(data.message);
  }

  function getWhatsAppEventUrl(eventTitle: string) {
    const text = encodeURIComponent(
      `Saudações. Gostaria de informações para participar da atividade: ${eventTitle}.`
    );
    return `https://wa.me/556196023210?text=${text}`;
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, target: "event" | "media") {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormValidationMsg(null);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (target === "event") {
          setEventForm((prev) => ({ ...prev, imageUrl: result }));
        } else {
          setMediaForm((prev) => ({ ...prev, mediaUrl: result }));
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setFormValidationMsg("Erro ao processar imagem.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } else {
      const videoBlobUrl = URL.createObjectURL(file);
      setMediaForm((prev) => ({ ...prev, mediaUrl: videoBlobUrl }));
      setIsUploading(false);
    }
  }

  const filteredEvents =
    filterPeriod === "todos"
      ? events
      : events.filter((e) => e.period === filterPeriod);

  // Validação estrita de Data e Horário
  function handleSaveEventDirect() {
    setFormValidationMsg(null);

    if (!eventForm.title || eventForm.title.trim() === "") {
      setFormValidationMsg("O título do ritual ou evento é obrigatório.");
      return;
    }
    if (!eventForm.date || eventForm.date.trim() === "") {
      setFormValidationMsg("Selecione a data do evento.");
      return;
    }

    const timeString = eventForm.time || "20:00";
    const selectedDateTime = new Date(`${eventForm.date}T${timeString}:00`);
    const now = new Date();

    if (isNaN(selectedDateTime.getTime())) {
      setFormValidationMsg("Formato de data ou horário inválido.");
      return;
    }

    // Bloqueia se a data/hora combinada for menor que agora
    if (selectedDateTime.getTime() < now.getTime()) {
      setFormValidationMsg("Não é permitido agendar atividades em datas ou horários que já passaram.");
      return;
    }

    const formattedDisplayDate = formatToDisplayDate(eventForm.date);

    if (editingId) {
      setEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev.id === editingId
            ? {
                ...ev,
                title: eventForm.title!.trim(),
                date: eventForm.date!,
                displayDate: formattedDisplayDate,
                time: timeString.trim(),
                location: (eventForm.location || "Santuário Domus Luciferis").trim(),
                type: eventForm.type || "Presencial",
                period: eventForm.period || "semana",
                description: (eventForm.description || "").trim(),
                imageUrl: eventForm.imageUrl || "",
              }
            : ev
        )
      );
    } else {
      const newEvent: EventItem = {
        id: `event-${Date.now()}`,
        title: eventForm.title!.trim(),
        date: eventForm.date!,
        displayDate: formattedDisplayDate,
        time: timeString.trim(),
        location: (eventForm.location || "Santuário Domus Luciferis").trim(),
        type: eventForm.type || "Presencial",
        period: eventForm.period || "semana",
        description: (eventForm.description || "").trim(),
        imageUrl: eventForm.imageUrl || "",
      };
      setEvents((prev) => [newEvent, ...prev]);
    }

    setActiveModal(null);
    setEditingId(null);
    setFormValidationMsg(null);
  }

  function handleSaveMediaDirect(type: "video" | "image") {
    setFormValidationMsg(null);

    if (!mediaForm.title || mediaForm.title.trim() === "") {
      setFormValidationMsg(`O título do ${type === "video" ? "vídeo" : "arquivo de foto"} é obrigatório.`);
      return;
    }
    if (!mediaForm.mediaUrl || mediaForm.mediaUrl.trim() === "") {
      setFormValidationMsg(`Selecione um arquivo de ${type === "video" ? "vídeo" : "imagem"} ou insira a URL.`);
      return;
    }

    if (editingId) {
      if (type === "video") {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === editingId
              ? {
                  ...v,
                  title: mediaForm.title!.trim(),
                  date: (mediaForm.date || "2026").trim(),
                  description: (mediaForm.description || "").trim(),
                  mediaUrl: mediaForm.mediaUrl!.trim(),
                }
              : v
          )
        );
      } else {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  title: mediaForm.title!.trim(),
                  date: (mediaForm.date || "2026").trim(),
                  description: (mediaForm.description || "").trim(),
                  mediaUrl: mediaForm.mediaUrl!.trim(),
                }
              : p
          )
        );
      }
    } else {
      const newItem: GalleryItem = {
        id: `${type}-${Date.now()}`,
        title: mediaForm.title!.trim(),
        date: (mediaForm.date || "2026").trim(),
        description: (mediaForm.description || "").trim(),
        mediaType: type,
        mediaUrl: mediaForm.mediaUrl!.trim(),
      };
      if (type === "video") {
        setVideos((prev) => [newItem, ...prev]);
      } else {
        setPhotos((prev) => [newItem, ...prev]);
      }
    }

    setActiveModal(null);
    setEditingId(null);
    setFormValidationMsg(null);
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Topo de Navegação */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
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
          <div className="flex gap-2">
            <Button onClick={() => { setPasswordMessage(""); setShowPasswordModal(true); }} variant="outline" size="sm" className="border-primary/30 text-primary">
              <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Alterar senha
            </Button>
            <Button onClick={handleLogoutAdmin} variant="outline" size="sm" className="border-primary/40 bg-primary/10 font-cinzel text-xs uppercase tracking-wider text-primary hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40">
              <Unlock className="mr-1.5 h-3.5 w-3.5" /> Sair do Admin
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
            <Lock className="mr-1.5 h-3.5 w-3.5" /> Acesso Admin
          </Button>
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
      <section className="mx-auto mb-16 max-w-4xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary/60">
          Santuário & Egrégora Luciferiana
        </p>
        <h1 className="font-cinzel text-4xl text-primary md:text-6xl">
          Atividades & Vivências
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Acompanhe nosso calendário de rituais, os ensinamentos em vídeo e a galeria de fotos das operações no santuário.
        </p>
      </section>

      {/* 1. SEÇÃO DE CRONOGRAMA */}
      <section className="mx-auto mb-20 max-w-5xl">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-primary/20 pb-6 sm:flex-row">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <CalendarIcon className="h-5 w-5" />
              <h2 className="font-cinzel text-2xl text-primary md:text-3xl">
                Cronograma
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Cronograma de rituais coletivos, vigílias e celebrações no templo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-primary/30 p-1 bg-black/40">
              <button
                onClick={() => setFilterPeriod("todos")}
                className={`px-3 py-1 text-xs font-cinzel uppercase rounded ${
                  filterPeriod === "todos"
                    ? "bg-primary text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterPeriod("semana")}
                className={`px-3 py-1 text-xs font-cinzel uppercase rounded ${
                  filterPeriod === "semana"
                    ? "bg-primary text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Desta Semana
              </button>
              <button
                onClick={() => setFilterPeriod("mes")}
                className={`px-3 py-1 text-xs font-cinzel uppercase rounded ${
                  filterPeriod === "mes"
                    ? "bg-primary text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Do Mês
              </button>
            </div>

            {isAdmin && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingId(null);
                  setFormValidationMsg(null);
                  setEventForm({
                    title: "",
                    date: getTodayIsoDate(),
                    time: "20:00",
                    location: "Santuário Domus Luciferis",
                    type: "Presencial",
                    period: "semana",
                    description: "",
                    imageUrl: "",
                  });
                  setActiveModal("event");
                }}
                className="bg-primary text-black font-cinzel text-xs uppercase"
              >
                <Plus className="mr-1 h-4 w-4" /> Novo Evento
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <p className="text-center py-8 text-xs text-zinc-500 font-cinzel">
              Nenhuma atividade agendada para este período.
            </p>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="relative overflow-hidden rounded-lg border border-primary/20 bg-zinc-950/80 p-5 backdrop-blur transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] flex flex-col md:flex-row gap-6 items-center"
              >
                {event.imageUrl && (
                  <div
                    onClick={() =>
                      setExpandedMedia({
                        id: event.id,
                        title: event.title,
                        date: event.displayDate || event.date,
                        description: event.description,
                        mediaType: "image",
                        mediaUrl: event.imageUrl!,
                      })
                    }
                    className="relative aspect-[16/10] w-full md:w-56 shrink-0 cursor-pointer overflow-hidden rounded border border-primary/20 bg-black/95 flex items-center justify-center group"
                    title="Clique para expandir"
                  >
                    <img
                      src={event.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover blur-md opacity-30 scale-110"
                    />
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="relative z-10 max-h-full max-w-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-cinzel text-[11px] font-bold text-primary border border-primary/20">
                      {event.displayDate || formatToDisplayDate(event.date)}
                    </span>
                    <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] text-zinc-400">
                      {event.type}
                    </span>
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300 border border-amber-500/20 uppercase">
                      {event.period === "semana" ? "Esta Semana" : "Neste Mês"}
                    </span>
                  </div>
                  <h3 className="font-cinzel text-lg text-primary">
                    {event.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Moon className="h-3.5 w-3.5 text-primary" /> {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {event.location}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full md:w-auto">
                  {isAdmin && (
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(event.id);
                          setFormValidationMsg(null);
                          setEventForm(event);
                          setActiveModal("event");
                        }}
                        className="h-8 w-8 text-zinc-400 hover:text-primary"
                        title="Editar Evento"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja remover esta atividade do cronograma?")) {
                            setEvents((prev) => prev.filter((e) => e.id !== event.id));
                          }
                        }}
                        className="h-8 w-8 text-zinc-400 hover:text-red-400"
                        title="Excluir Evento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Button
                    asChild
                    className="w-full sm:w-auto bg-primary text-xs font-cinzel uppercase tracking-wider text-black hover:bg-white"
                  >
                    <a
                      href={getWhatsAppEventUrl(event.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Participar
                    </a>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 2. VÍDEOS */}
      <section className="mx-auto mb-20 max-w-6xl">
        <div className="mb-8 flex items-center justify-between border-b border-primary/20 pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Video className="h-5 w-5" />
              <h2 className="font-cinzel text-2xl text-primary md:text-3xl">
                Vídeos & Ensinamentos
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Assista às gravações de rituais, palestras e mensagens do templo.
            </p>
          </div>

          {isAdmin && (
            <Button
              size="sm"
              onClick={() => {
                setEditingId(null);
                setFormValidationMsg(null);
                setMediaForm({
                  title: "",
                  date: "2026",
                  description: "",
                  mediaUrl: "",
                });
                setActiveModal("video");
              }}
              className="bg-primary text-black font-cinzel text-xs uppercase"
            >
              <Plus className="mr-1 h-4 w-4" /> Enviar Novo Vídeo
            </Button>
          )}
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {videos.map((item) => (
            <Card
              key={item.id}
              className="relative overflow-hidden border-primary/20 bg-zinc-950/80 backdrop-blur transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.12)]"
            >
              {isAdmin && (
                <div className="absolute top-2 right-2 z-20 flex gap-1 bg-black/80 rounded p-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(item.id);
                      setFormValidationMsg(null);
                      setMediaForm(item);
                      setActiveModal("video");
                    }}
                    className="h-7 w-7 text-zinc-300 hover:text-primary"
                    title="Editar foto"
                    aria-label="Editar foto"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Deseja realmente remover este vídeo?")) {
                        setVideos((prev) => prev.filter((v) => v.id !== item.id));
                      }
                    }}
                    className="h-7 w-7 text-zinc-300 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <div
                onClick={() => setExpandedMedia(item)}
                className="relative aspect-video w-full cursor-pointer bg-black/95 flex items-center justify-center group overflow-hidden"
              >
                <video
                  src={`${item.mediaUrl}#t=0.5`}
                  preload="metadata"
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary/30 border border-primary/50 text-primary backdrop-blur-sm transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-black">
                  <Play className="h-7 w-7 fill-current ml-1" />
                </div>
                <span className="absolute bottom-3 right-3 z-10 rounded bg-black/80 px-2 py-1 text-[11px] text-zinc-300 backdrop-blur">
                  {item.date}
                </span>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="font-cinzel text-lg text-primary">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. FOTOS */}
      <section className="mx-auto mb-16 max-w-6xl">
        <div className="mb-8 flex items-center justify-between border-b border-primary/20 pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <h2 className="font-cinzel text-2xl text-primary md:text-3xl">
                Fotos de Eventos & Cerimônias
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Registros fotográficos de nossas vivências e consagrações.
            </p>
          </div>

          {isAdmin && (
            <Button
              size="sm"
              onClick={() => {
                setEditingId(null);
                setFormValidationMsg(null);
                setMediaForm({
                  title: "",
                  date: "2026",
                  description: "",
                  mediaUrl: "",
                });
                setActiveModal("photo");
              }}
              className="bg-primary text-black font-cinzel text-xs uppercase"
            >
              <Plus className="mr-1 h-4 w-4" /> Enviar Nova Foto
            </Button>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {photos.map((item) => (
            <Card
              key={item.id}
              className="group relative overflow-hidden border-primary/20 bg-zinc-950/80 transition-all hover:border-primary/60 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
            >
              {isAdmin && (
                <div className="absolute top-2 right-2 z-20 flex gap-1 bg-black/80 rounded p-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(item.id);
                      setFormValidationMsg(null);
                      setMediaForm(item);
                      setActiveModal("photo");
                    }}
                    className="h-7 w-7 text-zinc-300 hover:text-primary"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Deseja realmente remover esta foto da galeria?")) {
                        setPhotos((prev) => prev.filter((p) => p.id !== item.id));
                      }
                    }}
                    className="h-7 w-7 text-zinc-300 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <div
                onClick={() => setExpandedMedia(item)}
                className="relative aspect-square w-full cursor-pointer overflow-hidden bg-black/95 flex items-center justify-center"
              >
                <img
                  src={item.mediaUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover blur-md opacity-30 scale-110"
                />
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="relative z-10 max-h-full max-w-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3 bg-zinc-950/90 border-t border-primary/10">
                <span className="block text-[10px] uppercase tracking-wider text-primary/70">
                  {item.date}
                </span>
                <h4 className="font-cinzel text-xs font-semibold text-zinc-200 mt-0.5 line-clamp-1">
                  {item.title}
                </h4>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* MODAL ADMIN */}
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
                <X className="h-4 w-4" />
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

      {/* MODAL EVENTO COM VALIDAÇÃO DE DATA / HORA FUTURA */}
      {isAdmin && activeModal === "event" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto border-primary/40 bg-zinc-950 p-6 text-zinc-200">
            <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
              <h3 className="font-cinzel text-lg text-primary">
                {editingId ? "Substituir Atividade" : "Nova Atividade no Calendário"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setFormValidationMsg(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formValidationMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{formValidationMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400">
                  Título do Ritual / Evento <span className="text-primary">*</span>
                </label>
                <Input
                  value={eventForm.title || ""}
                  onChange={(e) => {
                    setFormValidationMsg(null);
                    setEventForm({ ...eventForm, title: e.target.value });
                  }}
                  placeholder="Ex: Rito de Abertura com Mammon"
                  className="bg-black/60 border-primary/20 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Imagem de Destaque do Evento (Opcional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-cinzel uppercase text-primary hover:bg-primary/20">
                    <Upload className="h-4 w-4" />
                    Escolher Imagem
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "event")}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                    {eventForm.imageUrl ? "Imagem carregada!" : "Nenhum arquivo"}
                  </span>
                </div>

                {eventForm.imageUrl && (
                  <div className="mt-2.5 relative aspect-[16/10] w-full overflow-hidden rounded border border-primary/20 bg-black/95 flex items-center justify-center">
                    <img
                      src={eventForm.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover blur-md opacity-30 scale-110"
                    />
                    <img
                      src={eventForm.imageUrl}
                      alt="Prévia"
                      className="relative z-10 max-h-full max-w-full object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, imageUrl: "" })}
                      className="absolute top-2 right-2 z-20 rounded-full bg-black/80 p-1 text-zinc-300 hover:text-red-400"
                      title="Remover imagem"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400">
                    Data <span className="text-primary">*</span>
                  </label>
                  <Input
                    type="date"
                    min={getTodayIsoDate()} // Bloqueia dias anteriores no calendário
                    value={eventForm.date || ""}
                    onChange={(e) => {
                      setFormValidationMsg(null);
                      setEventForm({ ...eventForm, date: e.target.value });
                    }}
                    className="bg-black/60 border-primary/20 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Horário</label>
                  <Input
                    type="time"
                    value={eventForm.time || "20:00"}
                    onChange={(e) => {
                      setFormValidationMsg(null);
                      setEventForm({ ...eventForm, time: e.target.value });
                    }}
                    className="bg-black/60 border-primary/20 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400">Período de Exibição</label>
                  <select
                    value={eventForm.period || "semana"}
                    onChange={(e) => setEventForm({ ...eventForm, period: e.target.value as any })}
                    className="w-full h-9 rounded-md border border-primary/20 bg-black/60 px-3 text-xs text-zinc-200"
                  >
                    <option value="semana">Esta Semana</option>
                    <option value="mes">Neste Mês</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Tipo de Cerimônia</label>
                  <select
                    value={eventForm.type || "Presencial"}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as any })}
                    className="w-full h-9 rounded-md border border-primary/20 bg-black/60 px-3 text-xs text-zinc-200"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Online / Egrégora">Online / Egrégora</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Local</label>
                <Input
                  value={eventForm.location || ""}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="Ex: Santuário Domus Luciferis"
                  className="bg-black/60 border-primary/20 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">Descrição / Finalidade</label>
                <Textarea
                  value={eventForm.description || ""}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Detalhes sobre a finalidade da cerimônia..."
                  className="bg-black/60 border-primary/20 text-xs"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveModal(null);
                  setFormValidationMsg(null);
                }}
                className="border-primary/20 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveEventDirect}
                className="bg-primary text-black font-cinzel text-xs uppercase font-bold"
              >
                {editingId ? "Substituir Atividade" : "Salvar Atividade"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL MÍDIA */}
      {isAdmin && (activeModal === "video" || activeModal === "photo") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-primary/40 bg-zinc-950 p-6 text-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
              <h3 className="font-cinzel text-lg text-primary">
                {editingId
                  ? activeModal === "video"
                    ? "Substituir Vídeo"
                    : "Substituir Foto"
                  : activeModal === "video"
                  ? "Adicionar Novo Vídeo"
                  : "Adicionar Nova Foto"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setFormValidationMsg(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formValidationMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{formValidationMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400">
                  Título <span className="text-primary">*</span>
                </label>
                <Input
                  value={mediaForm.title || ""}
                  onChange={(e) => {
                    setFormValidationMsg(null);
                    setMediaForm({ ...mediaForm, title: e.target.value });
                  }}
                  placeholder="Ex: Rito de Aliança"
                  className="bg-black/60 border-primary/20 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">Data / Ano</label>
                <Input
                  value={mediaForm.date || ""}
                  onChange={(e) => setMediaForm({ ...mediaForm, date: e.target.value })}
                  placeholder="Ex: Outubro de 2026"
                  className="bg-black/60 border-primary/20 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  {activeModal === "video"
                    ? "Opção 1: Upload do Arquivo de Vídeo (MP4, WEBM)"
                    : "Upload do Arquivo de Imagem"}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-cinzel uppercase text-primary hover:bg-primary/20">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isUploading ? "Carregando..." : "Escolher Arquivo"}
                    <input
                      type="file"
                      accept={activeModal === "video" ? "video/*" : "image/*"}
                      onChange={(e) => handleFileUpload(e, "media")}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <span className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                    {mediaForm.mediaUrl ? "Arquivo selecionado!" : "Nenhum arquivo"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  {activeModal === "video"
                    ? "Ou cole a URL direta do vídeo"
                    : "Ou cole a URL direta da imagem"}
                </label>
                <Input
                  value={mediaForm.mediaUrl || ""}
                  onChange={(e) => {
                    setFormValidationMsg(null);
                    setMediaForm({ ...mediaForm, mediaUrl: e.target.value });
                  }}
                  placeholder={
                    activeModal === "video"
                      ? "https://exemplo.com/video.mp4"
                      : "https://exemplo.com/imagem.jpg"
                  }
                  className="bg-black/60 border-primary/20 text-xs"
                />
              </div>

              {activeModal === "video" && (
                <div>
                  <span className="text-[10px] text-zinc-500">
                    O arquivo escolhido ou a URL substitui a mídia atual ao salvar.
                  </span>
                </div>
              )}

              {mediaForm.mediaUrl && (
                <div className="mt-3 relative aspect-[16/10] w-full overflow-hidden rounded border border-primary/20 bg-black/95 flex items-center justify-center">
                  {activeModal === "video" ? (
                    <video
                      src={`${mediaForm.mediaUrl}#t=0.5`}
                      preload="metadata"
                      controls
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <>
                      <img
                        src={mediaForm.mediaUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover blur-md opacity-30 scale-110"
                      />
                      <img
                        src={mediaForm.mediaUrl}
                        alt="Preview"
                        className="relative z-10 max-h-full max-w-full object-contain p-1"
                      />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaForm({ ...mediaForm, mediaUrl: "" })}
                    className="absolute top-2 right-2 z-20 rounded-full bg-black/80 p-1 text-zinc-300 hover:text-red-400"
                    title="Remover"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="text-xs text-zinc-400">Descrição</label>
                <Textarea
                  value={mediaForm.description || ""}
                  onChange={(e) => setMediaForm({ ...mediaForm, description: e.target.value })}
                  placeholder="Breve descrição sobre o conteúdo..."
                  className="bg-black/60 border-primary/20 text-xs"
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveModal(null);
                  setFormValidationMsg(null);
                }}
                className="border-primary/20 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isUploading}
                onClick={() => handleSaveMediaDirect(activeModal === "video" ? "video" : "image")}
                className="bg-primary text-black font-cinzel text-xs uppercase font-bold"
              >
                {isUploading
                  ? "Carregando..."
                  : editingId
                  ? activeModal === "photo"
                    ? "Salvar alterações da foto"
                    : "Salvar alterações do vídeo"
                  : activeModal === "photo"
                  ? "Salvar foto"
                  : "Salvar vídeo"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* LIGHTBOX */}
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
              type="button"
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
                <p className="text-xs text-zinc-400 mt-0.5">
                  {expandedMedia.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navegação Inferior */}
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