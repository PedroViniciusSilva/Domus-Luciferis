import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  Flame,
  Home,
  MessageCircle,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export type RitualCategory =
  | "todos"
  | "prosperidade"
  | "amor"
  | "protecao"
  | "justica"
  | "alta_magia";

export type RitualItem = {
  id: string;
  title: string;
  category: RitualCategory;
  categoryLabel: string;
  price: string;
  shortDescription: string;
  fullDescription: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  featured?: boolean;
};

const RITUALS_DATA: RitualItem[] = [
  {
    id: "magnetismo-forca pessoal",
    title: "Magnetismo e Força Pessoal",
    category: "prosperidade",
    categoryLabel: "Prosperidade & Finanças",
    price: "R$ 700,00",
    shortDescription:
      "Trabalho focado na quebra de amarras financeiras, aceleração de negócios e expansão patrimonial sob a egrégora de Mammon e Belial.",
    fullDescription:
      "Este ritual de alta voltagem atua no desbloqueio dos canais de abundância e prosperidade material. Conduzido dentro do santuário com consagração em metais solares e fogo sagrado, direciona correntes energéticas para abertura comercial, resolução de dívidas e atração de oportunidades.",
    mediaType: "image",
    mediaUrl: "/images/rituals/lilith.png",
    featured: true,
  },
  {
    id: "amarracao-amorosa",
    title: "Amarração & Dominação Amorosa",
    category: "amor",
    categoryLabel: "Amor & União",
    price: "R$ 3.000,00",
    shortDescription:
      "Atuação direta na mente, desejo carnal e atração magnética para reconciliação ou consolidação de relacionamento.",
    fullDescription:
      "Trabalho cerimonial de magnetismo e sedução canalizado sob a força de Asmodeus e Astaroth. Visa restabelecer a atração visceral, eliminar interferências externas de terceiros e restabelecer a conexão carnal e emocional entre o casal.",
    mediaType: "image",
    mediaUrl: "/images/rituals/amarracao.jpg",
    featured: true,
  },
  {
    id: "banimento-corte-laços",
    title: "Banimento  & Quebra de Demandas",
    category: "protecao",
    categoryLabel: "Proteção & Limpeza",
    price: "R$ 800,00",
    shortDescription:
      "Desintegração total de feitiços contrários, magia negra nociva, inveja destrutiva e obsessores espirituais.",
    fullDescription:
      "Uma limpeza profunda e agressiva de campo áurico e residencial. Elimina larvas astrais, quebra demandas antigas e estabelece um escudo protetor intransponível com os guardiões da Corrente Luciferiana.",
    mediaType: "image",
    mediaUrl: "images/rituals/demanda.png",
  },
  {
    id: "justica-retribuicao-belial",
    title: "Demanda de Retribuição & Justiça",
    category: "justica",
    categoryLabel: "Destruição & Justiça",
    price: "R$ 2.000,00",
    shortDescription:
      "Carga de retribuição implacável para neutralizar inimigos, falsos testemunhos e injustiças sofridas.",
    fullDescription:
      "Trabalho rigoroso de justiça e equilíbrio kármico acelerado. Não aceita intermediários e atua devolvendo em dobro qualquer ataque, traição ou calúnia desferida contra o solicitante.",
    mediaType: "image",
    mediaUrl: "images/rituals/prosperidade.png",
  },
  {
    id: "pacto-iniciacao-lucifer",
    title: "Iniciação & Pactuação Luciferiana",
    category: "alta_magia",
    categoryLabel: "Alta Magia",
    price: "R$ 3.500,00",
    shortDescription:
      "Cerimônia solene de aliança e despertar da centelha divina, soberania pessoal e proteção vitalícia.",
    fullDescription:
      "O trabalho mais nobre do templo. Um ritual exclusivo para aqueles que buscam a iluminação, autoridade espiritual, desenvolvimento de dons psíquicos e aliança direta com Lúcifer.",
    mediaType: "image",
    mediaUrl: "images/rituals/seere.png",
    featured: true,
  },
];

const CATEGORIES = [
  { id: "todos", label: "Todos os Trabalhos" },
  { id: "prosperidade", label: "Prosperidade" },
  { id: "amor", label: "Amor & União" },
  { id: "protecao", label: "Proteção & Limpeza" },
  { id: "justica", label: "Justiça & Defesa" },
  { id: "alta_magia", label: "Alta Magia" },
];

