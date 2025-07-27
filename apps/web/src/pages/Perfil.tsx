import { useState, useRef } from 'react';
import { User, Heart, Edit2, Save, X, Plus, Trash2, Upload, Sun, Moon, Settings, Lock, LogOut, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/ui/logo';

interface Child {
    name: string;
    age: number;
    notes?: string;
}

const Perfil = () => {
    const { user, updateProfile, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [newChild, setNewChild] = useState({ name: '', age: 0, notes: '' });
    const [showNewChildForm, setShowNewChildForm] = useState(false);
    const [childFormErrors, setChildFormErrors] = useState({});
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        username: user?.username || '',
        bio: user?.bio || ''
    });

    const [children, setChildren] = useState(user?.children || []);

    
    const validateChild = (child) => {
        const errors = [];
        
        if (!child.name.trim()) {
            errors.push({ field: 'name', message: 'Nome é obrigatório' });
        } else if (child.name.trim().length < 2) {
            errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres' });
        }
        
        if (!child.age || child.age < 1 || child.age > 30) {
            errors.push({ field: 'age', message: 'Idade deve estar entre 1 e 30 anos' });
        }
        
        if (child.notes && child.notes.length > 200) {
            errors.push({ field: 'notes', message: 'Observações não podem exceder 200 caracteres' });
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    };

    const handleSaveProfile = () => {
        if (!formData.displayName.trim()) {
            toast({
                title: "Erro de validação",
                description: "Nome de exibição é obrigatório.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.username.trim()) {
            toast({
                title: "Erro de validação", 
                description: "Nome de usuário é obrigatório.",
                variant: "destructive",
            });
            return;
        }

        updateProfile({
            ...formData,
            children: children,
            avatarUrl: avatarPreview || user?.avatarUrl
        });
        setIsEditing(false);
        setAvatarPreview(null);
        toast({
            title: "Perfil atualizado!",
            description: "Suas informações foram salvas com sucesso.",
        });
    };

    const handleAddChild = () => {
        const validation = validateChild(newChild);
        
        if (!validation.isValid) {
            const errors = {};
            validation.errors.forEach(error => {
                errors[error.field] = error.message;
            });
            setChildFormErrors(errors);
            return;
        }

        setChildren([...children, newChild]);
        setNewChild({ name: '', age: 0, notes: '' });
        setShowNewChildForm(false);
        setChildFormErrors({});
        toast({
            title: "Filho adicionado!",
            description: "As informações foram salvas.",
        });
    };

    const handleRemoveChild = (index) => {
        setChildren(children.filter((_, i) => i !== index));
        toast({
            title: "Informações removidas",
            description: "As informações do filho foram removidas.",
        });
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) {
            logout();
            toast({
                title: "Conta excluída",
                description: "Sua conta foi excluída com sucesso.",
                variant: "destructive"
            });
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; 
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Erro",
                description: "Formato não suportado. Use JPEG, PNG ou WebP.",
                variant: "destructive"
            });
            return;
        }

        if (file.size > maxSize) {
            toast({
                title: "Erro",
                description: "Arquivo muito grande. Máximo 5MB.",
                variant: "destructive"
            });
            return;
        }

        setIsUploadingAvatar(true);

        try {
            const objectUrl = URL.createObjectURL(file);
            
            setTimeout(() => {
                setAvatarPreview(objectUrl);
                setIsUploadingAvatar(false);
                toast({
                    title: "Avatar carregado!",
                    description: "Clique em 'Salvar Alterações' para confirmar.",
                });
            }, 1500);
        } catch (error) {
            setIsUploadingAvatar(false);
            toast({
                title: "Erro",
                description: "Não foi possível processar a imagem.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-8 lg:mb-12 animate-fade-in">
                    <div className="relative inline-block mb-6">
                        <Avatar className="w-24 h-24 lg:w-28 lg:h-28 shadow-lg hover:scale-105 transition-transform duration-300">
                            <AvatarImage src={avatarPreview || user?.avatarUrl} />
                            <AvatarFallback className="text-2xl lg:text-3xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                                {user?.displayName?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                            <Button
                                size="sm"
                                className="absolute -bottom-2 -right-2 h-10 w-10 p-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:scale-105 transition-all duration-300"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingAvatar}
                            >
                                {isUploadingAvatar ? (
                                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                            </Button>
                        )}
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Meu Perfil</h1>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-600">
                        <span className="font-medium">@{user?.username}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Membro da comunidade</span>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                />

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
                    
                    <div className="xl:col-span-8 space-y-6 lg:space-y-8">
                        
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <CardTitle className="text-xl lg:text-2xl text-gray-900 flex items-center">
                                    <User className="w-6 h-6 mr-3 text-blue-600" />
                                    Informações Pessoais
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditing(!isEditing);
                                        if (isEditing) {
                                            setAvatarPreview(null);
                                            setFormData({
                                                displayName: user?.displayName || '',
                                                username: user?.username || '',
                                                bio: user?.bio || ''
                                            });
                                        }
                                    }}
                                    className="group hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 transition-all duration-300 hover:scale-105"
                                >
                                    {isEditing ? (
                                        <>
                                            <X className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                            Cancelar
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                            Editar
                                        </>
                                    )}
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {isEditing ? (
                                    <div className="space-y-6">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="displayName" className="text-gray-700 font-medium">Nome de Exibição</Label>
                                                <Input
                                                    id="displayName"
                                                    value={formData.displayName}
                                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                                    placeholder="Seu nome completo"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="username" className="text-gray-700 font-medium">Nome de Usuário</Label>
                                                <Input
                                                    id="username"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                                    placeholder="seu_usuario"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio" className="text-gray-700 font-medium">Biografia (opcional)</Label>
                                            <Textarea
                                                id="bio"
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                placeholder="Conte um pouco sobre você e sua jornada..."
                                                maxLength={200}
                                                className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                            />
                                            <p className="text-xs text-gray-500">{formData.bio.length}/200 caracteres</p>
                                        </div>
                                        <Button 
                                            onClick={handleSaveProfile} 
                                            className="group w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu"
                                        >
                                            <Save className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Nome de Exibição</h4>
                                                <p className="text-lg text-gray-900 font-medium">{user?.displayName || 'Não informado'}</p>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Nome de Usuário</h4>
                                                <p className="text-lg text-gray-900 font-medium">@{user?.username || 'Não informado'}</p>
                                            </div>
                                        </div>
                                        {user?.bio && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Biografia</h4>
                                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <CardTitle className="text-xl lg:text-2xl text-gray-900 flex items-center">
                                    <Heart className="w-6 h-6 mr-3 text-pink-600" />
                                    Informações dos Filhos
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowNewChildForm(true)}
                                    className="group hover:bg-pink-50 border-pink-200 text-pink-600 hover:text-pink-700 transition-all duration-300 hover:scale-105"
                                >
                                    <Plus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                    Adicionar
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {children.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                                        {children.map((child, index) => (
                                            <div key={index} className="group p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100 hover:shadow-lg transition-all duration-300 hover:scale-105 transform-gpu">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 text-lg mb-2">{child.name}</h4>
                                                        <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors duration-200">
                                                            {child.age} {child.age === 1 ? 'ano' : 'anos'}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveChild(index)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {child.notes && (
                                                    <div className="mt-4 p-3 bg-white/60 rounded-lg border border-pink-100">
                                                        <p className="text-sm text-gray-600 leading-relaxed">{child.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma informação adicionada</h3>
                                        <p className="text-gray-500">Adicione informações sobre seus filhos para personalizar sua experiência.</p>
                                    </div>
                                )}

                                <Dialog open={showNewChildForm} onOpenChange={setShowNewChildForm}>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold text-gray-900">Adicionar Filho</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-6 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="childName" className="text-gray-700 font-medium">Nome ou Apelido</Label>
                                                <Input
                                                    id="childName"
                                                    value={newChild.name}
                                                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                                                    placeholder="Nome do seu filho"
                                                    className={`h-12 transition-all duration-300 ${childFormErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                                                />
                                                {childFormErrors.name && (
                                                    <p className="text-sm text-red-600">{childFormErrors.name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="childAge" className="text-gray-700 font-medium">Idade</Label>
                                                <Input
                                                    id="childAge"
                                                    type="number"
                                                    min="1"
                                                    max="30"
                                                    value={newChild.age || ''}
                                                    onChange={(e) => setNewChild({ ...newChild, age: parseInt(e.target.value) || 0 })}
                                                    placeholder="Idade em anos"
                                                    className={`h-12 transition-all duration-300 ${childFormErrors.age ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                                                />
                                                {childFormErrors.age && (
                                                    <p className="text-sm text-red-600">{childFormErrors.age}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="childNotes" className="text-gray-700 font-medium">Observações (opcional)</Label>
                                                <Textarea
                                                    id="childNotes"
                                                    value={newChild.notes}
                                                    onChange={(e) => setNewChild({ ...newChild, notes: e.target.value })}
                                                    placeholder="Gostos, necessidades especiais, conquistas..."
                                                    maxLength={200}
                                                    className={`min-h-[100px] transition-all duration-300 ${childFormErrors.notes ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                                                />
                                                <p className="text-xs text-gray-500">{newChild.notes?.length || 0}/200 caracteres</p>
                                                {childFormErrors.notes && (
                                                    <p className="text-sm text-red-600">{childFormErrors.notes}</p>
                                                )}
                                            </div>
                                            <div className="flex space-x-3 pt-4">
                                                <Button 
                                                    onClick={handleAddChild} 
                                                    className="group bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                                >
                                                    <Save className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                                    Salvar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowNewChildForm(false);
                                                        setNewChild({ name: '', age: 0, notes: '' });
                                                        setChildFormErrors({});
                                                    }}
                                                    className="flex-1 hover:bg-gray-50 transition-all duration-300"
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="xl:col-span-4 space-y-6">
                        
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-xl text-gray-900 flex items-center">
                                    <Settings className="w-5 h-5 mr-3 text-gray-600" />
                                    Configurações
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        {theme === 'dark' ? (
                                            <Moon className="w-5 h-5 text-gray-600" />
                                        ) : (
                                            <Sun className="w-5 h-5 text-gray-600" />
                                        )}
                                        <span className="text-gray-900 font-medium">Tema {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleTheme}
                                        className="hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 transition-all duration-300 hover:scale-105"
                                    >
                                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                    </Button>
                                </div>
                                
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex items-start space-x-3">
                                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-blue-700 font-medium mb-1">Em desenvolvimento</p>
                                            <p className="text-xs text-blue-600">Mais configurações estarão disponíveis em breve.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-xl text-gray-900">Conta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    variant="outline"
                                    className="group w-full justify-start hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 transition-all duration-300 hover:scale-105"
                                >
                                    <Lock className="w-4 h-4 mr-3 transition-transform group-hover:scale-110 duration-300" />
                                    Alterar Senha
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={logout}
                                    className="group w-full justify-start hover:bg-gray-50 transition-all duration-300 hover:scale-105"
                                >
                                    <LogOut className="w-4 h-4 mr-3 transition-transform group-hover:scale-110 duration-300" />
                                    Sair da Conta
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-xl bg-red-50/80 border-red-200 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-xl text-red-700">Zona de Perigo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-red-600 text-sm mb-4 leading-relaxed">
                                    Esta ação é irreversível. Todos os seus dados, posts e informações serão excluídos permanentemente.
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    className="group w-full bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                >
                                    <Trash2 className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                    Excluir Conta Permanentemente
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;