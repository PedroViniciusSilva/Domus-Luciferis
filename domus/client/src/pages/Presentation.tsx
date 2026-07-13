import { Button } from "@/components/ui/button";
import MainLayout from "@/components/MainLayout";
import { ArrowRight, ShieldCheck, Sparkles, LayoutGrid, ScrollText } from "lucide-react";
import { Link } from "wouter";

const highlights = [
  {
    icon: LayoutGrid,
    title: "Estrutura visual",
    description: "Home, páginas principais e navegação já organizadas para navegação clara.",
  },
  {
    icon: Sparkles,
    title: "Identidade do templo",
    description: "Visual escuro, tipografia cerimonial e detalhes dourados em toda a interface.",
  },
  {
    icon: ScrollText,
    title: "Doações registradas",
    description: "Cadastro com armazenamento local e painel restrito para consulta e manutenção.",
  },
  {
    icon: ShieldCheck,
    title: "Área restrita",
    description: "Entrada administrativa separada para editar e excluir cadastros de doações.",
  },
];

export default function Presentation() {
  return (
    <MainLayout>
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_45%),linear-gradient(to_bottom,_rgba(0,0,0,0.92),_rgba(0,0,0,1))]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.45em] text-primary/70">
              Link de apresentação
            </p>
            <h1 className="font-cinzel text-4xl text-primary md:text-6xl">
              Domus Luciferis em andamento
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Esta página mostra a versão atual do site para validação visual e revisão com o cliente.
              O conteúdo principal já está estruturado, com navegação, páginas institucionais e área
              restrita para doações.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/">
                <Button className="h-11 border border-primary/30 bg-primary text-black hover:bg-white">
                  Ver Home
                </Button>
              </Link>
              <Link href="/admin/doacoes">
                <Button variant="outline" className="h-11 border-primary/30 text-primary hover:bg-primary hover:text-black">
                  Área restrita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-primary/10 bg-zinc-950/80 p-6 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-cinzel text-xl text-primary">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}