import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/login', {
        email,
        password,
      });

      const { user, token } = response.data;
      
      login(user, token);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo à Element Adega!"
      });
      
      if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (user.role === 'MOTOBOY') {
        navigate('/motoboy');
      } else if (user.role === 'VENDEDOR') {
        navigate('/admin-estoque');
      } else {
        // Rotas do cliente estão desabilitadas
        toast({
          title: "Acesso não disponível",
          description: "O acesso do cliente está temporariamente desabilitado.",
          variant: "destructive",
        });
        // Não redireciona, mantém na tela de login
      }
    } catch (error) {
      toast({
        title: "Erro de login",
        description: "Por favor, verifique seu email e senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-[#1F1F1F] border border-[#2E2E2E] rounded-lg p-8 w-full max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <img 
            src="/logo.png" 
            alt="Black's Adega" 
            className="h-24 w-24 object-contain brightness-110"
          />
        </div>
        
        <h2 className="text-[#FFFFFF] text-2xl font-bold text-center">Área de Acesso</h2>
        <p className="text-[#CFCFCF] text-center mt-2">
          Faça login para acessar sua conta
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-[#CFCFCF] font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-2 bg-[#141414] border border-[#2E2E2E] rounded-md text-[#CFCFCF] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-[#CFCFCF] font-medium mb-2">
            Senha
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-4 py-2 bg-[#141414] border border-[#2E2E2E] rounded-md text-[#CFCFCF] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div />
        
        <Button
          type="submit"
          className="w-full bg-[#D4AF37] hover:bg-[#E6C76A] text-[#0B0B0B] font-semibold"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
        
        <div className="text-center mt-6">
          <p className="text-[#CFCFCF]">
            Não tem uma conta?{" "}
            <a href="/cadastro" className="text-[#D4AF37] hover:text-[#E6C76A] font-medium">
              Cadastre-se
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
