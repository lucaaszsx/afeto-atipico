import { useState } from 'react';
import { Heart, MessageCircle, Clock, Plus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
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
    const { isAuthenticated, user } = useAuth();
    const { toast } = useToast();
    const [newPost, setNewPost] = useState('');
    const [posts, setPosts] = useState<Post[]>([
        {
            id: '1',
            authorName: 'Ana Paula',
            authorUsername: 'ana_paula',
            content: 'Hoje meu filho surpreendeu a todos na escola! Depois de meses trabalhando com ele em casa, finalmente conseguiu se comunicar com os colegas durante o recreio. Pequenas vitórias que fazem toda a diferença no nosso coração de mãe. 💙',
            timestamp: '2 horas atrás'
        },
        {
            id: '2',
            authorName: 'Maria Santos',
            authorUsername: 'maria_santos',
            content: 'Gostaria de compartilhar uma dica que tem funcionado muito bem aqui em casa: criamos uma rotina visual com pictogramas para as atividades do dia. Ele se sente muito mais seguro sabendo o que vem a seguir. Quem mais usa estratégias visuais?',
            timestamp: '5 horas atrás'
        },
        {
            id: '3',
            authorName: 'Carolina Lima',
            authorUsername: 'carolina_lima',
            content: 'Dias difíceis existem, e hoje foi um deles. Mas lembrei que não estou sozinha nessa jornada. Obrigada por existirem e por me mostrarem que juntas somos mais fortes. Amanhã será um novo dia! 🌅',
            timestamp: '1 dia atrás'
        }
    ]);

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
            title: "Post compartilhado!",
            description: "Sua experiência foi compartilhada com a comunidade.",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl mb-4 shadow-lg hover:scale-105 transition-transform duration-300">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Hub das Mães</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Um espaço seguro para compartilhar experiências, desabafos e conquistas. 
                        Aqui, cada história importa e fortalece nossa comunidade.
                    </p>
                </div>

                {isAuthenticated ? (
                    <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmitPost}>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                        <span className="text-white font-medium">
                                            {user?.displayName?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <Textarea
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                            placeholder="Compartilhe sua experiência, dúvida ou conquista com nossa comunidade..."
                                            className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none transition-all duration-300"
                                        />
                                        <div className="flex justify-end mt-4">
                                            <Button 
                                                type="submit" 
                                                disabled={!newPost.trim()}
                                                className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu"
                                            >
                                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></span>
                                                <span className="relative flex items-center">
                                                    <Plus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                                    Compartilhar
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="mb-8 max-w-2xl mx-auto">
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
                            
                            <CardContent className="relative p-6 text-center">
                                <div className="mb-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm mb-3">
                                        <MessageCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                        Faça parte da conversa
                                    </h3>
                                    <p className="text-blue-100 text-sm leading-relaxed">
                                        Entre na sua conta para compartilhar experiências e conectar-se com outras mães.
                                    </p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link to="/login">
                                        <Button 
                                            className="group relative overflow-hidden bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu font-semibold px-6"
                                        >
                                            <span className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-100/50 to-blue-50/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></span>
                                            <span className="relative flex items-center">
                                                <LogIn className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                                Fazer Login
                                            </span>
                                        </Button>
                                    </Link>
                                    <Link to="/cadastro">
                                        <Button 
                                            variant="outline" 
                                            className="group border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu bg-transparent backdrop-blur-sm font-semibold relative overflow-hidden px-6"
                                        >
                                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></span>
                                            <span className="relative">Criar Conta</span>
                                        </Button>
                                    </Link>
                                </div>
                                
                                <div className="mt-4 flex items-center justify-center space-x-2 text-blue-200 text-xs">
                                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></div>
                                    <span>Mais de 500 mães conectadas</span>
                                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="space-y-6">
                    {posts.map((post, index) => (
                        <Card 
                            key={post.id} 
                            className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform-gpu animate-fade-in"
                            style={{animationDelay: `${index * 100}ms`}}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md hover:scale-105 transition-transform duration-300">
                                        <span className="text-white font-medium">
                                            {post.authorName.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex flex-col">
                                                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                                                    {post.authorName}
                                                </h3>
                                                <span className="text-sm text-gray-500">@{post.authorUsername}</span>
                                            </div>
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {post.timestamp}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">
                                            {post.content}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-12 animate-fade-in">
                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-600 mb-2">
                            Ainda não há posts compartilhados
                        </h3>
                        <p className="text-gray-500">
                            Seja a primeira a compartilhar sua experiência com nossa comunidade!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HubMaes;