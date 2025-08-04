import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/ui/logo';

const VerificacaoEmail = () => {
    const { userService, authService } = useApp();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const showErrorToast = (message: string) => {
        toast({
            title: "Erro",
            description: message,
            variant: "destructive",
        });
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    };

    const validateForm = (): boolean => {
        const trimmedEmail = email.trim();
        
        if (!trimmedEmail) {
            showErrorToast("Por favor, insira seu email.");
            return false;
        }

        if (!validateEmail(trimmedEmail)) {
            showErrorToast("Por favor, insira um email válido.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        const trimmedEmail = email.trim();
        
        if (authService.getCurrentUser().email !== trimmedEmail) {
            showErrorToast('O e-mail fornecido não coincide com o e-mail da sua conta.');
            setIsLoading(false);
            
            return;
        }
        
        const result = await authService.resendEmailVerification();
        
        if (result.success) {
            toast({
                title: 'Email encontrado!',
                description: 'Foi enviado um código de verificação para o seu email.'
            });
            
            await new Promise((resolve) => {
                setTimeout(() => {
                    navigate('/verificacao-codigo', { state: { email } });
                    resolve();
                }, 500);
            });
        } else showErrorToast('Não foi possível enviar o e-mail com o código de verificação devido a um erro interno do servidor.');
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo size="lg" />
                    <p className="text-gray-600 mt-4">Verificação de segurança</p>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                    <CardHeader className="text-center pb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 mx-auto shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Verificação de Email
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Confirme seu email para continuar a verificação
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300"
                                    autoComplete="email"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || !email.trim()}
                                className="group w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu border-0"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                                {isLoading ? (
                                    <div className="relative flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Verificando email...
                                    </div>
                                ) : (
                                    <span className="relative flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                        Verificar Email
                                    </span>
                                )}
                            </Button>

                            <div className="space-y-3">
                                <div className="text-center text-sm text-gray-600">
                                    Ainda não tem uma conta?
                                </div>
                                
                                <Button
                                    variant="outline"
                                    className="group w-full transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-gray-200 hover:border-emerald-300"
                                    asChild
                                >
                                    <Link to="/cadastro" className="flex items-center justify-center">
                                        <Mail className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                        Criar nova conta
                                    </Link>
                                </Button>

                                <Button 
                                    variant="ghost" 
                                    className="group w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-300" 
                                    asChild
                                >
                                    <Link to="/login" className="flex items-center justify-center">
                                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1 duration-300" />
                                        Voltar ao login
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default VerificacaoEmail;