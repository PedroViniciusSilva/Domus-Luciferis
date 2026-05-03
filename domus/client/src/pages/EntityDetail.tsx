import { useRoute } from "wouter";
import { allEntities } from "@/data/entities";
import MainLayout from "@/components/MainLayout";

export default function EntityDetail() {
  const [, params] = useRoute("/goetia/:slug");
  const entidade = allEntities.find((e) => e.slug === params?.slug);

  if (!entidade) return <div>Entidade não encontrada.</div>;

  return (
    <MainLayout>
      <div className="min-h-screen bg-black text-zinc-200">
        {/* Banner com Imagem Grande */}
        <div className="relative h-[60vh] w-full">
          <img 
            src={entidade.image} 
            className="w-full h-full object-cover opacity-60"
            alt={entidade.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-10 left-10">
            <span className="text-primary font-cinzel tracking-[0.5em] uppercase text-sm">{entidade.title}</span>
            <h1 className="font-cinzel text-6xl text-white mt-2 tracking-widest">{entidade.name}</h1>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Coluna Lateral: Info Rápida */}
          <div className="space-y-8 border-r border-primary/10 pr-8">
            <div>
              <h4 className="text-primary font-cinzel uppercase text-xs mb-2">Área de Atuação</h4>
              <p className="text-xl font-light">{entidade.area}</p>
            </div>
            <div>
              <h4 className="text-primary font-cinzel uppercase text-xs mb-2">Melhores Dias</h4>
              <p className="text-lg font-light">{entidade.bestDays}</p>
            </div>
            <div>
              <h4 className="text-primary font-cinzel uppercase text-xs mb-2">Poderes</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {entidade.powers.map(p => (
                  <span key={p} className="border border-primary/30 px-3 py-1 text-[10px] uppercase tracking-widest">{p}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Central: Textos Longos */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="font-cinzel text-2xl text-primary mb-6 border-b border-primary/20 pb-2">História e Origem</h2>
              <p className="text-zinc-400 leading-relaxed text-lg font-light">{entidade.history}</p>
            </section>
            
            <section className="bg-zinc-900/30 p-8 border border-primary/5 rounded-lg">
              <h2 className="font-cinzel text-2xl text-primary mb-6">Instruções de Culto</h2>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-line italic">{entidade.cultivation}</p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}