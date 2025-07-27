import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isFirstVisit, setFirstVisitCookie } from '@/utils/cookies';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (isFirstVisit()) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    setFirstVisitCookie();
    setShowConsent(false);
  };

  const handleDismiss = () => {
    setFirstVisitCookie();
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Cookies e Preferências
              </h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Utilizamos cookies para salvar suas preferências, como tema da aplicação, 
                para melhorar sua experiência. Ao continuar, você aceita o uso de cookies.
              </p>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleAccept}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs px-3 py-1"
                >
                  Aceitar
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;