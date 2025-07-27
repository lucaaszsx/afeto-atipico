import { Heart, Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-900 flex items-center justify-center z-50 overflow-hidden">
      <div className="text-center animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
              <Heart className="w-10 h-10 text-white animate-bounce" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl opacity-20 animate-ping"></div>
          </div>
        </div>
        
        {/* Text */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Afeto Atípico</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Carregando sua experiência...</p>
        
        {/* Loader */}
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Aguarde um momento</span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-6 w-48 mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;