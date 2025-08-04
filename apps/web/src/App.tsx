import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import LoadingScreen from './components/LoadingScreen';
import Index from './pages/Index';
import HubMaes from './pages/HubMaes';
import AreaGrupos from './pages/AreaGrupos';
import ChatGrupo from './pages/ChatGrupo';
import EspacoCuidado from './pages/EspacoCuidado';
import DireitosBeneficios from './pages/DireitosBeneficios';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import VerificacaoCodigo from './pages/VerificacaoCodigo';
import VerificacaoEmail from './pages/VerificacaoEmail';
import EsqueciSenha from './pages/EsqueciSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import Perfil from './pages/Perfil';
import NotFound from './pages/NotFound';
import { useScrollToTop } from './hooks/useScrollToTop';
import { useApp } from './contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useRef } from 'react';

const queryClient = new QueryClient();

const AppContent = () => {
    useScrollToTop();
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { userService, authService } = useApp();
    const { toast } = useToast();
    const hasInitialized = useRef(false);
    const routesWithoutLayout = ['/grupos/chat/'];
    const shouldHideLayout = routesWithoutLayout.some(route => location.pathname.startsWith(route));

    useEffect(() => {
        if (hasInitialized.current) return;
        
        hasInitialized.current = true;

        const handleAuthFailure = () => {
            toast({
                title: 'Sessão finalizada',
                description: 'Sua sessão expirou. Faça login novamente.'
            });
            navigate('/login', { replace: true });
        };

        authService.setOnUnauthorizedCallback(handleAuthFailure);

        const loadUser = async () => {
            if (authService.hasAccessToken) {
                try {
                    await userService.getCurrentUser();
                } catch (error) {
                    console.error('Erro ao carregar usuário:', error);
                }
            }
            
            setIsLoading(false);
        };
        
        loadUser();
    }, []);
    
    if (isLoading) return <LoadingScreen />;

    return (
        <div className='min-h-screen flex flex-col'>
            {!shouldHideLayout && <Header />}
            
            <main className={shouldHideLayout ? 'h-screen' : 'flex-1'}>
                <Routes>
                    <Route path='/' element={<Index />} />
                    <Route path='/hub-maes' element={<HubMaes />} />
                    <Route path='/grupos' element={
                        <ProtectedRoute>
                            <AreaGrupos />
                        </ProtectedRoute>
                    } />
                    <Route path='/grupos/chat/:groupId' element={
                        <ProtectedRoute>
                            <ChatGrupo />
                        </ProtectedRoute>
                    } />
                    <Route path='/esqueci-senha' element={<EsqueciSenha />} />
                    <Route path='/redefinir-senha' element={<RedefinirSenha />} />
                    <Route path='/espaco-cuidado' element={<EspacoCuidado />} />
                    <Route path='/direitos-beneficios' element={<DireitosBeneficios />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/cadastro' element={<Cadastro />} />
                    <Route path='/verificacao-codigo' element={<VerificacaoCodigo />} />
                    <Route path='/verificacao-email' element={<VerificacaoEmail />} />
                    <Route path='/perfil' element={
                        <ProtectedRoute>
                            <Perfil />
                        </ProtectedRoute>
                    } />
                    <Route path='*' element={<NotFound />} />
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
                <AppProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </AppProvider>
            </ThemeProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;