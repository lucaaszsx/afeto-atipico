import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { useToast } from '@/hooks/use-toast';

const EsqueciSenha = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { toast } = useToast();

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

    const sendPasswordResetEmail = async (): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate success - In real app, this would be an API call
        // const response = await api.sendPasswordReset(email);
        // if (!response.ok) throw new Error('Failed to send reset email');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await sendPasswordResetEmail();
            setEmailSent(true);
            toast({
                title: "Email enviado com sucesso!",
                description: "Verifique sua caixa de entrada para redefinir sua senha.",
            });
        } catch (error) {
            showErrorToast("Erro ao enviar email de redefinição. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTryAnotherEmail = () => {
        setEmailSent(false);
        setEmail('');
    };

    const renderSuccessView = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo size="lg" />
                    <p className="text-gray-600 mt-4">Redefinição de senha solicitada</p>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                    <CardHeader className="text-center pb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 mx-auto shadow-lg">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Email Enviado!
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Instruções de redefinição foram enviadas
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <div className="text-center text-gray-600">
                            <p>Enviamos um link de redefinição de senha para:</p>
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="font-medium text-blue-700">{email}</p>
                            </div>
                            <p className="mt-4 text-sm leading-relaxed">
                                Clique no link recebido por email para redefinir sua senha. 
                                O link será válido por 24 horas.
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                Não encontrou o email? Verifique sua pasta de spam.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="group w-full transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-gray-200 hover:border-blue-300"
                                onClick={handleTryAnotherEmail}
                            >
                                <span className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                    Tentar outro email
                                </span>
                            </Button>

                            <Button 
                                variant="ghost" 
                                className="group w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300" 
                                asChild
                            >
                                <Link to="/login" className="flex items-center justify-center">
                                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1 duration-300" />
                                    Voltar ao login
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderFormView = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo size="lg" />
                    <p className="text-gray-600 mt-4">Recuperar acesso à sua conta</p>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="text-center pb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 mx-auto shadow-lg">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Esqueci a Senha
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Digite seu email para receber as instruções de redefinição
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
                                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                    autoComplete="email"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || !email.trim()}
                                className="group w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu border-0"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                                {isLoading ? (
                                    <div className="relative flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Enviando instruções...
                                    </div>
                                ) : (
                                    <span className="relative flex items-center justify-center">
                                        <Mail className="w-5 h-5 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                        Enviar Instruções
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

    return emailSent ? renderSuccessView() : renderFormView();
};

export default EsqueciSenha;