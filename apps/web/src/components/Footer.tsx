import { Heart, Mail, Phone } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 via-transparent to-indigo-900/50"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {/* Logo and Mission */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Logo
                                href="/"
                                size="md"
                                showText="true"
                                colorScheme="white"
                            />
                        </div>
                        <p className="text-blue-100 leading-relaxed text-sm sm:text-base">
                            Uma plataforma de apoio e acolhimento para mães de crianças com autismo. 
                            Juntas, somos mais fortes.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                            Links Rápidos
                        </h3>
                        <nav className="space-y-1">
                            {[
                                { to: '/hub-maes', label: 'Hub das Mães' },
                                { to: '/grupos', label: 'Área de Grupos' },
                                { to: '/espaco-cuidado', label: 'Espaço de Cuidado' },
                                { to: '/direitos-beneficios', label: 'Direitos e Benefícios' }
                            ].map((link, index) => (
                                <Link 
                                    key={link.to}
                                    to={link.to} 
                                    className="group relative block text-blue-100 hover:text-white transition-all duration-300 hover:translate-x-1 transform-gpu text-sm sm:text-base"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <span className="relative">
                                        {link.label}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:w-full transition-all duration-300"></span>
                                    </span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Contact */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                            Contato
                        </h3>
                        <div className="space-y-1">
                            <div className="group flex items-center space-x-3 hover:translate-x-1 transition-transform duration-300 transform-gpu">
                                <div className="p-2 bg-blue-800/50 rounded-lg group-hover:bg-blue-700/60 transition-colors duration-300">
                                    <Mail className="w-5 h-5 text-blue-300 group-hover:text-blue-200 group-hover:scale-110 transition-all duration-300" />
                                </div>
                                <span className="text-blue-100 group-hover:text-white transition-colors duration-300 text-sm sm:text-base">
                                    contato@afetoatipico.com
                                </span>
                            </div>
                            <div className="group flex items-center space-x-3 hover:translate-x-1 transition-transform duration-300 transform-gpu">
                                <div className="p-2 bg-blue-800/50 rounded-lg group-hover:bg-blue-700/60 transition-colors duration-300">
                                    <Phone className="w-5 h-5 text-blue-300 group-hover:text-blue-200 group-hover:scale-110 transition-all duration-300" />
                                </div>
                                <span className="text-blue-100 group-hover:text-white transition-colors duration-300 text-sm sm:text-base">
                                    (11) 9999-9999
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative border-t border-blue-700/60 mt-8 pt-6 text-center space-y-2">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                    <p className="text-blue-200 text-sm sm:text-base">
                        © 2025 Afeto Atípico. Feito com{' '}
                        <span className="inline-block animate-pulse text-blue-400">💙</span>{' '}
                        para mães incríveis.
                    </p>
                    <p className="text-blue-300 text-xs sm:text-sm">
                        Desenvolvido por{' '}
                        <a 
                            href="https://github.com/lucaaszsx" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300"
                        >
                            Lucas
                            <span className="inline-block ml-1 group-hover:translate-x-0.5 transition-transform duration-300">→</span>
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;