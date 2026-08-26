import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  MessageCircle,
  Play,
  X,
} from "lucide-react";
import { useState } from "react";
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
  const [expandedMedia, setExpandedMedia] = useState<RitualItem | null>(null);

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
        {RITUALS_DATA.map((ritual) => (
          <Card
            key={ritual.id}
            className="flex flex-col justify-between overflow-hidden border-primary/20 bg-zinc-950/80 backdrop-blur transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          >
            <div>
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