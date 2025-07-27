import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import LoadingScreen from "./components/LoadingScreen";
import Index from "./pages/Index";
import HubMaes from "./pages/HubMaes";
import AreaGrupos from "./pages/AreaGrupos";
import ChatGrupo from "./pages/ChatGrupo";
import EspacoCuidado from "./pages/EspacoCuidado";
import DireitosBeneficios from "./pages/DireitosBeneficios";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import VerificacaoCodigo from "./pages/VerificacaoCodigo";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  useScrollToTop();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const routesWithoutLayout = ['/grupos/chat/'];
  const shouldHideLayout = routesWithoutLayout.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHideLayout && <Header />}
      
      <main className={shouldHideLayout ? "h-screen" : "flex-1"}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hub-maes" element={<HubMaes />} />
          <Route path="/grupos" element={<AreaGrupos />} />
          <Route path="/grupos/chat/:groupId" element={
            <ProtectedRoute>
              <ChatGrupo />
            </ProtectedRoute>
          } />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/espaco-cuidado" element={<EspacoCuidado />} />
          <Route path="/direitos-beneficios" element={<DireitosBeneficios />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/verificacao-codigo" element={<VerificacaoCodigo />} />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {!shouldHideLayout && <Footer />}
      <CookieConsent />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;