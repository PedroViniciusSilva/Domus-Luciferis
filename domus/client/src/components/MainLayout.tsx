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
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
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
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/rituais">
              <a className="text-xs tracking-widest hover:text-primary transition-colors duration-300 uppercase">Rituais</a>
            </Link>
            <Link href="/produtos">
              <a className="text-xs tracking-widest hover:text-primary transition-colors duration-300 uppercase">Produtos</a>
            </Link>
            <Link href="/goetia">
              <a className="text-xs tracking-widest hover:text-primary transition-colors duration-300 uppercase">Goetia</a>
            </Link>
            <Link href="/membros">
              <a className="text-xs tracking-widest hover:text-primary transition-colors duration-300 uppercase">Membros</a>
            </Link>
            
            <div className="h-4 w-[1px] bg-primary/20 mx-2" /> {/* Divisor visual */}

            
            <a 
              href="https://chat.whatsapp.com/HhpYGYoCqkdDSrTpayzUjc" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-black font-cinzel tracking-wider text-xs">
                Junte-se a Nós
              </Button>
            </a>
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
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Instagram</a>
            <a href="https://chat.whatsapp.com/HhpYGYoCqkdDSrTpayzUjc" className="text-muted-foreground hover:text-primary transition-colors">WhatsApp</a>
          </div>
          <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Templo Domus Luciferis. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}