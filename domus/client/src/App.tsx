import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Imports Reais
import Home from "./pages/Home";
import Rituals from "./pages/Rituals";
import Shop from "./pages/Shop";
import Goetia from "./pages/Goetia";
import Donations from "./pages/Members";
import AdminDonations from "./pages/AdminDonations";
import EntityDetail from "./pages/EntityDetail"; // Página de detalhes que você vai criar

function LegacyMembersRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/doacoes");
  }, [setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Rotas principais */}
      <Route path="/rituais" component={Rituals} />
      <Route path="/produtos" component={Shop} />
      <Route path="/goetia" component={Goetia} />
      <Route path="/doacoes" component={Donations} />
      <Route path="/membros" component={LegacyMembersRedirect} />
      <Route path="/admin/doacoes" component={AdminDonations} />

      {/* ROTA DINÂMICA: Essencial para abrir a tela completa de cada Daemon */}
      <Route path="/goetia/:slug" component={EntityDetail} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
