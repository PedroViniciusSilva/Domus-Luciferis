import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function Rituals() {
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
      <h1 className="font-cinzel text-4xl text-primary pt-16 text-center">Rituais</h1>
    </div>
  );
}