export default function Rituals() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<RitualCategory>("todos");
  const [selectedRitual, setSelectedRitual] = useState<RitualItem | null>(null);

  const filteredRituals =
    activeCategory === "todos"
      ? RITUALS_DATA
      : RITUALS_DATA.filter((ritual) => ritual.category === activeCategory);

  function getWhatsAppUrl(ritualTitle: string) {
    const text = encodeURIComponent(
      `Saudações. Gostaria de agendar uma consulta ao oráculo sobre o ritual: ${ritualTitle}.`
    );
    return `https://chat.whatsapp.com/HhpYGYoCqkdDSrTpayzUjc?text=${text}`;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Barra de navegação superior: Voltar e Home */}
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
      <div className="mx-auto mb-10 max-w-3xl rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <p className="text-xs leading-relaxed">
            <strong className="font-semibold text-amber-300 uppercase tracking-wider">Aviso Importante: </strong> 
            Nenhum trabalho espiritual ou ritual é executado sem a consulta prévia ao Oráculo. A confirmação oracular é mandatória para avaliar o alinhamento e a viabilidade de cada caso.
          </p>
        </div>
      </div>

      {/* Filtros de Categoria */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            onClick={() => setActiveCategory(cat.id as RitualCategory)}
            className={`font-cinzel text-xs uppercase tracking-widest ${
              activeCategory === cat.id
                ? "bg-primary text-black hover:bg-primary/90"
                : "border-primary/20 text-zinc-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Grid de Rituais */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRituals.map((ritual) => (
          <Card
            key={ritual.id}
            className="flex flex-col justify-between overflow-hidden border-primary/20 bg-zinc-950/80 backdrop-blur transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          >
            <div>
              {/* Mídia do Card clicável para abrir detalhes */}
              <div
                onClick={() => setSelectedRitual(ritual)}
                className="relative aspect-video w-full cursor-pointer overflow-hidden bg-black/90 flex items-center justify-center group"
                title="Clique para ver detalhes"
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
                      className="relative z-10 max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </>
                )}
                {ritual.featured && (
                  <span className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded bg-primary px-2 py-1 font-cinzel text-[10px] font-bold uppercase tracking-wider text-black">
                    <Sparkles className="h-3 w-3" /> Destaque
                  </span>
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

            <CardFooter className="flex flex-col gap-2 pt-0">
              <div className="grid w-full grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRitual(ritual)}
                  className="border-primary/30 text-xs font-cinzel uppercase tracking-wider text-primary hover:bg-primary hover:text-black"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> Detalhes
                </Button>
                <Button
                  type="button"
                  asChild
                  className="bg-primary text-xs font-cinzel uppercase tracking-wider text-black hover:bg-white"
                >
                  <a
                    href={getWhatsAppUrl(ritual.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Consultar
                  </a>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Modal de Detalhes do Ritual */}
      {selectedRitual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <Card className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto border-primary/40 bg-zinc-950 p-6 text-zinc-200">
            {/* Barra superior dentro do Modal: Voltar, Home e Fechar */}
            <div className="mb-4 flex items-center justify-between border-b border-primary/10 pb-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRitual(null)}
                  className="border border-primary/20 text-xs text-primary hover:bg-primary/10"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Voltar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRitual(null);
                    setLocation("/");
                  }}
                  className="border border-primary/20 text-xs text-primary hover:bg-primary/10"
                >
                  <Home className="mr-1.5 h-3.5 w-3.5" />
                  Home
                </Button>
              </div>

              <button
                onClick={() => setSelectedRitual(null)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                title="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Imagem expandida ajustada sem distorção e com tamanho de destaque */}
            <div className="relative mb-6 h-64 sm:h-80 w-full overflow-hidden rounded-md border border-primary/20 bg-black/95 flex items-center justify-center">
              {selectedRitual.mediaType === "video" ? (
                <video
                  src={selectedRitual.mediaUrl}
                  controls
                  className="h-full w-full object-contain"
                />
              ) : (
                <>
                  <img
                    src={selectedRitual.mediaUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover blur-md opacity-30 scale-110"
                  />
                  <img
                    src={selectedRitual.mediaUrl}
                    alt={selectedRitual.title}
                    className="relative z-10 h-full w-full object-contain"
                  />
                </>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                  {selectedRitual.categoryLabel}
                </span>
                <h2 className="font-cinzel text-2xl text-primary md:text-3xl mt-1">
                  {selectedRitual.title}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 border-y border-primary/10 py-3">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-primary" />
                  <span>Operação no Altar do Santuário</span>
                </div>
              </div>

              <div>
                <h3 className="font-cinzel text-sm uppercase tracking-wider text-primary mb-2">
                  Finalidade da Ritualistica
                </h3>
                <p className="text-xs leading-relaxed text-zinc-300">
                  {selectedRitual.fullDescription}
                </p>
              </div>

              {/* Destaque de Valor */}
              <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/10 p-4">
                <div>
                  <span className="block text-[11px] uppercase tracking-widest text-zinc-400">
                    Investimento do Trabalho
                  </span>
                  <span className="font-cinzel text-2xl font-bold text-primary">
                    {selectedRitual.price}
                  </span>
                </div>
                <span className="rounded bg-black/50 px-2.5 py-1 text-[11px] text-primary/90 border border-primary/20">
                  Materiais inclusos
                </span>
              </div>

              {/* Caixa de Aviso Obrigatório do Oráculo */}
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong className="font-semibold text-amber-300">Consulta Oracular Obrigatória: </strong>
                    Nenhum ritual é firmado sem antes consulta oracular. A consulta oracular é essencial para diagnosticar o cenário espiritual e certificar a viabilidade do trabalho.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="flex-1 bg-primary font-cinzel text-black hover:bg-white text-xs uppercase tracking-widest h-11"
                >
                  <a
                    href={getWhatsAppUrl(selectedRitual.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> Consultar Oraculo 
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRitual(null)}
                  className="border-primary/20 text-xs font-cinzel uppercase tracking-wider"
                >
                  Fechar
                </Button>
              </div>
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