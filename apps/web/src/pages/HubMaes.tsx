import { useState } from 'react';
import { Heart, MessageCircle, Clock, Plus, LogIn, ChevronDown, Filter, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '../contexts/AppContext';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Post {
    id: string;
    authorName: string;
    authorUsername: string;
    content: string;
    timestamp: string;
}

const HubMaes = () => {
    const { authService } = useApp();
    const { toast } = useToast();
    const [newPost, setNewPost] = useState('');
    const [visiblePosts, setVisiblePosts] = useState(4);
    const [sortBy, setSortBy] = useState('recent');
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
    
    const [posts, setPosts] = useState<Post[]>([
        {
            id: '1',
            authorName: 'Ana Paula Silva',
            authorUsername: 'ana_paula',
            content: 'Hoje meu filho surpreendeu a todos na escola! Depois de meses trabalhando com ele em casa, finalmente conseguiu se comunicar com os colegas durante o recreio. Pequenas vitórias que fazem toda a diferença no nosso coração de mãe. É incrível como cada progresso, por menor que seja, nos enche de esperança e alegria. 💙',
            timestamp: '2 horas atrás'
        },
        {
            id: '2',
            authorName: 'Maria Santos',
            authorUsername: 'maria_santos',
            content: 'Gostaria de compartilhar uma dica que tem funcionado muito bem aqui em casa: criamos uma rotina visual com pictogramas para as atividades do dia. Ele se sente muito mais seguro sabendo o que vem a seguir. A ansiedade diminuiu significativamente e agora ele até mesmo antecipa as próximas atividades com entusiasmo. Quem mais usa estratégias visuais? Adoraria trocar experiências!',
            timestamp: '5 horas atrás'
        },
        {
            id: '3',
            authorName: 'Carolina Lima',
            authorUsername: 'carolina_lima',
            content: 'Dias difíceis existem, e hoje foi um deles. Mas lembrei que não estou sozinha nessa jornada. Obrigada por existirem e por me mostrarem que juntas somos mais fortes. Amanhã será um novo dia! 🌅',
            timestamp: '1 dia atrás'
        },
        {
            id: '4',
            authorName: 'Fernanda Costa',
            authorUsername: 'fernanda_costa',
            content: 'Quero dividir com vocês uma conquista especial: ontem minha filha falou "eu te amo" pela primeira vez de forma espontânea. Foram 4 anos esperando por esse momento. A terapia, o carinho e a paciência valeram cada segundo. É uma sensação indescritível ouvir essas palavras depois de tanto tempo investindo em comunicação alternativa.',
            timestamp: '2 dias atrás'
        },
        {
            id: '5',
            authorName: 'Juliana Rodrigues',
            authorUsername: 'juliana_rodrigues',
            content: 'Alguém mais tem dificuldades com a hora do banho? Descobri que usar um timer visual e deixar ela escolher a música ajudou muito! Transformamos um momento de stress em algo divertido. Agora ela mesma pede para tomar banho quando vê o timer.',
            timestamp: '3 dias atrás'
        },
        {
            id: '6',
            authorName: 'Patricia Oliveira',
            authorUsername: 'patricia_oliveira',
            content: 'Hoje foi um daqueles dias que testam nossa paciência, mas também nos lembram do quanto nossos filhos são especiais. Cada criança tem seu tempo, e isso é perfeitamente normal. Precisamos nos lembrar disso nos momentos mais difíceis. 💕',
            timestamp: '4 dias atrás'
        },
        {
            id: '7',
            authorName: 'Isabela Martins',
            authorUsername: 'isabela_martins',
            content: 'Compartilho aqui uma reflexão: às vezes nos cobramos tanto para sermos mães perfeitas que esquecemos que nossos filhos só precisam que sejamos nós mesmas, com todo nosso amor e dedicação. Não existe manual, cada jornada é única.',
            timestamp: '5 dias atrás'
        },
        {
            id: '8',
            authorName: 'Camila Ferreira',
            authorUsername: 'camila_ferreira',
            content: 'Hoje quero agradecer a esta comunidade incrível. Quando me senti perdida e sem esperança, vocês me mostraram que não estava sozinha. Seus relatos, dicas e palavras de carinho fizeram toda a diferença na minha jornada como mãe.',
            timestamp: '6 dias atrás'
        }
    ]);
    
    const user = authService.getCurrentUser();

    const handleSubmitPost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        const post: Post = {
            id: Date.now().toString(),
            authorName: user?.displayName || 'Usuária',
            authorUsername: user?.username || 'usuario',
            content: newPost,
            timestamp: 'agora'
        };

        setPosts([post, ...posts]);
        setNewPost('');
        
        toast({
            title: 'Post compartilhado!',
            description: 'Sua experiência foi compartilhada com a comunidade.',
        });
    };

    const loadMorePosts = () => {
        setVisiblePosts(prev => Math.min(prev + 4, posts.length));
    };

    const togglePostExpansion = (postId: string) => {
        setExpandedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    const sortedPosts = [...posts].sort((a, b) => {
        if (sortBy === 'recent') return 0;
        return a.authorName.localeCompare(b.authorName);
    });

    const displayedPosts = sortedPosts.slice(0, visiblePosts);
    const hasMorePosts = visiblePosts < posts.length;

    const getAvatarGradient = (name: string) => {
        const gradients = [
            'from-pink-400 to-rose-500',
            'from-purple-400 to-indigo-500',
            'from-blue-400 to-cyan-500',
            'from-emerald-400 to-teal-500',
            'from-orange-400 to-red-500',
            'from-violet-400 to-purple-500'
        ];
        const index = name.charCodeAt(0) % gradients.length;
        return gradients[index];
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50'>
            {/* Enhanced Header */}
            <div className='bg-white/95 backdrop-blur-md border-b border-pink-100/50 sticky top-0 z-50 shadow-sm'>
                <div className='max-w-5xl mx-auto px-4 py-6'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-4'>
                            <div className='relative'>
                                <div className='w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg'>
                                    <Heart className='w-6 h-6 text-white' />
                                </div>
                                <div className='absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center'>
                                    <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                                </div>
                            </div>
                            <div className='min-w-0'>
                                <h1 className='text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent'>
                                    Hub das Mães
                                </h1>
                                <p className='text-sm text-gray-600 truncate'>
                                    Comunidade de apoio e experiências
                                </p>
                            </div>
                        </div>
                        
                        <div className='hidden md:flex items-center space-x-4 text-sm text-gray-600'>
                            <div className='flex items-center space-x-2'>
                                <Users className='w-4 h-4 text-purple-500' />
                                <span>{posts.length} experiências</span>
                            </div>
                            <div className='w-1 h-1 bg-gray-300 rounded-full'></div>
                            <div className='flex items-center space-x-2'>
                                <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                                <span>Ativa agora</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-5xl mx-auto px-4 py-8'>
                {/* Enhanced Post Composer */}
                {authService.isAuthenticated ? (
                    <Card className='mb-10 border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden'>
                        <div className='bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 p-1'>
                            <div className='bg-white rounded-lg'>
                                <CardContent className='p-6'>
                                    <div className='flex items-start space-x-4'>
                                        <div className={`w-14 h-14 bg-gradient-to-br ${getAvatarGradient(user?.displayName || 'U')} rounded-full flex items-center justify-center shadow-lg flex-shrink-0`}>
                                            <span className='text-white font-semibold text-lg'>
                                                {user?.displayName?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className='mb-3'>
                                                <h3 className='font-semibold text-gray-800'>
                                                    Compartilhe sua experiência
                                                </h3>
                                                <p className='text-sm text-gray-500'>
                                                    Sua história pode inspirar outras mães
                                                </p>
                                            </div>
                                            <Textarea
                                                value={newPost}
                                                onChange={(e) => setNewPost(e.target.value)}
                                                placeholder='O que você gostaria de compartilhar hoje? Conte sobre suas descobertas, desafios ou conquistas...'
                                                className='min-h-[120px] border-gray-200 focus:border-pink-400 focus:ring-pink-400 resize-none bg-gray-50/50 rounded-xl transition-all duration-200'
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && e.ctrlKey) {
                                                        e.preventDefault();
                                                        handleSubmitPost(e);
                                                    }
                                                }}
                                            />
                                            <div className='flex justify-between items-center mt-4'>
                                                <div className='flex items-center space-x-4'>
                                                    <span className='text-sm text-gray-500'>
                                                        {newPost.length > 0 && `${newPost.length}/500 caracteres`}
                                                    </span>
                                                    {newPost.length > 0 && (
                                                        <span className='text-xs text-gray-400'>
                                                            Ctrl + Enter para enviar
                                                        </span>
                                                    )}
                                                </div>
                                                <Button 
                                                    onClick={handleSubmitPost}
                                                    disabled={!newPost.trim() || newPost.length > 500}
                                                    className='bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-lg hover:shadow-xl px-6'
                                                >
                                                    <Sparkles className='w-4 h-4 mr-2' />
                                                    Compartilhar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className='mb-10 border-0 shadow-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white overflow-hidden'>
                        <div className='absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10'></div>
                        <CardContent className='relative p-8 text-center'>
                            <div className='inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-sm mb-6 shadow-xl'>
                                <MessageCircle className='w-10 h-10 text-white' />
                            </div>
                            <h3 className='text-3xl font-bold mb-4'>
                                Conecte-se com nossa comunidade
                            </h3>
                            <p className='text-pink-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed'>
                                Junte-se a centenas de mães que compartilham experiências, 
                                dicas e apoio mútuo em nossa jornada especial.
                            </p>
                            
                            <div className='flex flex-col sm:flex-row gap-4 justify-center mb-6'>
                                <Link to='/login'>
                                    <Button className='bg-white text-pink-600 hover:bg-pink-50 font-bold px-8 py-3 shadow-xl hover:shadow-2xl transition-all duration-200'>
                                        <LogIn className='w-5 h-5 mr-2' />
                                        Fazer Login
                                    </Button>
                                </Link>
                                <Link to='/cadastro'>
                                    <Button 
                                        variant='outline' 
                                        className='border-2 border-white text-white hover:bg-white hover:text-pink-600 bg-transparent backdrop-blur-sm font-bold px-8 py-3 shadow-xl hover:shadow-2xl transition-all duration-200'
                                    >
                                        Criar Conta Gratuita
                                    </Button>
                                </Link>
                            </div>
                            
                            <div className='flex items-center justify-center space-x-2 text-pink-200 text-sm'>
                                <Sparkles className='w-4 h-4' />
                                <span>Gratuito para sempre • Sem spam • Comunidade segura</span>
                                <Sparkles className='w-4 h-4' />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Enhanced Filter Section */}
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50'>
                    <div className='min-w-0'>
                        <h2 className='text-2xl font-bold text-gray-800 mb-1'>
                            Experiências da Comunidade
                        </h2>
                        <p className='text-gray-600'>
                            {posts.length} {posts.length === 1 ? 'história compartilhada' : 'histórias compartilhadas'}
                        </p>
                    </div>
                    
                    <div className='flex items-center space-x-3 flex-shrink-0'>
                        <Filter className='w-5 h-5 text-gray-500' />
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className='border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white/80 backdrop-blur-sm'
                        >
                            <option value='recent'>Mais recentes</option>
                            <option value='author'>Por autor</option>
                        </select>
                    </div>
                </div>

                {/* Enhanced Posts Grid */}
                <div className='space-y-6'>
                    {displayedPosts.map((post, index) => {
                        const isExpanded = expandedPosts.has(post.id);
                        const shouldTruncate = post.content.length > 280;
                        const displayContent = shouldTruncate && !isExpanded 
                            ? post.content.substring(0, 280) + '...' 
                            : post.content;

                        return (
                            <Card 
                                key={post.id} 
                                className='border-0 shadow-lg bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group'
                            >
                                <div className='bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-indigo-500/5 p-px'>
                                    <div className='bg-white rounded-lg'>
                                        <CardContent className='p-6'>
                                            <div className='flex items-start space-x-4'>
                                                <div className={`w-14 h-14 bg-gradient-to-br ${getAvatarGradient(post.authorName)} rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ring-4 ring-white group-hover:scale-105 transition-transform duration-300`}>
                                                    <span className='text-white font-semibold text-lg'>
                                                        {post.authorName.charAt(0)}
                                                    </span>
                                                </div>
                                                
                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3'>
                                                        <div className='min-w-0'>
                                                            <h3 className='font-bold text-gray-900 text-lg group-hover:text-pink-600 transition-colors duration-200 truncate'>
                                                                {post.authorName}
                                                            </h3>
                                                            <span className='text-sm text-gray-500 truncate block'>
                                                                @{post.authorUsername}
                                                            </span>
                                                        </div>
                                                        <div className='flex items-center text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-full flex-shrink-0'>
                                                            <Clock className='w-4 h-4 mr-1' />
                                                            <span className='whitespace-nowrap'>{post.timestamp}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className='prose prose-sm max-w-none'>
                                                        <p className='text-gray-700 leading-relaxed text-base mb-0 break-words word-wrap break-word overflow-wrap break-word hyphens-auto'>
                                                            {displayContent}
                                                        </p>
                                                    </div>
                                                    
                                                    {shouldTruncate && (
                                                        <button 
                                                            onClick={() => togglePostExpansion(post.id)}
                                                            className='inline-flex items-center mt-3 text-pink-600 font-medium text-sm hover:text-pink-700 transition-colors duration-200 group/btn'
                                                        >
                                                            {isExpanded ? 'Mostrar menos' : 'Ler mais'}
                                                            <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 group-hover/btn:translate-y-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Enhanced Load More Section */}
                {hasMorePosts && (
                    <div className='text-center mt-12'>
                        <div className='mb-6'>
                            <div className='w-16 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mx-auto mb-4'></div>
                            <p className='text-gray-600 mb-6'>
                                Mostrando <span className='font-semibold text-pink-600'>{displayedPosts.length}</span> de{' '}
                                <span className='font-semibold text-purple-600'>{posts.length}</span> experiências
                            </p>
                        </div>
                        
                        <Button 
                            onClick={loadMorePosts}
                            variant='outline'
                            className='group border-2 border-gradient-to-r from-pink-300 to-purple-300 text-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300'
                        >
                            <span className='font-semibold'>Carregar mais histórias</span>
                            <ChevronDown className='w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform duration-200' />
                        </Button>
                    </div>
                )}

                {/* Enhanced Empty State */}
                {posts.length === 0 && (
                    <div className='text-center py-20'>
                        <div className='w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
                            <Heart className='w-12 h-12 text-pink-400' />
                        </div>
                        <h3 className='text-2xl font-bold text-gray-700 mb-4'>
                            Seja a primeira a compartilhar
                        </h3>
                        <p className='text-gray-500 text-lg max-w-md mx-auto leading-relaxed'>
                            Sua experiência pode ser o ponto de partida para inspirar 
                            e ajudar outras mães em jornadas similares.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HubMaes;