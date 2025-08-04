import { useState } from 'react';
import { User, Heart, Edit2, Save, X, Plus, Trash2, Settings, Lock, LogOut, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { validateDisplayName, validateUsername, validateBio, validateChildForm } from '@/utils/validation';
import { NetworkError, ApiError, ApiErrorCodes } from '@/lib/rest';
import { useApp } from '../contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface FormErrors {
    displayName?: string;
    username?: string;
    bio?: string;
    general?: string;
}

interface ChildFormErrors {
    name?: string;
    age?: string;
    notes?: string;
    general?: string;
}

const Perfil = () => {
    const { userService, authService, isPendingVerification } = useApp();
    const { toast } = useToast();
    const user = authService.getCurrentUser();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        username: user?.username || '',
        bio: user?.bio || ''
    });
    
    const [newChild, setNewChild] = useState({ name: '', age: 0, notes: '' });
    const [showNewChildForm, setShowNewChildForm] = useState(false);
    const [childFormErrors, setChildFormErrors] = useState<ChildFormErrors>({});

    const validateProfileForm = (): boolean => {
        const errors: FormErrors = {};
        
        const displayNameError = validateDisplayName(formData.displayName);
        if (displayNameError) errors.displayName = displayNameError.message;
        
        const usernameError = validateUsername(formData.username);
        if (usernameError) errors.username = usernameError.message;
        
        const bioError = validateBio(formData.bio);
        if (bioError) errors.bio = bioError.message;
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateChild = (): boolean => {
        const errors: ChildFormErrors = {};
        const validationResult = validateChildForm(newChild);
        
        if (!validationResult.isValid) {
            validationResult.errors.forEach(error => {
                switch (error.field) {
                    case 'childName':
                        errors.name = error.message;
                        break;
                    case 'childAge':
                        errors.age = error.message;
                        break;
                    case 'childNotes':
                        errors.notes = error.message;
                        break;
                }
            });
        }
        
        setChildFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProfileError = (error: NetworkError | ApiError): void => {
        if (error.isRequestError) {
            return toast({
                title: 'Erro de conexão',
                description: 'Não foi possível se conectar com o servidor.',
                variant: 'destructive'
            });
        }
        
        switch (error.apiCode) {
            case ApiErrorCodes.USERNAME_ALREADY_EXISTS:
                setFormErrors({ username: 'Este nome de usuário já está em uso.' });
                break;
            
            case ApiErrorCodes.VALIDATION_FAILED:
                toast({
                    title: 'Erro de validação',
                    description: 'Os dados fornecidos são inválidos.',
                    variant: 'destructive'
                });
                break;
            
            default:
                toast({
                    title: 'Erro interno',
                    description: 'Ocorreu um erro interno. Tente novamente.',
                    variant: 'destructive'
                });
        }
    };

    const handleChildError = (error: NetworkError | ApiError): void => {
        if (error.isRequestError) {
            return toast({
                title: 'Erro de conexão',
                description: 'Não foi possível se conectar com o servidor.',
                variant: 'destructive'
            });
        }
        
        switch (error.apiCode) {
            case ApiErrorCodes.VALIDATION_FAILED:
                toast({
                    title: 'Erro de validação',
                    description: 'Os dados da criança são inválidos.',
                    variant: 'destructive'
                });
                break;
            
            default:
                toast({
                    title: 'Erro interno',
                    description: 'Ocorreu um erro interno. Tente novamente.',
                    variant: 'destructive'
                });
        }
    };

    const handleSaveProfile = async () => {
        if (!validateProfileForm()) return;

        const { data, error, success } = await userService.updateProfile({
            displayName: formData.displayName,
            username: formData.username,
            bio: formData.bio
        });

        if (success) {
            setIsEditing(false);
            toast({
                title: 'Perfil atualizado!',
                description: 'Suas informações foram salvas com sucesso.'
            });
        } else {
            handleProfileError(error);
        }
    };

    const handleAddChild = async () => {
        if (!validateChild()) return;

        const { data, error, success } = await userService.addChild({
            name: newChild.name,
            age: newChild.age,
            notes: newChild.notes || undefined
        });

        if (success) {
            setNewChild({ name: '', age: 0, notes: '' });
            setShowNewChildForm(false);
            setChildFormErrors({});
            toast({
                title: 'Filho adicionado!',
                description: 'As informações foram salvas com sucesso.'
            });
        } else {
            handleChildError(error);
        }
    };

    const handleRemoveChild = async (childId: string) => {
        if (!window.confirm('Tem certeza que deseja remover essas informações?')) return;

        const { data, error, success } = await userService.removeChild(childId);

        if (success) {
            toast({
                title: 'Informações removidas',
                description: 'As informações do filho foram removidas com sucesso.'
            });
        } else {
            handleChildError(error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) return;

        const { data, error, success } = await userService.deleteAccount();

        if (success) {
            await authService.logout();
            toast({
                title: 'Conta excluída',
                description: 'Sua conta foi excluída com sucesso.',
                variant: 'destructive'
            });
        } else {
            toast({
                title: 'Erro ao excluir conta',
                description: 'Não foi possível excluir sua conta. Tente novamente.',
                variant: 'destructive'
            });
        }
    };

    const resetForm = () => {
        setFormData({
            displayName: user?.displayName || '',
            username: user?.username || '',
            bio: user?.bio || ''
        });
        setFormErrors({});
    };

    const resetChildForm = () => {
        setNewChild({ name: '', age: 0, notes: '' });
        setChildFormErrors({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                
                {/* Header Section */}
                <div className="text-center mb-6 sm:mb-8 lg:mb-12 animate-fade-in">
                    <div className="relative inline-block mb-4 sm:mb-6">
                        <Avatar className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 shadow-lg hover:scale-105 transition-transform duration-300">
                            <AvatarImage src={user?.avatarUrl} />
                            <AvatarFallback className="text-xl sm:text-2xl lg:text-3xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                                {user?.displayName?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">Meu Perfil</h1>
                    <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base text-gray-600 px-4">
                        <span className="font-medium break-all">@{user?.username}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block"></div>
                            <span className="text-center break-all">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block"></div>
                            <span className="text-center">Membro da comunidade</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
                    
                    {/* Main Content */}
                    <div className="xl:col-span-8 space-y-4 sm:space-y-6 lg:space-y-8">
                        
                        {/* Personal Information Card */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                            <CardHeader className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6">
                                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900 flex items-center">
                                    <User className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                                    <span className="break-words">Informações Pessoais</span>
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (isEditing) {
                                            resetForm();
                                        }
                                        setIsEditing(!isEditing);
                                    }}
                                    disabled={userService.isUpdatingProfile}
                                    className="group hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
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
                            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                                {isEditing ? (
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="displayName" className="text-gray-700 font-medium text-sm sm:text-base">Nome de Exibição</Label>
                                                <Input
                                                    id="displayName"
                                                    value={formData.displayName}
                                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                                    className={`h-10 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base ${formErrors.displayName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                    placeholder="Seu nome completo"
                                                />
                                                {formErrors.displayName && (
                                                    <p className="text-sm text-red-600 mt-1">{formErrors.displayName}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="username" className="text-gray-700 font-medium text-sm sm:text-base">Nome de Usuário</Label>
                                                <Input
                                                    id="username"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className={`h-10 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base ${formErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                    placeholder="seu_usuario"
                                                />
                                                {formErrors.username && (
                                                    <p className="text-sm text-red-600 mt-1">{formErrors.username}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio" className="text-gray-700 font-medium text-sm sm:text-base">Biografia (opcional)</Label>
                                            <Textarea
                                                id="bio"
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                placeholder="Conte um pouco sobre você e sua jornada..."
                                                maxLength={200}
                                                className={`min-h-[100px] sm:min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base resize-none ${formErrors.bio ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            />
                                            <p className="text-xs text-gray-500">{formData.bio.length}/200 caracteres</p>
                                            {formErrors.bio && (
                                                <p className="text-sm text-red-600 mt-1">{formErrors.bio}</p>
                                            )}
                                        </div>
                                        
                                        {formErrors.general && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-600">{formErrors.general}</p>
                                            </div>
                                        )}
                                        
                                        <Button 
                                            onClick={handleSaveProfile}
                                            disabled={userService.isUpdatingProfile}
                                            className="group w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu h-10 sm:h-11"
                                        >
                                            {userService.isUpdatingProfile ? (
                                                <div className="relative flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Salvando...
                                                </div>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                                    Salvar Alterações
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                                            <div className="space-y-2 sm:space-y-3">
                                                <h4 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Nome de Exibição</h4>
                                                <p className="text-base sm:text-lg text-gray-900 font-medium break-words">{user?.displayName || 'Não informado'}</p>
                                            </div>
                                            <div className="space-y-2 sm:space-y-3">
                                                <h4 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Nome de Usuário</h4>
                                                <p className="text-base sm:text-lg text-gray-900 font-medium break-all">@{user?.username || 'Não informado'}</p>
                                            </div>
                                        </div>
                                        {user?.bio && (
                                            <div className="space-y-2 sm:space-y-3">
                                                <h4 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Biografia</h4>
                                                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">{user.bio}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Children Information Card */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                            <CardHeader className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6">
                                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900 flex items-center">
                                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-pink-600 flex-shrink-0" />
                                    <span className="break-words">Informações dos Filhos</span>
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowNewChildForm(true)}
                                    disabled={userService.isAddingChild}
                                    className="group hover:bg-pink-50 border-pink-200 text-pink-600 hover:text-pink-700 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                                >
                                    <Plus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                    Adicionar
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                {user?.children && user.children.length > 0 ? (
                                    <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                                        {user.children.map((child, index) => (
                                            <div key={child.id || index} className="group p-4 sm:p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100 hover:shadow-lg transition-all duration-300 hover:scale-105 transform-gpu">
                                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-2 break-words pr-2">{child.name}</h4>
                                                        <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors duration-200 text-xs sm:text-sm">
                                                            {child.age} {child.age === 1 ? 'ano' : 'anos'}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveChild(child.id)}
                                                        disabled={userService.isRemovingChild}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {child.notes && (
                                                    <div className="mt-3 sm:mt-4 p-3 bg-white/60 rounded-lg border border-pink-100">
                                                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words">{child.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 sm:py-12">
                                        <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                                        <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">Nenhuma informação adicionada</h3>
                                        <p className="text-sm sm:text-base text-gray-500 px-4">Adicione informações sobre seus filhos para personalizar sua experiência.</p>
                                    </div>
                                )}

                                <Dialog open={showNewChildForm} onOpenChange={setShowNewChildForm}>
                                    <DialogContent className="w-[95vw] max-w-md mx-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Adicionar Filho</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 sm:gap-6 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="childName" className="text-gray-700 font-medium text-sm sm:text-base">Nome ou Apelido</Label>
                                                <Input
                                                    id="childName"
                                                    value={newChild.name}
                                                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                                                    placeholder="Nome do seu filho"
                                                    className={`h-10 sm:h-12 transition-all duration-300 text-sm sm:text-base ${childFormErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
                                                />
                                                {childFormErrors.name && (
                                                    <p className="text-xs sm:text-sm text-red-600">{childFormErrors.name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="childAge" className="text-gray-700 font-medium text-sm sm:text-base">Idade</Label>
                                                <Input
                                                    id="childAge"
                                                    type="number"
                                                    min="1"
                                                    max="30"
                                                    value={newChild.age || ''}
                                                    onChange={(e) => setNewChild({ ...newChild, age: parseInt(e.target.value) || 0 })}
                                                    placeholder="Idade em anos"
                                                    className={`h-10 sm:h-12 transition-all duration-300 text-sm sm:text-base ${childFormErrors.age ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
                                                />
                                                {childFormErrors.age && (
                                                    <p className="text-xs sm:text-sm text-red-600">{childFormErrors.age}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="childNotes" className="text-gray-700 font-medium text-sm sm:text-base">Observações (opcional)</Label>
                                                <Textarea
                                                    id="childNotes"
                                                    value={newChild.notes}
                                                    onChange={(e) => setNewChild({ ...newChild, notes: e.target.value })}
                                                    placeholder="Gostos, necessidades especiais, conquistas..."
                                                    maxLength={200}
                                                    className={`min-h-[80px] sm:min-h-[100px] transition-all duration-300 text-sm sm:text-base resize-none ${childFormErrors.notes ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
                                                />
                                                <p className="text-xs text-gray-500">{newChild.notes?.length || 0}/200 caracteres</p>
                                                {childFormErrors.notes && (
                                                    <p className="text-xs sm:text-sm text-red-600">{childFormErrors.notes}</p>
                                                )}
                                            </div>

                                            {childFormErrors.general && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-sm text-red-600">{childFormErrors.general}</p>
                                                </div>
                                            )}

                                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2 sm:pt-4">
                                                <Button 
                                                    onClick={handleAddChild}
                                                    disabled={userService.isAddingChild}
                                                    className="group bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg h-10 sm:h-11"
                                                >
                                                    {userService.isAddingChild ? (
                                                        <div className="relative flex items-center">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Salvando...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
                                                            Salvar
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowNewChildForm(false);
                                                        resetChildForm();
                                                    }}
                                                    disabled={userService.isAddingChild}
                                                    className="flex-1 hover:bg-gray-50 transition-all duration-300 h-10 sm:h-11"
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

                    {/* Sidebar */}
                    <div className="xl:col-span-4 space-y-4 sm:space-y-6">
                        
                        {/* Settings Card */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-lg sm:text-xl text-gray-900 flex items-center">
                                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-600 flex-shrink-0" />
                                    <span className="break-words">Configurações</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                                {isPendingVerification && (
                                    <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div className="flex items-start space-x-2 sm:space-x-3">
                                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm text-yellow-700 font-medium mb-1 break-words">Verificação de email pendente</p>
                                                <p className="text-xs text-yellow-600 break-words">Verifique seu email para ativar todas as funcionalidades da conta.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex items-start space-x-2 sm:space-x-3">
                                        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1 break-words">Em desenvolvimento</p>
                                            <p className="text-xs text-blue-600 break-words">Mais configurações estarão disponíveis em breve.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Card */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-lg sm:text-xl text-gray-900 break-words">Conta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                                <Button
                                    variant="outline"
                                    onClick={authService.logout}
                                    className="group w-full justify-start hover:bg-gray-50 transition-all duration-300 hover:scale-105 h-10 sm:h-11 text-sm sm:text-base"
                                >
                                    <LogOut className="w-4 h-4 mr-3 transition-transform group-hover:scale-110 duration-300 flex-shrink-0" />
                                    <span className="break-words">Sair da Conta</span>
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