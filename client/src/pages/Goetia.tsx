import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { allEntities } from "@/data/daemons/entities";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const categorias = ["Entidade Maior", "Reis", "Duques", "Príncipes", "Marqueses", "Presidentes", "Condes", "Cavaleiros"];

function EntityCard({ entity }: { entity: (typeof allEntities)[number] }) {
  return (
    <Link href={`/goetia/${entity.slug}`} className="block h-full">
      <Card className="group relative h-full overflow-hidden rounded-2xl border border-primary/10 bg-zinc-950/90 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_35px_rgba(212,175,55,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_55%)]" />
        
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.35em] text-primary/50">#{entity.slug}</p>
              <CardTitle className="mt-2 font-cinzel text-3xl text-primary">{entity.name}</CardTitle>
              <p className="mt-2 text-sm text-zinc-400">{entity.title}</p>
            </div>
            <Badge className="border-primary/20 bg-primary/10 text-[10px] uppercase tracking-[0.24em] text-primary whitespace-nowrap">
              {entity.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6 p-6 pt-0">
          <div className="flex justify-center">
            <div className="rounded-xl border border-white/5 bg-black/50 p-4">
              <img
                src={entity.sigil}
                alt={`Sigilo de ${entity.name}`}
                className="h-40 w-40 object-contain opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105 invert"
                onError={(event) => {
                  event.currentTarget.src = "/images/symbol_flame.png";
                  event.currentTarget.classList.remove("invert");
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Goetia() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8 flex gap-3">
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

      <header className="mb-12 text-center">
        <h1 className="mb-4 font-cinzel text-4xl uppercase tracking-widest text-primary">
          Hierarquia Infernal
        </h1>
        <p className="text-muted-foreground italic font-light">
          “Conhecimento, Tradição e Prática do Templo Domus Luciferis”
        </p>
      </header>

      <div className="mb-10 rounded-2xl border border-primary/10 bg-zinc-950/70 p-6">
        <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-primary/50">Catálogo</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-cinzel text-2xl text-primary">Selecione uma categoria</h2>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400">
            Te convidamos a conhecer todas as entidades da Goetia, cada uma com sua história, sigilo e correspondências. Explore as categorias abaixo para descobrir suas características.
          </p>
        </div>
      </div>

      <Tabs defaultValue="Entidade Maior" className="w-full">
        <div className="mb-8 flex justify-center">
          <TabsList className="h-auto flex-wrap justify-center border border-primary/20 bg-zinc-900/60 p-2">
            {categorias.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="px-4 font-cinzel text-[10px] uppercase tracking-widest sm:text-xs"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categorias.map((cat) => {
          const entidadesDaCategoria = allEntities.filter((entity) => entity.category === cat);

          return (
            <TabsContent key={cat} value={cat} className="animate-in fade-in zoom-in duration-500">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {entidadesDaCategoria.length > 0 ? (
                  entidadesDaCategoria.map((entidade) => <EntityCard key={entidade.slug} entity={entidade} />)
                ) : (
                  <p className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-zinc-950/60 p-10 text-center text-zinc-600 italic">
                    Registros em fase de transcrição...
                  </p>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}