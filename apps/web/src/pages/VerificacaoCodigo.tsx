import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiErrorCodes, NetworkError, ApiError } from '@/lib/rest';
import { Logo } from '@/components/ui/logo';
import { useAuth, useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { appConfig } from '@/constants/validation';

interface LocationState {
    email?: string;
}

const VerificacaoCodigo = () => {
    const [code, setCode] = useState<string[]>(Array(appConfig.verificationCodeLength).fill(''));
    const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
    const [canResend, setCanResend] = useState<boolean>(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    
    const { authService, isLoading } = useAuth();
    const { userService } = useApp();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    
    const state = location.state as LocationState;
    const user = authService.getCurrentUser();
    const userEmail = state?.email || user?.email;

    // Timer and authentication check effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [authService, navigate, userEmail]);

    const showErrorToast = (message: string) => {
        toast({
            title: "Erro",
            description: message,
            variant: "destructive",
        });
    };

    const showSuccessToast = (message: string) => {
        toast({
            title: "Sucesso!",
            description: message,
        });
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const resetCodeInput = (): void => {
        setCode(Array(appConfig.verificationCodeLength).fill(''));
        inputRefs.current[0]?.focus();
    };

    const isValidDigit = (value: string): boolean => {
        return /^\d$/.test(value);
    };

    const isCodeComplete = (): boolean => {
        return code.every(digit => digit !== '') && code.length === appConfig.verificationCodeLength;
    };

    const handleInputChange = (index: number, value: string): void => {
        // Only allow single digits
        if (value && !isValidDigit(value)) return;
        if (value.length > 1) return;
        
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < appConfig.verificationCodeLength - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent): void => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent): void => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, appConfig.verificationCodeLength);
        
        if (digits.length > 0) {
            const newCode = Array(appConfig.verificationCodeLength).fill('');
            for (let i = 0; i < digits.length && i < appConfig.verificationCodeLength; i++) {
                newCode[i] = digits[i];
            }
            setCode(newCode);
            
            // Focus on next empty input or last input
            const nextEmptyIndex = newCode.findIndex(digit => digit === '');
            const focusIndex = nextEmptyIndex === -1 ? appConfig.verificationCodeLength - 1 : nextEmptyIndex;
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const validateForm = (): boolean => {
        if (!isCodeComplete()) {
            showErrorToast(`Digite o código completo de ${appConfig.verificationCodeLength} dígitos`);
            return false;
        }

        if (timeLeft === 0) {
            showErrorToast("O código expirou. Solicite um novo código.");
            return false;
        }

        return true;
    };

    const handleSubmitError = (error: NetworkError | ApiError) => {
        if (error.isNetworkError) return toast({
            title: 'Ocorreu um erro de rede',
            description: 'Não foi possível se conectar com o servidor devido a um erro de rede.',
            variant: 'destructive'
        });
        
        switch (error.apiCode) {
            case ApiErrorCodes.INVALID_CODE:
                showErrorToast('O código de verificação fornecido é inválido.');
                break;
            
            case ApiErrorCodes.CODE_EXPIRED:
                showErrorToast('O código de verificação fornecido já expirou.');
                break;
            
            case ApiErrorCodes.CODE_ALREADY_USED:
                showErrorToast('O código de verificação fornecido já foi utilizado.');
                break;
            
            default:
                toast('Ocorreu um erro interno no servidor ao tentar fazer a autenticação. Se o problema persistir, entre em contato com.o suporte.');
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!validateForm()) return;

        const fullCode = code.join('');
        const result = await authService.verifyEmail({ code: fullCode });
        
        await userService.getCurrentUser();
        
        if (result.success) {
            showSuccessToast("Sua conta foi verificada com sucesso!");
            navigate('/');
        } else {
            handleSubmitError(result.error);
            resetCodeInput();
        }
    };

    const handleResendCode = async (): Promise<void> => {
        if (!canResend || isLoading) return;

        const success = await authService.resendEmailVerification();
        
        if (success) {
            setTimeLeft(300); // Reset to 5 minutes
            setCanResend(false);
            resetCodeInput();
            showSuccessToast("Novo código enviado para seu email!");
        } else {
            showErrorToast("Não foi possível reenviar o código. Tente novamente.");
        }
    };

    const handleGoBack = (): void => {
        if (isLoading) return;
        navigate('/cadastro');
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
                            Código de {appConfig.verificationCodeLength} dígitos enviado para
                            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="font-medium text-blue-700">{userEmail}</span>
                            </div>
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className={`text-sm font-medium ${timeLeft > 60 ? 'text-gray-600' : 'text-red-600'}`}>
                                        {timeLeft > 0 ? `Expira em ${formatTime(timeLeft)}` : 'Código expirado'}
                                    </div>
                                </div>

                                <div 
                                    className="flex justify-center space-x-3"
                                    onPaste={handlePaste}
                                >
                                    {code.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={(el) => inputRefs.current[index] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-12 h-12 text-center text-lg font-bold border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300"
                                            autoFocus={index === 0}
                                            disabled={isLoading}
                                            autoComplete="off"
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={!isCodeComplete() || isLoading || timeLeft === 0}
                                className="group w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu border-0"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                                {(isLoading) ? (
                                    <div className="relative flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Verificando...
                                    </div>
                                ) : (
                                    <span className="relative flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                        Verificar Código
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 space-y-3">
                            <div className="text-center">
                                <Button
                                    variant="outline"
                                    onClick={handleResendCode}
                                    disabled={!canResend || isLoading}
                                    className="group transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-gray-200 hover:border-emerald-300"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2 transition-transform group-hover:rotate-180 duration-300" />
                                    {canResend ? 'Reenviar código' : `Reenviar em ${formatTime(timeLeft)}`}
                                </Button>
                            </div>

                            <div className="text-center">
                                <Button 
                                    variant="ghost" 
                                    onClick={handleGoBack}
                                    disabled={isLoading}
                                    className="group text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-300"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1 duration-300" />
                                    Voltar ao cadastro
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default VerificacaoCodigo;