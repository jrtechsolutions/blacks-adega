import React, { Dispatch, SetStateAction } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Archive, 
  Plus, 
  Menu,
  X,
  DollarSign,
  CreditCard,
  Receipt,
  Users,
  Store,
  Truck,
  Tag,
  TrendingUp,
  LogOut as LogOutIcon,
  FolderOpen,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: Dispatch<SetStateAction<boolean>>;
}

const AdminSidebar = ({ isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen }: AdminSidebarProps) => {
  const { user } = useAuth();
  
  const allMenuItems = [
    { 
      icon: <Home className="h-5 w-5" />, 
      label: 'Dashboard', 
      path: '/admin-dashboard',
      roles: ['ADMIN']
    },
    { 
      icon: <Archive className="h-5 w-5" />, 
      label: 'Estoque', 
      path: '/admin-estoque',
      roles: ['ADMIN', 'VENDEDOR']
    },
    { 
      icon: <Plus className="h-5 w-5" />, 
      label: 'Cadastrar Produtos', 
      path: '/admin-cadastro-produtos',
      roles: ['ADMIN', 'VENDEDOR']
    },
    { 
      icon: <FolderOpen className="h-5 w-5" />, 
      label: 'Categorias', 
      path: '/admin-categorias',
      roles: ['ADMIN', 'VENDEDOR']
    },
    { 
      icon: <Store className="h-5 w-5" />, 
      label: 'PDV', 
      path: '/admin-pdv',
      roles: ['ADMIN', 'VENDEDOR']
    },
    { 
      icon: <Tag className="h-5 w-5" />, 
      label: 'Promoções e Combos', 
      path: '/admin-promocoes-combos',
      roles: ['ADMIN', 'VENDEDOR']
    },
    { 
      icon: <Truck className="h-5 w-5" />, 
      label: 'Cadastro de Fornecedores', 
      path: '/admin-fornecedores',
      roles: ['ADMIN', 'VENDEDOR']
    },
    { 
      icon: <CreditCard className="h-5 w-5" />, 
      label: 'Meios de Pagamento', 
      path: '/admin-pagamentos',
      roles: ['ADMIN', 'VENDEDOR']
    },
    { 
      icon: <Clock className="h-5 w-5" />, 
      label: 'Sessões PDV', 
      path: '/admin-pdv-sessions',
      roles: ['ADMIN', 'VENDEDOR']
    },
    { 
      icon: <DollarSign className="h-5 w-5" />, 
      label: 'Controle de Vendas', 
      path: '/admin-vendas',
      roles: ['ADMIN']
    },
    { 
      icon: <TrendingUp className="h-5 w-5" />, 
      label: 'Financeiro', 
      path: '/admin-finance',
      roles: ['ADMIN']
    },
    { 
      icon: <Users className="h-5 w-5" />, 
      label: 'Usuários', 
      path: '/admin-usuarios',
      roles: ['ADMIN']
    }
  ];

  // Filtrar itens do menu baseado no role do usuário
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );
  
  return (
    <>
      {/* Mobile Menu Button is handled by AdminLayout now, so it's removed from here */}
      
      {/* Desktop Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-[#141414] shadow-lg transition-all duration-300 z-10
        ${isCollapsed ? 'w-20' : 'w-64'}
        hidden lg:block
      `}>
        <div className="flex flex-col h-full">
          <div className={`p-4 flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center border-b border-[#2E2E2E]`}>
            {!isCollapsed && (
              <div className="bg-white p-1 rounded flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Black's Adega Admin" 
                  className="h-8"
                />
              </div>
            )}
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-[#1F1F1F] text-[#CFCFCF]"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          
          <div className="px-3 py-4 flex-1 overflow-y-auto">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center p-3 rounded-lg transition-colors
                    ${isActive ? 'bg-[#D4AF37] text-[#0B0B0B]' : 'hover:bg-[#1F1F1F] text-[#CFCFCF]'}
                  `}
                >
                  <span className="flex items-center justify-center w-5 h-5">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-[#2E2E2E]">
            <NavLink
              to="/login"
              className="flex items-center p-3 rounded-lg text-[#CFCFCF] hover:bg-[#1F1F1F] transition-colors"
            >
              <span className="flex items-center justify-center w-5 h-5"><LogOutIcon className="h-5 w-5" /></span>
              {!isCollapsed && <span className="ml-3">Sair</span>}
            </NavLink>
          </div>
        </div>
      </aside>
      
      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)}></div>
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#141414] shadow-lg animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#2E2E2E]">
              <div className="bg-white p-1 rounded flex items-center justify-center mr-2 mt-2 mb-2 ml-2">
                <img 
                  src="/logo.png" 
                  alt="Black's Adega Admin" 
                  className="h-8"
                />
              </div>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-md hover:bg-[#1F1F1F] text-[#CFCFCF] ml-auto mt-2"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-3 py-4 flex-1 overflow-y-auto">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center p-3 rounded-lg transition-colors
                      ${isActive ? 'bg-[#D4AF37] text-[#0B0B0B]' : 'hover:bg-[#1F1F1F] text-[#CFCFCF]'}
                    `}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <span className="flex items-center justify-center w-5 h-5">{item.icon}</span>
                    <span className="ml-3">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
            
            <div className="p-4 border-t border-[#2E2E2E]">
              <NavLink
                to="/login"
                className="flex items-center p-3 rounded-lg text-[#CFCFCF] hover:bg-[#1F1F1F] transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="flex items-center justify-center w-5 h-5"><LogOutIcon className="h-5 w-5" /></span>
                <span className="ml-3">Sair</span>
              </NavLink>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
