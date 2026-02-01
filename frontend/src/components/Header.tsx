import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";

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

  // Função para scroll suave até a seção de contato
  const scrollToContato = () => {
    const section = document.getElementById('contato');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContatoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollToContato();
    } else {
      navigate('/');
      setTimeout(() => {
        scrollToContato();
      }, 400); // tempo para garantir que a home carregue
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

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-[#CFCFCF] hover:text-[#D4AF37] hover:bg-[#1F1F1F]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/promocoes" className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium transition-colors">Promoções</Link>
          <Link to="/combos" className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium transition-colors">Combos</Link>
          <Link to="/narguile" className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium transition-colors">Narguilé</Link>
          <Link to="/bebidas" className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium transition-colors">Bebidas</Link>
          <button onClick={handleContatoClick} className="text-[#CFCFCF] hover:text-[#D4AF37] font-medium bg-transparent border-none cursor-pointer transition-colors">Contato</button>
          <Link to="/login" className="bg-[#D4AF37] hover:bg-[#E6C76A] text-[#0B0B0B] px-4 py-2 rounded-md transition-colors font-medium flex items-center">
            <User className="mr-2 h-5 w-5" /> Entrar
          </Link>
          {!hideCartButton && (
            <Link to="/carrinho" className="bg-[#1F1F1F] text-[#D4AF37] border border-[#2E2E2E] px-4 py-2 rounded-md hover:bg-[#2E2E2E] hover:border-[#D4AF37] transition-colors flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" /> Carrinho
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile Navigation */}
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
                <User className="mr-2 h-5 w-5" /> Entrar
              </Link>
              {!hideCartButton && (
                <Link 
                  to="/carrinho" 
                  className="bg-[#1F1F1F] text-[#D4AF37] border border-[#2E2E2E] px-4 py-2 rounded-md hover:bg-[#2E2E2E] hover:border-[#D4AF37] transition-colors flex-1 flex justify-center items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" /> Carrinho
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
