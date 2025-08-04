import {
    DropdownMenuSeparator,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenu
} from '@/components/ui/dropdown-menu';
import { Menu, X, Heart, Users, Shield, Sparkles, LogIn, User, LogOut, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '../contexts/AppContext';
import { useState } from 'react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated, isPendingVerification, authService } = useAuth();
    const location = useLocation();
    
    const needsEmailVerification = isAuthenticated && isPendingVerification;
    
    const navigation = [
        { name: 'Hub das Mães', href: '/hub-maes', icon: Heart, color: 'from-pink-500 to-rose-500' },
        { name: 'Área de Grupos', href: '/grupos', icon: Users, color: 'from-blue-500 to-indigo-500' },
        { name: 'Espaço de Cuidado', href: '/espaco-cuidado', icon: Sparkles, color: 'from-purple-500 to-violet-500' },
        { name: 'Direitos e Benefícios', href: '/direitos-beneficios', icon: Shield, color: 'from-emerald-500 to-green-500' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-white/95 backdrop-blur-xl border-b border-blue-100/60 sticky top-0 z-50 shadow-sm shadow-blue-100/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8">
                <div className="flex justify-between items-center h-16">
                    <Logo
                        href="/"
                        size="md"
                        showText="true"
                        className="transition-transform duration-300 hover:scale-105"
                    />

                    <nav className="hidden xl:flex items-center space-x-1">
                        {navigation.map((item, index) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`group relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 transform-gpu ${
                                        active
                                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-sm'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                                    }`}
                                    style={{
                                        animationDelay: `${index * 50}ms`
                                    }}
                                >
                                    <div className={`p-2 rounded-sm transition-all duration-300 ${
                                        active 
                                            ? `bg-gradient-to-r ${item.color} shadow-sm` 
                                            : 'group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-500'
                                    }`}>
                                        <Icon className={`w-4 h-4 transition-all duration-300 ${
                                            active 
                                                ? 'text-white' 
                                                : 'text-gray-500 group-hover:text-white group-hover:scale-110'
                                        }`} />
                                    </div>
                                    <span className="relative">
                                        {item.name}
                                        {active && (
                                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                                        )}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="group flex items-center space-x-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:scale-105 transform-gpu hover:shadow-lg hover:shadow-blue-200/40 px-3 py-2 rounded-lg"
                                    >
                                        <div className="relative w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-lg">
                                            <User className="w-4 h-4 text-white" />
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div> {needsEmailVerification && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                                                    <AlertCircle className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="hidden sm:block font-medium text-gray-700 group-hover:text-blue-700 transition-colors duration-300">
                                            {user?.displayName?.split(' ')[0]}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 animate-scale-in"> {needsEmailVerification && (
                                        <>
                                            <DropdownMenuItem asChild className="cursor-pointer bg-red-50 text-red-700 hover:bg-red-100 focus:bg-red-100">
                                                <Link to="/verificacao-email" className="flex items-center space-x-2">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium">Email não verificado</span>
                                                        <span className="text-xs text-red-600">Clique para verificar</span>
                                                    </div>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                    
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link to="/perfil" className="flex items-center space-x-2 hover:bg-blue-50 transition-colors duration-200">
                                            <User className="w-4 h-4" />
                                            <span>Meu Perfil</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={authService.logout.bind(authService)}
                                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors duration-200"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sair</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden xl:flex items-center space-x-3">
                                <Link to="/login">
                                    <Button 
                                        variant="ghost" 
                                        className="group relative overflow-hidden text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:scale-105 transform-gpu px-4 py-2 hover:shadow-lg hover:shadow-blue-200/30"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-100/30 to-blue-50/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></span>
                                        <span className="relative flex items-center">
                                            <LogIn className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                            Entrar
                                        </span>
                                    </Button>
                                </Link>
                                <Link to="/cadastro">
                                    <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105 transform-gpu shadow-lg hover:shadow-xl hover:shadow-blue-500/30 border-0">
                                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></span>
                                        <span className="relative font-medium">Cadastrar</span>
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="xl:hidden group p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:scale-110 transform-gpu"
                        >
                            <div className="relative">
                                {isMenuOpen ? 
                                    <X className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" /> : 
                                    <Menu className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                                }
                            </div>
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="xl:hidden py-4 border-t border-blue-100/60 animate-fade-in bg-gradient-to-b from-white/95 to-blue-50/20 backdrop-blur-sm rounded-b-xl">
                        <div className="space-y-2">
                            {navigation.map((item, index) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 transform-gpu animate-fade-in ${
                                            active
                                                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-sm'
                                                : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                                        }`}
                                        style={{
                                            animationDelay: `${index * 100}ms`
                                        }}
                                    >
                                        <div className={`p-1.5 rounded-md transition-all duration-300 ${
                                            active 
                                                ? `bg-gradient-to-r ${item.color} shadow-sm` 
                                                : 'group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-500'
                                        }`}>
                                            <Icon className={`w-5 h-5 transition-all duration-300 ${
                                                active 
                                                    ? 'text-white' 
                                                    : 'text-gray-500 group-hover:text-white group-hover:scale-110'
                                            }`} />
                                        </div>
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                            
                            {!isAuthenticated && (
                                <div className="pt-4 border-t border-blue-100/60 space-y-2 animate-fade-in">
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button 
                                            variant="ghost" 
                                            className="group w-full justify-start text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-md"
                                        >
                                            <LogIn className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                            Entrar
                                        </Button>
                                    </Link>
                                    <Link to="/cadastro" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="group w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></span>
                                            <span className="relative font-medium">Cadastrar</span>
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;