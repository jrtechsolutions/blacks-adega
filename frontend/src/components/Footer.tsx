import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0B0B0B] text-[#FFFFFF] border-t border-[#2E2E2E]">
      <div className="element-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <img 
              src="/logo.png" 
              alt="Black's Adega" 
              className="h-16 mb-4 brightness-110" 
            />
            <p className="text-[#CFCFCF] text-center md:text-left">
              Sua adega de confiança com as melhores bebidas, combos e produtos para narguilé.
            </p>
          </div>
          
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-[#D4AF37] font-bold text-xl">Contato</h3>
            <div className="flex flex-col space-y-2">
              <p className="flex items-center justify-center md:justify-start text-[#CFCFCF]">
                <MapPin className="mr-2 h-5 w-5 text-[#D4AF37]" />
                Av. Antônio Carlos Benjamin dos Santos, 1663 - Jardim São Bernardo
              </p>
              <p className="flex items-center justify-center md:justify-start text-[#CFCFCF]">
                <Phone className="mr-2 h-5 w-5 text-[#D4AF37]" />
                (11) 96868-1952
              </p>
              <p className="flex items-center justify-center md:justify-start text-[#CFCFCF]">
                <Mail className="mr-2 h-5 w-5 text-[#D4AF37]" />
                contato@elementadega.com.br
              </p>
            </div>
          </div>
          
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-[#D4AF37] font-bold text-xl">Links Rápidos</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/promocoes" className="text-[#CFCFCF] hover:text-[#D4AF37] transition-colors">Promoções</Link>
              <Link to="/combos" className="text-[#CFCFCF] hover:text-[#D4AF37] transition-colors">Combos</Link>
              <Link to="/narguile" className="text-[#CFCFCF] hover:text-[#D4AF37] transition-colors">Narguilé</Link>
              <Link to="/bebidas" className="text-[#CFCFCF] hover:text-[#D4AF37] transition-colors">Bebidas</Link>
             </div>
          </div>
        </div>
        
        <div className="border-t border-[#2E2E2E] mt-8 pt-6 text-center">
          <p className="text-[#CFCFCF]">© {new Date().getFullYear()} Black's Adega. Todos os direitos reservados.</p>
          <p className="text-sm text-[#CFCFCF]/60 mt-2">
            Consumo de bebidas alcoólicas é proibido para menores de 18 anos. Beba com moderação.
          </p>
        </div>
      </div>
      <div className="text-center text-xs text-[#CFCFCF]/60 py-4 border-t border-[#2E2E2E]">
        Desenvolvido por <a href="https://www.jrtechnologysolutions.com.br" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#D4AF37]">Jr Technology Solutions</a>
      </div>
    </footer>
  );
};

export default Footer;
