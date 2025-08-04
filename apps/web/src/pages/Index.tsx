import { Link } from 'react-router-dom';
import { Heart, Users, Shield, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '../contexts/AppContext';
import { useState, useEffect } from 'react';

const Index = () => {
    const { isAuthenticated } = useAuth();
    const [typedText, setTypedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const targetText = 'sozinha';

    useEffect(() => {
        let currentIndex = 0;
        let isDeleting = false;
        
        const typeEffect = () => {
            if (!isDeleting && currentIndex <= targetText.length) {
                setTypedText(targetText.slice(0, currentIndex));
                currentIndex++;
            } else if (isDeleting && currentIndex >= 0) {
                setTypedText(targetText.slice(0, currentIndex));
                currentIndex--;
            }

            if (currentIndex > targetText.length) {
                setTimeout(() => {
                    isDeleting = true;
                }, 2000);
            }

            if (currentIndex < 0) {
                isDeleting = false;
                currentIndex = 0;
            }
        };

        const interval = setInterval(typeEffect, isDeleting ? 100 : 150);
        
        return () => clearInterval(interval);
    }, [targetText]);

    const features = [
        {
            icon: Heart,
            title: 'Hub das Mães',
            description: 'Compartilhe suas experiências e encontre apoio em nossa comunidade acolhedora.',
            link: '/hub-maes',
            color: 'from-pink-500 to-rose-500',
            shadowColor: 'hover:shadow-pink-500/25'
        },
        {
            icon: Users,
            title: 'Área de Grupos',
            description: 'Conecte-se com mães que vivenciam desafios similares em grupos de apoio.',
            link: '/grupos',
            color: 'from-blue-500 to-indigo-500',
            shadowColor: 'hover:shadow-blue-500/25'
        },
        {
            icon: Sparkles,
            title: 'Espaço de Cuidado',
            description: 'Recursos e dicas para cuidar de si mesma enquanto cuida do seu filho.',
            link: '/espaco-cuidado',
            color: 'from-purple-500 to-violet-500',
            shadowColor: 'hover:shadow-purple-500/25'
        },
        {
            icon: Shield,
            title: 'Direitos e Benefícios',
            description: 'Informações sobre seus direitos e benefícios disponíveis.',
            link: '/direitos-beneficios',
            color: 'from-emerald-500 to-green-500',
            shadowColor: 'hover:shadow-emerald-500/25'
        }
    ];

    const values = [
        'Acolhimento sem julgamentos',
        'Informações confiáveis e verificadas',
        'Comunidade segura e empática',
        'Recursos práticos para o dia a dia',
        'Fortalecimento da rede de apoio',
        'Cuidado com a saúde mental materna'
    ];

    return (
        <div className="min-h-screen">
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 sm:py-32">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
                
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mb-8 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 animate-fade-in">
                            <Heart className="mr-2 h-4 w-4" />
                            Bem-vinda ao Afeto Atípico
                        </div>
                        
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                            Você não está{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent relative">
                                {typedText}
                                <span 
                                    className="inline-block w-0.5 h-12 sm:h-16 lg:h-20 bg-blue-600 ml-1 -mb-1"
                                    style={{
                                        animation: 'blink 1s infinite'
                                    }}
                                ></span>
                            </span>
                        </h1>
                        
                        <style>{`
                            @keyframes blink {
                                0%, 50% { opacity: 1; }
                                51%, 100% { opacity: 0; }
                            }
                        `}</style>
                        
                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl">
                            Um espaço seguro e acolhedor para mães de crianças com autismo. 
                            Aqui você encontra apoio, informação e uma comunidade que entende sua jornada.
                        </p>
                        
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            {!isAuthenticated ? 
                                <Link to="/cadastro">
                                    <Button 
                                        size="lg" 
                                        className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-lg px-8 py-4 h-auto transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 transform-gpu border-0 ring-2 ring-transparent hover:ring-blue-400/50 hover:ring-offset-2 hover:ring-offset-blue-50"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                                        <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                                        <span className="relative flex items-center font-semibold">
                                            Fazer Parte da Comunidade
                                            <ArrowRight className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                                        </span>
                                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-active:opacity-100 transition-opacity duration-150"></div>
                                    </Button>
                                </Link> 
                            : ''}
                            <Link to="/hub-maes">
                                <Button 
                                    size="lg" 
                                    variant="outline" 
                                    className="group relative overflow-hidden text-lg px-8 py-4 h-auto border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-200/40 transform-gpu bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-100/50 to-blue-50/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                                    <span className="relative font-medium">
                                        Explorar o Hub das Mães
                                    </span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Descubra todos os recursos da plataforma
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Criamos um ambiente completo para que você se sinta apoiada em cada momento da sua jornada.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card 
                                    key={index} 
                                    className={`group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-gray-50/30 to-white hover:scale-105 ${feature.shadowColor} transform-gpu hover:border-gray-100 hover:bg-gradient-to-br hover:from-white hover:via-blue-50/20 hover:to-white animate-fade-in`}
                                    style={{animationDelay: `${index * 100}ms`}}
                                >
                                    <CardContent className="p-6">
                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors duration-300">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4 leading-relaxed">
                                            {feature.description}
                                        </p>
                                        <Link to={feature.link}>
                                            <Button 
                                                variant="ghost" 
                                                className="group/btn relative overflow-hidden text-blue-600 hover:text-blue-700 p-0 h-auto font-medium transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            >
                                                <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md opacity-0 group-hover/btn:opacity-100 transition-all duration-300 scale-75 group-hover/btn:scale-100"></span>
                                                <span className="relative flex items-center px-3 py-2 font-semibold">
                                                    Explorar
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:scale-110" />
                                                </span>
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-8">
                            Nossa Missão
                        </h2>
                        
                        <div className="space-y-6 mb-12">
                            <p className="text-lg text-gray-600 leading-relaxed">
                                O Afeto Atípico nasceu da compreensão de que as mães de crianças com autismo frequentemente 
                                se sentem isoladas e incompreendidas, enfrentando uma jornada singular repleta de desafios únicos.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Criamos um espaço seguro, sem julgamentos, onde você pode se comunicar livremente 
                                e encontrar o apoio necessário para fortalecer sua autoestima e bem-estar emocional.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Acreditamos no poder dos grupos de apoio e no compartilhamento de experiências 
                                para transformar desafios em conquistas e criar uma rede de suporte verdadeiramente efetiva.
                            </p>
                        </div>
                        
                        <h3 className="text-2xl font-semibold text-gray-900 mb-8">
                            O que oferecemos para você
                        </h3>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            {values.map((value, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-blue-100 hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 hover:scale-105 transform-gpu animate-fade-in"
                                    style={{animationDelay: `${index * 50}ms`}}
                                >
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 font-medium text-left">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {!isAuthenticated
                ? (
                    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
                        
                        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
                                Pronta para fazer parte desta comunidade?
                            </h2>
                            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
                                Junte-se a centenas de mães que já encontraram apoio, amizade e força 
                                em nossa plataforma. Sua jornada não precisa ser solitária.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/cadastro">
                                    <Button 
                                        size="lg" 
                                        className="group relative overflow-hidden bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/30 transform-gpu font-semibold border-0"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-100/50 to-blue-50/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                                        <span className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                                        <span className="relative flex items-center">
                                            Cadastrar-se Gratuitamente
                                            <ArrowRight className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                                        </span>
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button 
                                        size="lg" 
                                        variant="outline" 
                                        className="group relative overflow-hidden text-lg px-8 py-4 h-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-white/20 transform-gpu bg-transparent backdrop-blur-sm font-medium"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                                        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                        <span className="relative">Já tenho conta</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>
                )
                : ''}
        </div>
    );
};

export default Index;