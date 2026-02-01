import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// Se você não tiver os ícones, remova ou substitua por texto ou outros ícones
// import { Menu, X, ShoppingCart, User } from 'lucide-react';
// import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const hideCartButton = [
    '/',
    '/promocoes',
    '/combos',
    '/narguile',
    '/bebidas',
    '/login',
  ].includes(location.pathname);

  const scrollToContato = () => {
    const section = document.getElementById('contato');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContatoClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollToContato();
    } else {
      navigate('/');
      setTimeout(() => {
        scrollToContato();
      }, 400);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-[#141414] sticky top-0 z-50 shadow-md border-b border-[#2E2E2E]">
      <div className="element-container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img 
            src="/logo.png" 
            alt="Black's Adega" 
            className="h-12 md:h-16 brightness-110"
          />
        </Link>

        {/* Botão do menu mobile */}
        <button
          className="md:hidden text-[#CFCFCF] hover:text-[#D4AF37] hover:bg-[#1F1F1F] px-3 py-2 rounded-md transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? 'Fechar' : 'Menu'}
        </button>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/promocoes" className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium transition-colors">Promoções</Link>
          <Link to="/combos" className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium transition-colors">Combos</Link>
          <Link to="/narguile" className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium transition-colors">Narguilé</Link>
          <Link to="/bebidas" className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium transition-colors">Bebidas</Link>
          <button onClick={handleContatoClick} className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium bg-transparent border-none cursor-pointer transition-colors">Contato</button>
          <Link to="/login" className="bg-[#D4AF37] hover:bg-[#E6C76A] text-[#0B0B0B] px-4 py-2 rounded-md transition-colors font-medium flex items-center">
            Entrar
          </Link>
          {!hideCartButton && (
            <Link to="/carrinho" className="bg-[#1F1F1F] text-[#D4AF37] border border-[#2E2E2E] px-4 py-2 rounded-md hover:bg-[#2E2E2E] hover:border-[#D4AF37] transition-colors flex items-center">
              Carrinho
            </Link>
          )}
        </nav>
      </div>

      {/* Navegação Mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#141414] animate-fade-in border-t border-[#2E2E2E]">
          <div className="element-container py-4 flex flex-col space-y-4">
            <Link 
              to="/promocoes" 
              className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium p-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Promoções
            </Link>
            <Link 
              to="/combos" 
              className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium p-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Combos
            </Link>
            <Link 
              to="/narguile" 
              className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium p-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Narguilé
            </Link>
            <Link 
              to="/bebidas" 
              className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium p-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Bebidas
            </Link>
            <button onClick={handleContatoClick} className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium p-2 bg-transparent border-none cursor-pointer w-full text-left transition-colors">Contato</button>
            <div className="flex space-x-2 pt-2">
              <Link 
                to="/login" 
                className="bg-[#D4AF37] hover:bg-[#E6C76A] text-[#0B0B0B] px-4 py-2 rounded-md transition-colors font-medium flex-1 flex justify-center items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Entrar
              </Link>
              {!hideCartButton && (
                <Link 
                  to="/carrinho" 
                  className="bg-[#1F1F1F] text-[#D4AF37] border border-[#2E2E2E] px-4 py-2 rounded-md hover:bg-[#2E2E2E] hover:border-[#D4AF37] transition-colors flex-1 flex justify-center items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Carrinho
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 