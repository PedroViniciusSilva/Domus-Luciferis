import { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group shrink-0">
              <img 
                src="/images/logo.jpg" 
                alt="Domus Luciferis Logo" 
                className="h-12 w-12 rounded-full border border-primary/30 group-hover:border-primary transition-colors duration-500"
              />
              <span className="font-cinzel font-bold text-xl tracking-widest text-primary group-hover:text-white transition-colors duration-500">
                DOMUS LUCIFERIS
              </span>
            </div>
          </Link>
          
          {/* Menu Principal Atualizado */}
          <nav className="hidden md:flex items-center gap-6 ml-auto pl-6">
            <div className="flex items-center gap-5">
              <Link href="/rituais" className="inline-flex h-10 items-center text-xs uppercase tracking-widest transition-colors duration-300 hover:text-primary">
                Rituais
              </Link>
              <Link href="/produtos" className="inline-flex h-10 items-center text-xs uppercase tracking-widest transition-colors duration-300 hover:text-primary">
                Cronograma
              </Link>
              <Link href="/goetia" className="inline-flex h-10 items-center text-xs uppercase tracking-widest transition-colors duration-300 hover:text-primary">
                Goetia
              </Link>
              <Link href="/doacoes" className="inline-flex h-10 items-center text-xs uppercase tracking-widest transition-colors duration-300 hover:text-primary">
                Doações
              </Link>
            </div>

            <div className="h-6 w-px bg-primary/20" /> {/* Divisor visual */}

            <div className="flex items-center gap-3">
              <a
                href="https://chat.whatsapp.com/HhpYGYoCqkdDSrTpayzUjc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="outline" size="sm" className="h-10 border-primary text-primary hover:bg-primary hover:text-black font-cinzel tracking-wider text-xs">
                  Junte-se a Nós
                </Button>
              </a>

              <Link href="/admin/doacoes" className="inline-flex">
                <Button variant="outline" size="sm" className="h-10 border-primary/40 text-white hover:bg-primary hover:text-black font-cinzel tracking-wider text-xs">
                  Área Administrativa
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-primary/10 py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8 flex justify-center">
            <img src="/images/symbol_flame.png" alt="Flame Symbol" className="h-12 opacity-50" />
          </div>
          <h3 className="font-cinzel text-2xl text-primary mb-4">DOMUS LUCIFERIS</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 font-light italic">
            "Transformar vivência em estrutura, conhecimento em serviço e prática em responsabilidade coletiva."
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <a href="https://www.instagram.com/domusluciferis?igsh=MW00NmNyajZmM2dzdg%3D%3D" className="text-muted-foreground hover:text-primary transition-colors">Instagram</a>
            <a href="https://wa.me/556196023210" className="text-muted-foreground hover:text-primary transition-colors">WhatsApp</a>
            <a href="https://www.youtube.com/@domusluciferis" className="text-muted-foreground hover:text-primary transition-colors">YouTube</a>
            {/* E-mail reservado para ativação futura. */}
            {/* <a href="https://email.domusluciferis.com" className="text-muted-foreground hover:text-primary transition-colors">Email</a> */}
            <a href="https://www.tiktok.com/@domus.luciferis?_r=1&_t=ZS-9AHIdeTNGKY" className="text-muted-foreground hover:text-primary transition-colors">TikTok</a>
          </div>
          <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Templo Domus Luciferis. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
