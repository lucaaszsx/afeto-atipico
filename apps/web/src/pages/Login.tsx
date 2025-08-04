import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';

import { ApiErrorCodes, NetworkError, ApiError } from '@/lib/rest';
import { validateLoginForm } from '@/utils/validation';
import { useApp } from '../contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    
    const { authService } = useApp();
    const { toast } = useToast();
    const navigate = useNavigate();
    
    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        const validationResult = validateLoginForm({ email, password });
        
        if (!validationResult.isValid) {
            validationResult.errors.forEach(error => {
                switch (error.field) {
                    case 'email':
                        errors.email = error.message;
                        break;
                    case 'password':
                        errors.password = error.message;
                        break;
                }
            });
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleLoginError = (error: NetworkError | ApiError): void => {
        if (error.isRequestError) {
            return toast({
                title: 'Ocorreu um erro',
                description: 'Não foi possível se conectar com o servidor devido a um erro durante a comunicação.',
                variant: 'destructive'
            });
        }
        
        switch (error.apiCode) {
            case ApiErrorCodes.AUTHENTICATION_FAILED:
                toast({
                    title: 'Erro de autenticação',
                    description: 'E-mail ou senha inválidos',
                    variant: 'destructive'
                });
                break;
            
            case ApiErrorCodes.VALIDATION_FAILED:
                toast({
                    title: 'Erro de validação',
                    description: 'Ocorreu um erro ao tentar validar os dados fornecidos.',
                    variant: 'destructive'
                });
                break;
            
            default:
                toast({
                    title: 'Erro interno no servidor',
                    description: 'Ocorreu um erro interno no servidor ao tentar fazer a autenticação. Se o problema persistir, entre em contato com.o suporte.',
                    variant: 'destructive'
                });
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        
        const { data, error, success } = await authService.login({ email, password });
        
        if (success) {
            toast({
                title: 'Login realizado com sucesso!',
                description: 'Bem-vinda de volta à nossa comunidade.'
            });
            navigate('/');
        } else {
            handleLoginError(error);
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="space-y-1 text-center mb-8">
                    <Logo size="xl" showText={false} />
                    <p className="text-gray-600">Bem-vinda de volta à nossa comunidade</p>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Entrar na Plataforma
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Acesse sua conta para continuar conectada
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    autoComplete="email"
                                />
                                {formErrors.email && (
                                    <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 font-medium">
                                    Senha
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className={`h-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 ${formErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {formErrors.password && (
                                    <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                                )}
                            </div>

                            <div className="text-right">
                                <Link 
                                    to="/esqueci-senha" 
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
                                >
                                    Esqueceu sua senha?
                                </Link>
                            </div>

                            {formErrors.general && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{formErrors.general}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="group w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu border-0"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                                {isLoading ? (
                                    <div className="relative flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Entrando...
                                    </div>
                                ) : (
                                    <span className="relative flex items-center justify-center">
                                        <LogIn className="w-5 h-5 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                        Entrar
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Ainda não tem uma conta?{' '}
                                <Link 
                                    to="/cadastro" 
                                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
                                >
                                    Cadastre-se aqui
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;