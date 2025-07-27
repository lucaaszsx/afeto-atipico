import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { APP_CONFIG } from '@/constants/validation';

const VerificacaoCodigo = () => {
  const [code, setCode] = useState(Array(APP_CONFIG.VERIFICATION_CODE_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(300); 
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { 
    verifyEmail, 
    resendEmailVerification, 
    user, 
    isLoading, 
    pendingVerification 
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/cadastro');
      return;
    }

    if (user.isVerified && !pendingVerification) {
      navigate('/login');
      return;
    }

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
  }, [user, navigate, pendingVerification]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    
    if (value && !/^\d$/.test(value)) return;
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    
    if (value && index < APP_CONFIG.VERIFICATION_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, APP_CONFIG.VERIFICATION_CODE_LENGTH);
    
    if (digits.length > 0) {
      const newCode = Array(APP_CONFIG.VERIFICATION_CODE_LENGTH).fill('');
      for (let i = 0; i < digits.length && i < APP_CONFIG.VERIFICATION_CODE_LENGTH; i++) {
        newCode[i] = digits[i];
      }
      setCode(newCode);
      
      
      const nextEmptyIndex = newCode.findIndex(digit => digit === '');
      const focusIndex = nextEmptyIndex === -1 ? APP_CONFIG.VERIFICATION_CODE_LENGTH - 1 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== APP_CONFIG.VERIFICATION_CODE_LENGTH) {
      toast({
        title: "Código incompleto",
        description: `Digite o código de ${APP_CONFIG.VERIFICATION_CODE_LENGTH} dígitos`,
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await verifyEmail(fullCode);
      
      if (success) {
        toast({
          title: "Verificação concluída!",
          description: "Sua conta foi verificada com sucesso.",
        });
        navigate('/');
      } else {
        toast({
          title: "Código inválido",
          description: "O código digitado não está correto. Tente novamente.",
          variant: "destructive",
        });
        
        setCode(Array(APP_CONFIG.VERIFICATION_CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro na verificação",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      
      setCode(Array(APP_CONFIG.VERIFICATION_CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    try {
      const success = await resendEmailVerification();
      
      if (success) {
        setTimeLeft(300); 
        setCanResend(false);
        toast({
          title: "Código reenviado",
          description: "Um novo código foi enviado para seu email.",
        });
      } else {
        toast({
          title: "Erro ao reenviar",
          description: "Não foi possível reenviar o código. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
      toast({
        title: "Erro ao reenviar",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificação de Email</h1>
          <p className="text-gray-600">
            Enviamos um código de {APP_CONFIG.VERIFICATION_CODE_LENGTH} dígitos para <br />
            <span className="font-medium text-blue-600">{user?.email}</span>
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-gray-900">
              Digite o código de verificação
            </CardTitle>
            <CardDescription className="text-gray-600">
              {timeLeft > 0 ? `Código expira em ${formatTime(timeLeft)}` : 'Código expirado'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code Input */}
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
                    className="w-12 h-12 text-center text-lg font-bold border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    autoFocus={index === 0}
                    disabled={isLoading}
                  />
                ))}
              </div>

              <Button
                type="submit"
                disabled={
                  isLoading || 
                  code.join('').length !== APP_CONFIG.VERIFICATION_CODE_LENGTH ||
                  timeLeft === 0
                }
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Verificar Código'
                )}
              </Button>
            </form>

            {/* Actions */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <button
                  onClick={handleResendCode}
                  disabled={!canResend || isLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {canResend ? 'Reenviar código' : `Reenviar em ${formatTime(timeLeft)}`}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => navigate('/cadastro')}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-700 font-medium flex items-center justify-center mx-auto disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao cadastro
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status de carregamento global */}
        {isLoading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Processando...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificacaoCodigo;