import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';

import { validateRegistrationForm } from '@/utils/validation';
import { NetworkError, ApiError, ApiErrorCodes } from '@/lib/rest';
import { useApp } from '../contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface FormErrors {
    username?: string;
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

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
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    
    const { authService } = useApp();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        const validationResult = validateRegistrationForm(formData);
        
        if (!validationResult.isValid) {
            validationResult.errors.forEach(error => {
                switch (error.field) {
                    case 'username':
                        errors.username = error.message;
                        break;
                    case 'displayName':
                        errors.displayName = error.message;
                        break;
                    case 'email':
                        errors.email = error.message;
                        break;
                    case 'password':
                        errors.password = error.message;
                        break;
                    case 'confirmPassword':
                        errors.confirmPassword = error.message;
                        break;
                }
            });
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegistrationError = (error: NetworkError | ApiError): void => {
        if (error.isRequestError) {
            return toast({
                title: 'Ocorreu um erro',
                description: 'Não foi possível se conectar com o servidor devido a um erro durante a comunicação.',
                variant: 'destructive'
            });
        }
        
        switch (error.apiCode) {
            case ApiErrorCodes.EMAIL_ALREADY_EXISTS:
                toast({
                    title: 'E-mail já cadastrado',
                    description: 'Este e-mail já está sendo usado por outra conta. Tente fazer login ou use outro e-mail.',
                    variant: 'destructive'
                });
                break;
            
            case ApiErrorCodes.USERNAME_ALREADY_EXISTS:
                toast({
                    title: 'Nome de usuário já existe',
                    description: 'Este nome de usuário já está sendo usado. Escolha outro nome de usuário.',
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
                    description: 'Ocorreu um erro interno no servidor ao tentar criar a conta. Se o problema persistir, entre em contato com o suporte.',
                    variant: 'destructive'
                });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        const { data, error, success } = await authService.register({
            username: formData.username,
            displayName: formData.displayName,
            email: formData.email,
            password: formData.password
        });
        
        if (success) {
            toast({
                title: "Cadastro realizado com sucesso!",
                description: "Para acessar todos os recursos disponíveis, você pode verificar o seu e-mail indo nas configurações de perfil."
            });
            navigate('/');
        } else {
            handleRegistrationError(error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="space-y-1 text-center mb-8">
                    <Logo size="xl" showText={false} />
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
                                    autoComplete="username"
                                    required
                                    className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 ${formErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {formErrors.username && (
                                    <p className="text-sm text-red-600 mt-1">{formErrors.username}</p>
                                )}
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
                                    autoComplete="name"
                                    required
                                    className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 ${formErrors.displayName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {formErrors.displayName && (
                                    <p className="text-sm text-red-600 mt-1">{formErrors.displayName}</p>
                                )}
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
                                    autoComplete="email"
                                    required
                                    className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        required
                                        className={`h-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 ${formErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                                        autoComplete="new-password"
                                        required
                                        className={`h-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 ${formErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {formErrors.confirmPassword && (
                                    <p className="text-sm text-red-600 mt-1">{formErrors.confirmPassword}</p>
                                )}
                            </div>

                            {formErrors.general && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{formErrors.general}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={authService.isLoading}
                                className="group w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu border-0"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                                {authService.isLoading ? (
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