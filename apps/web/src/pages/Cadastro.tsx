import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateRegistrationForm } from '@/utils/validation';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/ui/logo';

const Cadastro = () => {
    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validation = validateRegistrationForm(formData);
        
        if (!validation.isValid) {
            validation.errors.forEach(error => {
                toast({
                    title: "Erro de validação",
                    description: error.message,
                    variant: "destructive",
                });
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await register({
                username: formData.username,
                displayName: formData.displayName,
                email: formData.email,
                password: formData.password
            });
            
            if (result.success) {
                if (result.needsVerification) {
                    toast({
                        title: "Cadastro realizado!",
                        description: "Verifique seu email para continuar.",
                    });
                    navigate('/verificacao-codigo');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            toast({
                title: "Erro no cadastro",
                description: "Ocorreu um erro inesperado. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="space-y-1 text-center mb-8">
                    <Logo
                        size="xl"
                        showText={false}
                    />
                    <p className="text-gray-600">Junte-se à nossa comunidade acolhedora</p>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Criar Conta
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Preencha seus dados para fazer parte da comunidade
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-gray-700 font-medium">
                                    Nome de Usuário
                                </Label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="seu_usuario"
                                    required
                                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="displayName" className="text-gray-700 font-medium">
                                    Nome de Exibição
                                </Label>
                                <Input
                                    id="displayName"
                                    name="displayName"
                                    type="text"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    placeholder="Seu nome completo"
                                    required
                                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="seu@email.com"
                                    required
                                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 font-medium">
                                    Senha
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        required
                                        className="h-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                                    Confirmar Senha
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        required
                                        className="h-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="group w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu border-0"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                                {isLoading ? (
                                    <div className="relative flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Criando conta...
                                    </div>
                                ) : (
                                    <span className="relative flex items-center justify-center">
                                        <UserPlus className="w-5 h-5 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                        Criar Conta
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Já tem uma conta?{' '}
                                <Link 
                                    to="/login" 
                                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
                                >
                                    Entre aqui
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Cadastro;