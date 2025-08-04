import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.group('%c🛡️ Aviso de Segurança', 'color: #d32f2f; font-size: 18px; font-weight: bold;');
console.warn(
    '%cATENÇÃO: Este console é para desenvolvedores!\n' +
    'Não cole código de origem desconhecida aqui.',
    'color: #e65100; font-size: 14px; font-weight: bold;'
);
console.info(
    '%cSe alguém pediu para colar algo aqui, pode ser uma tentativa de phishing.',
    'color: #1976d2; font-size: 13px;'
);
console.groupEnd();

createRoot(document.getElementById("root")!).render(<App />);