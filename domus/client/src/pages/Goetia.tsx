import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter"; // Importação essencial para navegação
import { allEntities } from "@/data/daemons/entities";

export default function Goetia() {
  const categorias = ["Entidade Maior", "Reis", "Duques", "Príncipes", "Marqueses", "Presidentes", "Condes", "Cavaleiros"];

  return (
    <div className="container mx-auto px-4 py-16">
      <header className="text-center mb-12">
        <h1 className="font-cinzel text-4xl text-primary mb-4 uppercase tracking-widest">
          Hierarquia Infernal
        </h1>
        <p className="text-muted-foreground italic font-light">
          "Conhecimento, Tradição e Prática do Templo Domus Luciferis"
        </p>
      </header>

      <Tabs defaultValue="Entidade Maior" className="w-full">
        <div className="flex justify-center mb-10">
          <TabsList className="bg-zinc-900/50 border border-primary/20 h-auto flex-wrap justify-center p-2">
            {categorias.map((cat) => (
              <TabsTrigger 
                key={cat} 
                value={cat} 
                className="font-cinzel text-[10px] sm:text-xs uppercase tracking-widest px-4"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categorias.map((cat) => {
          const entidadesDaCategoria = allEntities.filter(e => e.category === cat);
          
          return (
            <TabsContent key={cat} value={cat} className="animate-in fade-in zoom-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {entidadesDaCategoria.length > 0 ? (
                  entidadesDaCategoria.map((entidade) => (
                    /* Aqui substituímos o Dialog pelo Link dinâmico */
                    <Link key={entidade.name} href={`/goetia/${entidade.slug}`}>
                      <Card className="bg-black/60 border-primary/10 hover:border-primary/40 transition-all group cursor-pointer h-full">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] text-primary/40 uppercase font-bold">
                              #{entidade.slug}
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase">{entidade.title}</span>
                          </div>
                          <CardTitle className="font-cinzel text-xl text-primary text-center mt-2 group-hover:scale-105 transition-transform">
                            {entidade.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="mb-4 flex justify-center">
                            <img 
                              src={entidade.image} 
                              alt={entidade.name} 
                              className="h-24 w-24 object-contain opacity-50 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all"
                              onError={(e) => e.currentTarget.src = "/images/symbol_flame.png"}
                            />
                          </div>
                          <p className="text-[10px] text-primary uppercase tracking-tighter mb-2 font-bold">{entidade.area}</p>
                          <p className="text-xs text-muted-foreground italic">
                            Ver grimório completo
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-full text-center text-zinc-600 italic py-10">
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