import { useRoute, useLocation } from "wouter";
import { allEntities } from "@/data/daemons/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function EntityDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/goetia/:slug");
  const entity = allEntities.find((e) => e.slug === params?.slug);

  if (!entity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl text-primary font-cinzel">Entidade não encontrada</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      {/* Botão de Voltar e Home */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex gap-3 mb-6">
          <Button 
            onClick={() => window.history.back()} 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:bg-primary/10 border border-primary/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button 
            onClick={() => setLocation('/')} 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:bg-primary/10 border border-primary/20"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>

      {/* Banner Principal */}
      <div className="relative h-[40vh] w-full overflow-hidden border-b border-primary/20">
        <img 
          src={entity.image} 
          alt={entity.name}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 text-center">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary uppercase tracking-widest">
            {entity.category} - {entity.title}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-cinzel text-primary uppercase tracking-[0.2em]">
            {entity.name}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Coluna da Esquerda: Dados Técnicos e Sigilo */}
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-primary/10">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-cinzel text-primary border-b border-primary/20 pb-2 uppercase text-sm">Correspondências</h3>
                <div className="space-y-3 text-sm">
                  <p><span className="text-primary/60 uppercase text-[10px] block">Enn:</span> <span className="italic">"{entity.enn}"</span></p>
                  <p><span className="text-primary/60 uppercase text-[10px] block">Planeta:</span> {entity.planeta}</p>
                  <p><span className="text-primary/60 uppercase text-[10px] block">Elemento:</span> {entity.elemento}</p>
                  <p><span className="text-primary/60 uppercase text-[10px] block">Metal:</span> {entity.metal}</p>
                  <p><span className="text-primary/60 uppercase text-[10px] block">Incenso:</span> {entity.incenso}</p>
                  <p><span className="text-primary/60 uppercase text-[10px] block">Melhores Dias:</span> {entity.melhoresDias}</p>
                  <p><span className="text-primary/60 uppercase text-[10px] block">Legiões:</span> {entity.legioes}</p>
                </div>
              </CardContent>
            </Card>

            {/* Bloco Exclusivo do Sigilo da Entidade */}
            <Card className="bg-zinc-900/50 border-primary/10 overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                <h3 className="font-cinzel text-primary border-b border-primary/20 pb-2 uppercase text-sm w-full text-center">
                  Sigilo Sagrado
                </h3>
                <div className="relative w-48 h-48 bg-zinc-950/80 rounded-lg p-4 border border-primary/20 flex items-center justify-center group backdrop-blur-sm">
                  <img 
                    src={entity.sigil} 
                    alt={`Sigilo de ${entity.name}`}
                    className="max-w-full max-h-full object-contain block opacity-90 invert tracking-widest group-hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => {
                      // Fallback dinâmico caso a rota do Vite adicione query strings
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("?retry")) {
                        target.src = `/images/sigils/${entity.slug}.png?retry=1`;
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h3 className="font-cinzel text-primary uppercase text-sm">Atribuições e Poderes</h3>
              <div className="flex flex-wrap gap-2">
                {entity.poderes?.map((poder) => (
                  <Badge key={poder} variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                    {poder}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna da Direita: História */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-cinzel text-primary mb-4 uppercase tracking-wider">Sua História</h2>
              <Separator className="mb-6 bg-primary/20" />
              <p className="text-zinc-400 leading-relaxed text-lg whitespace-pre-line">
                {entity.historia}
              </p>
            </section>
            
            <section className="bg-primary/5 p-8 border-l-2 border-primary">
              <h2 className="text-xl font-cinzel text-primary mb-2 uppercase italic">Especialidade</h2>
              <p className="text-zinc-300">{entity.area}</p>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}