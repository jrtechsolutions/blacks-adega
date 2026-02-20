import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Search, 
  SlidersHorizontal, 
  AlertCircle, 
  Plus,
  ArrowUpDown,
  Archive,
  Calendar,
  FileDown,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from 'sonner';
import api from '@/lib/axios';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from '@/components/ui/command';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Product interface
interface Product {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  price: number;
  stock: number;
  stockStatus: 'low' | 'medium' | 'high' | 'out';
  supplier: string;
  updatedAt: string;
  costPrice?: number;
  description?: string;
  image?: string;
  active: boolean;
  isFractioned: boolean;
  totalVolume?: string | number;
  unitVolume?: number | null;
}

// Category interface
interface Category {
  id: string;
  name: string;
}

// Função utilitária para mapear o status de estoque para o frontend
function mapStockStatus(status: string): 'out' | 'low' | 'medium' | 'high' {
  switch (status) {
    case 'OUT_OF_STOCK':
      return 'out';
    case 'LOW_STOCK':
      return 'low';
    case 'IN_STOCK':
      return 'high';
    default:
      return 'medium';
  }
}

const AdminStock = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockUpdateAmount, setStockUpdateAmount] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product, direction: 'asc' | 'desc' } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: '',
    costPrice: '',
    stock: '',
    description: '',
    isFractioned: false,
    unitVolume: '',
    totalVolume: '',
    active: true,
    margin: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isStockEntryDialogOpen, setIsStockEntryDialogOpen] = useState(false);
  const [stockEntryForm, setStockEntryForm] = useState({
    productId: '',
    quantity: '',
    unitCost: '',
    notes: ''
  });
  const [loadingStockEntry, setLoadingStockEntry] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProductInfo, setSelectedProductInfo] = useState<{
    name: string;
    currentCost: number;
    currentStock: number;
    newCost?: number;
  } | null>(null);
  const [stockEntries, setStockEntries] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { toast } = useToast();

  useEffect(() => {
    api.get('/admin/products').then(res => {
      // Mapear o status de estoque para o formato esperado no frontend
      const mapped = res.data.map((p: any) => ({
        ...p,
        stockStatus: mapStockStatus(p.stockStatus)
      }));
      setProducts(mapped);
    });
    
    api.get('/admin/categories?active=true').then(res => {
      setCategories(res.data);
    });
    // Buscar movimentações de estoque (entradas)
    api.get('/admin/stock-entries').then(res => setStockEntries(res.data));
    // Buscar movimentações de estoque (entradas e saídas)
    api.get('/admin/stock-movements').then(res => setStockMovements(res.data));
  }, []);

  // Function to handle sorting
  const requestSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Apply sorting to products
  const sortedProducts = React.useMemo(() => {
    const sortableProducts = [...products];
    
    if (sortConfig !== null) {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableProducts;
  }, [products, sortConfig]);

  // Filter products based on search term, category and stock status
  const filteredProducts = sortedProducts.filter(product => {
    const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || '';
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || categoryName === categoryFilter;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && product.stockStatus === 'low') ||
                        (stockFilter === 'out' && product.stockStatus === 'out') ||
                        (stockFilter === 'available' && product.stockStatus !== 'out');
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Open stock update dialog
  const openUpdateDialog = (product: Product) => {
    setSelectedProduct(product);
    setStockUpdateAmount(0);
    setIsUpdateDialogOpen(true);
  };

  // Update stock handler
  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      await api.put(`/admin/products/${productId}/stock`, { stock: newStock });
      setProducts(products.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      toast({ title: 'Estoque atualizado com sucesso!' });
      setIsUpdateDialogOpen(false);
    } catch (error: any) {
      toast({ 
        title: 'Erro ao atualizar estoque.', 
        description: error.response?.data?.error || 'Tente novamente mais tarde.',
        variant: 'destructive' 
      });
    }
  };

  // Function to get stock status badge
  const getStockStatusBadge = (status: 'low' | 'medium' | 'high' | 'out') => {
    switch (status) {
      case 'high':
        return <Badge className="bg-green-500">Alto</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500">Médio</Badge>;
      case 'low':
        return <Badge className="bg-yellow-500">Baixo</Badge>;
      case 'out':
        return <Badge className="bg-red-500">Esgotado</Badge>;
      default:
        return null;
    }
  };

  // Função para abrir o modal de edição
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    const isFractioned = !!product.isFractioned;
    setEditForm({
      name: product.name,
      category: product.category?.id || '',
      price: product.price.toString(),
      costPrice: product.costPrice?.toString() || '',
      stock: product.stock.toString(),
      description: product.description || '',
      image: null,
      isFractioned,
      unitVolume: product.unitVolume != null ? String(product.unitVolume) : '',
      totalVolume: product.totalVolume != null ? String(product.totalVolume) : '',
      active: typeof product.active === 'boolean' ? product.active : true,
      margin: '',
    });
    setIsEditDialogOpen(true);
  };

  // Função para salvar as alterações
  const handleEditSave = async () => {
    try {
      await api.put(`/admin/products/${editingProduct?.id}`, {
        name: editForm.name,
        categoryId: editForm.category,
        price: parseFloat(editForm.price),
        costPrice: parseFloat(editForm.costPrice),
        stock: parseInt(editForm.stock),
        description: editForm.description,
        isFractioned: editForm.isFractioned,
        unitVolume: editForm.isFractioned ? Number(editForm.unitVolume) : null,
        totalVolume: editForm.isFractioned && editForm.stock && editForm.unitVolume
          ? Number(editForm.stock) * Number(editForm.unitVolume)
          : null,
        active: editForm.active,
      });
      // Atualizar a lista de produtos
      const updatedProducts = products.map(p => 
        p.id === editingProduct?.id 
          ? { 
              ...p, 
              name: editForm.name,
              category: { 
                id: editForm.category, 
                name: categories.find(c => c.id === editForm.category)?.name || '' 
              },
              price: parseFloat(editForm.price),
              stock: parseInt(editForm.stock),
            }
          : p
      );
      setProducts(updatedProducts);
      toast({ title: 'Produto atualizado com sucesso!' });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({ 
        title: 'Erro ao atualizar produto.', 
        description: error.response?.data?.error || 'Tente novamente mais tarde.',
        variant: 'destructive' 
      });
    }
  };

  // Função para atualizar status ativo do produto
  const handleToggleActive = async (productId: string, active: boolean) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const payload = {
        name: product.name,
        categoryId: product.category.id,
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        description: product.description,
        active,
      };

      await api.put(`/admin/products/${productId}`, payload);
      setProducts(products.map(p => p.id === productId ? { ...p, active } : p));
      toast({ title: `Produto ${active ? 'ativado' : 'inativado'} com sucesso!` });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar status.',
        description: error.response?.data?.error || 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    }
  };

  const handleStockEntrySelect = (name: string, value: string) => {
    setStockEntryForm({ ...stockEntryForm, [name]: value });
    
    // Buscar informações do produto selecionado
    if (name === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        setSelectedProductInfo({
          name: product.name,
          currentCost: product.costPrice || 0,
          currentStock: product.stock
        });
      }
    }
  };

  // Calcular novo custo médio quando quantidade ou custo unitário mudar
  const calculateNewCost = () => {
    if (!selectedProductInfo || !stockEntryForm.quantity || !stockEntryForm.unitCost) {
      return null;
    }

    const estoqueAtual = selectedProductInfo.currentStock;
    const custoAtual = selectedProductInfo.currentCost;
    const quantidadeNova = Number(stockEntryForm.quantity);
    const custoNovo = Number(stockEntryForm.unitCost);

    if (estoqueAtual === 0) {
      return custoNovo;
    }

    const valorTotalAtual = estoqueAtual * custoAtual;
    const valorTotalNovo = quantidadeNova * custoNovo;
    const estoqueTotal = estoqueAtual + quantidadeNova;
    
    return (valorTotalAtual + valorTotalNovo) / estoqueTotal;
  };

  const handleStockEntryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStockEntryForm({ ...stockEntryForm, [e.target.name]: e.target.value });
  };

  const handleStockEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStockEntry(true);
    const payload = {
      ...stockEntryForm,
      quantity: parseInt(stockEntryForm.quantity, 10),
      unitCost: parseFloat(stockEntryForm.unitCost),
    };
    const productId = payload.productId;
    const quantity = payload.quantity;
    const unitCost = payload.unitCost;
    console.log('[Estoque] Iniciando registro de entrada', { productId, quantity, unitCost, notes: payload.notes });
    sonnerToast.loading('Salvando...', { id: 'stock-entry-save' });
    const onSuccess = () => {
      sonnerToast.dismiss('stock-entry-save');
      console.log('[Estoque] Entrada registrada com sucesso', { productId });
      toast({ title: 'Entrada de estoque registrada com sucesso!' });
      setIsStockEntryDialogOpen(false);
      setStockEntryForm({ productId: '', quantity: '', unitCost: '', notes: '' });
      setProductSearchTerm('');
      setSelectedProductInfo(null);
      api.get('/admin/products').then(res => {
        const mapped = res.data.map((p: any) => ({
          ...p,
          stockStatus: mapStockStatus(p.stockStatus)
        }));
        setProducts(mapped);
      });
    };
    try {
      await api.post('/admin/stock-entries', payload);
      onSuccess();
    } catch (err: any) {
      const isNetworkError = !err.response && (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED');
      if (isNetworkError) {
        console.log('[Estoque] Falha de rede, tentando novamente em 2s...', { productId, code: err.code });
        await new Promise(r => setTimeout(r, 2000));
        try {
          await api.post('/admin/stock-entries', payload);
          onSuccess();
          return;
        } catch (retryErr: any) {
          console.log('[Estoque] Erro no retry', { productId, message: retryErr?.message });
          err = retryErr;
        }
      } else {
        console.log('[Estoque] Erro ao registrar entrada', { productId, status: err.response?.status, error: err.response?.data?.error });
      }
      sonnerToast.dismiss('stock-entry-save');
      toast({
        title: 'Erro ao registrar entrada de estoque.',
        description: err.response?.data?.error || (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' ? 'Falha na conexão. Tente novamente.' : 'Tente novamente.'),
        variant: 'destructive'
      });
    } finally {
      setLoadingStockEntry(false);
    }
  };

  // Filtrar produtos para busca no modal
  const filteredProductsForModal = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // Função para exportar XLSX
  const exportToXLSX = () => {
    console.log('🔍 Debug - Filtros aplicados:', {
      searchTerm,
      categoryFilter,
      stockFilter,
      totalProducts: products.length,
      filteredProducts: filteredProducts.length
    });
    
    const data = filteredProducts.map(product => ({
      Nome: product.name,
      Categoria: product.category?.name,
      Preço: product.price,
      'Preço de Custo': product.costPrice ?? '',
      Estoque: product.stock,
      Status: product.stockStatus,
      Volume: product.isFractioned ? product.totalVolume : '-',
      Ativo: product.active ? 'Sim' : 'Não',
      'Estoque Baixo': (product.stockStatus === 'low' || product.stockStatus === 'out') ? 'Sim' : 'Não',
    }));
    
    console.log('📊 Produtos que serão exportados:', data.length);
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estoque');
    XLSX.writeFile(workbook, 'relatorio_estoque.xlsx');
  };

  // Função para exportar PDF
  const exportToPDF = () => {
    console.log('🔍 Debug - Filtros aplicados:', {
      searchTerm,
      categoryFilter,
      stockFilter,
      totalProducts: products.length,
      filteredProducts: filteredProducts.length
    });
    
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Estoque', 14, 16);
    doc.setFontSize(10);
    const tableData = filteredProducts.map(product => [
      product.name,
      product.category?.name,
      product.price,
      product.costPrice ?? '',
      product.stock,
      product.stockStatus,
      product.isFractioned ? product.totalVolume : '-',
      product.active ? 'Sim' : 'Não',
      (product.stockStatus === 'low' || product.stockStatus === 'out') ? 'Sim' : 'Não',
    ]);
    
    console.log('📊 Produtos que serão exportados:', tableData.length);
    
    autoTable(doc, {
      head: [['Nome', 'Categoria', 'Preço', 'Preço de Custo', 'Estoque', 'Status', 'Volume', 'Ativo', 'Estoque Baixo']],
      body: tableData,
      startY: 22,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    doc.save('relatorio_estoque.pdf');
  };

  // Função para filtrar movimentações por data
  const filteredStockMovements = React.useMemo(() => {
    if (!startDate && !endDate) return stockMovements;
    return stockMovements.filter((entry: any) => {
      const entryDate = new Date(entry.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && entryDate < start) return false;
      if (end) {
        // Incluir o dia final inteiro
        const endOfDay = new Date(end);
        endOfDay.setHours(23,59,59,999);
        if (entryDate > endOfDay) return false;
      }
      return true;
    });
  }, [stockMovements, startDate, endDate]);

  // Função para exportar movimentação (XLSX ou PDF)
  const exportMovimentacao = (type: 'xlsx' | 'pdf') => {
    const data = filteredStockMovements.map(entry => ({
      Data: new Date(entry.createdAt).toLocaleString('pt-BR'),
      Produto: entry.product?.name,
      Tipo: entry.type === 'out' ? 'Saída' : 'Entrada',
      Quantidade: entry.quantity,
      'Custo Unitário': entry.unitCost,
      Total: entry.totalCost,
      Observação: entry.notes || '-',
      Origem: entry.origin || '-',
    }));
    if (type === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimentacao');
      XLSX.writeFile(workbook, 'movimentacao_estoque.xlsx');
    } else {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Movimentação de Estoque', 14, 16);
      doc.setFontSize(10);
      const tableData = filteredStockMovements.map(entry => [
        new Date(entry.createdAt).toLocaleString('pt-BR'),
        entry.product?.name,
        entry.type === 'out' ? 'Saída' : 'Entrada',
        entry.quantity,
        entry.unitCost,
        entry.totalCost,
        entry.notes || '-',
        entry.origin || '-',
      ]);
      autoTable(doc, {
        head: [['Data', 'Produto', 'Tipo', 'Quantidade', 'Custo Unitário', 'Total', 'Observação', 'Origem']],
        body: tableData,
        startY: 22,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
      });
      doc.save('movimentacao_estoque.pdf');
    }
  };

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="p-4 md:p-6 lg:p-8 w-full">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-[#FFFFFF] flex items-center justify-between">
              Estoque de Produtos
            </h1>
            <p className="text-[#CFCFCF]">Gerencie seus produtos, estoque e preços.</p>
          </div>

          {/* Linha de filtros de data e exportação */}
          <div className="my-4">
            <div className="flex flex-wrap items-center gap-2 bg-[#1F1F1F] border border-[#2E2E2E] p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium mr-1 text-[#CFCFCF]">Data Inicial</label>
                <input
                  type="date"
                  className="border border-[#2E2E2E] rounded px-2 py-1 text-sm focus:outline-none bg-[#1F1F1F] text-[#FFFFFF] focus:ring-2 focus:ring-[#D4AF37]"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  max={endDate || undefined}
                  placeholder="dd/mm/aaaa"
                  style={{ minWidth: 120 }}
                />
              </div>
              <div className="flex items-center gap-2 ml-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium mr-1 text-[#CFCFCF]">Data Final</label>
                <input
                  type="date"
                  className="border border-[#2E2E2E] rounded px-2 py-1 text-sm focus:outline-none bg-[#1F1F1F] text-[#FFFFFF] focus:ring-2 focus:ring-[#D4AF37]"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  placeholder="dd/mm/aaaa"
                  style={{ minWidth: 120 }}
                />
              </div>
              {(startDate || endDate) && (
                <Button variant="ghost" size="sm" onClick={() => { setStartDate(''); setEndDate(''); }}>
                  Limpar Filtro
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={exportToXLSX}
                  className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  <FileDown className="h-4 w-4" /> Exportar XLSX
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  <FileText className="h-4 w-4" /> Exportar PDF
                </button>
              </div>
            </div>
          </div>

          {/* Linha de botões de ação */}
          <div className="flex justify-end gap-2 mb-4">
            <Button onClick={() => navigate('/admin-cadastro-produtos')}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
            <Button variant="outline" onClick={() => setIsStockEntryDialogOpen(true)}>
              <Archive className="h-4 w-4 mr-2" />
              Entrada de Estoque
            </Button>
          </div>
          
          <div className="my-6 bg-[#1F1F1F] border border-[#2E2E2E] p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              <div className="lg:col-span-2">
                  <label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">Buscar</label>
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input 
                          id="search"
                          placeholder="Buscar por nome ou categoria..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full"
                      />
                  </div>
              </div>
              <div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger id="category" className="w-full">
                          <SelectValue placeholder="Filtrar por Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Todas as Categorias</SelectItem>
                          {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <div>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                      <SelectTrigger id="stock" className="w-full">
                          <SelectValue placeholder="Filtrar por Estoque" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Todos os Status</SelectItem>
                          <SelectItem value="available">Disponível</SelectItem>
                          <SelectItem value="low">Estoque Baixo</SelectItem>
                          <SelectItem value="out">Esgotado</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
            </div>
          </div>

          {/* Tabela para telas maiores */}
          <div className="hidden md:block bg-[#1F1F1F] border border-[#2E2E2E] rounded-lg shadow-sm overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" onClick={() => requestSort('name')}>
                          Nome <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => requestSort('price')}>
                          Preço <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => requestSort('stock')}>
                          Estoque <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Volume (ml)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category?.name}</TableCell>
                        <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.isFractioned ? product.totalVolume : '-'}</TableCell>
                        <TableCell>{getStockStatusBadge(product.stockStatus)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={product.active}
                            onCheckedChange={(active) => handleToggleActive(product.id, active)}
                          />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditDialog(product)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openUpdateDialog(product)}>Atualizar Estoque</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-500"
                                onClick={async () => {
                                  if (window.confirm('Tem certeza que deseja remover este produto?')) {
                                    try {
                                      await api.delete(`/admin/products/${product.id}`);
                                      setProducts(products.filter(p => p.id !== product.id));
                                      toast({ title: 'Produto removido com sucesso!' });
                                    } catch (error: any) {
                                      toast({ 
                                        title: 'Erro ao remover produto.', 
                                        description: error.response?.data?.error || 'Tente novamente mais tarde.',
                                        variant: 'destructive' 
                                      });
                                    }
                                  }
                                }}
                              >
                                Deletar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
          </div>

          {/* Cards para telas menores */}
          <div className="grid gap-4 md:hidden">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-[#1F1F1F] border border-[#2E2E2E]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div>
                          <CardTitle>{product.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                        </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(product)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openUpdateDialog(product)}>Atualizar Estoque</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-500"
                          onClick={async () => {
                            if (window.confirm('Tem certeza que deseja remover este produto?')) {
                              try {
                                await api.delete(`/admin/products/${product.id}`);
                                setProducts(products.filter(p => p.id !== product.id));
                                toast({ title: 'Produto removido com sucesso!' });
                              } catch (error: any) {
                                toast({ 
                                  title: 'Erro ao remover produto.', 
                                  description: error.response?.data?.error || 'Tente novamente mais tarde.',
                                  variant: 'destructive' 
                                });
                              }
                            }
                          }}
                        >
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Preço:</span>
                        <span>R$ {product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Estoque:</span>
                        <span>{product.stock}</span>
                      </div>
                      {product.isFractioned && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-600 dark:text-gray-400">Volume:</span>
                          <span>{product.totalVolume} ml</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Status:</span>
                        {getStockStatusBadge(product.stockStatus)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Ativo:</span>
                        <Switch
                          checked={product.active}
                          onCheckedChange={(active) => handleToggleActive(product.id, active)}
                        />
                      </div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stock Update Dialog */}
      
      {/* Stock Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Estoque</DialogTitle>
            <DialogDescription>
              Adicione ou remova unidades do estoque do produto {selectedProduct?.name}.
              Valores negativos irão reduzir o estoque.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-element-black" />
              <span className="font-medium">{selectedProduct?.name}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="text-sm">
                <p>Estoque atual:</p>
                <p className="font-medium text-lg">{selectedProduct?.stock} unidades</p>
              </div>
              
              <div>
                <label className="text-sm">Quantidade a adicionar/remover:</label>
                <Input 
                  type="number"
                  value={stockUpdateAmount.toString()}
                  onChange={(e) => setStockUpdateAmount(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm flex items-center">
                <span className="font-medium mr-2">Novo estoque total:</span> 
                <span className={`font-bold ${
                  (selectedProduct?.stock || 0) + stockUpdateAmount < 0 
                    ? 'text-red-500' 
                    : 'text-element-black'
                }`}>
                  {(selectedProduct?.stock || 0) + stockUpdateAmount} unidades
                </span>
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => handleStockUpdate(selectedProduct?.id || '', (selectedProduct?.stock || 0) + stockUpdateAmount)}
              disabled={(selectedProduct?.stock || 0) + stockUpdateAmount < 0}
              className="bg-element-black"
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#141414] border-[#2E2E2E]">
          <DialogHeader>
            <DialogTitle className="text-[#FFFFFF]">Editar Produto</DialogTitle>
            <DialogDescription className="text-[#CFCFCF]">
              Atualize as informações do produto {editingProduct?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#FFFFFF]">Nome do Produto</label>
                <Input
                  className="bg-[#1F1F1F] border-[#2E2E2E] text-[#FFFFFF]"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#FFFFFF]">Categoria</label>
                <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                  <SelectTrigger className="bg-[#1F1F1F] border-[#2E2E2E] text-[#FFFFFF]">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#FFFFFF]">Preço de Venda</label>
                <Input
                  className="bg-[#1F1F1F] border-[#2E2E2E] text-[#FFFFFF]"
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => {
                    setEditForm({ ...editForm, price: e.target.value });
                    // Atualiza margem automaticamente
                    const cost = parseFloat(editForm.costPrice || '0');
                    const price = parseFloat(e.target.value || '0');
                    if (!isNaN(cost) && !isNaN(price) && price > 0) {
                      const margin = ((price - cost) / price) * 100;
                      setEditForm((prev) => ({ ...prev, margin: margin.toFixed(2) }));
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#FFFFFF]">Preço de Custo</label>
                <Input
                  className="bg-[#1F1F1F] border-[#2E2E2E] text-[#FFFFFF]"
                  type="number"
                  step="0.01"
                  value={editForm.costPrice}
                  onChange={(e) => {
                    setEditForm({ ...editForm, costPrice: e.target.value });
                    // Atualiza preço de venda automaticamente se houver margem
                    const cost = parseFloat(e.target.value || '0');
                    const margin = parseFloat(editForm.margin || '0');
                    if (!isNaN(cost) && !isNaN(margin) && margin !== 0) {
                      const salePrice = cost / (1 - (margin / 100));
                      if (!isNaN(salePrice) && salePrice > 0) {
                        setEditForm((prev) => ({ ...prev, price: salePrice.toFixed(2) }));
                      }
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#FFFFFF]">Margem (%)</label>
                <Input
                  className="bg-[#1F1F1F] border-[#2E2E2E] text-[#FFFFFF]"
                  type="number"
                  step="0.01"
                  value={editForm.margin || ''}
                  onChange={(e) => {
                    setEditForm({ ...editForm, margin: e.target.value });
                    // Atualiza preço de venda automaticamente
                    const cost = parseFloat(editForm.costPrice || '0');
                    const margin = parseFloat(e.target.value || '0');
                    if (!isNaN(cost) && !isNaN(margin) && margin !== 0) {
                      const salePrice = cost / (1 - (margin / 100));
                      if (!isNaN(salePrice) && salePrice > 0) {
                        setEditForm((prev) => ({ ...prev, price: salePrice.toFixed(2) }));
                      }
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#FFFFFF]">Estoque</label>
                <Input
                  className="bg-[#1F1F1F] border-[#2E2E2E] text-[#FFFFFF]"
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#FFFFFF]">Descrição</label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md bg-[#1F1F1F] border-[#2E2E2E] text-[#FFFFFF] placeholder:text-[#6B6B6B]"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>


            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-[#FFFFFF]">
                <input
                  type="checkbox"
                  checked={editForm.isFractioned}
                  onChange={e => setEditForm({ ...editForm, isFractioned: e.target.checked })}
                />
                Produto Fracionado
              </label>
            </div>
            {editForm.isFractioned && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFFFFF]">Volume da Garrafa (ml)</label>
                  <Input
                    className="bg-[#1F1F1F] border-[#2E2E2E] text-[#FFFFFF]"
                    type="number"
                    min={1}
                    value={editForm.unitVolume || ''}
                    onChange={e => {
                      const value = e.target.value.replace(/[^\d.,]/g, '');
                      setEditForm({ ...editForm, unitVolume: value });
                    }}
                    placeholder="Ex: 1000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#FFFFFF]">Volume Total (ml)</label>
                  <Input
                    className="bg-[#1F1F1F] border-[#2E2E2E] text-[#FFFFFF]"
                    type="text"
                    value={
                      editForm.stock && editForm.unitVolume
                        ? String(Number(editForm.stock) * Number(editForm.unitVolume))
                        : ''
                    }
                    readOnly
                    disabled
                    placeholder="Volume total calculado"
                  />
                  <p className="text-xs text-[#6B6B6B]">Volume total disponível em estoque (estoque x volume da garrafa)</p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-[#FFFFFF]">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={e => setEditForm({ ...editForm, active: e.target.checked })}
                />
                Ativo
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-[#2E2E2E] text-[#CFCFCF] hover:bg-[#1F1F1F]">
              Cancelar
            </Button>
            <Button onClick={handleEditSave} className="bg-[#D4AF37] hover:bg-[#E6C76A] text-[#0B0B0B]">
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStockEntryDialogOpen} onOpenChange={setIsStockEntryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Registrar entrada de estoque</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Registre uma nova entrada de estoque. O sistema calculará automaticamente o novo custo médio ponderado.
            </DialogDescription>
          </DialogHeader>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" onSubmit={handleStockEntrySubmit}>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-[#FFFFFF]">Produto*</label>
              <Command className="rounded-lg border border-[#2E2E2E] bg-[#1F1F1F]">
                <CommandInput
                  placeholder="Digite para buscar..."
                  value={productSearchTerm}
                  onValueChange={setProductSearchTerm}
                  className="text-[#FFFFFF] placeholder:text-[#CFCFCF]"
                />
                <CommandList className="max-h-[200px] sm:max-h-[300px] overflow-y-auto">
                  <CommandEmpty className="text-[#CFCFCF] py-4">Nenhum produto encontrado.</CommandEmpty>
                  <CommandGroup>
                    {products.filter(product =>
                      product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
                    ).map(product => (
                      <CommandItem
                        key={product.id}
                        value={product.id}
                        onSelect={() => {
                          handleStockEntrySelect('productId', product.id);
                          setProductSearchTerm(product.name);
                        }}
                        className="text-[#FFFFFF] hover:bg-[#2E2E2E] cursor-pointer py-3 px-3"
                      >
                        {product.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>

            {/* Informações do produto selecionado */}
            {selectedProductInfo && (
              <div className="md:col-span-2 p-3 sm:p-4 bg-[#1F1F1F] border border-[#2E2E2E] rounded-lg">
                <h4 className="font-medium text-sm mb-3 text-[#FFFFFF]">Informações do Produto</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-[#CFCFCF] block text-xs">Nome:</span>
                    <p className="font-medium text-[#FFFFFF] break-words">{selectedProductInfo.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#CFCFCF] block text-xs">Estoque Atual:</span>
                    <p className="font-medium text-[#FFFFFF]">{selectedProductInfo.currentStock} unidades</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#CFCFCF] block text-xs">Custo Atual:</span>
                    <p className="font-medium text-[#FFFFFF]">R$ {selectedProductInfo.currentCost.toFixed(2)}</p>
                  </div>
                  {calculateNewCost() && (
                    <div className="space-y-1">
                      <span className="text-[#CFCFCF] block text-xs">Novo Custo Médio:</span>
                      <p className="font-medium text-green-500">R$ {calculateNewCost()!.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-[#FFFFFF]">Quantidade*</label>
              <Input 
                type="number" 
                name="quantity" 
                value={stockEntryForm.quantity} 
                onChange={handleStockEntryChange} 
                required 
                min={1}
                className="h-11 text-base sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#FFFFFF]">Custo Unitário (R$)*</label>
              <Input 
                type="number" 
                name="unitCost" 
                value={stockEntryForm.unitCost} 
                onChange={handleStockEntryChange} 
                required 
                min={0.01} 
                step={0.01}
                className="h-11 text-base sm:text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-[#FFFFFF]">Observação</label>
              <Textarea 
                name="notes" 
                value={stockEntryForm.notes} 
                onChange={handleStockEntryChange} 
                rows={3}
                className="text-base sm:text-sm resize-none"
              />
            </div>
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsStockEntryDialogOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loadingStockEntry} 
                className="bg-[#D4AF37] hover:bg-[#E6C76A] text-[#0B0B0B] font-medium w-full sm:w-auto order-1 sm:order-2 h-11 text-base sm:text-sm transition-colors"
              >
                {loadingStockEntry ? 'Salvando...' : 'Registrar Entrada'}
              </Button>
            </div>
          </form>
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminStock;
