import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/ui/logo';

const RedefinirSenha = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        token: '',
        password: '',
        confirmPassword: ''
    });
    const [visibility, setVisibility] = useState({
        password: false,
        confirmPassword: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState(null);
    const [passwordChanged, setPasswordChanged] = useState(false);
    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
            errors: {
                minLength,
                hasUpperCase,
                hasLowerCase,
                hasNumbers,
                hasSpecialChar
            }
        };
    };
    const validateForm = () => {
        const { password, confirmPassword } = formData;

        if (!password.trim() || !confirmPassword.trim()) {
            toast({
                title: "Campos obrigatórios",
                description: "Por favor, preencha todos os campos.",
                variant: "destructive",
            });
            return false;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            toast({
                title: "Senha inválida",
                description: "A senha não atende aos critérios de segurança.",
                variant: "destructive",
            });
            return false;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Senhas não coincidem",
                description: "As senhas digitadas são diferentes.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const toggleVisibility = (field) => {
        setVisibility(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };
    const validateToken = async (tokenParam) => {
        try {
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            
            const isValid = tokenParam && tokenParam.length >= 20;
            setIsValidToken(isValid);
            
            if (isValid) {
                setFormData(prev => ({ ...prev, token: tokenParam }));
            }
        } catch (error) {
            setIsValidToken(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            const success = Math.random() > 0.1;

            if (success) {
                setPasswordChanged(true);
                toast({
                    title: "Senha redefinida!",
                    description: "Sua senha foi alterada com sucesso.",
                });
            } else {
                throw new Error('Token expirado ou inválido');
            }
        } catch (error) {
            toast({
                title: "Erro na redefinição",
                description: "Token expirado ou inválido. Solicite uma nova redefinição.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            validateToken(tokenParam);
        } else {
            setIsValidToken(false);
        }
    }, [searchParams]);
    
    const renderLoadingState = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-8 pb-8">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="space-y-2">
                            <p className="text-gray-900 font-medium">Validando token...</p>
                            <p className="text-sm text-gray-600">Aguarde um momento</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
    const renderInvalidTokenState = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo size="lg" />
                    <p className="text-gray-600 mt-4">Problema com o link de redefinição</p>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm animate-fade-in">
                    <CardHeader className="text-center pb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4 mx-auto shadow-lg">
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Link Inválido
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Este link de redefinição não é válido
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <div className="text-center text-gray-600">
                            <p className="leading-relaxed">
                                O link de redefinição de senha que você utilizou é inválido, 
                                expirou ou já foi usado anteriormente.
                            </p>
                            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-700">
                                    <strong>Dica:</strong> Links de redefinição são válidos por apenas 24 horas.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button 
                                className="group w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-lg" 
                                asChild
                            >
                                <Link to="/esqueci-senha">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Solicitar Nova Redefinição
                                </Link>
                            </Button>

                            <Button 
                                variant="ghost" 
                                className="group w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300" 
                                asChild
                            >
                                <Link to="/login" className="flex items-center justify-center">
                                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1 duration-300" />
                                    Voltar ao Login
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
    const renderSuccessState = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo size="lg" />
                    <p className="text-gray-600 mt-4">Redefinição concluída com sucesso</p>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm animate-fade-in">
                    <CardHeader className="text-center pb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 mx-auto shadow-lg">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Senha Redefinida!
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Sua senha foi alterada com sucesso
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <div className="text-center text-gray-600">
                            <p className="leading-relaxed">
                                Sua senha foi redefinida com sucesso. Agora você pode fazer login 
                                com sua nova senha e acessar sua conta.
                            </p>
                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-700">
                                    ✓ Senha alterada e conta protegida
                                </p>
                            </div>
                        </div>

                        <Button 
                            className="group w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-lg" 
                            asChild
                        >
                            <Link to="/login" className="flex items-center justify-center">
                                Fazer Login
                                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 duration-300" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
    const renderPasswordStrength = () => {
        const { password } = formData;
        if (!password) return null;

        const validation = validatePassword(password);
        const { errors } = validation;

        return (
            <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-700 mb-3">Critérios de senha:</p>
                <div className="space-y-2">
                    {[
                        { key: 'minLength', text: 'Pelo menos 8 caracteres' },
                        { key: 'hasUpperCase', text: 'Uma letra maiúscula (A-Z)' },
                        { key: 'hasLowerCase', text: 'Uma letra minúscula (a-z)' },
                        { key: 'hasNumbers', text: 'Um número (0-9)' },
                        { key: 'hasSpecialChar', text: 'Um caractere especial (!@#$...)' }
                    ].map((item) => (
                        <div key={item.key} className={`flex items-center space-x-2 ${errors[item.key] ? 'text-green-600' : 'text-gray-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${errors[item.key] ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-xs">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    const renderFormState = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo size="lg" />
                    <p className="text-gray-600 mt-4">Defina sua nova senha</p>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="text-center pb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 mx-auto shadow-lg">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Redefinir Senha
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Digite sua nova senha nos campos abaixo
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 font-medium">
                                    Nova Senha
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={visibility.password ? 'text' : 'password'}
                                        placeholder="Digite sua nova senha"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        disabled={isLoading}
                                        className="h-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleVisibility('password')}
                                        disabled={isLoading}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {visibility.password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                                    Confirmar Nova Senha
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={visibility.confirmPassword ? 'text' : 'password'}
                                        placeholder="Confirme sua nova senha"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        disabled={isLoading}
                                        className="h-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleVisibility('confirmPassword')}
                                        disabled={isLoading}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {visibility.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {renderPasswordStrength()}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="group w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu border-0"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                                {isLoading ? (
                                    <div className="relative flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Redefinindo senha...
                                    </div>
                                ) : (
                                    <span className="relative flex items-center justify-center">
                                        <Lock className="w-5 h-5 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                        Redefinir Senha
                                    </span>
                                )}
                            </Button>

                            <div className="text-center">
                                <Button 
                                    variant="ghost" 
                                    className="group text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300" 
                                    asChild
                                >
                                    <Link to="/login" className="flex items-center">
                                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1 duration-300" />
                                        Voltar ao Login
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
    
    if (isValidToken === null) return renderLoadingState();
    if (!isValidToken) return renderInvalidTokenState();
    if (passwordChanged) return renderSuccessState();
    return renderFormState();
};

export default RedefinirSenha;