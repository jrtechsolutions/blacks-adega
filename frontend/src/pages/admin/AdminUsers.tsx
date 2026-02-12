import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const userTypes = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'VENDEDOR', label: 'Vendedor' },
];

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const AdminUsers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', cpf: '', type: 'ADMIN' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<any | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setError('Faça login novamente para acessar esta página.');
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`${API_URL}/admin/users?roles=ADMIN,VENDEDOR`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar usuários:', err);
        setError('Erro ao buscar usuários');
        setLoading(false);
      });
  }, [token]);

  const handleOpenModal = () => {
    setForm({ name: '', email: '', password: '', cpf: '', type: 'ADMIN' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    setForm({ ...form, type: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/admin/users`, {
        name: form.name,
        email: form.email,
        password: form.password,
        cpf: form.cpf,
        role: form.type.toUpperCase(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const res = await axios.get(`${API_URL}/admin/users?roles=ADMIN,MOTOBOY,VENDEDOR`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(res.data);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err);
      setError('Erro ao cadastrar usuário');
    }
    setLoading(false);
  };

  const openEdit = (user: any) => {
    setEditUser(user);
    setIsEditOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editUser) return;
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleEditTypeChange = (value: string) => {
    if (!editUser) return;
    setEditUser({ ...editUser, role: value });
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setLoading(true);
    setError('');
    try {
      await axios.put(`${API_URL}/admin/users/${editUser.id}`, {
        name: editUser.name,
        email: editUser.email,
        cpf: editUser.cpf,
        role: (editUser.role || '').toUpperCase(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await axios.get(`${API_URL}/admin/users?roles=ADMIN,MOTOBOY,VENDEDOR`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setIsEditOpen(false);
      setEditUser(null);
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setError('Erro ao atualizar usuário');
    }
    setLoading(false);
  };

  const openDelete = (user: any) => {
    setDeleteUser(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.delete(`${API_URL}/admin/users/${deleteUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Atualizar lista de usuários
      const res = await axios.get(`${API_URL}/admin/users?roles=ADMIN,MOTOBOY,VENDEDOR`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      
      // Se foi desativado ao invés de excluído, mostrar mensagem
      if (response.data?.deactivated) {
        setError(response.data.message || 'Usuário foi desativado ao invés de excluído');
        // Fechar o modal após 2 segundos para o usuário ver a mensagem
        setTimeout(() => {
          setIsDeleteOpen(false);
          setDeleteUser(null);
          setError('');
        }, 2000);
      } else {
        // Exclusão bem-sucedida
        setIsDeleteOpen(false);
        setDeleteUser(null);
      }
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Erro ao excluir usuário';
      setError(errorMessage);
      // Não fecha o modal se houver erro, para o usuário ver a mensagem
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="p-4 md:p-6 lg:p-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#FFFFFF]">Usuários do Sistema</h1>
          <Button className="bg-[#D4AF37] text-[#0B0B0B] hover:bg-[#E6C76A]" onClick={handleOpenModal}>
            <UserPlus className="h-4 w-4 mr-2" />
            + Novo Usuário
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Digite o nome ou e-mail" />
              </div>
              <Button className="bg-[#1F1F1F] text-[#FFFFFF] hover:bg-[#2E2E2E]">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="w-[140px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">#{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role === 'ADMIN' ? 'Administrador' : user.role === 'VENDEDOR' ? 'Vendedor' : user.role}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openDelete(user)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" name="cpf" type="text" value={form.cpf} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="type">Tipo de Usuário</Label>
                <Select value={form.type} onValueChange={handleTypeChange}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                <Button type="submit" className="bg-[#D4AF37] text-[#0B0B0B] hover:bg-[#E6C76A]/90">Cadastrar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            {editUser && (
              <form onSubmit={submitEdit} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input id="edit-name" name="name" value={editUser.name || ''} onChange={handleEditChange} required />
                </div>
                <div>
                  <Label htmlFor="edit-email">E-mail</Label>
                  <Input id="edit-email" name="email" type="email" value={editUser.email || ''} onChange={handleEditChange} required />
                </div>
                <div>
                  <Label htmlFor="edit-cpf">CPF</Label>
                  <Input id="edit-cpf" name="cpf" type="text" value={editUser.cpf || ''} onChange={handleEditChange} />
                </div>
                <div>
                  <Label htmlFor="edit-type">Tipo de Usuário</Label>
                  <Select value={editUser.role || 'ADMIN'} onValueChange={handleEditTypeChange}>
                    <SelectTrigger id="edit-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-[#D4AF37] text-[#0B0B0B] hover:bg-[#E6C76A]/90">Salvar</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
              {error && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
              {deleteUser && (
                <p className="text-sm text-muted-foreground mt-2">
                  Tem certeza que deseja excluir o usuário <strong>{deleteUser.name}</strong> ({deleteUser.email})?
                  {deleteUser.role === 'ADMIN' && (
                    <span className="block mt-1 text-amber-600 dark:text-amber-400">
                      ⚠️ Este é um administrador. Certifique-se de que não é o último admin do sistema.
                    </span>
                  )}
                </p>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setError(''); setDeleteUser(null); }}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;