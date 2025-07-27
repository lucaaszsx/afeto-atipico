import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6 animate-scale-in">
          <span className="text-4xl font-bold text-primary">404</span>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Página não encontrada
        </h1>
        
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Ops! A página que você está procurando não existe ou foi movida. 
          Vamos te ajudar a voltar para o caminho certo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-primary/20 text-primary hover:bg-primary/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Página anterior
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
