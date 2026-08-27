import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Imports das Páginas
import Home from "./pages/Home";
import Rituals from "./pages/Rituals";
import Schedule from "./pages/Schedule";
import Goetia from "./pages/Goetia";
import Donations from "./pages/Members";
import AdminDonations from "./pages/AdminDonations";
import EntityDetail from "./pages/EntityDetail";
import Presentation from "./pages/Presentation";

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
      
      {/* Rota do Cronograma (compatível com os caminhos novo e legados) */}
      <Route path="/cronograma" component={Schedule} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/produtos" component={Schedule} />
      <Route path="/shop" component={Schedule} />

      <Route path="/goetia" component={Goetia} />
      <Route path="/doacoes" component={Donations} />
      <Route path="/apresentacao" component={Presentation} />
      <Route path="/membros" component={LegacyMembersRedirect} />
      <Route path="/admin/doacoes" component={AdminDonations} />

      {/* Rota dinâmica para detalhes de entidades */}
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