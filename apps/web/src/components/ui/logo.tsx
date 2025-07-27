import { Link } from 'react-router-dom';
import LogoIcon from '@/assets/images/logos/Logo.svg';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    href?: string;
    className?: string;
    textClassName?: string;
    iconClassName?: string;
    colorScheme?: 'blue' | 'white';
}

const sizes = {
    sm: {
        container: 'w-8 h-8',
        icon: 'w-6 h-6',
        text: 'text-lg'
    },
    md: {
        container: 'w-10 h-10',
        icon: 'w-7 h-7',
        text: 'text-xl'
    },
    lg: {
        container: 'w-12 h-12',
        icon: 'w-9 h-9',
        text: 'text-2xl'
    },
    xl: {
        container: 'w-14 h-14',
        icon: 'w-11 h-11',
        text: 'text-3xl'
    }
};
const textColors = {
    blue: 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700',
    white: 'bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-gray-200'
};

export const Logo = ({ 
    size = 'md', 
    showText = true, 
    href = '/', 
    className = '',
    textClassName = '',
    iconClassName = '',
    colorScheme = 'blue'
}: LogoProps) => {
    const currentTextColor = textColors[colorScheme];
    const currentSize = sizes[size];

    const LogoContent = () => (
        <div className={`inline-flex items-center space-x-3 group ${className}`}>
            <div className={`${currentSize.container} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/30 transform-gpu relative overflow-hidden ${iconClassName}`}>
                <img
                    className={`${currentSize.icon} group-hover:scale-110 transition-transform duration-300 relative z-10`}
                    src={LogoIcon}
                    alt="Afeto Atípico Logo"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-0"></div>
            </div>
            {showText && (
                <span className={`${currentSize.text} font-bold ${currentTextColor} transition-all duration-300 ${textClassName}`}>
                    Afeto Atípico
                </span>
            )}
        </div>
    );

    if (href) {
        return (
            <Link to={href} className="inline-block">
                <LogoContent />
            </Link>
        );
    }

    return <LogoContent />;
};