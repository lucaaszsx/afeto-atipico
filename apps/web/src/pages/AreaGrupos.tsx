import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Users, Plus, Hash, X } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MyGroupCard } from '@/components/MyGroupCard';
import { GroupCard } from '@/components/GroupCard';

import { useApp, useAuth } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { validateGroupForm } from '@/utils/validation';
import { appConfig } from '@/constants/validation';
import { IGroupModel } from '@/services/types/models/GroupModels';
import { ICreateGroupRequestDTO } from '@/services/types/dtos/requests/GroupRequests';

interface FormData {
    name: string;
    description: string;
    tags: string[];
}

interface FormErrors {
    [key: string]: string;
}

const AreaGrupos = () => {
    const { groupService } = useApp();
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    
    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availableGroups, setAvailableGroups] = useState<IGroupModel[]>([]);
    const [myGroups, setMyGroups] = useState<IGroupModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
    
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        tags: ['']
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Data loading
    const loadData = async () => {
        setIsLoading(true);
        
        // Load user's groups
        const userGroupsResult = await groupService.getUserGroups();
        if (userGroupsResult.success && userGroupsResult.data) {
            setMyGroups(userGroupsResult.data.groups);
        } else if (userGroupsResult.error) toast({
            title: 'Erro',
            description: 'Não foi possível carregar os grupos que você faz parte.',
            variant: 'destructive'
        });
        
        // Load public groups
        const publicGroupsResult = await groupService.getPublicGroups({ limit: 5 });
        
        if (publicGroupsResult.success && publicGroupsResult.data) {
            setAvailableGroups(publicGroupsResult.data.groups);
        } else if (publicGroupsResult.error) toast({
            title: 'Erro',
            description: 'Não foi possível carregar os grupos públicos.',
            variant: 'destructive'
        });
        
        setIsLoading(false);
    };

    // Execute data loading on component mount
    useEffect(() => {
        loadData();
    }, []);

    // Computed values
    const filteredGroups = availableGroups.filter(group => {
        // Don't show groups the user is already a member of
        if (myGroups.some(myGroup => myGroup.id === group.id)) return false;
        
        // Filter by search term
        return group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const canCreateGroup = myGroups.length < appConfig.maxGroupsPerUser;

    // Event handlers
    const handleJoinGroup = async (groupId: string) => {
        if (!isAuthenticated || joiningGroupId) {
            if (!isAuthenticated) navigate('/login');
            return;
        }

        setJoiningGroupId(groupId);

        const result = await groupService.joinGroup(groupId);
        
        if (result.success && result.data) {
            // Move group from available to my groups
            const joinedGroup = availableGroups.find(g => g.id === groupId);
            if (joinedGroup) {
                setMyGroups(prev => [...prev, joinedGroup]);
                setAvailableGroups(prev => prev.filter(g => g.id !== groupId));
                
                toast({
                    title: 'Grupo adicionado!',
                    description: `Você agora faz parte do grupo "${joinedGroup.name}".`,
                });
            }
        } else if (result.error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível entrar no grupo.',
                variant: 'destructive'
            });
        }
        
        setJoiningGroupId(null);
    };

    const handleAccessGroup = (groupId: string) => {
        navigate(`/grupos/chat/${groupId}`);
    };

    const handleFormChange = (field: keyof FormData, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        
        // Validate using the composite validation function
        const validationResult = validateGroupForm({
            name: formData.name,
            description: formData.description,
            tags: formData.tags
        });
        
        if (!validationResult.isValid) {
            validationResult.errors.forEach(error => {
                // Map field names to form field names
                switch (error.field) {
                    case 'groupName':
                        errors.name = error.message;
                        break;
                    case 'groupDescription':
                        errors.description = error.message;
                        break;
                    case 'groupTags':
                        errors.tags = error.message;
                        break;
                }
            });
        }
        
        // Check group limit
        if (!canCreateGroup) {
            errors.general = `Você já atingiu o limite de ${appConfig.maxGroupsPerUser} grupos criados.`;
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateGroup = async () => {
        if (groupService.isCreatingGroup || !validateForm()) return;
        
        const validTags = formData.tags.filter(tag => tag.trim().length > 0);
        
        const createData: ICreateGroupRequestDTO = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            tags: validTags
        };
        
        const result = await groupService.createGroup(createData);
        
        if (result.success && result.data) {
            // Add created group to my groups
            setMyGroups(prev => [...prev, result.data!]);
            
            // Reset form
            setFormData({ name: '', description: '', tags: [''] });
            setFormErrors({});
            setIsModalOpen(false);
            
            toast({
                title: 'Grupo criado!',
                description: `O grupo "${result.data.name}" foi criado com sucesso.`,
            });
        } else if (result.error) toast({
            title: 'Erro',
            description: 'Não foi possível criar o grupo.',
            variant: 'destructive'
        });
    };

    const handleTagAdd = () => {
        if (formData.tags.length < appConfig.groupTags.maxCount) handleFormChange('tags', [...formData.tags, '']);
    };

    const handleTagRemove = (index: number) => {
        const newTags = formData.tags.filter((_, i) => i !== index);
        handleFormChange('tags', newTags.length === 0 ? [''] : newTags);
    };

    const handleTagUpdate = (index: number, value: string) => {
        const newTags = [...formData.tags];
        newTags[index] = value;
        handleFormChange('tags', newTags);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setFormData({ name: '', description: '', tags: [''] });
        setFormErrors({});
    };

    // Loading state
    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
            <div className="text-center animate-pulse">
                <Users className="w-16 h-16 text-blue-500 mx-auto mb-6 animate-bounce" />
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                    <div className="h-3 bg-gray-100 rounded w-24 mx-auto"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
            <div className="max-w-7xl mx-auto px-4 space-y-8">
                {/* Header Section */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
                        <Users className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Área de Grupos</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Conecte-se com outras famílias, compartilhe experiências e encontre apoio em nossa comunidade acolhedora
                    </p>
                </div>

                {/* My Groups Section */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-6">
                        <CardTitle className="text-2xl text-gray-900 flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            Meus Grupos
                            {myGroups.length > 0 && (
                                <Badge 
                                    variant="secondary" 
                                    className="ml-3 bg-green-100 text-green-700 hover:bg-green-200"
                                >
                                    {myGroups.length}
                                </Badge>
                            )}
                        </CardTitle>
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    disabled={!canCreateGroup}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Criar Grupo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="text-xl text-gray-900">Criar Novo Grupo</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                    {formErrors.general && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-700">{formErrors.general}</p>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="groupName" className="text-gray-700 font-medium">
                                            Nome do Grupo
                                        </Label>
                                        <Input
                                            id="groupName"
                                            value={formData.name}
                                            onChange={(e) => handleFormChange('name', e.target.value)}
                                            placeholder="Ex: Mães de Autistas RJ"
                                            maxLength={appConfig.groupName.maxLength}
                                            className={`h-12 transition-all duration-300 ${
                                                formErrors.name 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                        />
                                        {formErrors.name && (
                                            <p className="text-sm text-red-600">{formErrors.name}</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="groupDescription" className="text-gray-700 font-medium">
                                            Descrição
                                        </Label>
                                        <Textarea
                                            id="groupDescription"
                                            value={formData.description}
                                            onChange={(e) => handleFormChange('description', e.target.value)}
                                            placeholder="Descreva o propósito do grupo e como ele pode ajudar outros pais..."
                                            maxLength={appConfig.groupDescription.maxLength}
                                            className={`min-h-[100px] transition-all duration-300 ${
                                                formErrors.description 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                        />
                                        {formErrors.description && (
                                            <p className="text-sm text-red-600">{formErrors.description}</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-gray-700 font-medium">
                                                Tags (máximo {appConfig.groupTags.maxCount})
                                            </Label>
                                            {formData.tags.length < appConfig.groupTags.maxCount && (
                                                <Button 
                                                    type="button" 
                                                    onClick={handleTagAdd} 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="h-8 px-3 text-xs"
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Adicionar Tag
                                                </Button>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            {formData.tags.map((tag, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <Input
                                                            value={tag}
                                                            onChange={(e) => handleTagUpdate(index, e.target.value)}
                                                            placeholder="Ex: Autismo"
                                                            maxLength={appConfig.groupTags.maxLength}
                                                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                                        />
                                                    </div>
                                                    {formData.tags.length > 1 && (
                                                        <Button 
                                                            type="button" 
                                                            onClick={() => handleTagRemove(index)} 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="h-11 w-11 p-0 border-gray-200 hover:border-red-300 hover:text-red-600 transition-all duration-300"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {formErrors.tags && (
                                            <p className="text-sm text-red-600">{formErrors.tags}</p>
                                        )}
                                    </div>
                                    
                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                        <Button 
                                            variant="outline" 
                                            onClick={handleModalClose}
                                            disabled={groupService.isCreatingGroup}
                                            className="px-6"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button 
                                            onClick={handleCreateGroup} 
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6"
                                            disabled={groupService.isCreatingGroup}
                                        >
                                            {groupService.isCreatingGroup ? (
                                                <>
                                                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                                    Criando...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Criar Grupo
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {myGroups.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MessageCircle className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Você ainda não faz parte de nenhum grupo
                                </h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    Conecte-se com outras famílias criando um novo grupo ou participando de grupos existentes
                                </p>
                                <Button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    disabled={!canCreateGroup}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Criar Meu Primeiro Grupo
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {myGroups.map((group) => (
                                    <MyGroupCard
                                        key={group.id}
                                        group={group}
                                        onAccess={handleAccessGroup}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Available Groups Section */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                    <CardHeader>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <CardTitle className="text-2xl text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                                    <Search className="w-5 h-5 text-white" />
                                </div>
                                Descubra Grupos
                                <Badge 
                                    variant="secondary" 
                                    className="ml-3 bg-purple-100 text-purple-700 hover:bg-purple-200"
                                >
                                    {filteredGroups.length}
                                </Badge>
                            </CardTitle>
                            <div className="relative w-full lg:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nome, descrição ou tags..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredGroups.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {searchTerm ? 'Nenhum grupo encontrado' : 'Nenhum grupo disponível'}
                                </h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    {searchTerm 
                                        ? 'Tente buscar com outros termos ou crie um novo grupo para conectar pessoas com interesses similares!' 
                                        : 'Seja o primeiro a criar um grupo e ajudar a construir nossa comunidade de apoio!'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                {filteredGroups.map((group) => (
                                    <GroupCard
                                        key={group.id}
                                        group={group}
                                        onJoin={handleJoinGroup}
                                        onAccess={handleAccessGroup}
                                        isLoading={joiningGroupId === group.id}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AreaGrupos;